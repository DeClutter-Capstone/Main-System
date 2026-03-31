from fastapi import APIRouter
from app.api.routes import projects, transformation

router = APIRouter(prefix='/api')
router.include_router(projects.router)
router.include_router(transformation.router)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

