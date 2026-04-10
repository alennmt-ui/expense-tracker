import { apiRequest } from './client';

interface SubscriptionResponse {
  id: number;
  name: string;
  amount: number;
  billing_date: number;
  category: string;
  status: string;
  created_at: string;
}

interface SubscriptionCreate {
  name: string;
  amount: number;
  billing_date: number;
  category: string;
  status?: string;
}

export async function getSubscriptions(): Promise<SubscriptionResponse[]> {
  return apiRequest<SubscriptionResponse[]>('/subscriptions');
}

export async function createSubscription(data: SubscriptionCreate): Promise<SubscriptionResponse> {
  return apiRequest<SubscriptionResponse>('/subscription', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSubscription(id: number, data: Partial<SubscriptionCreate>): Promise<SubscriptionResponse> {
  return apiRequest<SubscriptionResponse>(`/subscription/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSubscription(id: number): Promise<void> {
  await apiRequest(`/subscription/${id}`, {
    method: 'DELETE',
  });
}
