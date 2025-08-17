"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import { type Budget } from "@/lib/types";

const formSchema = z.object({
  categoryId: z.coerce.number().min(1, "Category is required."),
  amount: z.coerce.number().positive("Budget amount must be positive."),
});

export function SetBudgetSheet({ children }: { children: React.ReactNode }) {
  const { categories, budgets, setBudget } = useWalletWatcher();
  const [isOpen, setIsOpen] = useState(false);

  const expenseCategories = categories.filter(
    (c) => c.name.toLowerCase() !== "income"
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: undefined,
      amount: 0,
    },
  });

  const selectedCategoryId = form.watch("categoryId");

  useEffect(() => {
    if (selectedCategoryId) {
      const existingBudget = budgets.find(b => b.categoryId === selectedCategoryId);
      if (existingBudget) {
        form.setValue("amount", existingBudget.amount);
      } else {
        form.setValue("amount", 0);
      }
    }
  }, [selectedCategoryId, budgets, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await setBudget(values as Budget);
    setIsOpen(false);
    form.reset();
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Set Budget</SheetTitle>
          <SheetDescription>
            Set a monthly budget for a spending category.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
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
                      {expenseCategories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Budget
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
