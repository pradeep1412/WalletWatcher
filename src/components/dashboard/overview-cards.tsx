"use client";

import { useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function OverviewCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="mt-1 h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export function OverviewCards() {
  const { filteredTransactions, user, loading } = useWalletWatcher();

  const formatCurrency = useMemo(() => {
    if (!user) {
      return (amount: number) => amount.toString();
    }
    const formatter = new Intl.NumberFormat(user.country ? `en-${user.country}` : 'en-US', {
      style: "currency",
      currency: "USD", // This should ideally be dynamic based on country
    });
    return (amount: number) => formatter.format(amount);
  }, [user]);

  const { income, expenses, balance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    // Ensure filteredTransactions is an array before calling forEach
    (filteredTransactions || []).forEach((t) => {
      const amount = Math.abs(t.amount);
      if (t.type === "income") {
        income += amount;
      } else {
        expenses += amount;
      }
    });
    return { income, expenses, balance: income - expenses };
  }, [filteredTransactions]);
  
  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
            <OverviewCardSkeleton />
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(income)}</div>
          <p className="text-xs text-muted-foreground">
            For the selected period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(expenses)}</div>
          <p className="text-xs text-muted-foreground">
            For the selected period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">
            For the selected period
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
