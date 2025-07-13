import re
from datetime import datetime

EMAIL_REGEX = r"[^@]+@[^@]+\.[^@]+"

def is_valid_email(email: str) -> bool:
    """
    Validates email format using regex.
    """
    return re.match(EMAIL_REGEX, email) is not None


def is_valid_time_format(timestr: str) -> bool:
    """
    Validates time string format (HH:MM).
    """
    try:
        datetime.strptime(timestr, "%H:%M")
        return True
    except ValueError:
        return False


def is_valid_date_format(datestr: str) -> bool:
    """
    Validates date string format (YYYY-MM-DD).
    """
    try:
        datetime.strptime(datestr, "%Y-%m-%d")
        return True
    except ValueError:
        return False
