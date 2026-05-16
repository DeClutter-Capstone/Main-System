"""File upload and storage handling utilities."""
import os
import shutil
from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile
from PIL import Image
from io import BytesIO


# Configuration
UPLOAD_DIR = Path(__file__).parent.parent.parent / "storage" / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


# Create uploads directory if it doesn't exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def validate_image_file(file_contents: bytes) -> dict:
    """
    Validate image file before saving.
    
    Args:
        file_contents: Raw bytes of the file
    
    Returns:
        dict: Contains valid (bool), message (str), dimensions (tuple if valid)
    """
    # Check file extension
    if not hasattr(validate_image_file, '_original_filename'):
        return {"valid": False, "message": "Missing filename"}
    
    file_ext = Path(validate_image_file._original_filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return {
            "valid": False,
            "message": f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }
    
    # Check file size
    file_size = len(file_contents)
    
    if file_size > MAX_FILE_SIZE:
        return {
            "valid": False,
            "message": f"File size ({file_size / 1024 / 1024:.2f} MB) exceeds limit ({MAX_FILE_SIZE / 1024 / 1024:.0f} MB)"
        }
    
    # Validate image format and get dimensions
    try:
        image = Image.open(BytesIO(file_contents))
        image.verify()  # Verify image integrity
        
        # Reopen image to get dimensions (verify() closes the image)
        image = Image.open(BytesIO(file_contents))
        width, height = image.size
        
        return {
            "valid": True,
            "size": file_size,
            "width": width,
            "height": height,
            "format": image.format
        }
    except Exception as e:
        return {
            "valid": False,
            "message": f"Invalid image file: {str(e)}"
        }


async def save_upload_file(file: UploadFile) -> dict:
    """
    Save uploaded file to storage.
    
    Returns:
        dict: Contains file_path (str), file_name (str), file_size (int), dimensions (tuple)
    """
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Read file content once
    contents = await file.read()
    
    # Store filename for validation function
    validate_image_file._original_filename = file.filename
    
    # Validate file
    validation = await validate_image_file(contents)
    if not validation["valid"]:
        raise ValueError(validation["message"])
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    return {
        "file_path": str(file_path),
        "file_name": unique_filename,
        "file_size": validation["size"],
        "width": validation["width"],
        "height": validation["height"],
        "format": validation["format"]
    }


def delete_upload_file(file_path: str) -> bool:
    """Delete uploaded file from storage."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error deleting file {file_path}: {str(e)}")
        return False


def get_upload_url(file_name: str) -> str:
    """Generate URL for accessing uploaded file."""
    return f"/files/{file_name}"
