import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/kalisoft_ecommerce"
    jwt_secret: str = os.getenv("JWT_SECRET", "change-this-to-a-long-random-secret-key")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    use_cloud_sql: bool = False
    instance_connection_name: str = ""
    db_user: str = "postgres"
    db_pass: str = ""
    db_name: str = "kalisoft_ecommerce"

    sentry_dsn: str = ""
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    app_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
