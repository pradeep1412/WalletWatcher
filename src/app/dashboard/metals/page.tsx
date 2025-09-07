
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertTriangle, Atom, Gem, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Asset } from "@/lib/types";
import { AssetCard } from "@/components/dashboard/asset-card";

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

// Helper to parse price string like "₹1,234.56" into a number
const parsePrice = (priceString: string): number => {
    if (typeof priceString !== 'string') return NaN;
    return parseFloat(priceString.replace(/[₹,]/g, ''));
}

export default function MetalsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/metals");
        if (!response.ok) {
          throw new Error("Failed to fetch metal prices. Please try again later.");
        }
        const data = await response.json();
        
        // Mocking change, changePercent, and history for the new card UI
        const goldPrice = parsePrice(data.gold["24k"]);
        const silverPrice = parsePrice(data.silver.price);
        const platinumPrice = parsePrice(data.platinum.price);

        const generateMockHistory = (basePrice: number) => {
          if (isNaN(basePrice)) return [];
          const history = [];
          for (let i = 0; i < 15; i++) {
            history.push(basePrice * (1 + (Math.random() - 0.5) * 0.05));
          }
          return history;
        }

        const mockAssetData = (price: number) => {
          if (isNaN(price)) return { change: 0, changePercent: 0, history: []};
          const change = price * (Math.random() - 0.5) * 0.02;
          const changePercent = (change / price) * 100;
          return { change, changePercent, history: generateMockHistory(price) };
        }

        const newAssets: Asset[] = [
          { 
            symbol: "GOLD",
            name: "Gold (24k)", 
            price: goldPrice,
            unit: data.gold.unit,
            icon: Award, 
            ...mockAssetData(goldPrice) 
          },
          { 
            symbol: "SILVER",
            name: "Silver", 
            price: silverPrice,
            unit: data.silver.unit, 
            icon: Gem, 
            ...mockAssetData(silverPrice) 
          },
          { 
            symbol: "PLATINUM",
            name: "Platinum", 
            price: platinumPrice,
            unit: data.platinum.unit, 
            icon: Atom, 
            ...mockAssetData(platinumPrice)
          },
        ];

        setAssets(newAssets);

      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Metal Prices</h1>
        <p className="text-muted-foreground">
            Stay updated with the latest prices of precious metals.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
        </div>
      ) : error ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
             <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Could not fetch prices</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
        </Card>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map(asset => <AssetCard key={asset.symbol} asset={asset} />)}
        </div>
      ) : null}
    </div>
  );
}
