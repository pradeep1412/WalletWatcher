
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

export function BudgetGoals() {
  const { transactions, categories, budgets } = useWalletWatcher();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [completedGoals, setCompletedGoals] = useState<Set<number>>(new Set());
  const [celebratingGoal, setCelebratingGoal] = useState<number | null>(null);

  const budgetData = useMemo(() => {
    return categories
      .filter(c => c.name.toLowerCase() !== 'income')
      .map((category) => {
        const budget = budgets.find((b) => b.categoryId === category.id)?.amount || 0;
        const spent = transactions
          .filter((t) => t.categoryId === category.id && t.type === "expense")
          .reduce((acc, t) => acc + t.amount, 0);
        const progress = budget > 0 ? (spent / budget) * 100 : 0;
        const isAchieved = budget > 0 && spent <= budget;
        const isCompleted = completedGoals.has(category.id);
        return {
          id: category.id,
          name: category.name,
          spent,
          budget,
          progress,
          isAchieved,
          isCompleted,
        };
      })
      .filter(b => b.budget > 0);
  }, [transactions, categories, budgets, completedGoals]);

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
  
  const handleMarkComplete = (categoryId: number) => {
      setCompletedGoals(prev => new Set(prev).add(categoryId));
      setCelebratingGoal(categoryId);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="h-full">
      {celebratingGoal !== null && <Confetti />}
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
                <div key={item.name} className="group">
                  <div className="mb-1 flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                       {item.isCompleted && (
                        <div className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5">
                            <Trophy className="h-3 w-3 text-accent" />
                            <span className="text-xs font-semibold text-accent">Goal Achieved!</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                      </span>
                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSetBudget(item.id)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={item.progress} className={cn({
                    "[&>div]:bg-accent": item.isCompleted,
                  })}/>
                  {item.isAchieved && !item.isCompleted && (
                      <div className="mt-2 text-right opacity-0 transition-opacity group-hover:opacity-100">
                          <Button size="sm" variant="outline" onClick={() => handleMarkComplete(item.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Complete
                          </Button>
                      </div>
                  )}
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
