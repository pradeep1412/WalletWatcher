
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertTriangle, Atom, Gem, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Asset, HistoryData } from "@/lib/types";
import { AssetCard } from "@/components/dashboard/asset-card";
import { format, subHours, subDays } from "date-fns";
import { db } from "@/lib/db";


function AssetCardSkeleton() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <Skeleton className="h-8 w-32 mt-2" />
                <Skeleton className="h-4 w-40 mt-2" />
                <div className="flex-grow mt-4 h-24">
                  <Skeleton className="h-full w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

const ALL_ASSETS = [
    { symbol: "NIFTY", name: "Nifty 50", unit: "points", icon: TrendingUp },
    { symbol: "GOLD", name: "Gold (24k)", unit: "gram", icon: Award },
    { symbol: "SILVER", name: "Silver", unit: "gram", icon: Gem },
    { symbol: "PLATINUM", name: "Platinum", unit: "gram", icon: Atom },
];

export default function MetalsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssetData() {
      try {
        setLoading(true);
        setError(null);

        const loadedAssets: Asset[] = [];

        for (const assetInfo of ALL_ASSETS) {
            const history = await db.getAssetHistory(assetInfo.symbol, 1);
            
            if (history.length === 0) continue;

            const latestPrice = history[0].price;
            const oldestPrice = history[history.length - 1].price;
            
            const change = latestPrice - oldestPrice;
            const changePercent = oldestPrice > 0 ? (change / oldestPrice) * 100 : 0;
            
            const historyData: HistoryData[] = history.map(p => ({
                date: format(new Date(p.date), "h:mm a"),
                price: p.price
            })).reverse();


            loadedAssets.push({
                ...assetInfo,
                price: latestPrice,
                change,
                changePercent,
                history: historyData,
            });
        }
        
        setAssets(loadedAssets);

      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchAssetData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Market Data</h1>
        <p className="text-muted-foreground">
            Stay updated with the latest prices of precious metals and market indices. Prices updated periodically.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
        </div>
      ) : error ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
             <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Could not load asset data</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
        </Card>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {assets.map(asset => <AssetCard key={asset.symbol} asset={asset} />)}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-12 w-12 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">No data yet</h2>
            <p className="mt-2 text-muted-foreground">Asset price data is being fetched. This page will update shortly.</p>
        </Card>
      )}
    </div>
  );
}

    