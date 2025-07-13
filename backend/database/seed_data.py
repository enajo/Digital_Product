import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import db, create_app
from app.models.user import Patient, Clinic, Admin
from app.models.doctor import Doctor
from app.models.slot import Slot
from app.models.standby import StandbyPreference
from app.models.dnd import DNDPreference
from datetime import datetime, timedelta, time

def seed():
    # drop & recreate schema
    db.drop_all()
    db.create_all()

    # ————— Clinics —————
    clinic1 = Clinic(
        email="clinic1@quickdoc.com",
        name="Healthy Life Clinic",
        city="Berlin",
        doctor_name="Meyer"
    )
    clinic1.set_password("password123")

    clinic2 = Clinic(
        email="clinic2@quickdoc.com",
        name="MediFast Center",
        city="Munich",
        doctor_name="Schmidt"
    )
    clinic2.set_password("password123")

    db.session.add_all([clinic1, clinic2])
    db.session.commit()

    # ————— Doctors —————
    dr1 = Doctor(
        clinic_id=clinic1.id,
        name="Dr. Anna Meyer",
        specialization="General Practitioner"
    )
    dr2 = Doctor(
        clinic_id=clinic2.id,
        name="Dr. Karl Schmidt",
        specialization="Cardiologist"
    )
    db.session.add_all([dr1, dr2])
    db.session.commit()

    # ————— Patients —————
    patient1 = Patient(
        email="patient1@example.com",
        name="Alice Brown",
        language="English",
        location="Berlin"
    )
    patient1.set_password("testpass")

    patient2 = Patient(
        email="patient2@example.com",
        name="Jonas Müller",
        language="German",
        location="Munich"
    )
    patient2.set_password("testpass")

    # ————— Admin —————
    admin = Admin(
        email="admin@quickdoc.com",
        full_name="Super Admin"
    )
    admin.set_password("adminpass")

    db.session.add_all([patient1, patient2, admin])
    db.session.commit()

    # ————— Slots —————
    # link slots to specific doctors
    today = datetime.utcnow().date()
    slots = [
        Slot(
            clinic_id=clinic1.id,
            doctor_id=dr1.id,
            date=today + timedelta(days=1),
            start_time=time(9, 0),
            end_time=time(9, 30),
            language="English"
        ),
        Slot(
            clinic_id=clinic1.id,
            doctor_id=dr1.id,
            date=today + timedelta(days=1),
            start_time=time(10, 0),
            end_time=time(10, 30),
            language="English"
        ),
        Slot(
            clinic_id=clinic2.id,
            doctor_id=dr2.id,
            date=today + timedelta(days=2),
            start_time=time(14, 0),
            end_time=time(14, 30),
            language="German"
        ),
        Slot(
            clinic_id=clinic2.id,
            doctor_id=dr2.id,
            date=today + timedelta(days=3),
            start_time=time(11, 0),
            end_time=time(11, 30),
            language="German"
        ),
    ]

    db.session.add_all(slots)
    db.session.commit()

    # ————— Standby & DND prefs —————
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
