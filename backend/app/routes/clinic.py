# backend/app/routes/clinic.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, time

from app import db
from app.models.user import Clinic
from app.models.slot import Slot
from app.models.booking import Booking
from app.models.standby import StandbyPreference
from app.models.dnd import DNDPreference
from app.models.slot_confirmation import SlotConfirmation

# notification helper
from app.services.notification_service import notify_standbys_for_slot

clinic_bp = Blueprint("clinic_bp", __name__, url_prefix="/api/clinic")


def get_current_clinic():
    claims = get_jwt()
    if claims.get("role") != "clinic":
        return None
    return Clinic.query.get(get_jwt_identity())


@clinic_bp.route("/slots", methods=["GET"])
@jwt_required()
def list_slots():
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    slots = (
        Slot.query
        .filter_by(clinic_id=clinic.id)
        .order_by(Slot.date, Slot.start_time)
        .all()
    )
    return jsonify([s.to_dict() for s in slots]), 200


@clinic_bp.route("/slots", methods=["POST"])
@jwt_required()
def create_slot():
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    try:
        slot = Slot(
            clinic_id=clinic.id,
            date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
            start_time=datetime.strptime(data["start_time"], "%H:%M").time(),
            end_time=datetime.strptime(data["end_time"],   "%H:%M").time(),
            language=data.get("language", "English"),
            specialization=data.get("specialization"),
            status="open"
        )
        db.session.add(slot)
        db.session.commit()

        # notify standby users
        notify_standbys_for_slot(slot)

        return jsonify({"slot": slot.to_dict()}), 201

    except (KeyError, ValueError) as e:
        return jsonify({"error": "Invalid input", "details": str(e)}), 400


@clinic_bp.route("/slots/<int:slot_id>", methods=["PUT"])
@jwt_required()
def update_slot(slot_id):
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    slot = Slot.query.get_or_404(slot_id)
    if slot.clinic_id != clinic.id or slot.status != "open":
        return jsonify({"error": "Access denied or not open"}), 403

    data = request.get_json() or {}
    try:
        if "date" in data:
            slot.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        if "start_time" in data:
            slot.start_time = datetime.strptime(data["start_time"], "%H:%M").time()
        if "end_time" in data:
            slot.end_time = datetime.strptime(data["end_time"], "%H:%M").time()
        if "language" in data:
            slot.language = data["language"]
        if "specialization" in data:
            slot.specialization = data["specialization"]
        db.session.commit()
        return jsonify({"slot": slot.to_dict()}), 200

    except ValueError as e:
        return jsonify({"error": "Invalid input", "details": str(e)}), 400


@clinic_bp.route("/slots/<int:slot_id>", methods=["DELETE"])
@jwt_required()
def cancel_slot(slot_id):
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    slot = Slot.query.get_or_404(slot_id)
    if slot.clinic_id != clinic.id:
        return jsonify({"error": "Access denied"}), 403

    slot.status = "cancelled"
    db.session.commit()
    return jsonify({"message": "Slot cancelled"}), 200


@clinic_bp.route("/slots/<int:slot_id>/reopen", methods=["POST"])
@jwt_required()
def reopen_slot(slot_id):
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    slot = Slot.query.get_or_404(slot_id)
    if slot.clinic_id != clinic.id:
        return jsonify({"error": "Access denied"}), 403

    slot.status = "open"
    db.session.commit()

    # notify standby users again
    notify_standbys_for_slot(slot)

    return jsonify({"message": "Slot reopened", "slot": slot.to_dict()}), 200


@clinic_bp.route("/bookings", methods=["GET"])
@jwt_required()
def list_bookings():
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    slot_ids = [s.id for s in Slot.query.filter_by(clinic_id=clinic.id)]
    bookings = (
        Booking.query
        .filter(Booking.slot_id.in_(slot_ids))
        .order_by(Booking.confirmed_at.desc())
        .all()
    )
    return jsonify([b.to_dict() for b in bookings]), 200


@clinic_bp.route("/bookings/<int:booking_id>", methods=["DELETE"])
@jwt_required()
def cancel_booking(booking_id):
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    booking = Booking.query.get_or_404(booking_id)
    slot = Slot.query.get(booking.slot_id)
    if slot.clinic_id != clinic.id:
        return jsonify({"error": "Access denied"}), 403

    db.session.delete(booking)
    slot.status = "open"
    db.session.commit()

    # notify standby users for reopened slot
    notify_standbys_for_slot(slot)

    return jsonify({"message": "Booking cancelled and slot reopened"}), 200


# ——— New cancellations endpoints ———

@clinic_bp.route("/cancellations", methods=["GET"])
@jwt_required()
def list_cancellations():
    """
    Return all currently-cancelled slots for this clinic.
    Frontend uses these as 'notifications'.
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    cancelled = (
        Slot.query
        .filter_by(clinic_id=clinic.id, status="cancelled")
        .order_by(Slot.date, Slot.start_time)
        .all()
    )
    results = [{
        "id":          s.id,
        "slotId":      s.id,
        "doctorName":  s.doctor.name if s.doctor else "",
        "specialty":   s.specialization,
        "date":        s.date.isoformat(),
        "time":        s.start_time.strftime("%H:%M")
    } for s in cancelled]

    return jsonify(results), 200


@clinic_bp.route("/cancellations/<int:slot_id>", methods=["DELETE"])
@jwt_required()
def clear_cancellation(slot_id):
    """
    Remove a cancelled-slot notification by deleting that slot.
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    slot = Slot.query.get_or_404(slot_id)
    if slot.clinic_id != clinic.id or slot.status != "cancelled":
        return jsonify({"error": "Access denied or not cancelled"}), 403

    db.session.delete(slot)
    db.session.commit()
    return jsonify({"message": "Cancellation cleared"}), 200


@clinic_bp.route("/block-day", methods=["POST"])
@jwt_required()
def block_day():
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    try:
        block_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
    except (KeyError, ValueError) as e:
        return jsonify({"error": "Invalid date", "details": str(e)}), 400

    # remove any existing slots on that day
    Slot.query.filter_by(clinic_id=clinic.id, date=block_date).delete()

    # create a full-day cancelled slot
    full = Slot(
        clinic_id=clinic.id,
        date=block_date,
        start_time=time(0, 0),
        end_time=time(23, 59),
        language="N/A",
        specialization=None,
        status="cancelled"
    )
    db.session.add(full)
    db.session.commit()

    return jsonify({"message": f"Clinic day {block_date} blocked"}), 200
