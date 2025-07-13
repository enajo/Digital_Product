# migrate.py

import sys
import os
from sqlalchemy import inspect, text

# ensure app package is on PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

from app import db, create_app
from app.models.user import Patient, Clinic, Admin
from app.models.doctor import Doctor
from app.models.slot import Slot
from app.models.booking import Booking
from app.models.standby import StandbyPreference
from app.models.dnd import DNDPreference

def migrate():
    """
    1) Adds slots.doctor_id if missing
    2) Creates any other tables/models via create_all()
    """
    engine = db.get_engine()
    inspector = inspect(engine)

    # 1) Ensure slots.doctor_id exists
    cols = [col['name'] for col in inspector.get_columns('slots')]
    if 'doctor_id' not in cols:
        print("🔨 Adding missing column slots.doctor_id…")
        # NOTE: adjust NOT NULL / DEFAULT as makes sense for your data
        db.session.execute(text("""
            ALTER TABLE slots
            ADD COLUMN doctor_id INTEGER REFERENCES doctors(id)
                DEFAULT 1  -- <- temporary default; change or remove as needed
                NOT NULL
        """))
        db.session.commit()
        print("✅ Added slots.doctor_id")

    # 2) Create any other tables (new models)
    try:
        db.create_all()
        print("✅ All tables are now up to date.")
    except Exception as e:
        print("❌ Migration/create_all failed:", str(e))

if __name__ == "__main__":
    # spin up Flask app context
    app = create_app()
    with app.app_context():
        migrate()
