"""Application configuration."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database components
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "sipper"
    db_password: str = "sipper"
    db_name: str = "sipper"
    
    @computed_field
    @property
    def database_url(self) -> str:
        """Build database URL from components."""
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    # Application
    app_env: str = "production"  # development/production
    secret_key: str = "change_this_secret_key"
    
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
