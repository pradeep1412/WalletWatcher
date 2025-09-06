
"use client";

import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { Goals } from "@/components/dashboard/goals";
import { TransactionsList } from "@/components/dashboard/recent-transactions";
import { AddTransactionSheet } from "@/components/dashboard/add-transaction-sheet";
import { Button } from "@/components/ui/button";
import { DashboardPeriodFilter } from "@/components/dashboard/dashboard-period-filter";
import { AdBanner } from "@/components/dashboard/ad-banner";

export default function DashboardPage() {
  const { user } = useWalletWatcher();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="grid w-full gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Here's a snapshot of your financial health.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
           <DashboardPeriodFilter />
          <AddTransactionSheet>
            <Button className="hidden md:inline-flex">
              Add
            </Button>
          </AddTransactionSheet>
        </div>
      </div>

      <OverviewCards />
      
      <AdBanner />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SpendingChart />
        </div>
        <div className="lg:col-span-2">
          <Goals />
        </div>
      </div>
      
      <TransactionsList limit={5} />
    </div>
  );
}
