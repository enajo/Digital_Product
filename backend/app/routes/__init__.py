# backend/app/__init__.py

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# instantiate extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    # --- CONFIG ---
    # 1) default config  
    app.config.from_object("config.DefaultConfig")
    # 2) instance config (e.g. instance/config.py)
    app.config.from_pyfile("config.py", silent=True)
    # 3) override from environment, if you like
    # app.config.from_envvar("MYAPP_SETTINGS", silent=True)

    # --- INITIALIZE EXTENSIONS ---
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    # --- REGISTER BLUEPRINTS ---
    # Auth (login, register)
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # Patient-facing routes
    from app.routes.patient import patient_bp
    app.register_blueprint(patient_bp, url_prefix="/api/patient")

    # Clinic-facing routes
    from app.routes.clinic import clinic_bp
    app.register_blueprint(clinic_bp, url_prefix="/api/clinic")

    # Admin-facing routes
    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    return app
