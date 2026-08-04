from app.services.email import send_email

ok = send_email(
    "kalisoftaisales@kalisoftai.in",
    "Test — SMTP working",
    "If you see this, SMTP is configured correctly.",
)
print("Email sent:", ok)
