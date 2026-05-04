import os
import base64
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session
from app.database.db import get_session
from app.schemas.transformation_schema import TransformationCreate, TransformationResponse
from app.services.transformation_service import generate_transformation
from dotenv import load_dotenv
from PIL import Image

load_dotenv()
router = APIRouter(prefix="/transformations", tags=["transformation"])
hf_token = os.getenv("hf_token")


def save_uploaded_image_to_url(file_content: bytes) -> str:
    """
    Convert uploaded image bytes to base64 data URL
    """
    base64_image = base64.b64encode(file_content).decode('utf-8')
    # Detect image format
    try:
        img = Image.open(io.BytesIO(file_content))
        mime_type = f"image/{img.format.lower()}"
    except:
        mime_type = "image/jpeg"
    
    data_url = f"data:{mime_type};base64,{base64_image}"
    return data_url


@router.post("/", response_model=TransformationResponse)
def create_transformation(
    room_type: str = Form(...),
    style_name: str = Form(...),
    image_file: UploadFile = File(...),
    project_id: str = Form(None),
    input_image_id: str = Form(None),
    prompt: str = Form(None), 
    db: Session = Depends(get_session)
):
    """
    Create a transformation from uploaded image.
    Accepts: room_type, style_name, and image_file (multipart form data)
    """
    try:
        # Read uploaded image
        image_content = image_file.file.read()
        
        # Convert to data URL for Replicate
        image_url = save_uploaded_image_to_url(image_content)

        transformation, output = generate_transformation(
            db=db,
            project_id=project_id,
            input_image_id=input_image_id,
            room_type=room_type,
            style_name=style_name,
            image_url=image_url,
            hf_token=hf_token,
            prompt=prompt or ''
        )
        
        # Add the output image URL to the response
        response_data = {
            "transformation_id": str(transformation.transformation_id),
            "room_type": transformation.room_type,
            "style_name": transformation.style_name,
            "project_id": str(transformation.project_id) if transformation.project_id else None,
            "input_image_id": str(transformation.input_image_id) if transformation.input_image_id else None,
            "prompt": transformation.prompt,
            "output_image_url": str(output)  # output is the URL string from Replicate
        }
        
        return response_data
    
    except Exception as e:
        print(f"Error in transformation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Transformation failed: {str(e)}")