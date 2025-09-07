
"use client";

import { useState, useEffect, type SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetChart } from "./asset-chart";
import type { Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [prevPrice, setPrevPrice] = useState(asset.price);

  useEffect(() => {
    if (asset.price !== prevPrice) {
      setFlash(asset.price > prevPrice ? "up" : "down");
      const timer = setTimeout(() => setFlash(null), 700);
      setPrevPrice(asset.price);
      return () => clearTimeout(timer);
    }
  }, [asset.price, prevPrice]);

  const getFormattedPrice = (price: number, options: Intl.NumberFormatOptions = {}) => {
      if (isNaN(price)) return "";
      
      const isNifty = asset.symbol === "NIFTY";
      const formatOptions: Intl.NumberFormatOptions = {
          style: isNifty ? "decimal" : "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          ...options
      };

      return new Intl.NumberFormat("en-IN", formatOptions).format(price);
  };
  
  const IconComponent = asset.icon as LucideIcon | ((props: SVGProps<SVGSVGElement>) => JSX.Element);
    
  const isPositiveChange = asset.change >= 0;

  return (
    <Card className="flex flex-col h-full bg-card/70 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5 hover:border-primary/40 transition-all duration-300 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
        <CardTitle className="text-lg font-medium">{asset.name}</CardTitle>
        <IconComponent className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-4 pt-0">
        <div
          className={cn(
            "text-3xl font-bold transition-colors duration-500",
            flash === "up" && "text-green-500",
            flash === "down" && "text-red-500"
          )}
        >
          {getFormattedPrice(asset.price)}
          <span className="text-sm font-medium text-muted-foreground ml-2">/ {asset.unit}</span>
        </div>
        <div className="flex items-baseline text-sm mt-1">
          <span className={cn("flex items-center gap-1 font-medium", isPositiveChange ? "text-green-500" : "text-red-500")}>
            {isPositiveChange ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {getFormattedPrice(asset.change, { signDisplay: 'always' })} 
            <span className="ml-1">({asset.changePercent.toFixed(2)}%)</span>
          </span>
          <span className="text-xs text-muted-foreground ml-2">Daily</span>
        </div>
        <div className="flex-grow mt-4 h-24 -mx-4 -mb-4">
          <AssetChart data={asset.history} isPositive={isPositiveChange} />
        </div>
      </CardContent>
    </Card>
  );
}
