
"use client";

import * as React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/button"; // Using button styles for badge-like trigger if needed

export interface OddsFilterValue {
  min?: number;
  max?: number;
}

interface ColumnOddsFilterProps {
  title: string; // e.g. "H-1.5 (Dom) - Opening"
  value?: OddsFilterValue;
  onChange: (value: OddsFilterValue | undefined) => void;
}

export function ColumnOddsFilter({ title, value, onChange }: ColumnOddsFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [min, setMin] = React.useState(value?.min?.toString() ?? "");
  const [max, setMax] = React.useState(value?.max?.toString() ?? "");

  // Update local state when value prop changes (e.g. reset)
  React.useEffect(() => {
    setMin(value?.min?.toString() ?? "");
    setMax(value?.max?.toString() ?? "");
  }, [value]);

  const handleApply = () => {
    const minVal = min ? parseFloat(min) : undefined;
    const maxVal = max ? parseFloat(max) : undefined;

    if (minVal === undefined && maxVal === undefined) {
      onChange(undefined);
    } else {
      onChange({ min: minVal, max: maxVal });
    }
    setOpen(false);
  };

  const handleReset = () => {
    setMin("");
    setMax("");
    onChange(undefined);
    setOpen(false);
  };

  const isActive = value?.min !== undefined || value?.max !== undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ml-1 hover:bg-slate-200 ${isActive ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-slate-400"}`}
          title="Filtrer les cotes"
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-xs text-slate-900 truncate pr-2" title={title}>
              {title}
            </h4>
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-slate-400 hover:text-slate-600"
                onClick={handleReset}
                title="Effacer le filtre"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="space-y-1 flex-1">
              <Label htmlFor="min" className="text-[10px] text-slate-500">Min</Label>
              <Input
                id="min"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="1.50"
                className="h-7 text-xs"
                type="number"
                step="0.01"
              />
            </div>
            <span className="text-slate-400 pt-4">-</span>
            <div className="space-y-1 flex-1">
              <Label htmlFor="max" className="text-[10px] text-slate-500">Max</Label>
              <Input
                id="max"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="1.60"
                className="h-7 text-xs"
                type="number"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button size="sm" className="h-7 text-xs w-full" onClick={handleApply}>
              Appliquer
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
