
import type { LucideIcon } from "lucide-react";
import { type SVGProps } from "react";

export interface User {
  id: number;
  username: string;
  country: string;
  currency: string;
  theme?: 'light' | 'dark';
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
  recurrence: 'one-time' | 'weekly' | 'monthly' | 'yearly';
  isCompleted?: boolean;
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

// For QR Code data structure
export interface QrTransaction {
    d: string; // date
    dsc: string; // description
    a: number; // amount
    t: 'income' | 'expense'; // type
    c: string; // categoryName
}

export interface QrData {
    type: 'WalletWatcherReport';
    version: number;
    data: QrTransaction[];
}

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  history: number[];
  icon: LucideIcon | ((props: SVGProps<SVGSVGElement>) => JSX.Element);
}
