from app.models.slot import Slot
from datetime import datetime, time


def is_slot_expired(slot: Slot) -> bool:
    """
    Check if a slot has already passed.
    """
    slot_datetime = datetime.combine(slot.date, slot.end_time)
    return datetime.utcnow() > slot_datetime


def expire_old_slots(slots):
    """
    Update the status of expired slots to 'expired'.
    """
    updated = 0
    for slot in slots:
        if slot.status == "open" and is_slot_expired(slot):
            slot.status = "expired"
            updated += 1
    return updated


def format_slot_timeslot(start: time, end: time) -> str:
    """
    Format slot time range nicely for UI.
    """
    return f"{start.strftime('%H:%M')} - {end.strftime('%H:%M')}"


def group_slots_by_day(slots):
    """
    Organize a list of slots by date for calendar or dashboard views.
    Returns: dict[date] = [slot1, slot2...]
    """
    grouped = {}
    for slot in slots:
        date_key = slot.date.isoformat()
        grouped.setdefault(date_key, []).append(slot.to_dict())
    return grouped


def filter_open_slots(slots, language=None, city=None):
    """
    Filter open slots based on optional language or location filters.
    """
    filtered = [s for s in slots if s.status == "open"]

    if language:
        filtered = [s for s in filtered if s.language.lower() == language.lower()]
    if city:
        filtered = [s for s in filtered if s.clinic and s.clinic.city.lower() == city.lower()]

    return filtered
