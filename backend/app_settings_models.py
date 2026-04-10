"""
App Settings Model
Stores general application settings as key-value pairs
"""

from sqlalchemy import Column, Integer, String
from database import Base


class AppSettings(Base):
    """
    AppSettings model for storing general application configuration
    
    Fields:
        id: Primary key
        key: Setting name (unique)
        value: Setting value (stored as string)
    """
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(String, nullable=False)

    def __repr__(self):
        return f"<AppSettings(key={self.key}, value={self.value})>"
