"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { MarketWithOutcomes } from "@/lib/db/queries/v3/markets";

interface ColumnVisibilitySelectorProps {
  markets: MarketWithOutcomes[];
  visibleMarkets: Set<string>;
  onToggleMarket: (marketId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export function ColumnVisibilitySelector({
  markets,
  visibleMarkets,
  onToggleMarket,
  onShowAll,
  onHideAll,
}: ColumnVisibilitySelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          Colonnes ({visibleMarkets.size}/{markets.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Visibilité des marchés</h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowAll}
                className="h-7 text-xs"
              >
                Tout afficher
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onHideAll}
                className="h-7 text-xs"
              >
                Tout masquer
              </Button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {markets.map((market) => {
              const isVisible = visibleMarkets.has(market.id);
              const label = market.custom_name || market.name;

              return (
                <div
                  key={market.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={() => onToggleMarket(market.id)}
                >
                  <Checkbox
                    id={`market-${market.id}`}
                    checked={isVisible}
                    onCheckedChange={() => onToggleMarket(market.id)}
                    className="cursor-pointer"
                  />
                  <Label
                    htmlFor={`market-${market.id}`}
                    className="flex-1 cursor-pointer text-sm font-normal"
                  >
                    {label}
                  </Label>
                  {isVisible && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t text-xs text-muted-foreground">
            Masquer un marché cache toutes ses colonnes (Opening + Current)
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
