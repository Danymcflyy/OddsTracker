"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, defaultChecked, disabled, onCheckedChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);

    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;

    const toggle = () => {
      if (disabled) return;
      const next = !currentChecked;
      if (!isControlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={currentChecked}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          currentChecked ? "bg-primary" : "bg-input",
          className
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow ring-0 transition-transform",
            currentChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
        <input
          ref={ref}
          type="checkbox"
          checked={currentChecked}
          onChange={(event) => {
            if (!isControlled) {
              setInternalChecked(event.target.checked);
            }
            onCheckedChange?.(event.target.checked);
          }}
          className="sr-only"
          disabled={disabled}
          {...props}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";
