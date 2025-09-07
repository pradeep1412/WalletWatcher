
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetalPrices {
  currency: string;
  gold: {
    "18k": string;
    "22k": string;
    "24k": string;
    unit: string;
  };
  platinum: {
    price: string;
    unit: string;
  };
  silver: {
    price: string;
    unit: string;
  };
}

function PriceCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
            </CardContent>
        </Card>
    )
}

export default function MetalsPage() {
  const [prices, setPrices] = useState<MetalPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        setError(null);
        // Fetch from the internal API route
        const response = await fetch("/api/metals");
        if (!response.ok) {
          throw new Error("Failed to fetch metal prices. Please try again later.");
        }
        const data = await response.json();
        setPrices(data);
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
            {prices?.currency && ` (Prices in ${prices.currency})`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PriceCardSkeleton />
            <PriceCardSkeleton />
            <PriceCardSkeleton />
        </div>
      ) : error ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
             <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Could not fetch prices</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
        </Card>
      ) : prices ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Gold</CardTitle>
                    <CardDescription>Price per {prices.gold.unit}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                   <div className="flex justify-between">
                       <span className="text-muted-foreground">24k</span>
                       <span className="font-semibold">{prices.gold["24k"]}</span>
                   </div>
                   <div className="flex justify-between">
                       <span className="text-muted-foreground">22k</span>
                       <span className="font-semibold">{prices.gold["22k"]}</span>
                   </div>
                   <div className="flex justify-between">
                       <span className="text-muted-foreground">18k</span>
                       <span className="font-semibold">{prices.gold["18k"]}</span>
                   </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Silver</CardTitle>
                    <CardDescription>Price per {prices.silver.unit}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                   <div className="flex justify-between">
                       <span className="text-muted-foreground">Price</span>
                       <span className="text-3xl font-bold">{prices.silver.price}</span>
                   </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Platinum</CardTitle>
                    <CardDescription>Price per {prices.platinum.unit}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                       <span className="text-muted-foreground">Price</span>
                       <span className="text-3xl font-bold">{prices.platinum.price}</span>
                   </div>
                </CardContent>
            </Card>
        </div>
      ) : null}
    </div>
  );
}
