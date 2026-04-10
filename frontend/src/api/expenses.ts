import { apiRequest } from './client';

interface ExpenseResponse {
  id: number;
  merchant: string;
  amount: number;
  date: string;
  category: string;
}

interface ExpenseCreate {
  merchant: string;
  amount: number;
  date: string;
  category: string;
}

export async function getExpenses(): Promise<ExpenseResponse[]> {
  return apiRequest<ExpenseResponse[]>('/expenses');
}

export async function createExpense(data: ExpenseCreate): Promise<ExpenseResponse> {
  return apiRequest<ExpenseResponse>('/expense', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(id: number): Promise<void> {
  await apiRequest(`/expense/${id}`, {
    method: 'DELETE',
  });
}
