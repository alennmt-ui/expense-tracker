import { apiRequest } from './client';

interface SummaryResponse {
  total_income: number;
  total_expense: number;
  balance: number;
  monthly_limit: number | null;
  remaining: number | null;
  limit_exceeded: boolean;
}

export async function getSummary(): Promise<SummaryResponse> {
  return apiRequest<SummaryResponse>('/summary');
}
