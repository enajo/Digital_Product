from app import db
from app.models.booking import Booking
from app.models.slot import Slot
from sqlalchemy.exc import IntegrityError
from datetime import datetime


def book_slot_for_patient(patient_id: int, slot_id: int):
    """
    Attempts to book a slot for a patient.
    Ensures slot is still available and updates both Slot and Booking records.
    Returns: (success: bool, message: str, booking: Booking or None)
    """
    slot = Slot.query.get(slot_id)

    if not slot:
        return False, "Slot does not exist.", None

    if slot.status != "open":
        return False, "Slot is no longer available.", None

    try:
        # Lock the slot in transaction
        slot.status = "booked"
        booking = Booking(patient_id=patient_id, slot_id=slot.id)
        db.session.add(booking)
        db.session.commit()
        return True, "Slot booked successfully.", booking

    except IntegrityError:
        db.session.rollback()
        return False, "Slot was just booked by another patient.", None

    except Exception as e:
        db.session.rollback()
        return False, str(e), None


def cancel_booking(booking_id: int, patient_id: int):
    """
    Cancels a booking if it belongs to the given patient.
    Frees the slot for reuse.
    """
    booking = Booking.query.get(booking_id)

    if not booking or booking.patient_id != patient_id:
        return False, "Booking not found or access denied."

    booking.cancel()
    booking.slot.status = "open"
    db.session.commit()

    return True, "Booking cancelled and slot reopened."


def get_patient_bookings(patient_id: int):
    """
    Returns all bookings for a given patient.
    """
    return Booking.query.filter_by(patient_id=patient_id).all()


def get_clinic_bookings(clinic_id: int):
    """
    Returns all bookings for slots belonging to a given clinic.
    """
    from app.models.user import Clinic
    clinic = Clinic.query.get(clinic_id)

    if not clinic:
        return []

    slot_ids = [slot.id for slot in clinic.slots]
    return Booking.query.filter(Booking.slot_id.in_(slot_ids)).all()
