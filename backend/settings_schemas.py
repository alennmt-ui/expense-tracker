"""
Settings Pydantic Schemas
Defines validation for settings API requests/responses
"""

from pydantic import BaseModel, Field, field_validator


class MonthlyLimitSet(BaseModel):
    """
    Schema for setting monthly spending limit
    Used in POST /limit endpoint
    """
    limit: float = Field(..., gt=0, description="Monthly spending limit (must be positive)")

    @field_validator('limit')
    @classmethod
    def validate_limit(cls, v):
        """Validate limit is positive and reasonable"""
        if v <= 0:
            raise ValueError('Monthly limit must be greater than 0')
        if v > 1000000000:
            raise ValueError('Monthly limit seems unreasonably high')
        return round(v, 2)

    class Config:
        json_schema_extra = {
            "example": {
                "limit": 3000.00
            }
        }


class MonthlyLimitResponse(BaseModel):
    """
    Schema for monthly limit response
    Used in GET /limit endpoint
    """
    monthly_limit: float = Field(..., description="Current monthly spending limit")

    class Config:
        json_schema_extra = {
            "example": {
                "monthly_limit": 3000.00
            }
        }
