# Request Flow Diagram

## Complete Transformation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. User Action                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Upload Image (JPG/PNG, max 5MB)                          │   │
│  │ • Select Room Type (Bedroom, Living Room, etc.)            │   │
│  │ • Select Style (Minimalist, Modern, Scandinavian)          │   │
│  │ • Click "Generate" Button                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  2. State Updates                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • uploadedImage: data URL (for preview)                    │   │
│  │ • uploadedFile: File object (for API)                      │   │
│  │ • selectedStyle: "Minimalist"                              │   │
│  │ • roomType: "Bedroom"                                      │   │
│  │ • isLoading: true                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  3. API Request (FormData)                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ POST /api/transformations/                                 │   │
│  │ Content-Type: multipart/form-data                          │   │
│  │                                                             │   │
│  │ • image_file: <File Object>                                │   │
│  │ • room_type: "bedroom"                                     │   │
│  │ • style_name: "minimalist"                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                    NETWORK (HTTP POST)
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                        BACKEND (FastAPI)                             │
├──────────────────────────────┼───────────────────────────────────────┤
│                              ▼                                       │
│  4. Route Handler                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ POST /api/transformations/                                 │   │
│  │ Location: backend/app/api/routes/transformation.py         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  5. Image Processing                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Read image bytes from uploaded file                      │   │
│  │ • Convert to base64                                        │   │
│  │ • Create data URL: data:image/jpeg;base64,<encoded>        │   │
│  │ Function: save_uploaded_image_to_url()                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  6. Database Record Creation                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Create Transformation record:                            │   │
│  │   - transformation_id: UUID                                │   │
│  │   - room_type: "bedroom"                                   │   │
│  │   - style_name: "minimalist"                               │   │
│  │   - project_id: NULL                                       │   │
│  │   - input_image_id: NULL                                   │   │
│  │ • Save to database                                         │   │
│  │ Location: backend/app/services/transformation_service.py   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  7. Replicate API Request                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ replicate.run(MODEL_NAME, input={                          │   │
│  │   "image": "data:image/jpeg;base64,...",                   │   │
│  │   "room_type": "bedroom",                                  │   │
│  │   "style": "minimalist",                                   │   │
│  │   "hf_token": <token>                                      │   │
│  │ })                                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                    EXTERNAL API (Replicate)
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                    REPLICATE (Remote AI Model)                       │
├──────────────────────────────┼───────────────────────────────────────┤
│                              ▼                                       │
│  8. Model Processing                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Receive image + room type + style                        │   │
│  │ • Process through AI model (30-60 seconds typically)       │   │
│  │ • Generate transformed image                               │   │
│  │ • Upload to Replicate storage                              │   │
│  │ • Return output URL                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                    NETWORK (HTTP Response)
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                        BACKEND (FastAPI)                             │
├──────────────────────────────┼───────────────────────────────────────┤
│                              ▼                                       │
│  9. Response Preparation                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ {                                                           │   │
│  │   "transformation_id": "uuid-string",                       │   │
│  │   "room_type": "bedroom",                                   │   │
│  │   "style_name": "minimalist",                               │   │
│  │   "project_id": null,                                       │   │
│  │   "input_image_id": null,                                   │   │
│  │   "prompt": null,                                           │   │
│  │   "output_image_url": "https://replicate.com/output.jpg"   │   │
│  │ }                                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                    NETWORK (HTTP Response)
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                        FRONTEND (React)                              │
├──────────────────────────────┼───────────────────────────────────────┤
│                              ▼                                       │
│  10. Response Handling                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Parse JSON response                                      │   │
│  │ • Extract output_image_url                                │   │
│  │ • Set generatedImage state                                 │   │
│  │ • Set isLoading: false                                     │   │
│  │ Location: frontend/src/services/transformationAPI.ts       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  11. Display Generated Image                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Render "Generated Image" section                         │   │
│  │ • Display image from URL                                   │   │
│  │ • Button changes back to "Generate"                        │   │
│  │ • Remove loading state                                     │   │
│  │ Location: frontend/src/pages/Generate.tsx                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  12. User Sees Result                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ✓ Original bedroom image on left                           │   │
│  │ ✓ Generated minimalist bedroom on right                    │   │
│  │ ✓ Both displayed with proper styling                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌────────────────────────────────────┐
│   User Action / API Call Error     │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ Frontend catches error in try/catch│
├────────────────────────────────────┤
│ • Set error state with message     │
│ • Set isLoading: false             │
│ • Clear generatedImage             │
│ • Display error in red box         │
└────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ User sees error message:           │
│ "File size must be less than 5MB"  │
│ or                                 │
│ "Transformation failed: ..."       │
└────────────────────────────────────┘
```

## File Structure with Flow

```
FRONTEND REQUEST
Generate.tsx:1 → handleGenerate() called
    ↓
Generate.tsx:82 → Check if file uploaded
    ↓
transformationAPI.ts:26 → requestTransformation()
    ↓
transformationAPI.ts:34 → Create FormData
    ↓
transformationAPI.ts:42 → fetch() POST
    ↓
────────────────── NETWORK ──────────────────
    ↓
BACKEND RECEIVES REQUEST
transformation.py:33 → create_transformation()
    ↓
transformation.py:47 → Read image bytes
    ↓
transformation.py:18 → save_uploaded_image_to_url()
    ↓
transformation.py:29 → Create data URL
    ↓
transformation.py:52 → Call generate_transformation()
    ↓
transformation_service.py:13 → generate_transformation()
    ↓
transformation_service.py:32 → Create Transformation record
    ↓
transformation_service.py:35 → Save to database
    ↓
transformation_service.py:28 → replicate.run()
    ↓
────────────────── NETWORK (to Replicate) ──────────────────
    ↓
REPLICATE PROCESSES IMAGE (30-60 seconds)
    ↓
────────────────── NETWORK (return from Replicate) ──────────────────
    ↓
transformation_service.py:40 → Return transformation + output_url
    ↓
transformation.py:57 → Build response JSON
    ↓
transformation.py:63 → Return response
    ↓
────────────────── NETWORK (back to Frontend) ──────────────────
    ↓
FRONTEND RECEIVES RESPONSE
transformationAPI.ts:42 → Parse response JSON
    ↓
Generate.tsx:98 → Receive output_image_url
    ↓
Generate.tsx:99 → Set generatedImage state
    ↓
Generate.tsx:101 → Re-render with generated image
    ↓
USER SEES GENERATED IMAGE
```

## Key Points

1. **Image Format**: JPEG, PNG supported (max 5MB)
2. **Processing Time**: 30-60 seconds (Replicate dependent)
3. **Image Storage**: Output image hosted on Replicate servers, not stored locally
4. **Database Storage**: Transformation metadata stored, but image URL only
5. **Error Handling**: Errors shown to user in red error box
6. **No Page Reload**: Single Page App, smooth UX
7. **CORS Enabled**: Backend allows requests from all origins (configure for production)
