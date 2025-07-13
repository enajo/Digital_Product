# backend/app/routes/test_mail.py

from flask import Blueprint, jsonify, current_app
from flask_mail import Message
from app import mail

# Define a blueprint for test email
test_mail_bp = Blueprint("test_mail_bp", __name__, url_prefix="/api/test")

@test_mail_bp.route('/email', methods=['GET'])
def send_test_email():
    """
    Sends a test email to verify SMTP configuration.
    Returns a JSON response indicating success or failure.
    """
    try:
        # Replace with your own email or fetch from config
        test_recipient = current_app.config.get('ADMIN_EMAIL')
        if not test_recipient:
            return jsonify({"error": "No test recipient configured (ADMIN_EMAIL)"}), 400

        msg = Message(
            subject="QuickDoc Test Email",
            recipients=[test_recipient],
            body="✅ If you see this, your mail settings are working correctly!"
        )
        mail.send(msg)
        return jsonify({"status": "sent", "to": test_recipient}), 200

    except Exception as e:
        current_app.logger.error(f"Test email failed: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500
