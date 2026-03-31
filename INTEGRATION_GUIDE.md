# Backend-Frontend Integration Guide

## Overview

This document describes the complete flow for transforming bedroom images using the DeClutter system.

## Complete Flow

### 1. **Frontend - Image Upload & Options Selection**

- User uploads image via `Generate.tsx`
- User selects room type (Bedroom, Living Room, etc.)
- User selects design style (Minimalist, Modern, Scandinavian)
- Image preview is displayed

### 2. **Frontend - Generate Button Click**

- User clicks "Generate" button
- `handleGenerate()` function is triggered
- Shows loading state with "Generating..." button text

### 3. **Frontend - API Request**

- `requestTransformation()` is called with:
  - `imageFile`: The uploaded File object
  - `roomType`: Selected room type (normalized to lowercase)
  - `styleName`: Selected style (normalized to lowercase)
- Sends FormData via POST to backend

**Request Details:**

```
POST /api/transformations/
Content-Type: multipart/form-data

- image_file: <File>
- room_type: "bedroom"
- style_name: "minimalist"
- project_id: (optional)
```

### 4. **Backend - Route Handler**

- Endpoint: `POST /api/transformations/`
- Route file: `backend/app/api/routes/transformation.py`
- Receives multipart form data with:
  - `image_file` (uploaded file)
  - `room_type` (string)
  - `style_name` (string)

### 5. **Backend - Image Processing**

- Image bytes are read from uploaded file
- Converted to base64 data URL using `save_uploaded_image_to_url()`
- Format: `data:image/jpeg;base64,<base64_encoded_image>`

### 6. **Backend - Database Record Creation & Replicate Request**

- `generate_transformation()` service is called
- Creates a `Transformation` record in the database:
  - `room_type`: "bedroom"
  - `style_name`: "minimalist"
  - `transformation_id`: Auto-generated UUID
- Sends request to Replicate API:
  ```python
  {
    "image": data_url,
    "room_type": "bedroom",
    "style": "minimalist",
    "hf_token": <token>
  }
  ```

### 7. **Replicate Processing**

- Replicate model processes the image
- Generates transformed image
- Returns output URL (hosted on Replicate's servers)

### 8. **Backend - Response**

- Route returns transformation record with output URL:
  ```json
  {
    "transformation_id": "uuid",
    "room_type": "bedroom",
    "style_name": "minimalist",
    "output_image_url": "https://replicate.com/api/models/.../output.jpg"
  }
  ```

### 9. **Frontend - Display Generated Image**

- Receives response with `output_image_url`
- Sets `generatedImage` state with the URL
- Image displays in "Generated Image" section
- Loading state is removed

## Files Modified/Created

### Backend Files

1. **`backend/app/api/routes/transformation.py`**
   - Updated to accept multipart form data
   - Added `save_uploaded_image_to_url()` helper function
   - Handles image file upload and conversion to data URL

2. **`backend/app/services/transformation_service.py`**
   - Updated `generate_transformation()` to accept `style_name` parameter
   - Passes both `room_type` and `style` to Replicate API
   - Fixed UUID handling for optional fields

3. **`backend/app/api/router.py`**
   - Fixed router initialization (removed duplicate APIRouter)
   - Properly includes both projects and transformation routers

4. **`backend/app/main.py`**
   - Added CORS middleware to allow frontend requests
   - Allows requests from any origin (configure for production)

### Frontend Files

1. **`frontend/src/services/transformationAPI.ts`** (NEW)
   - Created API service module
   - `requestTransformation()` function handles backend communication
   - Sends FormData with image file and options
   - Returns typed response

2. **`frontend/src/pages/Generate.tsx`**
   - Added state for:
     - `generatedImage`: Stores the output image URL
     - `isLoading`: Tracks processing state
     - `error`: Stores error messages
     - `uploadedFile`: Stores the File object for API call
   - Updated `handleFileChange()` to store the File object
   - Added `handleGenerate()` async function
   - Added error display section
   - Added generated image display section
   - Updated styles for error and generated image display

## API Endpoint

**Route:** `POST /api/transformations/`

**Request:**

```
Content-Type: multipart/form-data

room_type: string (required)
style_name: string (required)
image_file: File (required)
project_id: string (optional)
input_image_id: string (optional)
```

**Response:**

```json
{
  "transformation_id": "uuid",
  "room_type": "bedroom",
  "style_name": "minimalist",
  "project_id": null,
  "input_image_id": null,
  "prompt": null,
  "output_image_url": "https://..."
}
```

**Error Response:**

```json
{
  "detail": "Error message"
}
```

## Environment Variables Required

### Backend

- `REPLICATE_MODEL_NAME`: The Replicate model identifier
- `hf_token`: Hugging Face API token
- Database connection strings

### Frontend

- Update `API_BASE_URL` in `transformationAPI.ts` if backend is on different host/port

## Testing

### Simple Request Example

```bash
curl -X POST http://localhost:8000/api/transformations/ \
  -F "image_file=@bedroom.jpg" \
  -F "room_type=bedroom" \
  -F "style_name=minimalist"
```

### Expected Flow

1. User uploads image → preview shows
2. User selects room type and style
3. User clicks "Generate"
4. Button shows "Generating..." and is disabled
5. After 30-60 seconds (depends on Replicate), generated image appears
6. If error occurs, error message displays in red

## Notes

- Images are converted to base64 data URLs for Replicate processing
- No images are saved to disk; they're processed in memory
- CORS is enabled for all origins (restrict in production)
- Output image is hosted on Replicate's infrastructure, not stored locally
- Add `input_image_id` to database if you need to track uploads separately
