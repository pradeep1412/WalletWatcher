"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import { chartColors } from "@/lib/chart-colors";

export function SpendingChart() {
  const { filteredTransactions, categories, user } = useWalletWatcher();

  const chartData = useMemo(() => {
    const categorySpending = new Map<string, number>();

    (filteredTransactions || [])
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const categoryName = categories.find(c => c.id === t.categoryId)?.name || 'Uncategorized';
        const currentAmount = categorySpending.get(categoryName) || 0;
        categorySpending.set(categoryName, currentAmount + Math.abs(t.amount));
      });
    
    return Array.from(categorySpending.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);

  }, [filteredTransactions, categories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.country ? `en-${user.country}` : 'en-US', {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          Your top spending categories for the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="mx-auto aspect-video h-[250px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  yAxisId={0}
                />
                 <YAxis
                  orientation="right"
                  dataKey="value"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                  mirror
                  yAxisId={1}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                      hideLabel
                    />
                  }
                />
                <Bar dataKey="value" layout="vertical" radius={5}>
                    {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                No expense data to display for this period.
              </p>
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
