"""
Income Model
Defines the structure of income table using SQLAlchemy ORM
Follows same pattern as Expense model
"""

from sqlalchemy import Column, Integer, String, Float
from database import Base


class Income(Base):
    """
    Income model representing the income table in database
    
    Fields:
        id: Primary key, auto-incremented
        source: Source of income (salary, freelance, etc.)
        amount: Income amount (float)
        date: Date of income (stored as string in YYYY-MM-DD format)
        category: Category of income (Salary, Freelance, Investment, etc.)
    """
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False)  # Stored as string for consistency
    category = Column(String, nullable=False, default="Salary")

    def __repr__(self):
        return f"<Income(id={self.id}, source={self.source}, amount={self.amount})>"
