import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> bool:
    """Send a plain-text email via SMTP. Never raises — logs and returns False on failure."""
    if not settings.smtp_host or not settings.smtp_user:
        logger.warning("SMTP not configured — email not sent")
        return False
    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg["Subject"] = subject
        msg["From"] = settings.smtp_user
        msg["To"] = to
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_pass)
            server.send_message(msg)
        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, e)
        return False


def format_order_items(order) -> str:
    lines = []
    for item in order.items:
        qty = item.get("quantity", 1)
        price = float(item.get("price", 0))
        name = item.get("product_name") or item.get("product_id")
        lines.append(f"  - {name} x{qty}  —  Rs. {price * qty:.2f}")
    return "\n".join(lines) or "  (empty)"


def send_order_confirmation(order, customer_email: str, customer_name: str) -> None:
    body = f"""Hi {customer_name},

Thank you for your order with KaliSoft AI Marketplace!

Order #{order.id[:8].upper()}
Status: {order.status}
Total: Rs. {float(order.total):.2f}

Items:
{format_order_items(order)}

We'll notify you as your order status changes.

Thanks,
KaliSoft AI Marketplace
"""
    send_email(customer_email, f"Order Confirmed — #{order.id[:8].upper()}", body)


def send_order_status_email(order, customer_email: str, customer_name: str) -> None:
    body = f"""Hi {customer_name},

Your order #{order.id[:8].upper()} is now: {order.status.upper()}.

Items:
{format_order_items(order)}

Total: Rs. {float(order.total):.2f}

Thanks,
KaliSoft AI Marketplace
"""
    send_email(customer_email, f"Order {order.status.title()} — #{order.id[:8].upper()}", body)


def send_admin_new_order_email(order, customer_name: str, customer_email: str, shipping: dict) -> None:
    if not settings.notify_email:
        return
    addr = "\n".join(f"  {k}: {v}" for k, v in shipping.items() if v) or "  (not provided)"
    body = f"""NEW ORDER RECEIVED

Order #{order.id[:8].upper()}  (total: Rs. {float(order.total):.2f})

Customer: {customer_name}  ({customer_email})

Shipping:
{addr}

Items:
{format_order_items(order)}

— KaliSoft AI Marketplace bot
"""
    send_email(settings.notify_email, f"New Order #{order.id[:8].upper()} — {customer_name}", body)
