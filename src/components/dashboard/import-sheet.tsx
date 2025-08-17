"use client";

import { useState } from "react";
import * as xlsx from "xlsx";
import { useWalletWatcher } from "@/hooks/use-wallet-watcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { type Transaction } from "@/lib/types";

export function ImportSheet({ children }: { children: React.ReactNode }) {
  const { categories, addTransaction } = useWalletWatcher();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an Excel file to import.",
      });
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = xlsx.utils.sheet_to_json(worksheet);

        let importedCount = 0;
        for (const row of json) {
          const category = categories.find(c => c.name.toLowerCase() === String(row.Category).toLowerCase());
          if (!category) {
            console.warn(`Category not found: ${row.Category}`);
            continue;
          }

          const transaction: Omit<Transaction, "id"> = {
            date: new Date(row.Date).toISOString(),
            description: String(row.Description),
            amount: parseFloat(row.Amount),
            type: String(row.Type).toLowerCase() as "income" | "expense",
            categoryId: category.id,
          };

          await addTransaction(transaction);
          importedCount++;
        }
        toast({
          title: "Import successful",
          description: `Imported ${importedCount} transactions.`,
        });
      } catch (error) {
        console.error("Import error:", error);
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "Please check the file format and try again.",
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Sheet onOpenChange={() => { setFile(null); setIsImporting(false); }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Import Transactions</SheetTitle>
          <SheetDescription>
            Upload an Excel file (.xlsx) with your transactions.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-medium">File Format Instructions</h4>
            <p className="text-sm text-muted-foreground">
              Your Excel file should have columns named:{" "}
              <code className="font-mono text-primary">Date</code>,{" "}
              <code className="font-mono text-primary">Description</code>,{" "}
              <code className="font-mono text-primary">Amount</code>,{" "}
              <code className="font-mono text-primary">Category</code>, and{" "}
              <code className="font-mono text-primary">Type</code> (income/expense).
            </p>
          </div>
          <Input type="file" accept=".xlsx" onChange={handleFileChange} />
        </div>
        <SheetFooter className="pt-4">
            <SheetClose asChild>
                <Button onClick={handleImport} disabled={!file || isImporting}>
                    {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Import File
                </Button>
            </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
