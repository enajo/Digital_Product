from app import db, create_app
from app.models.user import Patient, Clinic, Admin
from app.models.slot import Slot
from app.models.booking import Booking
from app.models.standby import StandbyPreference
from app.models.dnd import DNDPreference

def migrate():
    try:
        db.create_all()
        print("✅ Database tables created successfully.")
    except Exception as e:
        print("❌ Migration failed:", str(e))

if __name__ == "__main__":
    app = create_app()  # Ensure you have this factory function in app/__init__.py
    with app.app_context():
        migrate()
