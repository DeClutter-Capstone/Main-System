import os
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO
from app.models.transformation import Transformation
from app.models.transformationsequence import TransformationSequence
from app.ai.ai import generate_image
from sqlmodel import Session, select
from dotenv import load_dotenv
from uuid import UUID
import base64

load_dotenv()

STORAGE_DIR = Path(__file__).parent.parent.parent / "storage"
INPUT_DIR = STORAGE_DIR / "input"
OUTPUT_DIR = STORAGE_DIR / "output"

# Create directories if they don't exist
INPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def _next_style_room_sequence(db: Session, style_name: str, room_type: str) -> int:
    """
    Atomically get the next sequence number for (style_name, room_type).
    """
    seq = db.exec(
        select(TransformationSequence).where(
            TransformationSequence.style_name == style_name,
            TransformationSequence.room_type == room_type,
        )
    ).first()

    if not seq:
        seq = TransformationSequence(style_name=style_name, room_type=room_type, last_number=0)
        db.add(seq)
        db.commit()
        db.refresh(seq)

    seq.last_number += 1
    db.add(seq)
    db.commit()
    db.refresh(seq)
    return seq.last_number


def save_image_from_url(image_url: str, save_path: Path):
    try:
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"Image saved to: {save_path}")
    except Exception as e:
        print(f"Error downloading/saving image from {image_url}: {e}")
        raise

def save_image_from_base64(image_data_url: str, save_path: Path):
    try:
        # Extract base64 data
        if image_data_url.startswith("data:"):
            base64_str = image_data_url.split(",")[1]
        else:
            base64_str = image_data_url
        
        # Decode and save
        image_data = Image.open(BytesIO(base64.b64decode(base64_str)))
        image_data.save(save_path, "PNG")
        
        print(f"✅ Image saved to: {save_path}")
    except Exception as e:
        print(f"Error saving base64 image: {e}")
        raise


def normalize_room_type(room_type: str) -> str:
    """
    Normalize room type by converting spaces to underscores and lowercasing
    e.g., "living room" -> "living_room"
    """
    return room_type.lower().replace(" ", "_")


def generate_transformation(db: Session, project_id, input_image_id, room_type: str, style_name: str, image_url: str, prompt: str = ''):
    """
    Generate a transformation using Replicate API and save images locally
    """
    # Normalize room_type to match enum (e.g., "living room" -> "living_room")
    normalized_room_type = normalize_room_type(room_type)
    normalized_style_name = normalize_room_type(style_name)

    print(f"Room type: {room_type} -> {normalized_room_type}")
    print(f"Style name: {style_name} -> {normalized_style_name}")

    # Allocate friendly filename (same for input/output)
    seq_num = _next_style_room_sequence(db, normalized_style_name, normalized_room_type)
    base_name = f"{normalized_style_name}_{normalized_room_type}_{seq_num:03d}"
    print(f"Using filename base: {base_name}")

    # Create transformation record first to get the ID
    transformation = Transformation(
        # project_id=UUID(project_id) if isinstance(project_id, str) and project_id else None,
        input_image_id=UUID(input_image_id) if isinstance(input_image_id, str) and input_image_id else None,
        room_type=normalized_room_type,
        style_name=normalized_style_name,
        prompt=prompt,
        file_key=base_name,
    )

    db.add(transformation)
    db.commit()
    db.refresh(transformation)

    transformation_id = str(transformation.transformation_id)
    print(f"📝 Created transformation: {transformation_id}")

    # Save input image
    input_image_path = INPUT_DIR / f"{base_name}.png"
    print(f"Saving input image to: {input_image_path}")

    if image_url.startswith("data:"):
        save_image_from_base64(image_url, input_image_path)
    else:
        save_image_from_url(image_url, input_image_path)

    # Call OpenAI gpt-image-1
    print(f"Calling OpenAI gpt-image-1 for {normalized_room_type} / {normalized_style_name}")
    output_image_path = OUTPUT_DIR / f"{base_name}.png"
    b64_result = generate_image(input_image_path, normalized_room_type, normalized_style_name, prompt)

    print(f"Saving output image to: {output_image_path}")
    save_image_from_base64(b64_result, output_image_path)

    return transformation, f"/storage/output/{base_name}.png"