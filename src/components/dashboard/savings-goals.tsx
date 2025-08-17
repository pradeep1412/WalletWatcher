"use client";

import { useState } from "react";
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
import { Plus, PiggyBank, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AddSavingsGoalSheet } from "./add-savings-goal-sheet";
import { AddFundsSheet } from "./add-funds-sheet";
import { type SavingsGoal } from "@/lib/types";

function SavingsGoalSkeleton() {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
        </div>
    )
}

export function SavingsGoals() {
  const { savingsGoals, loading } = useWalletWatcher();
  const [isAddGoalSheetOpen, setIsAddGoalSheetOpen] = useState(false);
  const [isAddFundsSheetOpen, setIsAddFundsSheetOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | undefined>(undefined);

  const handleAddFunds = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsAddFundsSheetOpen(true);
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  if (loading && savingsGoals.length === 0) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="mt-1 h-4 w-48" />
              </div>
              <Skeleton className="h-9 w-24" />
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-4">
                      <SavingsGoalSkeleton />
                      <SavingsGoalSkeleton />
                  </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>
            Track your progress towards your financial targets.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsAddGoalSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[150px]">
          <div className="space-y-4">
            {savingsGoals.length > 0 ? (
              savingsGoals.map((goal) => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                return (
                    <div key={goal.id}>
                        <div className="mb-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{goal.name}</span>
                                {progress >= 100 && <Target className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                </span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleAddFunds(goal)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Progress value={progress} />
                    </div>
                )
              })
            ) : (
                <div className="flex h-[100px] flex-col items-center justify-center text-center">
                    <PiggyBank className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 font-semibold">No Savings Goals Yet</p>
                    <p className="text-sm text-muted-foreground">Click "New Goal" to start saving for something amazing.</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <AddSavingsGoalSheet 
        isOpen={isAddGoalSheetOpen}
        setIsOpen={setIsAddGoalSheetOpen}
      />
      <AddFundsSheet 
        isOpen={isAddFundsSheetOpen}
        setIsOpen={setIsAddFundsSheetOpen}
        goal={selectedGoal}
      />
    </Card>
  );
}
