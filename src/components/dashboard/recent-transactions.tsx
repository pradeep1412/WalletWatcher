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
import { Skeleton } from "@/components/ui/skeleton";

function TransactionRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24 rounded-full" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-5 w-16" />
      </TableCell>
    </TableRow>
  );
}


export function TransactionsList({ limit }: { limit?: number }) {
  const { filteredTransactions, categories, user, loading } = useWalletWatcher();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.country ? `en-${user.country}` : 'en-US', {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  const transactions = filteredTransactions || [];
  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  const renderSkeletons = () => {
    const skeletonCount = limit || 5;
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <TransactionRowSkeleton key={`skeleton-${index}`} />
    ));
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your most recent income and expenses for the selected period.
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
            {loading ? (
                renderSkeletons()
            ) : displayedTransactions.length > 0 ? (
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
                  No transactions yet for this period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {limit && transactions.length > limit && !loading && (
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
