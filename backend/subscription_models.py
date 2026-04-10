"""
Subscription Model
Defines the structure of subscriptions table using SQLAlchemy ORM
Follows same pattern as Expense and Income models
"""

from sqlalchemy import Column, Integer, String, Float
from database import Base


class Subscription(Base):
    """
    Subscription model representing the subscriptions table in database
    
    Fields:
        id: Primary key, auto-incremented
        name: Name of the subscription service (e.g., "Netflix")
        amount: Monthly subscription cost (float)
        billing_date: Day of month for billing (1-31)
        category: Subscription category (Entertainment, Software, etc.)
        status: Subscription status (active/cancelled)
        created_at: Date subscription was added (YYYY-MM-DD format)
    """
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    billing_date = Column(Integer, nullable=False)  # 1-31
    category = Column(String, nullable=False)
    status = Column(String, default="active", nullable=False)
    created_at = Column(String, nullable=False)

    def __repr__(self):
        return f"<Subscription(id={self.id}, name={self.name}, amount={self.amount})>"
