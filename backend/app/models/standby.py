from app import db
from datetime import datetime

class StandbyPreference(db.Model):
    """
    Stores standby mode settings for a patient.
    Determines if they want to be alerted for last-minute slots.
    """
    __tablename__ = 'standby_preferences'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), unique=True, nullable=False)
    
    enabled = db.Column(db.Boolean, default=False)

    # Optional filters
    preferred_languages = db.Column(db.String(200), nullable=True)  # CSV e.g. "English,French"
    preferred_days = db.Column(db.String(100), nullable=True)       # CSV e.g. "Monday,Tuesday"
    preferred_times = db.Column(db.String(200), nullable=True)      # JSON string or range, e.g. "08:00-12:00,15:00-18:00"

    max_notifications_per_day = db.Column(db.Integer, default=5)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "enabled": self.enabled,
            "preferred_languages": self.preferred_languages.split(',') if self.preferred_languages else [],
            "preferred_days": self.preferred_days.split(',') if self.preferred_days else [],
            "preferred_times": self.preferred_times,
            "max_notifications_per_day": self.max_notifications_per_day,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
