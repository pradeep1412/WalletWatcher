export interface User {
  id: number;
  username: string;
  country: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  date: string; // ISO 8601 format
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId: number;
}

export interface Budget {
  categoryId: number;
  amount: number;
  recurrence: 'one-time' | 'weekly' | 'monthly' | 'yearly';
  isCompleted?: boolean;
}

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export type Period = 'week' | 'month' | 'year';

export interface AppState {
  user: User | null;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  loading: boolean;
  error: Error | null;
}
