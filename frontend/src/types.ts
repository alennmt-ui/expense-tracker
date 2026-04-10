export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  time: string;
  date?: string;
  amount: number;
  type: 'expense' | 'income';
  icon: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  initial: string;
}

export type Screen = 'dashboard' | 'expenses' | 'income' | 'analytics' | 'settings' | 'insights' | 'subscriptions';
