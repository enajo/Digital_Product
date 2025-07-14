# backend/app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
# remove Flask-Migrate import entirely if you’re not using migrations
from .config import Config

db   = SQLAlchemy()
jwt  = JWTManager()
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        origins="http://localhost:5173",
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # import all your models so SQLAlchemy knows about them
    from .models.user              import User, Patient, Clinic, Admin
    from .models.doctor            import Doctor
    from .models.slot              import Slot
    from .models.booking           import Booking
    from .models.standby           import StandbyPreference
    from .models.dnd               import DNDPreference
    from .models.slot_confirmation import SlotConfirmation

    # register your blueprints
    from .routes.auth     import auth_bp
    from .routes.patient  import patient_bp
    from .routes.clinic   import clinic_bp
    from .routes.doctors  import doctors_bp
    from .routes.admin    import admin_bp
    from .routes.confirm  import confirm_bp
    from .routes.test_mail import test_mail_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(clinic_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(confirm_bp)
    app.register_blueprint(test_mail_bp)

    @app.route("/")
    def index():
        return {"message": "QuickDoc API is running."}, 200

    # **auto-create all tables** in dev so you never get “relation ‘users’ does not exist”
    if app.config["FLASK_ENV"] == "development":
        with app.app_context():
            db.create_all()

    return app
