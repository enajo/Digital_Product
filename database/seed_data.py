from app import db, create_app
from app.models.user import Patient, Clinic, Admin
from app.models.slot import Slot
from app.models.standby import StandbyPreference
from app.models.dnd import DNDPreference
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta, time

def seed():
    db.drop_all()
    db.create_all()

    # Create sample clinics
    clinic1 = Clinic(
        email="clinic1@quickdoc.com",
        password=generate_password_hash("password123"),
        name="Healthy Life Clinic",
        city="Berlin",
        doctor_name="Meyer"
    )

    clinic2 = Clinic(
        email="clinic2@quickdoc.com",
        password=generate_password_hash("password123"),
        name="MediFast Center",
        city="Munich",
        doctor_name="Schmidt"
    )

    # Create sample patients
    patient1 = Patient(
        email="patient1@example.com",
        password=generate_password_hash("testpass"),
        name="Alice Brown",
        language="English",
        location="Berlin"
    )

    patient2 = Patient(
        email="patient2@example.com",
        password=generate_password_hash("testpass"),
        name="Jonas Müller",
        language="German",
        location="Munich"
    )

    # Create an admin
    admin = Admin(
        email="admin@quickdoc.com",
        password=generate_password_hash("adminpass")
    )

    db.session.add_all([clinic1, clinic2, patient1, patient2, admin])
    db.session.commit()

    # Create open slots for each clinic
    today = datetime.utcnow().date()
    slots = [
        Slot(clinic_id=clinic1.id, date=today + timedelta(days=1), start_time=time(9, 0), end_time=time(9, 30), language="English"),
        Slot(clinic_id=clinic1.id, date=today + timedelta(days=1), start_time=time(10, 0), end_time=time(10, 30), language="English"),
        Slot(clinic_id=clinic2.id, date=today + timedelta(days=2), start_time=time(14, 0), end_time=time(14, 30), language="German"),
        Slot(clinic_id=clinic2.id, date=today + timedelta(days=3), start_time=time(11, 0), end_time=time(11, 30), language="German"),
    ]

    db.session.add_all(slots)
    db.session.commit()

    # Add standby & DND preferences
    standby1 = StandbyPreference(
        patient_id=patient1.id,
        enabled=True,
        preferred_languages="English",
        preferred_days="Monday,Tuesday",
        preferred_times="08:00-12:00",
        max_notifications_per_day=3
    )

    dnd2 = DNDPreference(
        patient_id=patient2.id,
        dnd_days="Saturday,Sunday",
        dnd_time_ranges='[{"from": "14:00", "to": "16:00"}]',
        temporarily_paused=False
    )

    db.session.add_all([standby1, dnd2])
    db.session.commit()

    print("✅ Seed data inserted successfully.")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed()
