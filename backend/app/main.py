# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import audio, alert

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phase 1: Health endpoint
@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}

# Include routers
app.include_router(audio.router, prefix=f"{settings.API_V1_STR}/audio", tags=["audio"])
app.include_router(alert.router, prefix=f"{settings.API_V1_STR}", tags=["alert"])
app.include_router(alert.router, tags=["alert_root"])
