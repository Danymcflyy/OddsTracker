"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MarketOption {
  key?: string;  // v4 uses 'key'
  id?: string;   // v3 uses 'id' (keep for backward compatibility)
  name: string;
}

interface MarketFilterProps {
  value: string | null;
  options: MarketOption[];
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function MarketFilter({
  value,
  options,
  onChange,
  label = "Type de marché",
  placeholder = "Tous les marchés",
  className,
}: MarketFilterProps) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
      <Select
        value={value ?? "all"}
        onValueChange={(selected) => onChange(selected === "all" ? null : selected)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          {options.map((option) => {
            const value = option.key || option.id || '';
            return (
              <SelectItem key={value} value={value}>
                {option.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
