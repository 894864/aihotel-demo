import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border bg-white/80 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
