import * as React from "react";
import { cn } from "../../utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" 
            ? "bg-slate-900 text-slate-50 hover:bg-slate-900/90" 
            : "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
          "h-10 px-4 py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button"; 