"use client";

import { db } from "./db";

/**
 * Deletes transactions that are older than one year.
 */
async function deleteOldTransactions(): Promise<void> {
    try {
        const deletedCount = await db.deleteTransactionsOlderThan(365);
        if (deletedCount > 0) {
            console.log(`Successfully deleted ${deletedCount} old transaction(s).`);
        }
    } catch (error) {
        console.error("Error deleting old transactions:", error);
    }
}


/**
 * Runs all daily scheduled tasks.
 */
export async function runDailyTasks(): Promise<void> {
    const lastRun = localStorage.getItem('lastSchedulerRun');
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    if (lastRun !== today) {
        console.log("Running daily scheduled tasks...");
        await deleteOldTransactions();
        localStorage.setItem('lastSchedulerRun', today);
        console.log("Daily scheduled tasks completed.");
    }
}
