from flask_jwt_extended import get_jwt_identity


def get_current_user_id():
    """
    Returns the current user's ID from JWT identity.
    """
    identity = get_jwt_identity()
    return identity.get("id") if identity else None


def get_current_user_role():
    """
    Returns the current user's role from JWT identity.
    """
    identity = get_jwt_identity()
    return identity.get("role") if identity else None


def is_role(role: str):
    """
    Check if the current user has a specific role.
    """
    identity = get_jwt_identity()
    return identity and identity.get("role") == role
