# backend/app/routes/auth.py

import traceback
from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User, Patient, Clinic
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user: patient or clinic.
    Admin registration is disabled.
    """
    try:
        data = request.get_json() or {}
        email    = data.get("email", "").strip()
        password = data.get("password", "")
        role     = data.get("role", "patient")

        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered."}), 409

        if role == "patient":
            name     = data.get("name", "").strip()
            language = data.get("language", "English").strip()
            location = data.get("location", "Unknown").strip()
            if not name:
                return jsonify({"error": "Patient name is required."}), 400

            user = Patient(
                email=email,
                role="patient",
                name=name,
                language=language,
                location=location
            )

        elif role == "clinic":
            name        = data.get("name", "").strip()
            city        = data.get("city", "").strip()
            doctor_name = data.get("doctor_name", "").strip()
            if not name or not city:
                return jsonify({"error": "Clinic name and city are required."}), 400

            user = Clinic(
                email=email,
                role="clinic",
                name=name,
                city=city,
                doctor_name=doctor_name
            )

        else:
            return jsonify({"error": f"Invalid role '{role}'."}), 400

        # set_password assumed to hash & store
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return jsonify({"message": f"{role.capitalize()} registered successfully."}), 201

    except Exception as e:
        # full traceback in container logs
        traceback.print_exc()
        # concise JSON error to client
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login route for all roles. Returns JWT access_token.
    """
    try:
        data     = request.get_json() or {}
        email    = data.get("email", "").strip()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password."}), 401

        identity_str = str(user.id)
        access_token = create_access_token(
            identity=identity_str,
            additional_claims={
                "email": user.email,
                "role":  user.role
            },
            expires_delta=timedelta(minutes=60)
        )

        return jsonify({
            "access_token": access_token,
            "user": {
                "id":    user.id,
                "email": user.email,
                "role":  user.role
            }
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
