import { Transaction } from '../types';
import { DashboardSummary } from '../constants';

// Backend → Frontend adapters

export function adaptExpenseToTransaction(expense: {
  id: number;
  merchant: string;
  amount: number;
  date: string;
  category: string;
}): Transaction {
  return {
    id: expense.id.toString(),
    merchant: expense.merchant,
    category: expense.category,
    time: formatTime(expense.date),
    date: expense.date,
    amount: -Math.abs(expense.amount),
    type: 'expense',
    icon: getCategoryIcon(expense.category),
  };
}

export function adaptIncomeToTransaction(income: {
  id: number;
  source: string;
  amount: number;
  date: string;
  category?: string;
}): Transaction {
  return {
    id: income.id.toString(),
    merchant: income.source,
    category: income.category || 'Income',
    time: formatTime(income.date),
    date: income.date,
    amount: Math.abs(income.amount),
    type: 'income',
    icon: 'briefcase',
  };
}

export function adaptSubscription(subscription: {
  id: number;
  name: string;
  amount: number;
  billing_date: number;
  category: string;
  status: string;
  created_at: string;
}): { id: string; name: string; amount: number; initial: string } {
  return {
    id: subscription.id.toString(),
    name: subscription.name,
    amount: subscription.amount,
    initial: subscription.name.charAt(0).toUpperCase(),
  };
}

export function adaptSummaryToDashboard(summary: {
  total_income: number | null;
  total_expense: number | null;
  balance: number | null;
  monthly_limit: number | null;
  remaining: number | null;
  limit_exceeded: boolean;
}): Partial<DashboardSummary> {
  const totalIncome = summary.total_income !== null ? summary.total_income : 0;
  const totalExpense = summary.total_expense !== null ? summary.total_expense : 0;
  const balance = summary.balance !== null ? summary.balance : 0;
  const limit = summary.monthly_limit !== null ? summary.monthly_limit : 0;
  const remaining = summary.remaining !== null ? summary.remaining : 0;
  const consumed = limit > 0 ? Math.round(((limit - remaining) / limit) * 100) : 0;

  return {
    balance,
    totalIncome,
    totalExpense,
    spendingLimit: limit,
    remaining,
    consumedPercent: Math.min(consumed, 100),
  };
}

export function adaptOCRData(ocrData: {
  merchant_name: string;
  total_amount: string;
  date: string;
}): { merchant: string; amount: number; date: string } {
  return {
    merchant: ocrData.merchant_name || '',
    amount: parseFloat(ocrData.total_amount) || 0,
    date: ocrData.date || new Date().toISOString().split('T')[0],
  };
}

// Frontend → Backend adapters

export function adaptExpensePayload(data: {
  merchant: string;
  amount: number;
  date: string;
  category: string;
}): { merchant: string; amount: number; date: string; category: string } {
  return {
    merchant: data.merchant,
    amount: Math.abs(data.amount),
    date: formatDateToISO(data.date),
    category: data.category,
  };
}

export function adaptIncomePayload(data: {
  source: string;
  amount: number;
  date: string;
  category?: string;
}): { source: string; amount: number; date: string; category: string } {
  return {
    source: data.source,
    amount: Math.abs(data.amount),
    date: formatDateToISO(data.date),
    category: data.category || 'Salary',
  };
}

// Helper functions

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function formatDateToISO(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return new Date().toISOString().split('T')[0];
}

function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'Groceries': 'shopping_cart',
    'Shopping': 'shopping_cart',
    'Utilities': 'zap',
    'Transport': 'car',
    'Travel': 'car',
    'Dining': 'utensils',
    'Salary': 'briefcase',
    'Income': 'briefcase',
  };
  return iconMap[category] || 'shopping_cart';
}
