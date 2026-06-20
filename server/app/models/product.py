from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    long_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    category_id: Mapped[str] = mapped_column(String(255), ForeignKey("categories.id"), nullable=False, index=True)
    images: Mapped[list] = mapped_column(JSONB, default=list)
    rating: Mapped[float] = mapped_column(Numeric(2, 1), default=0)
    features: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_contact_for_price: Mapped[bool] = mapped_column(Boolean, default=False)
    moq: Mapped[int | None] = mapped_column(Integer, nullable=True)
    uom: Mapped[str | None] = mapped_column(String(50), nullable=True)

    category: Mapped["Category"] = relationship("Category", back_populates="products")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    wishlist_entries: Mapped[list["Wishlist"]] = relationship("Wishlist", back_populates="product")
