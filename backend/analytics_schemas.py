"""
Analytics Schemas
Pydantic models for analytics endpoint responses
"""

from pydantic import BaseModel
from typing import Dict, List


class MonthlyTrend(BaseModel):
    """Schema for monthly trend data point"""
    month: str  # e.g., "Jan", "Feb"
    income: float
    expense: float


class AnalyticsMetrics(BaseModel):
    """Schema for key financial metrics"""
    net_savings: float
    avg_daily_spend: float
    savings_rate: float


class AnalyticsResponse(BaseModel):
    """Schema for complete analytics response"""
    category_breakdown: Dict[str, float]  # {category: total_amount}
    monthly_trends: List[MonthlyTrend]
    metrics: AnalyticsMetrics
