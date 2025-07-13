from datetime import datetime, time, timedelta


def current_utc_time():
    """
    Returns the current UTC time.
    """
    return datetime.utcnow()


def parse_time(timestr: str) -> time:
    """
    Converts a 'HH:MM' time string into a time object.
    """
    return datetime.strptime(timestr, "%H:%M").time()


def parse_datetime(datetime_str: str, fmt="%Y-%m-%d %H:%M"):
    """
    Parse a datetime string into a datetime object.
    """
    return datetime.strptime(datetime_str, fmt)


def format_time_range(start: time, end: time) -> str:
    """
    Returns a human-readable string for a time range.
    """
    return f"{start.strftime('%H:%M')} - {end.strftime('%H:%M')}"


def is_time_in_range(check: time, start: time, end: time) -> bool:
    """
    Check if a time is within a start–end time range.
    """
    return start <= check <= end


def is_slot_in_future(slot_date: datetime.date, slot_time: time) -> bool:
    """
    Returns True if the slot is in the future.
    """
    slot_datetime = datetime.combine(slot_date, slot_time)
    return slot_datetime > datetime.utcnow()
