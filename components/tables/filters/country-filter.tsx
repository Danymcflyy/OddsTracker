"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  name: string;
}

interface CountryFilterProps {
  value: string | null;
  options: Option[];
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function CountryFilter({
  value,
  options,
  onChange,
  label = "Pays",
  placeholder = "Tous les pays",
  className,
}: CountryFilterProps) {
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
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
