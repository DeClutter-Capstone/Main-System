from fastapi import APIRouter
from app.api.routes import projects, transformation, history, activity, users

router = APIRouter(prefix='/api')
router.include_router(projects.router)
router.include_router(transformation.router)
router.include_router(history.router)
router.include_router(activity.router)
router.include_router(users.router)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

