
"use client";

import { db } from "./db";
import { type AssetPrice } from "./types";

const LAST_FETCH_KEY = "lastAssetPriceFetch";
const FETCH_INTERVAL = 1000 * 60 * 60; // 1 hour

// Helper to parse price string like "₹1,234.56" or "24,741" into a number
const parsePrice = (priceString: string): number => {
    if (typeof priceString !== 'string') return NaN;
    return parseFloat(priceString.replace(/[₹,]/g, ''));
}


async function fetchAndStorePrices() {
    try {
        console.log("Fetching latest asset prices...");
        const response = await fetch("/api/metals");
        if (!response.ok) {
          throw new Error("Failed to fetch metal prices from proxy API.");
        }
        const data = await response.json();
        
        const now = new Date().toISOString();

        const prices: Omit<AssetPrice, "id">[] = [
            { symbol: "GOLD", date: now, price: parsePrice(data.gold["24k"]) },
            { symbol: "SILVER", date: now, price: parsePrice(data.silver.price) },
            { symbol: "PLATINUM", date: now, price: parsePrice(data.platinum.price) },
            { symbol: "NIFTY", date: now, price: parsePrice(data.nifty) },
        ];

        await db.addAssetPrices(prices);
        console.log("Successfully stored latest asset prices.");
        localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());

    } catch (error) {
        console.error("Error fetching or storing asset prices:", error);
    }
}


export async function runPriceScheduler(): Promise<void> {
    const lastRun = localStorage.getItem(LAST_FETCH_KEY);
    const now = Date.now();

    if (!lastRun || (now - parseInt(lastRun)) > FETCH_INTERVAL) {
        console.log("Price fetch interval elapsed. Running scheduler...");
        await fetchAndStorePrices();
    } else {
        console.log("Skipping price fetch, interval not elapsed.");
    }
}

    