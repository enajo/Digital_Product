import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Flask environment and security
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "supersecretkey")

    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@db:5432/quickdoc"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwtsecret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 60))
    )
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME     = "Authorization"
    JWT_HEADER_TYPE     = "Bearer"

    # Email provider (SMTP or SendGrid)
    EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "smtp").lower()

    if EMAIL_PROVIDER == "smtp":
        MAIL_SERVER = os.getenv("SMTP_SERVER", os.getenv("MAIL_SERVER", "smtp.example.com"))
        MAIL_PORT   = int(os.getenv("SMTP_PORT", os.getenv("MAIL_PORT", 587)))
        MAIL_USE_TLS  = os.getenv("MAIL_USE_TLS", "true").lower() in ("true", "1")
        MAIL_USE_SSL  = os.getenv("MAIL_USE_SSL", "false").lower() in ("true", "1")
        MAIL_USERNAME  = os.getenv("SMTP_USERNAME", os.getenv("MAIL_USERNAME"))
        MAIL_PASSWORD  = os.getenv("SMTP_PASSWORD", os.getenv("MAIL_PASSWORD"))
        MAIL_DEFAULT_SENDER = os.getenv(
            "EMAIL_SENDER", os.getenv("MAIL_DEFAULT_SENDER", MAIL_USERNAME)
        )
    elif EMAIL_PROVIDER == "sendgrid":
        SENDGRID_API_KEY   = os.getenv("SENDGRID_API_KEY")
        MAIL_DEFAULT_SENDER = os.getenv("EMAIL_SENDER", "quickdoc@example.com")

    # Frontend URL for building confirmation links
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Custom application settings
    NOTIFICATION_BATCH_SIZE = int(os.getenv("NOTIFICATION_BATCH_SIZE", 10))
    DEFAULT_TIMEZONE        = os.getenv("DEFAULT_TIMEZONE", "Europe/Berlin")

    # Admin default credentials (used for seeding)
    ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL", "admin@quickdoc.com")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
