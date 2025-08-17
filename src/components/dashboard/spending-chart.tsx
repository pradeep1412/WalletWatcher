"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher.tsx";

export function SpendingChart() {
  const { transactions, categories, user } = useWalletWatcher();

  const chartData = useMemo(() => {
    const expenseData: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const categoryName =
          categories.find((c) => c.id === t.categoryId)?.name ||
          "Uncategorized";
        expenseData[categoryName] =
          (expenseData[categoryName] || 0) + Math.abs(t.amount);
      });

    return Object.entries(expenseData).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions, categories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.country ? `en-${user.country}` : 'en-US', {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Category
              </span>
              <span className="font-bold text-foreground">
                {label}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Amount
              </span>
              <span className="font-bold">
                {formatCurrency(payload[0].value)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
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
        <ChartContainer config={{}} className="mx-auto aspect-video h-[250px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }}/>
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                No expense data to display.
              </p>
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
