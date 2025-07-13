from app import db
from datetime import datetime

class Booking(db.Model):
    """
    Represents a confirmed booking between a patient and a slot.
    """
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey('slots.id'), nullable=False, unique=True)
    confirmed_at = db.Column(db.DateTime, default=datetime.utcnow)
    cancelled = db.Column(db.Boolean, default=False)
    cancelled_at = db.Column(db.DateTime, nullable=True)

    def cancel(self):
        self.cancelled = True
        self.cancelled_at = datetime.utcnow()

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "slot_id": self.slot_id,
            "confirmed_at": self.confirmed_at.isoformat(),
            "cancelled": self.cancelled,
            "cancelled_at": self.cancelled_at.isoformat() if self.cancelled_at else None
        }
