
"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { HistoryData } from "@/lib/types";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher";

interface AssetChartProps {
  data: HistoryData[];
  isPositive: boolean;
}

export function AssetChart({ data, isPositive }: AssetChartProps) {
  const { formatCurrency } = useWalletWatcher();

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const strokeColor = isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  const chartData = data.map(item => ({
      ...item,
      price: item.price
  }));

  const yDomain: [string, string] = ['dataMin - (dataMax-dataMin)*0.1', 'dataMax + (dataMax-dataMin)*0.1'];

  return (
    <ResponsiveContainer width="100%" height="100%">
       <LineChart
        data={chartData}
        margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
       >
        <defs>
            <linearGradient id={`gradient-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
        </defs>
        <Tooltip
            cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={
                <ChartTooltipContent 
                    hideIndicator
                    formatter={(value, name, props) => {
                        return (
                            <div className="flex flex-col items-start">
                                <span className="text-xs text-muted-foreground">{props.payload.date}</span>
                                <span className="font-bold">{formatCurrency(Number(value))}</span>
                            </div>
                        )
                    }}
                />
            }
        />
        <XAxis dataKey="date" hide />
        <YAxis domain={yDomain} hide />
        <Line
          dataKey="price"
          type="monotone"
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
          fillOpacity={1}
          fill={`url(#gradient-${isPositive})`}
        />
       </LineChart>
    </ResponsiveContainer>
  );
}

