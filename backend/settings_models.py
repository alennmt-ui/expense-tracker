"""
Settings Model
Stores application settings including monthly spending limit
Simple key-value storage pattern
"""

from sqlalchemy import Column, Integer, String, Float
from database import Base


class Settings(Base):
    """
    Settings model for storing application configuration
    
    Fields:
        id: Primary key
        key: Setting name (e.g., 'monthly_limit')
        value: Setting value (stored as float)
    """
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(Float, nullable=False)

    def __repr__(self):
        return f"<Settings(key={self.key}, value={self.value})>"
