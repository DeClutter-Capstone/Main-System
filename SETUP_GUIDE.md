# Setup and Running Guide

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Make sure your `requirements.txt` includes:

- `fastapi`
- `uvicorn`
- `sqlmodel`
- `replicate`
- `python-multipart` (for form data handling)
- `pillow` (for image processing)
- `python-dotenv`

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
hf_token=your_hugging_face_token
REPLICATE_MODEL_NAME=model_owner/model_name
DATABASE_URL=your_database_url
```

### 3. Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

Check health: `http://localhost:8000/api/health`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Update API Base URL (if needed)

Edit `frontend/src/services/transformationAPI.ts`:

```typescript
const API_BASE_URL = "http://localhost:8000/api"; // Change if backend is on different host/port
```

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will typically be available at `http://localhost:5173` (or as shown in console)

## Complete Flow Test

1. **Start Backend**

   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend** (in another terminal)

   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**
   - Go to `http://localhost:5173` (or shown in console)
   - Navigate to "Generate" or "Transformation" page

4. **Test the Flow**
   - Upload a bedroom image (JPG, PNG, max 5MB)
   - Select a room type (Bedroom, Living Room, etc.)
   - Select a style (Minimalist, Modern, Scandinavian)
   - Click "Generate"
   - Wait for processing (30-60 seconds typically)
   - View the generated image

## Troubleshooting

### CORS Error

If you see CORS errors in browser console:

- Backend CORS is already configured in `backend/app/main.py`
- Make sure backend is running before frontend makes requests

### Image Processing Error

- Ensure `pillow` is installed: `pip install pillow`
- Check that uploaded image is valid (JPG, PNG)
- File size must be less than 5MB

### Replicate API Error

- Verify `hf_token` is set correctly
- Verify `REPLICATE_MODEL_NAME` is correct
- Check Replicate API status
- Ensure replicate package is installed: `pip install replicate`

### FormData Error

- Ensure `python-multipart` is installed: `pip install python-multipart`
- This is required for FastAPI to handle multipart form data

### Database Connection Error

- Verify database URL in `.env`
- Ensure database is running
- Check database permissions

## Database

The system uses SQLModel (SQLAlchemy + Pydantic). The database is automatically created on first startup.

Models created:

- `User`
- `Project`
- `InputImage`
- `Transformation`
- `GeneratedImage`
- `Style`
- `Activity`

## API Endpoints

### Health Check

```
GET /api/health
```

### Create Transformation

```
POST /api/transformations/
Content-Type: multipart/form-data

Parameters:
- image_file: File (required)
- room_type: string (required)
- style_name: string (required)
- project_id: string (optional)
- input_image_id: string (optional)
```

Response:

```json
{
  "transformation_id": "uuid",
  "room_type": "bedroom",
  "style_name": "minimalist",
  "project_id": null,
  "input_image_id": null,
  "prompt": null,
  "output_image_url": "https://replicate.com/..."
}
```

## File Structure

```
Main-System/
├── backend/
│   └── app/
│       ├── api/
│       │   ├── routes/
│       │   │   ├── transformation.py (UPDATED)
│       │   │   └── projects.py
│       │   └── router.py (UPDATED)
│       ├── services/
│       │   └── transformation_service.py (UPDATED)
│       ├── models/
│       ├── schemas/
│       ├── database/
│       ├── main.py (UPDATED)
│       └── config.py
├── frontend/
│   └── src/
│       ├── services/
│       │   └── transformationAPI.ts (NEW)
│       ├── pages/
│       │   └── Generate.tsx (UPDATED)
│       └── ...
└── INTEGRATION_GUIDE.md (NEW)
```

## Production Deployment

### Backend

1. Set `debug=False` in FastAPI
2. Update CORS allowed origins to specific domain
3. Use production database (not SQLite)
4. Use environment variables for sensitive data
5. Deploy with Gunicorn + Uvicorn
6. Use HTTPS

### Frontend

1. Build for production: `npm run build`
2. Deploy to CDN or static hosting
3. Update `API_BASE_URL` to production backend URL
4. Use environment variables for API URLs

## Notes

- Processing time depends on Replicate model (typically 30-60 seconds)
- Image output is hosted on Replicate, not stored locally
- For local image storage, implement image saving in `transformation_service.py`
- Scale horizontally by using async processing (Celery + Redis)
