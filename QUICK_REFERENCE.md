# Quick Reference Card

## 🎯 What Was Built

Complete end-to-end integration between React frontend and FastAPI backend for image transformation using Replicate AI model.

## 📊 The Flow (Simple Version)

```
User uploads image → Selects room & style → Clicks Generate
                                    ↓
                        Backend receives image
                                    ↓
                        Converts to data URL
                                    ↓
                        Sends to Replicate API
                                    ↓
                        Waits for AI processing
                                    ↓
                        Gets output image URL
                                    ↓
                        Returns to frontend
                                    ↓
                        Frontend displays image
```

## 🔗 Key Connections

### Frontend → Backend

```
Generate.tsx (handleGenerate)
    ↓
transformationAPI.ts (requestTransformation)
    ↓
POST /api/transformations/
```

### Backend Request Handler

```
transformation.py (create_transformation)
    ↓
Reads multipart form data
    ↓
Saves to database
    ↓
Calls transformation_service.py
```

### Backend → Replicate

```
transformation_service.py (generate_transformation)
    ↓
replicate.run() with image + room_type + style
    ↓
Replicate processes (30-60 sec)
    ↓
Returns output URL
```

## 📝 API Endpoint

```
POST /api/transformations/

Content-Type: multipart/form-data

Fields:
├─ image_file: File (JPEG/PNG, max 5MB)
├─ room_type: string (e.g., "bedroom")
├─ style_name: string (e.g., "minimalist")
├─ project_id: string (optional)
└─ input_image_id: string (optional)

Response:
{
  "transformation_id": "uuid",
  "room_type": "bedroom",
  "style_name": "minimalist",
  "output_image_url": "https://..."
}
```

## 🚀 To Run

```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## 📁 What Changed

| File                                             | Change                                      | Type     |
| ------------------------------------------------ | ------------------------------------------- | -------- |
| `backend/app/api/routes/transformation.py`       | Accept multipart form-data, image to base64 | Modified |
| `backend/app/services/transformation_service.py` | Accept style_name, pass to Replicate        | Modified |
| `backend/app/api/router.py`                      | Fix duplicate router                        | Fixed    |
| `backend/app/main.py`                            | Add CORS middleware                         | Enhanced |
| `frontend/src/services/transformationAPI.ts`     | New API service                             | Created  |
| `frontend/src/pages/Generate.tsx`                | Integrate API, show results                 | Enhanced |

## 💡 Key Features

- ✅ Accepts image file upload
- ✅ Stores transformation metadata in database
- ✅ Sends to Replicate AI model
- ✅ Receives and displays generated image
- ✅ Shows loading state while processing
- ✅ Displays errors to user
- ✅ CORS enabled for frontend-backend

## 🎨 User Experience

1. **Upload Page**
   - Image preview shows after selection
   - Select room type dropdown
   - Select style (card-based UI)

2. **Processing**
   - Generate button changes to "Generating..."
   - Button is disabled during processing
   - Visual feedback with opacity change

3. **Results**
   - Generated image displays below button
   - Clean, professional styling
   - Can upload another image to restart

4. **Error Handling**
   - Red error box shows if something fails
   - Clear error messages
   - User can retry

## 🔧 Environment Setup

### Backend `.env`

```
hf_token=your_hugging_face_api_token
REPLICATE_MODEL_NAME=owner/model-name
```

### Frontend Config

Edit `frontend/src/services/transformationAPI.ts`:

```typescript
const API_BASE_URL = "http://localhost:8000/api";
```

## 📊 Data Models

### Transformation (Database)

```
- transformation_id: UUID (auto)
- room_type: string
- style_name: string
- input_image_id: UUID (optional)
- project_id: UUID (optional)
- prompt: string (optional)
```

### Response JSON

```
- transformation_id: UUID string
- room_type: string
- style_name: string
- project_id: UUID string or null
- input_image_id: UUID string or null
- prompt: string or null
- output_image_url: string (URL from Replicate)
```

## 🐛 Common Issues & Fixes

| Issue                       | Cause                     | Fix                                        |
| --------------------------- | ------------------------- | ------------------------------------------ |
| CORS Error                  | Frontend/Backend mismatch | CORS already enabled, check running        |
| File not uploading          | File validation           | Check file is JPG/PNG, <5MB                |
| No image output             | API error                 | Check Replicate credentials in .env        |
| Backend not responding      | Port conflict             | Ensure port 8000 is free                   |
| Frontend can't find backend | Wrong API URL             | Check API_BASE_URL in transformationAPI.ts |

## 📚 Documentation

- **INTEGRATION_GUIDE.md** - Detailed flow documentation
- **SETUP_GUIDE.md** - Installation and deployment
- **FLOW_DIAGRAM.md** - Visual flow diagrams
- **IMPLEMENTATION_SUMMARY.md** - Complete summary

## 🎯 Next Steps (Optional)

1. Add project selection
2. Add history/gallery page
3. Add download button
4. Add batch processing
5. Add user authentication
6. Add rate limiting
7. Store generated images locally
8. Add image comparison tool

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173 (or shown)
- [ ] Can upload image successfully
- [ ] Image preview displays
- [ ] Can select room type
- [ ] Can select style
- [ ] Generate button works
- [ ] Loading state shows
- [ ] Generated image displays after processing
- [ ] Error handling works
- [ ] No CORS errors in console

## 🔐 Production Notes

Before deploying to production:

- [ ] Update CORS allowed_origins
- [ ] Use production database
- [ ] Add authentication
- [ ] Setup HTTPS
- [ ] Add rate limiting
- [ ] Setup monitoring/logging
- [ ] Use environment variables
- [ ] Add input validation
- [ ] Setup error tracking

---

**Status:** ✅ Ready to Use
**Last Updated:** March 25, 2026
