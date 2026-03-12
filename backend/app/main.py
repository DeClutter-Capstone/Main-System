from fastapi import FastAPI
from api.router import router

app = FastAPI(
    title="DeClutter API",
    description="AI-powered interior redesign system",
    version="1.0"
)

app.include_router(router)