"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRangeFilter } from "@/types/filters";

interface DateRangeFilterProps {
  value: DateRangeFilter;
  onChange: (value: DateRangeFilter) => void;
  label?: string;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  label = "Période",
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false);

  const formattedLabel = React.useMemo(() => {
    if (value.from && value.to) {
      return `${format(value.from, "dd MMM yyyy")} → ${format(
        value.to,
        "dd MMM yyyy"
      )}`;
    }

    if (value.from) {
      return `${format(value.from, "dd MMM yyyy")} → ...`;
    }

    return "Sélectionnez une période";
  }, [value.from, value.to]);

  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{formattedLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={{
              from: value.from ?? undefined,
              to: value.to ?? undefined,
            }}
            onSelect={(range) =>
              onChange({
                from: range?.from ?? null,
                to: range?.to ?? null,
              })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
