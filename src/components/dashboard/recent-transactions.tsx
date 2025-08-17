"use client";

import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function TransactionsList({ limit }: { limit?: number }) {
  const { transactions, categories, user } = useWalletWatcher();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.country ? `en-${user.country}` : 'en-US', {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your most recent income and expenses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="font-medium">{tx.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categories.find((c) => c.id === tx.categoryId)?.name ||
                        "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(tx.date), "PPP")}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.type === "income" ? "text-green-500" : ""
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(tx.amount))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No transactions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {limit && transactions.length > limit && (
        <CardFooter className="justify-end">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/transactions">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
