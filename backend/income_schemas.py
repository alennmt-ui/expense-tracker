"""
Income Pydantic Schemas
Defines data validation and serialization models for Income API requests/responses
Follows same validation pattern as Expense schemas
"""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


class IncomeCreate(BaseModel):
    """
    Schema for creating a new income entry
    Used in POST /income endpoint
    
    All fields are required with validation
    """
    source: str = Field(..., min_length=1, description="Income source")
    amount: float = Field(..., gt=0, description="Income amount (must be positive)")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    category: str = Field(default="Salary", description="Income category")

    @field_validator('source')
    @classmethod
    def validate_source(cls, v):
        """Validate source is not empty or whitespace"""
        if not v or not v.strip():
            raise ValueError('Income source cannot be empty')
        return v.strip()
    
    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        """Validate amount is positive and reasonable"""
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        if v > 10000000:
            raise ValueError('Amount seems unreasonably high')
        return round(v, 2)
    
    @field_validator('date')
    @classmethod
    def validate_date(cls, v):
        """Validate date format and ensure it's not in the future"""
        try:
            date_obj = datetime.strptime(v, '%Y-%m-%d')
            # Check if date is in the future
            if date_obj.date() > datetime.now().date():
                raise ValueError('Date cannot be in the future')
            return v
        except ValueError as e:
            if 'future' in str(e):
                raise e
            raise ValueError('Date must be in YYYY-MM-DD format')

    class Config:
        # Example for API documentation
        json_schema_extra = {
            "example": {
                "source": "Salary",
                "amount": 5000.00,
                "date": "2024-01-15",
                "category": "Salary"
            }
        }


class IncomeResponse(BaseModel):
    """
    Schema for income response
    Used in GET endpoints to return income data
    
    Includes the database-generated ID
    """
    id: int
    source: str
    amount: float
    date: str
    category: str

    class Config:
        # Allow ORM models to be converted to Pydantic models
        from_attributes = True


class FinancialSummary(BaseModel):
    """
    Schema for financial summary response
    Used in GET /summary endpoint
    
    Provides overview of total income, expenses, balance, and monthly limit info
    """
    total_income: float = Field(..., description="Sum of all income")
    total_expense: float = Field(..., description="Sum of all expenses")
    balance: float = Field(..., description="Income minus expenses")
    monthly_limit: Optional[float] = Field(None, description="Monthly spending limit")
    remaining: Optional[float] = Field(None, description="Remaining budget for the month")
    limit_exceeded: bool = Field(False, description="Whether monthly limit has been exceeded")

    class Config:
        json_schema_extra = {
            "example": {
                "total_income": 10000.00,
                "total_expense": 3500.00,
                "balance": 6500.00,
                "monthly_limit": 5000.00,
                "remaining": 1500.00,
                "limit_exceeded": False
            }
        }
