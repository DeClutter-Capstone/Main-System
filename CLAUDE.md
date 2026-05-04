# DeClutter — AI-Powered Interior Design Transformation

## Project Overview
Capstone project that lets users upload a room photo, pick a style, and get an AI-transformed result via the Replicate API. Monorepo with separate `frontend/` and `backend/` folders.

## Team
- Mohamed Elfaki — AI/ML
- Firas Nazar — Backend
- Saad Ahmed — Frontend
- Ahmed Salmi — Mobile & Integration

---

## Tech Stack

### Frontend (`frontend/`)
- React 19 + TypeScript + Vite 7
- Tailwind CSS 4
- React Router DOM 7
- Firebase 12 (Auth + Firestore + Storage)
- react-toastify

### Backend (`backend/`)
- Python / FastAPI 0.104
- SQLModel (SQLAlchemy + Pydantic ORM)
- PostgreSQL via psycopg2
- Replicate API — model: `syntaxnomad/interior-redesigner-declutter`
- Uvicorn ASGI server

---

## Running Locally

### Backend
```bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Architecture & Data Flow
1. User uploads image on `/generate` page
2. Frontend POSTs to `POST /api/transformations/` (multipart: image, room_type, style_name)
3. Backend converts image → base64 data URL, calls Replicate model
4. Result stored in PostgreSQL; output image URL returned
5. Frontend displays before/after comparison

---

## Key Directories
```
frontend/src/
  pages/          # HomePage, Generate, Authentication, Signup, Account, History, Projects, FAQ, About, Blog
  components/     # NavBar, TopBar, LoginForm, SignupForm, Layout, Footer, ProjectCard, HistoryCard
  services/       # transformationAPI.ts — calls backend
  Firebase/       # Firebase.ts — auth, db, storage, googleProvider

backend/app/
  api/routes/     # transformation.py, projects.py, router.py (health)
  models/         # User, Project, Transformation, InputImage, GeneratedImage, Style, Activity
  schemas/        # Pydantic request/response models
  services/       # transformation_service.py, project_service.py (detection/image are stubs)
  database/       # db.py (engine + table creation), session.py (DI)
```

---

## Domain Enums
- **RoomType**: kitchen, bedroom, bathroom, living_room, spa
- **StyleType**: modern, minimalist, scandinavian, industrial, bohemian, rustic, spa

---

## Known Gaps / TODOs
- `History` and `Projects` pages are stubs
- `ProjectCard` and `HistoryCard` components are empty stubs
- `detection_service.py` and `image_service.py` are empty (YOLO not yet implemented)
- Backend hardcodes `user_id = 1` — Firebase token validation not wired up
- No Docker / CI/CD config
- No budget estimator feature yet

---

## Environment Variables
- **Backend** (`backend/.env`): `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `REPLICATE_API_TOKEN`, `REPLICATE_MODEL_NAME`, `hf_token`
- **Frontend** (`frontend/.env.local`): Firebase config vars (prefixed `VITE_`)

---

## Protected Routes (require Firebase auth)
`/projects`, `/history`, `/faq`, `/account`

## Public Routes
`/`, `/login`, `/signup`, `/about`, `/blog`, `/generate`
