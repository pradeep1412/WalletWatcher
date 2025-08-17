"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useWalletWatcher } from "@/hooks/use-wallet-watcher";

export function SpendingChart() {
  const { transactions, categories } = useWalletWatcher();

  const chartData = useMemo(() => {
    const expenseData: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const categoryName = categories.find((c) => c.id === t.categoryId)?.name || "Uncategorized";
        expenseData[categoryName] = (expenseData[categoryName] || 0) + t.amount;
      });

    return Object.entries(expenseData).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions, categories]);
  
  const COLORS = ["#1EA8F9", "#30D5C8", "#FFC300", "#FF5733", "#C70039", "#900C3F"];
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          A look at where your money is going.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="mx-auto aspect-square h-[250px]">
          {chartData.length > 0 ? (
            <PieChart width={250} height={250}>
              <Pie
                data={chartData}
                cx={125}
                cy={125}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Category
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].name}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Amount
                            </span>
                            <span className="font-bold">
                              {formatCurrency(payload[0].value as number)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          ) : (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No expense data to display.</p>
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
