# backend/app/models/user.py

from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# import SlotConfirmation for back_populates
from app.models.slot_confirmation import SlotConfirmation

class User(db.Model):
    """
    Base User model with shared fields.
    Role-based subclasses: Patient, Clinic, Admin.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'patient', 'clinic', 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __mapper_args__ = {
        'polymorphic_identity': 'user',
        'polymorphic_on': role
    }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }


class Patient(User):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=True)
    standby_enabled = db.Column(db.Boolean, default=False)

    # relationships
    bookings = db.relationship('Booking', backref='patient', lazy=True)
    dnd      = db.relationship('DNDPreference', uselist=False, backref='patient', cascade='all, delete')
    standby  = db.relationship('StandbyPreference', uselist=False, backref='patient', cascade='all, delete')

    # one-to-many: confirmation tokens issued to this patient
    confirmations = db.relationship(
        'SlotConfirmation',
        back_populates='patient',
        cascade='all, delete-orphan'
    )

    __mapper_args__ = {
        'polymorphic_identity': 'patient',
    }


class Clinic(User):
    __tablename__ = 'clinics'

    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    doctor_name = db.Column(db.String(100), nullable=True)

    # A clinic now has many doctors:
    doctors = db.relationship(
        'Doctor',
        back_populates='clinic',
        cascade='all, delete-orphan',
        lazy='dynamic'
    )

    # existing slots relationship remains:
    slots = db.relationship('Slot', backref='clinic', lazy=True)

    __mapper_args__ = {
        'polymorphic_identity': 'clinic',
    }


class Admin(User):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': 'admin',
    }
