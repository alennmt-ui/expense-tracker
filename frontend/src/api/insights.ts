import { apiRequest } from './client';

interface TopCategory {
  name: string;
  amount: number;
  percentage: number;
}

interface Suggestion {
  title: string;
  description: string;
  type: string;
  impact: string;
}

interface InsightsResponse {
  health_score: number;
  top_category: TopCategory;
  suggestions: Suggestion[];
}

export async function getInsights(): Promise<InsightsResponse> {
  return apiRequest<InsightsResponse>('/insights');
}
