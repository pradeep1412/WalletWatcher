"use client";

import { useMemo, useState, useEffect } from "react";
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
import { Pencil, Plus, Trophy, CheckCircle } from "lucide-react";
import { SetBudgetSheet } from "./set-budget-sheet";
import { Confetti } from "@/components/ui/confetti";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function BudgetGoals() {
  const { filteredTransactions, categories, budgets, markGoalAsComplete, period } = useWalletWatcher();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [celebratingGoal, setCelebratingGoal] = useState<number | null>(null);

  const budgetData = useMemo(() => {
    return budgets
      .map((budget) => {
        const category = categories.find((c) => c.categoryId === budget.categoryId);
        if (!category) return null;

        const spent = (filteredTransactions || [])
          .filter((t) => t.categoryId === budget.categoryId && t.type === "expense")
          .reduce((acc, t) => acc + t.amount, 0);

        const budgetAmount = budget.amount;
        const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
        const isAchieved = budgetAmount > 0 && spent <= budgetAmount;

        const isPeriodMatch = 
            (budget.recurrence === 'weekly' && period === 'week') ||
            (budget.recurrence === 'monthly' && period === 'month') ||
            (budget.recurrence === 'yearly' && period === 'year') ||
             budget.recurrence === 'one-time';

        return {
          id: budget.categoryId,
          name: category.name,
          spent,
          budget: budgetAmount,
          progress,
          isAchieved,
          isCompleted: budget.isCompleted,
          recurrence: budget.recurrence,
          isPeriodMatch,
        };
      })
      .filter(b => b && b.budget > 0 && b.isPeriodMatch)
      .sort((a,b) => (a.name > b.name ? 1 : -1));
  }, [filteredTransactions, categories, budgets, period]);

  useEffect(() => {
      if(celebratingGoal !== null) {
          const timer = setTimeout(() => setCelebratingGoal(null), 5000); // Confetti lasts 5s
          return () => clearTimeout(timer);
      }
  }, [celebratingGoal])

  const handleSetBudget = (categoryId?: number) => {
    setSelectedCategory(categoryId);
    setIsSheetOpen(true);
  };
  
  const handleMarkComplete = async (categoryId: number) => {
      await markGoalAsComplete(categoryId);
      setCelebratingGoal(categoryId);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Card className="h-full">
      {celebratingGoal !== null && <Confetti />}
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Budget Goals</CardTitle>
          <CardDescription>
            Your progress for the selected period.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => handleSetBudget()}>
          <Plus className="mr-2 h-4 w-4" />
          Set Goal
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-4">
            {budgetData.length > 0 ? (
              budgetData.map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                       {item.isCompleted && item.recurrence === 'one-time' ? (
                        <div className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5">
                            <Trophy className="h-3 w-3 text-accent" />
                            <span className="text-xs font-semibold text-accent">Goal Achieved!</span>
                        </div>
                      ) : (
                         <Badge variant="secondary" className="text-xs">{capitalize(item.recurrence)}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                      </span>
                      {item.isAchieved && !item.isCompleted && item.recurrence === 'one-time' ? (
                        <Button size="sm" variant="outline" onClick={() => handleMarkComplete(item.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Complete
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSetBudget(item.id)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Progress value={item.progress} className={cn({
                    "[&>div]:bg-accent": (item.isCompleted && item.recurrence === 'one-time') || item.isAchieved,
                  })}/>
                </div>
              ))
            ) : (
                <div className="flex h-[200px] flex-col items-center justify-center text-center">
                    <p className="font-semibold">No Goals for this Period</p>
                    <p className="text-sm text-muted-foreground">Try setting a goal or changing the period filter.</p>
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
