"""Application configuration."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql+asyncpg://sipper:sipper@localhost:5432/sipper"
    
    # Security
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    encryption_key: str
    
    # API
    api_title: str = "SIPPER API"
    api_version: str = "1.0.0"
    api_description: str = "SIP Testing Platform with Multi-Tenant RBAC"
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
