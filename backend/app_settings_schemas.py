"""
App Settings Pydantic Schemas
Defines data validation and serialization models for settings API
"""

from pydantic import BaseModel
from typing import Dict


class SettingsUpdate(BaseModel):
    """Schema for updating multiple settings"""
    settings: Dict[str, str]

    class Config:
        json_schema_extra = {
            "example": {
                "settings": {
                    "currency": "USD",
                    "reset_day": "1",
                    "passive_rule": "non_salary"
                }
            }
        }


class SettingsResponse(BaseModel):
    """Schema for settings response"""
    settings: Dict[str, str]

    class Config:
        json_schema_extra = {
            "example": {
                "settings": {
                    "currency": "USD",
                    "reset_day": "1",
                    "passive_rule": "non_salary"
                }
            }
        }
