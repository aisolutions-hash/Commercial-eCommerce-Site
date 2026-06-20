import uuid
from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id: Mapped[str] = mapped_column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id"), nullable=False)
    product_id: Mapped[str] = mapped_column(String(255), ForeignKey("products.id"), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="wishlist_entries")
    product: Mapped["Product"] = relationship("Product", back_populates="wishlist_entries")

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_user_product_wishlist"),
    )
