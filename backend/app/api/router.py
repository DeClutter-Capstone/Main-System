from fastapi import APIRouter
from app.api.routes import projects

router = APIRouter(prefix='/api', tags=['api'])
router.include_router(projects.router, tags=["Projects"])

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

