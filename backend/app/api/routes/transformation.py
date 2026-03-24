from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database.session import get_session
from schemas.transformation_schema import TransformationCreate, TransformationResponse
from services.transformation_service import generate_transformation
router = APIRouter(prefix="/transformations", tags=["transformation"])

@router.post("/", response_model=TransformationResponse)
def create_transformation(
    data: TransformationCreate,
    db: Session = Depends(get_session)
):
    # get image path from DB (you already store it)
    image_url = get_image_url(data.input_image_id)

    transformation, output = generate_transformation(
        db=db,
        project_id=data.project_id,
        input_image_id=data.input_image_id,
        room_type=data.room_type,
        image_url=image_url,
        hf_token="your_hf_token"
    )

    return transformation