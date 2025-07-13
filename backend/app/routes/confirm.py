from datetime import datetime
from flask import Blueprint, request, render_template
from app import db
from app.models.slot_confirmation import SlotConfirmation
from app.models.slot import Slot

confirm_bp = Blueprint("confirm", __name__, url_prefix="/confirm")

@confirm_bp.route("", methods=["GET"])
def confirm_slot():
    token = request.args.get("token")
    c = SlotConfirmation.query.get(token)
    if not c or c.used or c.expires_at < datetime.utcnow():
        return render_template("confirm.html", status="invalid")
    slot = Slot.query.get(c.slot_id)
    if slot.status != "open":
        return render_template("confirm.html", status="taken")
    # mark it booked
    slot.status = "booked"
    c.used = True
    db.session.commit()
    return render_template("confirm.html", status="success")
