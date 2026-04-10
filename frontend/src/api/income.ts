import { apiRequest } from './client';

interface IncomeResponse {
  id: number;
  source: string;
  amount: number;
  date: string;
  category: string;
}

interface IncomeCreate {
  source: string;
  amount: number;
  date: string;
  category: string;
}

export async function getIncome(): Promise<IncomeResponse[]> {
  return apiRequest<IncomeResponse[]>('/income');
}

export async function createIncome(data: IncomeCreate): Promise<IncomeResponse> {
  return apiRequest<IncomeResponse>('/income', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteIncome(id: number): Promise<void> {
  await apiRequest(`/income/${id}`, {
    method: 'DELETE',
  });
}
