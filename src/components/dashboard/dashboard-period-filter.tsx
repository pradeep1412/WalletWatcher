"use client";

import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import { type Period } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DashboardPeriodFilter() {
    const { period, setPeriod } = useWalletWatcher();

    const handleValueChange = (value: string) => {
        setPeriod(value as Period);
    }

    return (
        <Tabs value={period} onValueChange={handleValueChange}>
            <TabsList>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="year">This Year</TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
