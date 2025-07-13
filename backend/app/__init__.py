# backend/app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate
from .config import Config

# 1) Create extension instances
db      = SQLAlchemy()
jwt     = JWTManager()
mail    = Mail()
migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 2) Enable CORS globally (adjust origins as needed)
    CORS(
        app,
        origins="http://localhost:5173",
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # 3) Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)

    # 4) Import all models so Flask-Migrate can detect them
    from .models.user               import User, Patient, Clinic, Admin
    from .models.doctor             import Doctor
    from .models.slot               import Slot
    from .models.booking            import Booking
    from .models.standby            import StandbyPreference
    from .models.dnd                import DNDPreference
    from .models.slot_confirmation  import SlotConfirmation

    # 5) Register blueprints
    from .routes.auth     import auth_bp
    from .routes.patient  import patient_bp
    from .routes.clinic   import clinic_bp
    from .routes.doctors  import doctors_bp
    from .routes.admin    import admin_bp
    from .routes.confirm  import confirm_bp
    from .routes.test_mail import test_mail_bp

    app.register_blueprint(auth_bp,     url_prefix="/api/auth")
    app.register_blueprint(patient_bp,  url_prefix="/api/patient")
    app.register_blueprint(clinic_bp,   url_prefix="/api/clinic")
    app.register_blueprint(doctors_bp,  url_prefix="/api/clinic/doctors")
    app.register_blueprint(admin_bp,    url_prefix="/api/admin")
    app.register_blueprint(confirm_bp)
    app.register_blueprint(test_mail_bp)

    # 6) **Ensure all tables are created** (only in dev; migrations handle real upgrades)
    with app.app_context():
        db.create_all()

    @app.route("/")
    def index():
        return {"message": "QuickDoc API is running."}, 200

    return app
