"""
Insights Schemas
Pydantic models for insights endpoint responses
"""

from pydantic import BaseModel
from typing import List


class TopCategory(BaseModel):
    """Schema for top spending category"""
    name: str
    amount: float
    percentage: float


class Suggestion(BaseModel):
    """Schema for financial suggestion"""
    title: str
    description: str
    type: str  # optimization, opportunity, audit, tax
    impact: str  # High, Medium, Low


class InsightsResponse(BaseModel):
    """Schema for complete insights response"""
    health_score: int  # 0-100
    top_category: TopCategory
    suggestions: List[Suggestion]
