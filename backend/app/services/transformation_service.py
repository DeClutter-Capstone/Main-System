import base64
import re
from io import BytesIO
from pathlib import Path
from typing import Optional, Tuple
from uuid import UUID

import requests
from PIL import Image
from sqlmodel import Session, select

from app.ai.ai import generate_image
from app.config import INPUT_DIR, OUTPUT_DIR
from app.models.transformation import Transformation
from app.models.transformationsequence import TransformationSequence


# ---------------------------------------------------------------------------
# Filename helpers
# ---------------------------------------------------------------------------

def _slugify_for_filename(value: str) -> str:
    """Produce a filesystem-safe slug from arbitrary user input.

    Used only for naming files on disk — the original room_type string is what
    gets saved to the DB and passed to the AI prompt.
    """
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    value = value.strip("_")
    return value or "untitled"


def _next_style_room_sequence(db: Session, style_slug: str, room_slug: str) -> int:
    seq = db.exec(
        select(TransformationSequence).where(
            TransformationSequence.style_name == style_slug,
            TransformationSequence.room_type == room_slug,
        )
    ).first()

    if not seq:
        seq = TransformationSequence(style_name=style_slug, room_type=room_slug, last_number=0)
        db.add(seq)
        db.commit()
        db.refresh(seq)

    seq.last_number += 1
    db.add(seq)
    db.commit()
    db.refresh(seq)
    return seq.last_number


# ---------------------------------------------------------------------------
# Image I/O
# ---------------------------------------------------------------------------

def _save_from_url(image_url: str, save_path: Path) -> None:
    response = requests.get(image_url, timeout=30)
    response.raise_for_status()
    save_path.write_bytes(response.content)


def _save_from_data_url(image_data_url: str, save_path: Path) -> None:
    if image_data_url.startswith("data:"):
        base64_str = image_data_url.split(",", 1)[1]
    else:
        base64_str = image_data_url
    image_data = Image.open(BytesIO(base64.b64decode(base64_str)))
    image_data.save(save_path, "PNG")


# ---------------------------------------------------------------------------
# Public entrypoint
# ---------------------------------------------------------------------------

def generate_transformation(
    db: Session,
    user_id: Optional[int],
    project_id: Optional[UUID],
    input_image_id: Optional[str],
    room_type: str,
    style_name: str,
    image_url: str,
    prompt: str = "",
    quality: str = "auto",
) -> Tuple[Transformation, str]:
    """Save the input image, call the AI pipeline, persist the result.

    `room_type` is stored as-is so values like "studio apartment" or
    "hotel lobby" survive into the DB and the AI prompt. A normalized slug is
    used only for the on-disk filename.
    """
    room_slug = _slugify_for_filename(room_type)
    style_slug = _slugify_for_filename(style_name)

    seq_num = _next_style_room_sequence(db, style_slug, room_slug)
    base_name = f"{style_slug}_{room_slug}_{seq_num:03d}"

    input_image_path_fs = INPUT_DIR / f"{base_name}.png"
    output_image_path_fs = OUTPUT_DIR / f"{base_name}.png"

    public_input_path = f"/storage/input/{base_name}.png"
    public_output_path = f"/storage/output/{base_name}.png"

    transformation = Transformation(
        user_id=user_id,
        project_id=project_id,
        input_image_id=UUID(input_image_id) if isinstance(input_image_id, str) and input_image_id else None,
        room_type=room_type,
        style_name=style_name,
        prompt=prompt,
        file_key=base_name,
        input_image_path=public_input_path,
        output_image_path=public_output_path,
    )

    db.add(transformation)
    db.commit()
    db.refresh(transformation)

    # Save input
    if image_url.startswith("data:"):
        _save_from_data_url(image_url, input_image_path_fs)
    else:
        _save_from_url(image_url, input_image_path_fs)

    # Call OpenAI — uses the verbatim room_type / style_name so custom values
    # are honored in the prompt. `quality` selects the underlying model.
    b64_result = generate_image(
        input_image_path_fs, room_type, style_name, prompt, quality=quality
    )
    _save_from_data_url(b64_result, output_image_path_fs)

    return transformation, public_output_path
