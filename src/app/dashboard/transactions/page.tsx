"use client";

import { useState } from "react";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { type Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const { transactions, categories, user } = useWalletWatcher();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(user?.country ? `en-${user.country}` : 'en-US', {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "Uncategorized";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            A complete history of your income and expenses.
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
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id} onClick={() => setSelectedTransaction(tx)} className="cursor-pointer">
                    <TableCell>
                      <div className="font-medium">{tx.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryName(tx.categoryId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(tx.date), "PPP")}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.type === "income" ? "text-green-500" : "text-red-500"
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
      </Card>

      <Dialog open={!!selectedTransaction} onOpenChange={(isOpen) => !isOpen && setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
             <div className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className={`font-medium ${selectedTransaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedTransaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(selectedTransaction.amount))}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{format(new Date(selectedTransaction.date), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="capitalize">{selectedTransaction.type}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="outline">{getCategoryName(selectedTransaction.categoryId)}</Badge>
                </div>
             </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
