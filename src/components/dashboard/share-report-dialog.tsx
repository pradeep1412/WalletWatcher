
"use client";

import { useMemo } from "react";
import QRCode from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Transaction, type Category } from "@/lib/types";

export function ShareReportDialog({
  isOpen,
  setIsOpen,
  transactions,
  categories,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transactions: Transaction[];
  categories: Category[];
}) {

  const qrData = useMemo(() => {
    if (!transactions.length || !categories.length) {
      return "";
    }
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const reportData = transactions.map(tx => ({
        d: tx.date,
        dsc: tx.description,
        a: tx.amount,
        t: tx.type,
        c: categoryMap.get(tx.categoryId) || "Uncategorized",
    }));

    return JSON.stringify({ type: "WalletWatcherReport", version: 1, data: reportData });
  }, [transactions, categories]);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report via QR Code</DialogTitle>
          <DialogDescription>
            Another Wallet Watcher user can scan this code to import your transaction history.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex items-center justify-center p-4 bg-white rounded-lg">
          {qrData ? (
             <QRCode
                value={qrData}
                size={220} // Adjusted size for better scannability
                level={"L"} // Level L is best for dense data
                includeMargin={true} // Adds a quiet zone
                className="h-auto max-w-full"
            />
          ) : (
            <p className="text-muted-foreground">No data to share.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
