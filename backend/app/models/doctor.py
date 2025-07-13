# app/models/doctor.py

from app import db
from datetime import datetime

class Doctor(db.Model):
    """
    Represents a single doctor belonging to a clinic.
    """
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    clinic_id = db.Column(db.Integer, db.ForeignKey('clinics.id'), nullable=False)

    # Basic profile
    name = db.Column(db.String(128), nullable=False)
    specialization = db.Column(db.String(128), nullable=True)
    # comma-separated list of languages the doctor speaks
    languages = db.Column(db.String(256), nullable=True)

    # timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    clinic = db.relationship('Clinic', back_populates='doctors')
    slots = db.relationship(
        'Slot',
        back_populates='doctor',
        cascade='all, delete-orphan',
        lazy='dynamic'
    )

    def to_dict(self):
        return {
            "id": self.id,
            "clinic_id": self.clinic_id,
            "name": self.name,
            "specialization": self.specialization,
            "languages": self.languages.split(",") if self.languages else [],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
