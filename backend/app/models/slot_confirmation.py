import uuid
from datetime import datetime, timedelta
from app import db

class SlotConfirmation(db.Model):
    __tablename__ = "slot_confirmations"

    token      = db.Column(db.String, primary_key=True,
                           default=lambda: str(uuid.uuid4()))
    slot_id    = db.Column(db.Integer, db.ForeignKey("slots.id"),
                           nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"),
                           nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False,
                           default=lambda: datetime.utcnow() + timedelta(hours=2))
    used       = db.Column(db.Boolean, default=False)

    slot    = db.relationship("Slot",    back_populates="confirmations")
    patient = db.relationship("Patient", back_populates="confirmations")
