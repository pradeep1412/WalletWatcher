"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import {
  type AppState,
  type Transaction,
  type Budget,
  type Period,
} from "@/lib/types";
import { useToast } from "./use-toast";
import { startOfWeek, startOfMonth, startOfYear, isWithinInterval, endOfWeek, endOfMonth, endOfYear } from 'date-fns';
import { runDailyTasks } from "@/lib/scheduler";


type WalletWatcherContextType = AppState & {
  filteredTransactions: Transaction[];
  period: Period;
  setPeriod: (period: Period) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  setBudget: (budget: Budget) => Promise<void>;
  markGoalAsComplete: (categoryId: number) => Promise<void>;
  logout: () => Promise<void>;
};

const AppContext = createContext<WalletWatcherContextType | undefined>(undefined);

export function WalletWatcherProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState<AppState>({
    user: null,
    transactions: [],
    categories: [],
    budgets: [],
    loading: true,
    error: null,
  });
  const [period, setPeriod] = useState<Period>('week');

  const loadData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      // Run scheduler first
      await runDailyTasks();

      const user = await db.getUser();
      if (!user) {
        router.replace("/");
        return;
      }
      const [transactions, categories, budgets] = await Promise.all([
        db.getTransactions(),
        db.getCategories(),
        db.getBudgets(),
      ]);
      setState({ user, transactions, categories, budgets, loading: false, error: null });
    } catch (error) {
      console.error(error);
      setState({
        user: null,
        transactions: [],
        categories: [],
        budgets: [],
        loading: false,
        error: error instanceof Error ? error : new Error("An unknown error occurred"),
      });
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: "Please try refreshing the page.",
      });
    }
  }, [router, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const filteredTransactions = useMemo(() => {
    const transactions = state.transactions || [];
    if (state.loading) return [];
    const now = new Date();
    
    const periodMap = {
      week: { start: startOfWeek(now), end: endOfWeek(now) },
      month: { start: startOfMonth(now), end: endOfMonth(now) },
      year: { start: startOfYear(now), end: endOfYear(now) },
    };

    const currentPeriod = periodMap[period];
    
    return transactions.filter(t => isWithinInterval(new Date(t.date), { start: currentPeriod.start, end: currentPeriod.end }));
  }, [state.transactions, period, state.loading]);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      await db.addTransaction(transaction);
      await loadData();
      toast({ title: "Success", description: "Transaction added." });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction.",
      });
    }
  };

  const setBudget = async (budget: Budget) => {
    try {
      await db.setBudget(budget);
      await loadData();
      toast({ title: "Success", description: "Goal updated." });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set goal.",
      });
    }
  };

  const markGoalAsComplete = async (categoryId: number) => {
    try {
      await db.markBudgetAsComplete(categoryId);
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not mark goal as complete.",
      });
    }
  };

  const logout = async () => {
    try {
      await db.clearUserData();
      router.replace("/");
      toast({ title: "Logged out", description: "Your data has been cleared." });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not clear your data. Please clear your browser cache.",
      });
    }
  };

  const providerValue: WalletWatcherContextType = {
    ...state,
    filteredTransactions,
    period,
    setPeriod,
    addTransaction,
    setBudget,
    logout,
    markGoalAsComplete,
  };

  return (
    <AppContext.Provider value={providerValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useWalletWatcher() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useWalletWatcher must be used within a WalletWatcherProvider");
  }
  return context;
}
