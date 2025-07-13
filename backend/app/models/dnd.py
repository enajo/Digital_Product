from app import db
from datetime import datetime

class DNDPreference(db.Model):
    """
    Stores a patient's Do-Not-Disturb schedule.
    Used to filter out notifications during unwanted times.
    """
    __tablename__ = 'dnd_preferences'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), unique=True, nullable=False)

    # Stored as CSV for simplicity, e.g., "Saturday,Sunday"
    dnd_days = db.Column(db.String(100), nullable=True)

    # Stored as JSON string of time ranges:
    # e.g., '[{"from": "08:00", "to": "11:00"}, {"from": "21:00", "to": "23:00"}]'
    dnd_time_ranges = db.Column(db.Text, nullable=True)

    temporarily_paused = db.Column(db.Boolean, default=False)
    pause_until = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            "dnd_days": self.dnd_days.split(',') if self.dnd_days else [],
            "dnd_time_ranges": json.loads(self.dnd_time_ranges or "[]"),
            "temporarily_paused": self.temporarily_paused,
            "pause_until": self.pause_until.isoformat() if self.pause_until else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
