import { apiRequest } from './client';

interface LimitResponse {
  monthly_limit: number;
}

interface LimitSet {
  limit: number;
}

export async function getLimit(): Promise<LimitResponse> {
  return apiRequest<LimitResponse>('/limit');
}

export async function setLimit(value: number): Promise<LimitResponse> {
  return apiRequest<LimitResponse>('/limit', {
    method: 'POST',
    body: JSON.stringify({ limit: value }),
  });
}
