import { Transaction, Subscription } from './types';

export interface DashboardSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  passiveIncome: number;
  fixedCosts: number;
  passivePercent: number;
  fixedCostPercent: number;
  spendingLimit: number;
  remaining: number;
  consumedPercent: number;
}

// Empty initial state - all data comes from backend
export const INITIAL_SUMMARY: DashboardSummary = {
  balance: 0,
  totalIncome: 0,
  totalExpense: 0,
  passiveIncome: 0,
  fixedCosts: 0,
  passivePercent: 0,
  fixedCostPercent: 0,
  spendingLimit: 0,
  remaining: 0,
  consumedPercent: 0,
};
