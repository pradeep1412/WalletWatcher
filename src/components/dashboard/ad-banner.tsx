"use client";

import { Info } from "lucide-react";

export function AdBanner() {
  return (
    <div className="flex w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Info className="h-8 w-8" />
        <p className="font-semibold">Advertisement</p>
        <p className="text-sm">Your Google Ad will be displayed here.</p>
      </div>
    </div>
  );
}
