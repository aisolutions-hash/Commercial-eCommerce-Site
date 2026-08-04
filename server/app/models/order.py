import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    items: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    shipping_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    shipping_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    shipping_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    shipping_city: Mapped[str | None] = mapped_column(String(255), nullable=True)
    shipping_zip: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="orders")
