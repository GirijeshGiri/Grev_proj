import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from config import settings
from database import init_db
from routes import health, analyze, requests, channels

# Configure structured logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("grievance_scribe")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager: initializes database on startup."""
    logger.info("Starting up %s (version %s)...", settings.APP_NAME, settings.APP_VERSION)
    init_db()
    logger.info("Database initialized successfully at %s", settings.DATABASE_URL)
    yield
    logger.info("Shutting down %s...", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend AI Intelligence Engine and Request Tracker for Grievance Scribe - AI Citizen Request Navigator.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# -----------------------------------------------------------------------------
# CORS Configuration
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Standardized Error Handlers (Section 29)
# -----------------------------------------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Formats all HTTP exceptions into clean, predictable JSON."""
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": str(exc.detail),
            "code": f"HTTP_{exc.status_code}",
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic request validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "message": "Invalid input format or missing required fields.",
            "code": "VALIDATION_ERROR",
            "details": exc.errors(),
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches all unexpected internal exceptions without exposing sensitive stack traces."""
    logger.exception("Unhandled application error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "An unexpected error occurred while processing your request.",
            "code": "INTERNAL_SERVER_ERROR",
        }
    )


# -----------------------------------------------------------------------------
# Router Registrations (Section 4 & 5)
# -----------------------------------------------------------------------------
app.include_router(health.router)
app.include_router(health.router, prefix="/api")

app.include_router(requests.router, prefix="/requests")
app.include_router(requests.router, prefix="/api/requests")

app.include_router(analyze.router)
app.include_router(channels.router)
app.include_router(channels.router, prefix="")


@app.get("/", include_in_schema=False)
async def root():
    """Root redirect to interactive API documentation."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "message": "Welcome to Grievance Scribe Backend. Access /docs for interactive Swagger UI."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
