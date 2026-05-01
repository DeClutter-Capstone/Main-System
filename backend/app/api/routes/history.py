from fastapi import APIRouter, Depends
from sqlmodel import Session

router = APIRouter(prefix="/history", tags=["history"])

@router.get("/",response_model=)