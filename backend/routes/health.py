from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health Check")
async def health_check(db: Session = Depends(get_db)):
    """Returns application and database connectivity status."""
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"

    return {
        "status": "ok",
        "database": db_status,
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ai_model": settings.AI_MODEL,
        "ai_provider": "gemini" if settings.AI_API_KEY else "deterministic_fallback",
    }
