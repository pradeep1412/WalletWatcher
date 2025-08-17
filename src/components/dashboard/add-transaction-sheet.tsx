
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import * as xlsx from "xlsx";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

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
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { type Transaction } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  date: z.date(),
  type: z.enum(["income", "expense"]),
  categoryId: z.coerce.number().min(1, "Category is required."),
});

function ManualTransactionForm({ onTransactionAdded }: { onTransactionAdded: () => void }) {
  const { categories, addTransaction } = useWalletWatcher();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      type: "expense",
      categoryId: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await addTransaction({
      ...values,
      date: values.date.toISOString(),
    });
    form.reset();
    onTransactionAdded();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="font-normal">Expense</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="income" />
                    </FormControl>
                    <FormLabel className="font-normal">Income</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Groceries from Target" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <SheetFooter className="pt-4">
           <SheetClose asChild>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Transaction
                </Button>
            </SheetClose>
        </SheetFooter>
      </form>
    </Form>
  );
}

function ImportTransactionsSection({ onImportCompleted }: { onImportCompleted: () => void }) {
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
          const category = categories.find(
            (c) => c.name.toLowerCase() === String(row.Category).toLowerCase()
          );
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
        onImportCompleted();
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
    <div className="space-y-4 pt-4">
        <div>
            <h4 className="text-base font-semibold">Import from File</h4>
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
      <SheetFooter>
         <SheetClose asChild>
            <Button onClick={handleImport} disabled={!file || isImporting}>
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import File
            </Button>
        </SheetClose>
      </SheetFooter>
    </div>
  );
}


export function AddTransactionSheet({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleCloseSheet = () => {
        setIsOpen(false);
    }
    
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild onClick={() => setIsOpen(true)}>{children}</SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Transaction</SheetTitle>
          <SheetDescription>
            Add a single transaction manually or import multiple from a file.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
            <div>
                <h4 className="text-base font-semibold">Manual Entry</h4>
                <ManualTransactionForm onTransactionAdded={handleCloseSheet} />
            </div>
            <Separator />
            <ImportTransactionsSection onImportCompleted={handleCloseSheet} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
