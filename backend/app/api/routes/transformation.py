import os
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database.session import get_session
from app.schemas.transformation_schema import TransformationCreate, TransformationResponse
from app.services.transformation_service import generate_transformation
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/transformations", tags=["transformation"])
hf_token = os.getenv("hf_token")

@router.post("/", response_model=TransformationResponse)
def create_transformation(
    data: TransformationCreate,
    db: Session = Depends(get_session)
):
    try:
        # Use a publicly accessible bedroom image URL
        image_url = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=512"  # Modern bedroom

        transformation, output = generate_transformation(
            db=db,
            project_id=data.project_id,
            input_image_id=data.input_image_id,
            room_type=data.room_type,
            style_name=data.style_name,
            image_url=image_url,
            hf_token=hf_token
        )
        
        # Add the output image URL to the response
        response_data = transformation.dict()
        response_data["output_image_url"] = str(output)  # output is the URL string from Replicate
        
        return response_data
    
    except Exception as e:
        # Log the error and return a proper error response
        print(f"Error in transformation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Transformation failed: {str(e)}")