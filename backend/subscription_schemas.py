"""
Subscription Schemas
Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional


class SubscriptionCreate(BaseModel):
    """Schema for creating a new subscription"""
    name: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0, description="Monthly subscription cost")
    billing_date: int = Field(..., ge=1, le=31, description="Day of month (1-31)")
    category: str = Field(..., min_length=1, max_length=50)
    status: str = Field(default="active", pattern="^(active|cancelled)$")


class SubscriptionUpdate(BaseModel):
    """Schema for updating a subscription (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    amount: Optional[float] = Field(None, gt=0)
    billing_date: Optional[int] = Field(None, ge=1, le=31)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    status: Optional[str] = Field(None, pattern="^(active|cancelled)$")


class SubscriptionResponse(BaseModel):
    """Schema for subscription response"""
    id: int
    name: str
    amount: float
    billing_date: int
    category: str
    status: str
    created_at: str

    class Config:
        from_attributes = True
