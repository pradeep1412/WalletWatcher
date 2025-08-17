
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
  type SavingsGoal
} from "@/lib/types";
import { useToast } from "./use-toast";

type WalletWatcherContextType = AppState & {
  filteredTransactions: Transaction[];
  period: Period;
  setPeriod: (period: Period) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  setBudget: (budget: Budget) => Promise<void>;
  markGoalAsComplete: (categoryId: number) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "currentAmount" | "isCompleted">) => Promise<void>;
  addFundsToSavingsGoal: (goal: SavingsGoal, amount: number) => Promise<void>;
  markSavingsGoalAsComplete: (goalId: number) => Promise<void>;
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
    savingsGoals: [],
    loading: true,
    error: null,
  });
  const [period, setPeriod] = useState<Period>('month');

  const loadData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const user = await db.getUser();
      if (!user) {
        router.replace("/");
        return;
      }
      const [transactions, categories, budgets, savingsGoals] = await Promise.all([
        db.getTransactions(),
        db.getCategories(),
        db.getBudgets(),
        db.getSavingsGoals(),
      ]);
      setState({ user, transactions, categories, budgets, savingsGoals, loading: false, error: null });
    } catch (error) {
      console.error(error);
      setState({
        user: null,
        transactions: [],
        categories: [],
        budgets: [],
        savingsGoals: [],
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
    
    const getPeriodDates = (period: Period) => {
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);

        switch (period) {
            case 'week': {
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return { start: startOfWeek, end: endOfWeek };
            }
            case 'month': {
                 const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                 endOfMonth.setHours(23, 59, 59, 999);
                return { start: startOfMonth, end: endOfMonth };
            }
            case 'year': {
                const endOfYear = new Date(now.getFullYear(), 11, 31);
                endOfYear.setHours(23, 59, 59, 999);
                return { start: startOfYear, end: endOfYear };
            }
            default:
                return { start: startOfMonth, end: new Date() };
        }
    };

    const currentPeriod = getPeriodDates(period);
    
    return transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= currentPeriod.start && tDate <= currentPeriod.end;
    });
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

  const addSavingsGoal = async (goal: Omit<SavingsGoal, "id" | "currentAmount" | "isCompleted">) => {
    try {
        await db.addSavingsGoal(goal);
        await loadData();
        toast({ title: "Success", description: "Savings goal created." });
    } catch(error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create savings goal.",
        });
    }
  }

  const addFundsToSavingsGoal = async (goal: SavingsGoal, amount: number) => {
    try {
        await db.addFundsToSavingsGoal(goal.id, amount);
        const newTotal = goal.currentAmount + amount;
        
        if (newTotal >= goal.targetAmount && goal.recurrence === 'one-time' && !goal.isCompleted) {
           await markSavingsGoalAsComplete(goal.id);
        } else {
           await loadData();
        }
        
        toast({ title: "Success", description: "Funds added to goal." });
    } catch(error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add funds.",
        });
    }
  }

  const markSavingsGoalAsComplete = async (goalId: number) => {
    try {
      await db.markSavingsGoalAsComplete(goalId);
      await loadData();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not mark savings goal as complete.",
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
    addSavingsGoal,
    addFundsToSavingsGoal,
    markSavingsGoalAsComplete,
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
