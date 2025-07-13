from app import db

# Import all model classes so they're registered with SQLAlchemy
from .user import User, Patient, Clinic, Admin
from .slot import Slot
from .booking import Booking
from .standby import StandbyPreference
from .dnd import DNDPreference

# This file ensures that when `db.create_all()` is run,
# all models are recognized by SQLAlchemy.
