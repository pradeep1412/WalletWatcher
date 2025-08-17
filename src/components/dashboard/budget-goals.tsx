"use client";

import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { SetBudgetSheet } from "./set-budget-sheet";

export function BudgetGoals() {
  const { transactions, categories, budgets } = useWalletWatcher();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
          id: category.id,
          name: category.name,
          spent,
          budget,
          progress,
        };
      })
      .filter(b => b.budget > 0);
  }, [transactions, categories, budgets]);

  const handleSetBudget = (categoryId?: number) => {
    setSelectedCategory(categoryId);
    setIsSheetOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Budget Goals</CardTitle>
          <CardDescription>
            Tracking your spending against your set budgets.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => handleSetBudget()}>
          <Plus className="mr-2 h-4 w-4" />
          Set Budget
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-4">
            {budgetData.length > 0 ? (
              budgetData.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                      </span>
                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSetBudget(item.id)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
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
      <SetBudgetSheet 
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        categoryId={selectedCategory}
      />
    </Card>
  );
}
