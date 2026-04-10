"""
Pydantic Schemas
Defines data validation and serialization models for API requests/responses
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class ExpenseCreate(BaseModel):
    """
    Schema for creating a new expense
    Used in POST /expense endpoint
    
    All fields are required with validation
    """
    merchant: str = Field(..., min_length=1, description="Merchant name")
    amount: float = Field(..., gt=0, description="Expense amount (must be positive)")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    category: str = Field(..., min_length=1, description="Expense category")

    @field_validator('merchant')
    @classmethod
    def validate_merchant(cls, v):
        """Validate merchant is not empty or whitespace"""
        if not v or not v.strip():
            raise ValueError('Merchant name cannot be empty')
        return v.strip()
    
    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        """Validate amount is positive and reasonable"""
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        if v > 1000000:
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
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Validate category is not empty"""
        if not v or not v.strip():
            raise ValueError('Category cannot be empty')
        return v.strip()

    class Config:
        # Example for API documentation
        json_schema_extra = {
            "example": {
                "merchant": "Starbucks",
                "amount": 5.50,
                "date": "2024-01-15",
                "category": "Food"
            }
        }


class ExpenseResponse(BaseModel):
    """
    Schema for expense response
    Used in GET endpoints to return expense data
    
    Includes the database-generated ID
    """
    id: int
    merchant: str
    amount: float
    date: str
    category: str

    class Config:
        # Allow ORM models to be converted to Pydantic models
        from_attributes = True


class ExpenseUpdate(BaseModel):
    """
    Schema for updating an expense
    All fields are optional, but if provided, must pass validation
    """
    merchant: Optional[str] = Field(None, min_length=1)
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1)

    @field_validator('merchant')
    @classmethod
    def validate_merchant(cls, v):
        """Validate merchant if provided"""
        if v is not None:
            if not v.strip():
                raise ValueError('Merchant name cannot be empty')
            return v.strip()
        return v
    
    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        """Validate amount if provided"""
        if v is not None:
            if v <= 0:
                raise ValueError('Amount must be greater than 0')
            if v > 1000000:
                raise ValueError('Amount seems unreasonably high')
            return round(v, 2)
        return v
    
    @field_validator('date')
    @classmethod
    def validate_date(cls, v):
        """Validate date format and ensure it's not in the future"""
        if v is not None:
            try:
                date_obj = datetime.strptime(v, '%Y-%m-%d')
                if date_obj.date() > datetime.now().date():
                    raise ValueError('Date cannot be in the future')
                return v
            except ValueError as e:
                if 'future' in str(e):
                    raise e
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Validate category if provided"""
        if v is not None:
            if not v.strip():
                raise ValueError('Category cannot be empty')
            return v.strip()
        return v
