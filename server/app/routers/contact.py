import logging
import os
from uuid import uuid4

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.contact import ContactInquiry
from app.schemas.contact import ContactInquiry as ContactInquirySchema, ContactResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", response_model=ContactResponse)
async def submit_contact(inquiry: ContactInquirySchema, db: AsyncSession = Depends(get_db)):
    inquiry_record = ContactInquiry(
        id=str(uuid4()),
        name=inquiry.name,
        email=inquiry.email,
        message=inquiry.message,
    )
    db.add(inquiry_record)
    await db.commit()

    logger.info("Contact inquiry saved: %s (%s)", inquiry.name, inquiry.email)

    notify_email = os.getenv("CONTACT_NOTIFY_EMAIL")
    if notify_email:
        try:
            import smtplib
            from email.message import EmailMessage

            msg = EmailMessage()
            msg.set_content(f"Name: {inquiry.name}\nEmail: {inquiry.email}\n\nMessage:\n{inquiry.message}")
            msg["Subject"] = f"KaliSoft Contact: {inquiry.name}"
            msg["From"] = inquiry.email
            msg["To"] = notify_email

            smtp_host = os.getenv("SMTP_HOST", "")
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
            smtp_user = os.getenv("SMTP_USER", "")
            smtp_pass = os.getenv("SMTP_PASS", "")

            if smtp_host and smtp_user:
                with smtplib.SMTP(smtp_host, smtp_port) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
        except Exception as e:
            logger.error("Failed to send contact email: %s", e)

    return ContactResponse(status="ok", message="Thank you for your inquiry. We'll get back to you within 24 hours.")
