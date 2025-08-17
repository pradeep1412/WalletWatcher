"use client";

import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { BudgetGoals } from "@/components/dashboard/budget-goals";
import { TransactionsList } from "@/components/dashboard/recent-transactions";
import { AddTransactionSheet } from "@/components/dashboard/add-transaction-sheet";
import { ImportSheet } from "@/components/dashboard/import-sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";

export default function DashboardPage() {
  const { user } = useWalletWatcher();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Here's a snapshot of your financial health.
          </p>
        </div>
        <div className="flex gap-2">
          <ImportSheet>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </ImportSheet>
          <AddTransactionSheet>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </AddTransactionSheet>
        </div>
      </div>

      <OverviewCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SpendingChart />
        </div>
        <div className="lg:col-span-2">
          <BudgetGoals />
        </div>
      </div>
      
      <TransactionsList />
    </div>
  );
}
