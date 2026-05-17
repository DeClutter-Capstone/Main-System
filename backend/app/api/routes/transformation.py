import base64
import io
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image
from sqlmodel import Session

from app.api.deps import get_current_user
from app.database.db import get_session
from app.models.user import User
from app.schemas.transformation_schema import TransformationResponse
from app.services.transformation_service import generate_transformation


router = APIRouter(prefix="/transformations", tags=["transformation"])


def _bytes_to_data_url(file_content: bytes) -> str:
    """Convert uploaded bytes to a base64 data URL for the AI pipeline."""
    base64_image = base64.b64encode(file_content).decode("utf-8")
    try:
        img = Image.open(io.BytesIO(file_content))
        mime_type = f"image/{(img.format or 'jpeg').lower()}"
    except Exception:
        mime_type = "image/jpeg"
    return f"data:{mime_type};base64,{base64_image}"


@router.post("/", response_model=TransformationResponse)
def create_transformation(
    room_type: str = Form(...),
    style_name: str = Form(...),
    image_file: UploadFile = File(...),
    project_id: Optional[str] = Form(None),
    input_image_id: Optional[str] = Form(None),
    prompt: Optional[str] = Form(None),
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Create a transformation from an uploaded image.

    `room_type` is stored verbatim — including free-text values supplied via
    the "Other" room option on the Generate page.
    """
    try:
        image_content = image_file.file.read()
        image_url = _bytes_to_data_url(image_content)

        parsed_project_id: Optional[UUID] = None
        if project_id:
            try:
                parsed_project_id = UUID(project_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid project_id")

        transformation, output_path = generate_transformation(
            db=db,
            user_id=user.user_id,
            project_id=parsed_project_id,
            input_image_id=input_image_id,
            room_type=room_type,
            style_name=style_name,
            image_url=image_url,
            prompt=prompt or "",
        )

        return {
            "transformation_id": str(transformation.transformation_id),
            "room_type": transformation.room_type,
            "style_name": transformation.style_name,
            "project_id": str(transformation.project_id) if transformation.project_id else None,
            "input_image_id": str(transformation.input_image_id) if transformation.input_image_id else None,
            "prompt": transformation.prompt,
            "output_image_url": output_path,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in transformation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Transformation failed: {str(e)}")
