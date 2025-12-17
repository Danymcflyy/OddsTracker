"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OddsRangeFilter } from "@/types/filters";

interface MarketOption {
  id: string;
  name: string;
}

interface OddsRangeFilterProps {
  value: OddsRangeFilter;
  onChange: (value: OddsRangeFilter) => void;
  markets: MarketOption[];
  label?: string;
  className?: string;
}

export function OddsRangeFilter({
  value,
  onChange,
  markets,
  label = "Filtrage par cotes",
  className,
}: OddsRangeFilterProps) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-xs text-muted-foreground font-semibold">
        {label}
      </Label>

      <div className="space-y-3">
        {/* Sélection du marché (optionnel) */}
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">
            Type de pari (optionnel)
          </Label>
          <Select
            value={value.marketId ?? "all"}
            onValueChange={(selected) =>
              onChange({ ...value, marketId: selected === "all" ? null : selected })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tous les marchés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les marchés</SelectItem>
              {markets.map((market) => (
                <SelectItem key={market.id} value={market.id}>
                  {market.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fourchette Opening */}
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">
            Cotes Opening (optionnel)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Min"
              value={value.openingMin ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  openingMin: event.target.value ? Number(event.target.value) : null,
                })
              }
              className="h-9"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <Input
              type="number"
              step="0.01"
              placeholder="Max"
              value={value.openingMax ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  openingMax: event.target.value ? Number(event.target.value) : null,
                })
              }
              className="h-9"
            />
          </div>
        </div>

        {/* Fourchette Current */}
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">
            Cotes Current (optionnel)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Min"
              value={value.currentMin ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  currentMin: event.target.value ? Number(event.target.value) : null,
                })
              }
              className="h-9"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <Input
              type="number"
              step="0.01"
              placeholder="Max"
              value={value.currentMax ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  currentMax: event.target.value ? Number(event.target.value) : null,
                })
              }
              className="h-9"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic">
          Laissez vide pour ne pas filtrer. Les filtres s'appliquent en ET.
        </p>
      </div>
    </div>
  );
}
