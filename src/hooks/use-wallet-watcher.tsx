"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import {
  type AppState,
  type Transaction,
  type Budget,
} from "@/lib/types";
import { useToast } from "./use-toast";

type WalletWatcherContextType = AppState & {
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  setBudget: (budget: Budget) => Promise<void>;
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

  const loadData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
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

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      await db.addTransaction(transaction);
      await loadData(); // Reload all data to reflect changes
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
      toast({ title: "Success", description: "Budget updated." });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set budget.",
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

  const providerValue = { ...state, addTransaction, setBudget, logout };

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
