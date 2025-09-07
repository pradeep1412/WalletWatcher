
"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

interface AssetChartProps {
  data: number[];
  isPositive: boolean;
}

export function AssetChart({ data, isPositive }: AssetChartProps) {
  const chartData = data.map((value, index) => ({
    name: index,
    value,
  }));

  const strokeColor = isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <defs>
            <linearGradient id={`gradient-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
        </defs>
        <Tooltip
            contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: "12px",
            }}
            labelStyle={{
                display: "none"
            }}
            formatter={(value) => [`${Number(value).toFixed(2)}`, null]}
            cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Line
          type="monotone"
          dataKey="value"
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

