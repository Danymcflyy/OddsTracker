"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  name: string;
}

interface LeagueFilterProps {
  value: number | null;
  options: Option[];
  onChange: (value: number | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function LeagueFilter({
  value,
  options,
  onChange,
  label = "Ligue",
  placeholder = "Toutes les ligues",
  className,
}: LeagueFilterProps) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
      <Select
        value={value !== null ? value.toString() : "all"}
        onValueChange={(selected) => onChange(selected === "all" ? null : Number(selected))}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id.toString()}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
