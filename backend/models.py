"""
Database Models
Defines the structure of database tables using SQLAlchemy ORM
"""

from sqlalchemy import Column, Integer, String, Float, Date
from database import Base


class Expense(Base):
    """
    Expense model representing the expenses table in database
    
    Fields:
        id: Primary key, auto-incremented
        merchant: Name of the merchant/store
        amount: Expense amount (float)
        date: Date of expense (stored as string in YYYY-MM-DD format)
        category: Expense category (Food, Transport, etc.)
    """
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    merchant = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False)  # Stored as string for simplicity
    category = Column(String, nullable=False)

    def __repr__(self):
        return f"<Expense(id={self.id}, merchant={self.merchant}, amount={self.amount})>"
