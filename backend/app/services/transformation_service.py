import os
import replicate 
from app.models.transformation import Transformation
from sqlmodel import Session 
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("REPLICATE_MODEL_NAME")

def generate_transformation(db: Session, project_id, input_image_id, room_type, style_name, image_url, hf_token):
    # Call Replicate API with the style name
    output = replicate.run(
        MODEL_NAME,
        input={
            "image": image_url,
            "room_type": room_type,
            "style": style_name,  # Pass the style name to the model
            "extra_prompt": "",  # Optional extra details
            "hf_token": hf_token
        }
    )
    print(output)
    
    # Create Transformation record
    transformation = Transformation(
        project_id=project_id,
        input_image_id=input_image_id,
        room_type=room_type,
        style_name=style_name,
        prompt=None  # Optional: set to generated prompt from output if needed
    )

    db.add(transformation)
    db.commit()
    db.refresh(transformation)

    return transformation, output