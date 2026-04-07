"""
Multi-channel Alert Dispatcher.
Channels: Email (SendGrid), SMS (Twilio), Dashboard (WebSocket).
"""
import os
import logging
from datetime import datetime
from .analyzer import THRESHOLDS, classify_pollutant

logger = logging.getLogger(__name__)

# Alert recipients from environment
GOVT_EMAILS   = os.getenv("GOVT_ALERT_EMAILS",  "admin@govt.in").split(",")
PUBLIC_EMAILS = os.getenv("PUBLIC_ALERT_EMAILS", "public@alert.io").split(",")
GOVT_PHONES   = os.getenv("GOVT_PHONE_NUMBERS",  "+911234567890").split(",")
FROM_EMAIL    = os.getenv("ALERT_FROM_EMAIL",    "alerts@ecosentinel.io")
FROM_PHONE    = os.getenv("TWILIO_FROM_NUMBER",  "+10000000000")


def _get_sendgrid():
    try:
        from sendgrid import SendGridAPIClient
        return SendGridAPIClient(os.environ["SENDGRID_API_KEY"])
    except Exception as e:
        logger.warning(f"SendGrid not configured: {e}")
        return None


def _get_twilio():
    try:
        from twilio.rest import Client
        return Client(os.environ["TWILIO_SID"], os.environ["TWILIO_AUTH_TOKEN"])
    except Exception as e:
        logger.warning(f"Twilio not configured: {e}")
        return None


def send_email_alert(alert: dict) -> bool:
    """Send formatted email alert via SendGrid."""
    sg = _get_sendgrid()
    if not sg:
        logger.info(f"[MOCK EMAIL] {alert['message']}")
        return False

    from sendgrid.helpers.mail import Mail
    level    = alert.get("level", "warning")
    color    = "#EF4444" if level == "critical" else "#F59E0B"
    recipients = GOVT_EMAILS + (PUBLIC_EMAILS if level == "critical" else [])

    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0F172A;padding:20px;border-radius:8px 8px 0 0;">
        <h1 style="color:#10B981;margin:0;font-size:20px;">🌿 EcoSentinel Alert</h1>
      </div>
      <div style="background:#1E293B;padding:24px;border-radius:0 0 8px 8px;border:1px solid #334155;">
        <div style="background:{color}20;border-left:4px solid {color};padding:12px 16px;border-radius:4px;margin-bottom:16px;">
          <strong style="color:{color};font-size:16px;">{level.upper()} — {alert['parameter']}</strong>
        </div>
        <table style="width:100%;border-collapse:collapse;color:#F1F5F9;font-size:14px;">
          <tr><td style="padding:8px;color:#94A3B8;">Parameter</td><td style="padding:8px;">{alert['parameter']}</td></tr>
          <tr><td style="padding:8px;color:#94A3B8;">Value</td><td style="padding:8px;color:{color};font-weight:bold;">{alert['value']}</td></tr>
          <tr><td style="padding:8px;color:#94A3B8;">Threshold</td><td style="padding:8px;">{alert['threshold']}</td></tr>
          <tr><td style="padding:8px;color:#94A3B8;">City</td><td style="padding:8px;">{alert['city']}</td></tr>
          <tr><td style="padding:8px;color:#94A3B8;">Time</td><td style="padding:8px;">{alert['timestamp']}</td></tr>
        </table>
        <p style="color:#94A3B8;margin-top:16px;font-size:13px;">{alert['message']}</p>
        <p style="color:#64748B;font-size:12px;margin-top:16px;">EcoSentinel AI Monitoring System — Do not reply to this email.</p>
      </div>
    </div>"""

    msg = Mail(
        from_email=FROM_EMAIL,
        to_emails=recipients,
        subject=f"[EcoSentinel] {level.upper()} — {alert['parameter']} Alert in {alert['city']}",
        html_content=html,
    )
    try:
        sg.send(msg)
        logger.info(f"Email sent to {recipients}")
        return True
    except Exception as e:
        logger.error(f"Email failed: {e}")
        return False


def send_sms_alert(alert: dict) -> bool:
    """Send SMS alert via Twilio (critical alerts only)."""
    twilio = _get_twilio()
    if not twilio:
        logger.info(f"[MOCK SMS] {alert['message']}")
        return False

    body = (
        f"🚨 EcoSentinel ALERT\n"
        f"{alert['level'].upper()} — {alert['parameter']}\n"
        f"Value: {alert['value']} | City: {alert['city']}\n"
        f"{alert['message']}"
    )
    success = True
    for phone in GOVT_PHONES:
        try:
            twilio.messages.create(body=body, from_=FROM_PHONE, to=phone.strip())
        except Exception as e:
            logger.error(f"SMS to {phone} failed: {e}")
            success = False
    return success


def check_and_dispatch(reading: dict, previous: dict | None = None) -> list[dict]:
    """
    Check reading against all thresholds.
    Dispatch email/SMS if thresholds exceeded.
    Returns list of alerts generated.
    """
    alerts_generated = []

    for param, levels in THRESHOLDS.items():
        val = reading.get(param, 0)
        status = classify_pollutant(param, val)
        if status == "safe":
            continue

        level     = "critical" if status in ("unhealthy", "hazardous") else "warning"
        threshold = levels["moderate"] if status == "moderate" else levels["unhealthy"]

        alert = {
            "level":     level,
            "parameter": param.upper(),
            "value":     val,
            "threshold": threshold,
            "city":      reading.get("city", "unknown"),
            "timestamp": reading.get("timestamp", datetime.utcnow().isoformat()),
            "message":   (
                f"{param.upper()} level of {val} has exceeded the {status} threshold "
                f"({threshold}) in {reading.get('city','unknown')}. "
                f"{'Immediate action required.' if level=='critical' else 'Please monitor closely.'}"
            ),
        }

        alert["sent_email"] = send_email_alert(alert)
        if level == "critical":
            alert["sent_sms"] = send_sms_alert(alert)

        alerts_generated.append(alert)

    return alerts_generated
