from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import Admin, Patient, Clinic
from app.models.slot import Slot
from app.models.booking import Booking
from app import db

admin_bp = Blueprint("admin_bp", __name__)

# Helper to ensure user is admin
def is_admin():
    identity = get_jwt_identity()
    return identity and identity["role"] == "admin"


@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def admin_dashboard():
    """
    Admin dashboard overview with system metrics.
    """
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 403

    stats = {
        "total_patients": Patient.query.count(),
        "total_clinics": Clinic.query.count(),
        "total_admins": Admin.query.count(),
        "total_slots": Slot.query.count(),
        "open_slots": Slot.query.filter_by(status="open").count(),
        "booked_slots": Slot.query.filter_by(status="booked").count(),
        "cancelled_slots": Slot.query.filter_by(status="cancelled").count(),
        "total_bookings": Booking.query.count()
    }

    return jsonify(stats), 200


@admin_bp.route("/users/patients", methods=["GET"])
@jwt_required()
def list_patients():
    """
    View all registered patients.
    """
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 403

    patients = Patient.query.all()
    return jsonify([p.to_dict() for p in patients]), 200


@admin_bp.route("/users/clinics", methods=["GET"])
@jwt_required()
def list_clinics():
    """
    View all registered clinics.
    """
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 403

    clinics = Clinic.query.all()
    return jsonify([c.to_dict() for c in clinics]), 200


@admin_bp.route("/users/<role>/<int:user_id>/delete", methods=["DELETE"])
@jwt_required()
def delete_user(role, user_id):
    """
    Delete a user by role and ID.
    Only for administrative cleanup or abuse cases.
    """
    if not is_admin():
        return jsonify({"error": "Unauthorized"}), 403

    model = {"patient": Patient, "clinic": Clinic, "admin": Admin}.get(role)
    if not model:
        return jsonify({"error": "Invalid role"}), 400

    user = model.query.get(user_id)
    if not user:
        return jsonify({"error": f"{role.capitalize()} not found."}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"{role.capitalize()} deleted successfully."}), 200
