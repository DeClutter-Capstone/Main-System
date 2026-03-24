import os
import replicate 
from models.transformation import Transformation
from sqlmodel import Session 
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("ReplicateModel")
def generate_transformation(db, project_id, input_image_id, room_type, image_url, hf_token):
    output = replicate.run(MODEL_NAME,
    input={"image": image_url,
            "room_type": room_type,
            "hf_token": hf_token}
    )
    transformation = Transformation(
        project_id=project_id,
        input_image_id=input_image_id,
        room_type=room_type
    )

    db.add(transformation)
    db.commit()
    db.refresh(transformation)

    return transformation, output