import os
import replicate 
from app.models.transformation import Transformation
from sqlmodel import Session 
from dotenv import load_dotenv
from app.models.style import StyleTypes
load_dotenv()

MODEL_NAME = os.getenv("REPLICATE_MODEL_NAME")

def generate_transformation(db, project_id, input_image_id, room_type, image_url, hf_token):
    output = replicate.run(
        MODEL_NAME,
        input={
            "image": image_url,
            "room_type": room_type,
            "hf_token": hf_token
        }
    )
    print(output)
    transformation = Transformation(
        project_id=project_id,
        input_image_id=input_image_id,
        room_type=room_type,
        style= enumerate(StyleTypes)
    )

    db.add(transformation)
    db.commit()
    db.refresh(transformation)

    return transformation, output