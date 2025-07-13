from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

def hash_password(password: str) -> str:
    """
    Generate a hashed password using Werkzeug.
    """
    return generate_password_hash(password)


def verify_password(hashed: str, password: str) -> bool:
    """
    Verify a password against its hash.
    """
    return check_password_hash(hashed, password)


def generate_jwt(user: User, expires_minutes: int = 60) -> str:
    """
    Generate a JWT token for an authenticated user.
    """
    payload = {
        "id": user.id,
        "email": user.email,
        "role": user.role
    }
    return create_access_token(identity=payload, expires_delta=timedelta(minutes=expires_minutes))


def is_authorized(identity, role: str) -> bool:
    """
    Check if the current identity is authorized for a given role.
    """
    return identity and identity.get("role") == role
