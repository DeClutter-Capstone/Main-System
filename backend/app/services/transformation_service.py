import os
import replicate 
from app.models.transformation import Transformation
from sqlmodel import Session 
from dotenv import load_dotenv
from uuid import UUID

load_dotenv()

MODEL_NAME = os.getenv("REPLICATE_MODEL_NAME")


def generate_transformation(db: Session, project_id, input_image_id, room_type: str, style_name: str, image_url: str, hf_token: str):
    """
    Generate a transformation using Replicate API
    
    Args:
        db: Database session
        project_id: Project UUID (optional)
        input_image_id: Input image UUID (optional)
        room_type: Type of room (e.g., "bedroom", "living_room")
        style_name: Style name (e.g., "modern", "minimalist")
        image_url: Image URL or data URL
        hf_token: Hugging Face token for the model
    
    Returns:
        Tuple of (Transformation object, output image URL)
    """
    
    # Call Replicate API with room type and style
    output = replicate.run(
        MODEL_NAME,
        input={
            "image": image_url,
            "room_type": room_type.lower(),
            "style": style_name.lower(),
            "hf_token": hf_token
        }
    )
    
    print(f"Replicate output: {output}")
    
    # Create and save transformation record
    transformation = Transformation(
        project_id=UUID(project_id) if isinstance(project_id, str) else project_id,
        input_image_id=UUID(input_image_id) if isinstance(input_image_id, str) else input_image_id,
        room_type=room_type.lower(),
        style_name=style_name.lower()
    )

    db.add(transformation)
    db.commit()
    db.refresh(transformation)

    return transformation, output