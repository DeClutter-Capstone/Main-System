# Code Snippets Reference

## Frontend - Handle Generate Click

```typescript
// From: frontend/src/pages/Generate.tsx

const handleGenerate = async () => {
  // Validate that user has uploaded an image
  if (!uploadedFile) {
    setError("Please upload an image first");
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // Call the backend API
    const response = await requestTransformation(
      uploadedFile,
      roomType,
      selectedStyle,
    );

    // Set the generated image from the response
    setGeneratedImage(response.output_image_url);
    setError(null);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    setError(errorMessage);
    setGeneratedImage(null);
    console.error("Transformation error:", err);
  } finally {
    setIsLoading(false);
  }
};
```

## Frontend - API Service

```typescript
// From: frontend/src/services/transformationAPI.ts

export async function requestTransformation(
  imageFile: File,
  roomType: string,
  styleName: string,
  projectId?: string,
): Promise<TransformationResponse> {
  const formData = new FormData();
  formData.append("image_file", imageFile);
  formData.append("room_type", roomType.toLowerCase());
  formData.append("style_name", styleName.toLowerCase());

  if (projectId) {
    formData.append("project_id", projectId);
  }

  const response = await fetch(`${API_BASE_URL}/transformations/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Transformation failed");
  }

  return response.json();
}
```

## Backend - Image to Data URL Conversion

```python
# From: backend/app/api/routes/transformation.py

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
```

## Backend - Route Handler

```python
# From: backend/app/api/routes/transformation.py

@router.post("/", response_model=TransformationResponse)
def create_transformation(
    room_type: str = Form(...),
    style_name: str = Form(...),
    image_file: UploadFile = File(...),
    project_id: str = Form(None),
    input_image_id: str = Form(None),
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
            hf_token=hf_token
        )

        # Add the output image URL to the response
        response_data = {
            "transformation_id": str(transformation.transformation_id),
            "room_type": transformation.room_type,
            "style_name": transformation.style_name,
            "project_id": str(transformation.project_id) if transformation.project_id else None,
            "input_image_id": str(transformation.input_image_id) if transformation.input_image_id else None,
            "prompt": transformation.prompt,
            "output_image_url": str(output)
        }

        return response_data

    except Exception as e:
        print(f"Error in transformation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Transformation failed: {str(e)}")
```

## Backend - Generate Transformation Service

```python
# From: backend/app/services/transformation_service.py

def generate_transformation(db: Session, project_id, input_image_id, room_type: str, style_name: str, image_url: str, hf_token: str):
    """
    Generate a transformation using Replicate API
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
```

## Backend - CORS Configuration

```python
# From: backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Create database tables on startup"""
    create_db_and_tables()

app.include_router(router)
```

## Frontend - Display Generated Image

```tsx
// From: frontend/src/pages/Generate.tsx

{
  /* Generated Image Display */
}
{
  generatedImage && (
    <div style={styles.generatedImageSection}>
      <h2 style={styles.generatedImageTitle}>Generated Image</h2>
      <div style={styles.generatedImageContainer}>
        <img
          src={generatedImage}
          alt="Generated"
          style={styles.generatedImageDisplay}
        />
      </div>
    </div>
  );
}
```

## Frontend - Error Display

```tsx
// From: frontend/src/pages/Generate.tsx

{
  /* Error Message */
}
{
  error && (
    <div style={styles.errorMessage}>
      <p>{error}</p>
    </div>
  );
}
```

## Frontend - Generate Button with Loading State

```tsx
// From: frontend/src/pages/Generate.tsx

<button
  style={{
    ...styles.generateButton,
    opacity: isLoading ? 0.6 : 1,
    cursor: isLoading ? "not-allowed" : "pointer",
  }}
  onClick={handleGenerate}
  disabled={isLoading}
>
  {isLoading ? "Generating..." : "Generate"}
</button>
```

## Frontend - File Upload Handler

```tsx
// From: frontend/src/pages/Generate.tsx

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPG, JPEG, or PNG image");
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    // Store the file for later use
    setUploadedFile(file);

    // Read and set the preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
};
```

## Frontend - Styles for Generated Image Section

```typescript
// From: frontend/src/pages/Generate.tsx

generatedImageSection: {
  marginTop: "3rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
} as React.CSSProperties,

generatedImageTitle: {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#333",
  margin: "0",
} as React.CSSProperties,

generatedImageContainer: {
  width: "100%",
  maxWidth: "800px",
  margin: "0 auto",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
} as React.CSSProperties,

generatedImageDisplay: {
  width: "100%",
  height: "auto",
  display: "block",
} as React.CSSProperties,
```

## Backend - Router Configuration

```python
# From: backend/app/api/router.py

from fastapi import APIRouter
from app.api.routes import projects, transformation

router = APIRouter(prefix='/api')
router.include_router(projects.router)
router.include_router(transformation.router)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}
```

## cURL Test Request

```bash
curl -X POST http://localhost:8000/api/transformations/ \
  -F "image_file=@/path/to/bedroom.jpg" \
  -F "room_type=bedroom" \
  -F "style_name=minimalist"
```

## Expected cURL Response

```json
{
  "transformation_id": "550e8400-e29b-41d4-a716-446655440000",
  "room_type": "bedroom",
  "style_name": "minimalist",
  "project_id": null,
  "input_image_id": null,
  "prompt": null,
  "output_image_url": "https://replicate.com/api/models/...output.jpg"
}
```

## Error Response Example

```json
{
  "detail": "Transformation failed: File size must be less than 5MB"
}
```

## Browser Console API Test (JavaScript)

```javascript
// Test from browser console
const formData = new FormData();
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

formData.append("image_file", file);
formData.append("room_type", "bedroom");
formData.append("style_name", "minimalist");

fetch("http://localhost:8000/api/transformations/", {
  method: "POST",
  body: formData,
})
  .then((r) => r.json())
  .then((data) => console.log(data))
  .catch((e) => console.error(e));
```

---

**Note:** All code snippets are ready to use. Copy and paste as needed.
