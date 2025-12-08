"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamFilterProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function TeamFilter({
  value,
  onChange,
  label = "Recherche équipe",
  placeholder = "Club, ville...",
  className,
}: TeamFilterProps) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
