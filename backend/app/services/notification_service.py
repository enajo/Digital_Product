# backend/app/services/notification_service.py

import logging
import json
from datetime import datetime, timedelta
from flask import current_app
from flask_mail import Message
from app import db, mail
from app.models.slot import Slot
from app.models.standby import StandbyPreference
from app.models.dnd import DNDPreference
from app.models.slot_confirmation import SlotConfirmation

logger = logging.getLogger(__name__)

# === DND + Time Helpers ===

def is_within_dnd(dnd: DNDPreference, slot: Slot) -> bool:
    """
    Check if the slot falls within a patient's DND settings.
    """
    if not dnd or not dnd.enabled:
        return False

    # Temporarily paused overrides everything
    if getattr(dnd, "temporarily_paused", False) and \
       getattr(dnd, "pause_until", None) and \
       dnd.pause_until > datetime.utcnow():
        return True

    # Check day names
    day_name = slot.date.strftime('%A')
    if getattr(dnd, "dnd_days", None) and day_name in dnd.dnd_days.split(','):
        return True

    # Check date span
    if getattr(dnd, "start_date", None) and slot.date < dnd.start_date:
        return False
    if getattr(dnd, "end_date", None) and slot.date > dnd.end_date:
        return False

    # Check time ranges
    ranges_json = getattr(dnd, "dnd_time_ranges", None)
    if ranges_json:
        try:
            ranges = json.loads(ranges_json)
            for r in ranges:
                start = datetime.strptime(r.get('from') or r.get('start_time'), '%H:%M').time()
                end   = datetime.strptime(r.get('to')   or r.get('end_time'),   '%H:%M').time()
                if slot.start_time < end and slot.end_time > start:
                    return True
        except Exception as err:
            logger.error(f"Error parsing DND time ranges: {err}", exc_info=True)

    return False


# === Standby Notification Flow ===

def parse_time_windows(raw: str):
    """
    Normalize a raw preferred_times value into a list of dicts with time objects:
      - JSON array of {start_time, end_time} or {from, to}
      - CSV "HH:MM-HH:MM,HH:MM-HH:MM"
      - blank → full day
    """
    if not raw:
        return [{"start_time": datetime.strptime("00:00", "%H:%M").time(),
                 "end_time":   datetime.strptime("23:59", "%H:%M").time()}]

    # Try JSON first
    try:
        arr = json.loads(raw)
        windows = []
        for t in arr:
            start_s = t.get("start_time") or t.get("from")
            end_s   = t.get("end_time")   or t.get("to")
            start = datetime.strptime(start_s, '%H:%M').time()
            end   = datetime.strptime(end_s,   '%H:%M').time()
            windows.append({"start_time": start, "end_time": end})
        return windows
    except Exception:
        pass

    # Fallback: CSV hyphen format e.g. "08:00-12:00,15:00-18:00"
    windows = []
    for seg in raw.split(","):
        seg = seg.strip()
        if "-" not in seg:
            logger.error(f"Invalid time segment '{seg}' in preferred_times")
            continue
        try:
            a, b = seg.split("-", 1)
            start = datetime.strptime(a, '%H:%M').time()
            end   = datetime.strptime(b, '%H:%M').time()
            windows.append({"start_time": start, "end_time": end})
        except ValueError as ve:
            logger.error(f"Invalid time format '{seg}': {ve}", exc_info=True)
    return windows


def notify_standbys_for_slot(slot: Slot):
    """
    When a slot opens or reopens, email all standby users whose prefs overlap—
    skipping anyone in DND—and generate a one-time confirmation link.
    """
    if slot.status != 'open':
        logger.debug(f"Slot {slot.id} skipped: status is '{slot.status}'")
        return

    prefs = StandbyPreference.query.filter_by(enabled=True).all()
    logger.info(f"Found {len(prefs)} enabled standby preferences")

    for pref in prefs:
        try:
            # --- Language filter ---
            langs = pref.preferred_languages.split(',') if pref.preferred_languages else []
            if langs and slot.language not in langs:
                logger.debug(f"Pref {pref.id} skipped: language mismatch")
                continue

            # --- Time window parsing & overlap check ---
            windows = parse_time_windows(pref.preferred_times or "")
            if not any(
                slot.start_time < w["end_time"] and slot.end_time > w["start_time"]
                for w in windows
            ):
                logger.debug(f"Pref {pref.id} skipped: no time overlap")
                continue

            # --- DND skip ---
            dnd_pref = DNDPreference.query.filter_by(patient_id=pref.patient_id).first()
            if is_within_dnd(dnd_pref, slot):
                logger.debug(f"Pref {pref.id} skipped: in DND window")
                continue

            # --- Create confirmation token ---
            confirm = SlotConfirmation(
                slot_id=slot.id,
                patient_id=pref.patient_id,
                expires_at=datetime.utcnow() + timedelta(hours=2)
            )
            db.session.add(confirm)
            db.session.commit()
            logger.info(f"Created confirmation token {confirm.token} for pref {pref.id}")

            # --- Send email ---
            link = f"{current_app.config['FRONTEND_URL']}/confirm?token={confirm.token}"
            user = pref.patient
            body = f"""
Hi {user.name},

A {slot.specialization or 'slot'} opened on {slot.date}
from {slot.start_time.strftime('%H:%M')} to {slot.end_time.strftime('%H:%M')}.
Click here to confirm (expires in 2 hours):

{link}

If someone else books it first, you’ll be notified it’s gone.
"""
            msg = Message(
                subject="QuickDoc: Slot Available for You",
                recipients=[user.email],
                body=body,
            )
            mail.send(msg)
            logger.info(f"Sent confirmation email to patient {pref.patient_id}")

        except Exception as err:
            logger.error(f"Failed notifying pref {pref.id}: {err}", exc_info=True)
