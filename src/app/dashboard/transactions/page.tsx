
"use client";

import { useState } from "react";
import { TransactionsList } from "@/components/dashboard/recent-transactions";
import { Button } from "@/components/ui/button";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import { Download, QrCode } from "lucide-react";
import * as xlsx from "xlsx";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { ShareReportDialog } from "@/components/dashboard/share-report-dialog";
import { DashboardPeriodFilter } from "@/components/dashboard/dashboard-period-filter";

export default function TransactionsPage() {
  const { filteredTransactions, categories } = useWalletWatcher();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleDownload = () => {
    const dataForSheet = filteredTransactions.map((tx) => ({
      Date: format(new Date(tx.date), "yyyy-MM-dd"),
      Description: tx.description,
      Category: categories.find((c) => c.id === tx.categoryId)?.name || "N/A",
      Type: tx.type,
      Amount: tx.type === "expense" ? -tx.amount : tx.amount,
    }));

    const worksheet = xlsx.utils.json_to_sheet(dataForSheet);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 40 }, // Description
      { wch: 20 }, // Category
      { wch: 10 }, // Type
      { wch: 10 }, // Amount
    ];
    worksheet["!cols"] = columnWidths;
    
    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    
    saveAs(data, `WalletWatcher_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              All Transactions
            </h1>
            <p className="text-muted-foreground">
              A complete history of your income and expenses.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <DashboardPeriodFilter />
            <Button onClick={() => setIsShareOpen(true)} variant="outline" disabled={filteredTransactions.length === 0}>
              <QrCode className="mr-2 h-4 w-4" />
              Share via QR
            </Button>
            <Button onClick={handleDownload} disabled={filteredTransactions.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
        <TransactionsList />
      </div>
      <ShareReportDialog 
        isOpen={isShareOpen}
        setIsOpen={setIsShareOpen}
        transactions={filteredTransactions}
        categories={categories}
      />
    </>
  );
}
