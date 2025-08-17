"use client";

import { useMemo } from "react";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BudgetGoals() {
  const { transactions, categories, budgets } = useWalletWatcher();

  const budgetData = useMemo(() => {
    return categories
      .filter(c => c.name.toLowerCase() !== 'income')
      .map((category) => {
        const budget = budgets.find((b) => b.categoryId === category.id)?.amount || 0;
        const spent = transactions
          .filter((t) => t.categoryId === category.id && t.type === "expense")
          .reduce((acc, t) => acc + t.amount, 0);
        const progress = budget > 0 ? (spent / budget) * 100 : 0;
        return {
          name: category.name,
          spent,
          budget,
          progress,
        };
      })
      .filter(b => b.budget > 0);
  }, [transactions, categories, budgets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Budget Goals</CardTitle>
        <CardDescription>
          Tracking your spending against your set budgets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-4">
            {budgetData.length > 0 ? (
              budgetData.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                    </span>
                  </div>
                  <Progress value={item.progress} />
                </div>
              ))
            ) : (
                <div className="flex h-[200px] items-center justify-center">
                    <p className="text-muted-foreground">No budgets set yet.</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
