# backend/app/models/slot.py

from datetime import datetime
from app import db

class Slot(db.Model):
    """
    Represents a single appointment slot offered by a clinic or doctor.
    """
    __tablename__ = 'slots'

    id = db.Column(db.Integer, primary_key=True)
    clinic_id = db.Column(db.Integer, db.ForeignKey('clinics.id'), nullable=False)

    # Associate a slot with a specific doctor (optional)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=True)

    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    language = db.Column(db.String(50), nullable=False)
    specialization = db.Column(db.String(50), nullable=True)
    status = db.Column(
        db.String(20),
        nullable=False,
        server_default='open'
    )  # possible values: open, booked, cancelled, expired

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )

    # one-to-one relationship with Booking (a slot may have at most one booking)
    booking = db.relationship(
        'Booking',
        backref='slot',
        uselist=False,
        cascade='all, delete-orphan'
    )

    # relationship back to doctor
    doctor = db.relationship(
        'Doctor',
        back_populates='slots',
        foreign_keys=[doctor_id]
    )

    # one-to-many relationship: confirmation tokens generated for this slot
    confirmations = db.relationship(
        'SlotConfirmation',
        back_populates='slot',
        cascade='all, delete-orphan'
    )

    def is_available(self):
        """Returns True if this slot is still open for booking."""
        return self.status == 'open'

    def to_dict(self):
        """
        Serialize to a JSON-friendly dict. Includes doctor info if assigned.
        """
        data = {
            "id": self.id,
            "clinic_id": self.clinic_id,
            "date": self.date.isoformat(),
            "start_time": self.start_time.strftime('%H:%M'),
            "end_time": self.end_time.strftime('%H:%M'),
            "language": self.language,
            "specialization": self.specialization,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        if self.doctor_id:
            data["doctor_id"] = self.doctor_id
            # assumes Doctor model has a `name` attribute
            data["doctor_name"] = self.doctor.name
        return data
