import { apiRequest } from './client';

interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

interface AnalyticsMetrics {
  net_savings: number;
  avg_daily_spend: number;
  savings_rate: number;
}

interface AnalyticsResponse {
  category_breakdown: Record<string, number>;
  monthly_trends: MonthlyTrend[];
  metrics: AnalyticsMetrics;
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  return apiRequest<AnalyticsResponse>('/analytics');
}
