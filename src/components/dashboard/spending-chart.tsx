
"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

type Period = "daily" | "monthly" | "yearly";

export function SpendingChart() {
  const { transactions, user } = useWalletWatcher();
  const [period, setPeriod] = useState<Period>("monthly");

  const chartData = useMemo(() => {
    const expenseData: { [key: string]: number } = {};
    const expenseTransactions = transactions.filter((t) => t.type === "expense");

    expenseTransactions.forEach((t) => {
      const date = new Date(t.date);
      let key = "";
      if (period === "daily") {
        key = format(date, "yyyy-MM-dd");
      } else if (period === "monthly") {
        key = format(date, "yyyy-MM");
      } else {
        key = format(date, "yyyy");
      }
      expenseData[key] = (expenseData[key] || 0) + Math.abs(t.amount);
    });

    return Object.entries(expenseData)
      .map(([date, value]) => ({ date, value }))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [transactions, period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.country ? `en-${user.country}` : 'en-US', {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let formattedLabel = label;
      if (period === "monthly") {
        formattedLabel = format(new Date(label), "MMMM yyyy");
      } else if (period === "daily") {
        formattedLabel = format(new Date(label), "PPP");
      }

      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </span>
              <span className="font-bold text-foreground">
                {formattedLabel}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Total Spent
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
  
  const XAxisTickFormatter = (value: string) => {
      if (period === 'monthly') return format(new Date(value), 'MMM');
      if (period === 'daily') return format(new Date(value), 'd');
      return value;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle>Spending Over Time</CardTitle>
                <CardDescription>
                A look at your spending trends.
                </CardDescription>
            </div>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <TabsList>
                    <TabsTrigger value="daily">Day</TabsTrigger>
                    <TabsTrigger value="monthly">Month</TabsTrigger>
                    <TabsTrigger value="yearly">Year</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="mx-auto aspect-video h-[250px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" tickFormatter={XAxisTickFormatter} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
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

