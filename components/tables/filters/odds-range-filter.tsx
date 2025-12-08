"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { OddsRangeFilter } from "@/types/filters";

interface OddsRangeFilterProps {
  value: OddsRangeFilter;
  onChange: (value: OddsRangeFilter) => void;
  label?: string;
  className?: string;
}

export function OddsRangeFilter({
  value,
  onChange,
  label = "Fourchette de cotes",
  className,
}: OddsRangeFilterProps) {
  const handleTypeChange = (type: "opening" | "closing") => {
    if (value.type === type) return;
    onChange({ ...value, type });
  };

  return (
    <div className={className}>
      <Label className="mb-1 block text-xs text-muted-foreground">
        {label} ({value.type === "opening" ? "Opening" : "Closing"})
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <Input
            type="number"
            step="0.01"
            placeholder="Min"
            value={value.min ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                min: event.target.value ? Number(event.target.value) : null,
              })
            }
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="number"
            step="0.01"
            placeholder="Max"
            value={value.max ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                max: event.target.value ? Number(event.target.value) : null,
              })
            }
          />
        </div>
        <div className="inline-flex rounded-md border p-1">
          <Button
            type="button"
            size="sm"
            variant={value.type === "opening" ? "default" : "ghost"}
            className="rounded-sm"
            onClick={() => handleTypeChange("opening")}
          >
            Opening
          </Button>
          <Button
            type="button"
            size="sm"
            variant={value.type === "closing" ? "default" : "ghost"}
            className="rounded-sm"
            onClick={() => handleTypeChange("closing")}
          >
            Closing
          </Button>
        </div>
      </div>
    </div>
  );
}
