"use client";

import { TransactionsList } from "@/components/dashboard/recent-transactions";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-3xl font-bold tracking-tight">
            All Transactions
          </h1>
          <p className="text-muted-foreground">
            A complete history of your income and expenses.
          </p>
        </div>
      <TransactionsList />
    </div>
  );
}
