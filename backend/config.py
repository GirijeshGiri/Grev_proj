import os
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App Information
    APP_NAME: str = "Grievance Scribe API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Server Bindings
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # LLM Configuration
    AI_API_KEY: str = os.getenv("AI_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-3.6-flash")
    AI_PROVIDER: str = "gemini"  # Supported: "gemini", "mock"

    # Persistence
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./grievance_scribe.db")

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return list(v)
        return ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
