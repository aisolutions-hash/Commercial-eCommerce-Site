import os
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = Field(alias="DATABASE_URL")
    jwt_secret: str = Field(alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=1440, alias="JWT_EXPIRE_MINUTES")
    use_cloud_sql: bool = Field(default=False, alias="USE_CLOUD_SQL")
    instance_connection_name: str = Field(default="", alias="INSTANCE_CONNECTION_NAME")
    db_user: str = Field(default="postgres", alias="DB_USER")
    db_pass: str = Field(default="", alias="DB_PASS")
    db_name: str = Field(default="kalisoft_ecommerce", alias="DB_NAME")
    sentry_dsn: str = Field(default="", alias="SENTRY_DSN")
    cors_origins: str = Field(default="http://localhost:3000,http://127.0.0.1:3000", alias="CORS_ORIGINS")
    app_url: str = Field(default="http://localhost:3000", alias="APP_URL")
    google_client_id: str = Field(default="", alias="GOOGLE_CLIENT_ID")
    google_client_secret: str = Field(default="", alias="GOOGLE_CLIENT_SECRET")
    smtp_host: str = Field(default="", alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_user: str = Field(default="", alias="SMTP_USER")
    smtp_pass: str = Field(default="", alias="SMTP_PASS")
    notify_email: str = Field(default="", alias="NOTIFY_EMAIL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"

settings = Settings()
