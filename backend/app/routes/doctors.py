# backend/app/routes/doctors.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from datetime import datetime, time

from app import db
from app.models.user import Clinic
from app.models.doctor import Doctor
from app.models.slot import Slot
from app.models.booking import Booking
# notification helper
from app.services.notification_service import notify_standbys_for_slot


doctors_bp = Blueprint("doctors_bp", __name__)


def get_current_clinic():
    """
    Return the Clinic instance for the logged‐in user, or None.
    """
    claims = get_jwt()
    if claims.get("role") != "clinic":
        return None
    clinic_id = get_jwt_identity()
    return Clinic.query.get(int(clinic_id))


def get_doctor(clinic, doctor_id):
    """
    Fetch a Doctor by ID and ensure it belongs to this clinic.
    """
    doctor = Doctor.query.get_or_404(doctor_id)
    if doctor.clinic_id != clinic.id:
        return None
    return doctor


@doctors_bp.route("", methods=["GET"])
@jwt_required()
def list_doctors():
    """
    List all doctors for this clinic.
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    doctors = Doctor.query.filter_by(clinic_id=clinic.id).all()
    return jsonify([d.to_dict() for d in doctors]), 200


@doctors_bp.route("", methods=["POST"])
@jwt_required()
def create_doctor():
    """
    Create a new doctor under this clinic.
    JSON payload: { "name": "...", "specialization": "...", "languages": "English,German" }
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "Doctor name is required."}), 400

    doctor = Doctor(
        clinic_id=clinic.id,
        name=name,
        specialization=data.get("specialization"),
        languages=data.get("languages")
    )
    db.session.add(doctor)
    db.session.commit()
    return jsonify({"doctor": doctor.to_dict()}), 201


@doctors_bp.route("/<int:doctor_id>", methods=["GET"])
@jwt_required()
def get_doctor_detail(doctor_id):
    """
    Fetch a single doctor’s details.
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    doctor = get_doctor(clinic, doctor_id)
    if not doctor:
        return jsonify({"error": "Not found"}), 404

    return jsonify(doctor.to_dict()), 200


@doctors_bp.route("/<int:doctor_id>", methods=["PUT"])
@jwt_required()
def update_doctor(doctor_id):
    """
    Update a doctor’s info.
    Accepts JSON with any of: name, specialization, languages
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    doctor = get_doctor(clinic, doctor_id)
    if not doctor:
        return jsonify({"error": "Not found"}), 404

    data = request.get_json() or {}
    if "name" in data:
        doctor.name = data["name"]
    if "specialization" in data:
        doctor.specialization = data["specialization"]
    if "languages" in data:
        doctor.languages = data["languages"]

    db.session.commit()
    return jsonify({"doctor": doctor.to_dict()}), 200


@doctors_bp.route("/<int:doctor_id>", methods=["DELETE"])
@jwt_required()
def delete_doctor(doctor_id):
    """
    Remove a doctor (and all their slots/bookings via cascade).
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    doctor = get_doctor(clinic, doctor_id)
    if not doctor:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(doctor)
    db.session.commit()
    return jsonify({"message": "Doctor deleted."}), 200


@doctors_bp.route("/<int:doctor_id>/slots", methods=["GET"])
@jwt_required()
def list_doctor_slots(doctor_id):
    """
    List all slots for a given doctor.
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    doctor = get_doctor(clinic, doctor_id)
    if not doctor:
        return jsonify({"error": "Not found"}), 404

    slots = (
        Slot.query
        .filter_by(clinic_id=clinic.id, doctor_id=doctor.id)
        .order_by(Slot.date, Slot.start_time)
        .all()
    )
    return jsonify([s.to_dict() for s in slots]), 200


@doctors_bp.route("/<int:doctor_id>/slots", methods=["POST"])
@jwt_required()
def create_doctor_slot(doctor_id):
    """
    Create a new slot on this doctor’s calendar.
    JSON: { date, start_time, end_time, language? }
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    doctor = get_doctor(clinic, doctor_id)
    if not doctor:
        return jsonify({"error": "Not found"}), 404

    data = request.get_json() or {}
    try:
        slot = Slot(
            clinic_id=clinic.id,
            doctor_id=doctor.id,
            date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
            start_time=datetime.strptime(data["start_time"], "%H:%M").time(),
            end_time=datetime.strptime(data["end_time"], "%H:%M").time(),
            language=data.get("language", "English"),
            specialization=doctor.specialization,
            status="open"
        )
        db.session.add(slot)
        db.session.commit()

        # notify standby users for this new slot
        notify_standbys_for_slot(slot)

        return jsonify({"slot": slot.to_dict()}), 201

    except (KeyError, ValueError) as e:
        return jsonify({"error": "Invalid input", "details": str(e)}), 400


@doctors_bp.route("/<int:doctor_id>/slots/<int:slot_id>", methods=["PUT"])
@jwt_required()
def update_doctor_slot(doctor_id, slot_id):
    """
    Update an existing slot on this doctor’s calendar.
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    doctor = get_doctor(clinic, doctor_id)
    if not doctor:
        return jsonify({"error": "Not found"}), 404

    slot = Slot.query.get_or_404(slot_id)
    if slot.clinic_id != clinic.id or slot.doctor_id != doctor.id:
        return jsonify({"error": "Access denied"}), 403
    if slot.status != "open":
        return jsonify({"error": "Only open slots can be edited"}), 400

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
        db.session.commit()
        return jsonify({"slot": slot.to_dict()}), 200

    except ValueError as e:
        return jsonify({"error": "Invalid input", "details": str(e)}), 400


@doctors_bp.route("/<int:doctor_id>/slots/<int:slot_id>", methods=["DELETE"])
@jwt_required()
def cancel_doctor_slot(doctor_id, slot_id):
    """
    Cancel (soft‐delete) a slot on this doctor’s calendar.
    """
    clinic = get_current_clinic()
    if not clinic:
        return jsonify({"error": "Unauthorized"}), 403

    doctor = get_doctor(clinic, doctor_id)
    if not doctor:
        return jsonify({"error": "Not found"}), 404

    slot = Slot.query.get_or_404(slot_id)
    if slot.clinic_id != clinic.id or slot.doctor_id != doctor.id:
        return jsonify({"error": "Access denied"}), 403

    slot.status = "cancelled"
    db.session.commit()
    return jsonify({"message": "Slot cancelled"}), 200
