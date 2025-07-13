# backend/app/routes/patient.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from datetime import datetime
import json

from app import db
from app.models.user import Patient, Clinic
from app.models.slot import Slot
from app.models.booking import Booking
from app.models.standby import StandbyPreference
from app.models.dnd import DNDPreference

patient_bp = Blueprint("patient_bp", __name__, url_prefix="/api/patient")


def get_current_patient():
    identity = get_jwt_identity()
    patient = Patient.query.get(int(identity))
    if not patient or patient.role != "patient":
        return None
    return patient


def _serialize_booking(booking: Booking):
    """
    Return a dict with booking info + doctor name, specialization,
    date, time, and default clinic city = 'Berlin' if not set.
    """
    slot = Slot.query.get(booking.slot_id)
    doctor = slot.doctor
    clinic = Clinic.query.get(slot.clinic_id)
    return {
        "id": booking.id,
        "doctor_name": doctor.name if doctor else "",
        "specialization": doctor.specialization if doctor and doctor.specialization else "",
        "clinic_city": clinic.city or "Berlin",
        "date": slot.date.isoformat(),
        "start_time": slot.start_time.strftime("%H:%M"),
    }


@patient_bp.route("/slots", methods=["GET"])
@jwt_required()
def get_available_slots():
    slots = Slot.query.filter_by(status="open").all()
    return jsonify([slot.to_dict() for slot in slots]), 200


@patient_bp.route("/book/<int:slot_id>", methods=["POST"])
@jwt_required()
def book_slot(slot_id):
    patient = get_current_patient()
    if not patient:
        return jsonify({"error": "Unauthorized"}), 403

    slot = Slot.query.get(slot_id)
    if not slot or slot.status != "open":
        return jsonify({"error": "Slot is no longer available."}), 400

    slot.status = "booked"
    booking = Booking(patient_id=patient.id, slot_id=slot.id)
    db.session.add(booking)
    db.session.commit()

    return jsonify({
        "message": "Slot booked successfully.",
        "booking": booking.to_dict()
    }), 200


@patient_bp.route("/appointments", methods=["GET"])
@jwt_required()
def get_my_appointments():
    patient = get_current_patient()
    if not patient:
        return jsonify({"error": "Unauthorized"}), 403

    bookings = Booking.query.filter_by(patient_id=patient.id).all()
    return jsonify([_serialize_booking(b) for b in bookings]), 200


@patient_bp.route("/appointments/<int:booking_id>", methods=["DELETE"])
@jwt_required()
def cancel_appointment(booking_id):
    """
    Patient cancels one of their bookings.
    Deletes the booking and marks the slot 'cancelled' so clinics see it.
    """
    patient = get_current_patient()
    if not patient:
        return jsonify({"error": "Unauthorized"}), 403

    booking = Booking.query.get_or_404(booking_id)
    if booking.patient_id != patient.id:
        return jsonify({"error": "Access denied"}), 403

    slot = Slot.query.get(booking.slot_id)
    db.session.delete(booking)
    if slot:
        slot.status = "cancelled"
    db.session.commit()

    return jsonify({"message": "Appointment cancelled."}), 200


@patient_bp.route("/standby", methods=["PUT"])
@jwt_required()
def update_standby():
    patient = get_current_patient()
    if not patient:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    standby = patient.standby or StandbyPreference(patient_id=patient.id)

    standby.enabled                  = data.get("enabled", True)
    standby.preferred_languages      = data.get("preferred_languages", "")
    standby.preferred_days           = data.get("preferred_days", "")
    standby.preferred_times          = data.get("preferred_times", "")
    standby.max_notifications_per_day = data.get("max_notifications_per_day", 5)

    db.session.add(standby)
    db.session.commit()

    return jsonify({
        "message": "Standby preferences updated.",
        "standby": standby.to_dict()
    }), 200


@patient_bp.route("/dnd", methods=["PUT"])
@jwt_required()
def update_dnd():
    patient = get_current_patient()
    if not patient:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    dnd = patient.dnd or DNDPreference(patient_id=patient.id)

    dnd.temporarily_paused = data.get("temporarily_paused", False)
    dnd.dnd_days           = data.get("dnd_days", "")
    dnd.dnd_time_ranges    = json.dumps(data.get("dnd_time_ranges", []))

    pause_until = data.get("pause_until")
    if pause_until:
        try:
            dnd.pause_until = datetime.fromisoformat(pause_until)
        except ValueError:
            return jsonify({
                "error": "Invalid pause_until format; must be ISO8601"
            }), 400

    db.session.add(dnd)
    db.session.commit()

    return jsonify({
        "message": "DND preferences updated.",
        "dnd": dnd.to_dict()
    }), 200


@patient_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    patient = get_current_patient()
    if not patient:
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify(patient.to_dict()), 200


@patient_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    patient = get_current_patient()
    if not patient:
        return jsonify({"error": "Unauthorized"}), 403

    past = Booking.query.filter_by(patient_id=patient.id).all()
    return jsonify([_serialize_booking(b) for b in past]), 200


@patient_bp.route("/metrics", methods=["GET"])
@jwt_required()
def get_metrics():
    patient = get_current_patient()
    if not patient:
        return jsonify({"error": "Unauthorized"}), 403

    total = Booking.query.filter_by(patient_id=patient.id).count()
    return jsonify({"total_bookings": total}), 200


@patient_bp.route("/top-clinics", methods=["GET"])
@jwt_required()
def top_clinics():
    patient = get_current_patient()
    if not patient:
        return jsonify({"error": "Unauthorized"}), 403

    results = (
        db.session.query(Clinic, func.count(Booking.id).label("visits"))
        .join(Booking, Booking.clinic_id == Clinic.id)
        .filter(Booking.patient_id == patient.id)
        .group_by(Clinic.id)
        .order_by(func.count(Booking.id).desc())
        .limit(5)
        .all()
    )

    out = [{
        "clinic": clinic.to_dict(),
        "visits": visits
    } for clinic, visits in results]

    return jsonify(out), 200
