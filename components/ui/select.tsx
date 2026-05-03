import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border bg-white/80 px-4 text-sm font-medium outline-none transition focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  )
);
Select.displayName = "Select";
