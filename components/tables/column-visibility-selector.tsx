"use client";

import * as React from "react";
import { Check, ChevronDown, Eye, EyeOff, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MarketOption {
  key: string;
  name: string;
  point?: number;
}

interface ColumnVisibilitySelectorProps {
  markets: MarketOption[];
  visibleMarkets: Set<string>;
  onToggleMarket: (marketKey: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

// Mapping des noms de groupe en français
const GROUP_NAMES: Record<string, string> = {
  'h2h': '1X2 (Match)',
  'h2h_h1': '1X2 (Mi-temps)',
  'spreads': 'Handicap Asiatique',
  'spreads_h1': 'Handicap (Mi-temps)',
  'totals': 'Over/Under',
  'totals_h1': 'O/U (Mi-temps)',
  'draw_no_bet': 'Draw No Bet',
  'btts': 'Les 2 marquent',
  'team_totals': 'Total Équipe',
};


export function ColumnVisibilitySelector({
  markets,
  visibleMarkets,
  onToggleMarket,
  onShowAll,
  onHideAll,
}: ColumnVisibilitySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

  // Regrouper les marchés par type de base
  const groupedMarkets = React.useMemo(() => {
    const groups = new Map<string, MarketOption[]>();

    for (const market of markets) {
      const baseKey = market.key.includes(':') ? market.key.split(':')[0] : market.key;

      if (!groups.has(baseKey)) {
        groups.set(baseKey, []);
      }
      groups.get(baseKey)!.push(market);
    }

    // Ordre prioritaire des groupes
    const groupOrder = ['h2h', 'spreads', 'totals', 'h2h_h1', 'spreads_h1', 'totals_h1', 'draw_no_bet', 'btts', 'team_totals'];

    return Array.from(groups.entries())
      .sort((a, b) => {
        const aIdx = groupOrder.indexOf(a[0]);
        const bIdx = groupOrder.indexOf(b[0]);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      })
      .map(([baseKey, items]) => ({
        baseKey,
        baseName: GROUP_NAMES[baseKey] || baseKey,
        items: items.sort((a, b) => {
          const aPoint = a.point ?? 0;
          const bPoint = b.point ?? 0;
          return aPoint - bPoint;
        }),
      }));
  }, [markets]);

  // Compter les colonnes visibles par groupe
  const getGroupVisibility = (items: MarketOption[]) => {
    const visible = items.filter(m => visibleMarkets.has(m.key)).length;
    return { visible, total: items.length };
  };

  // Toggle tous les marchés d'un groupe
  const toggleGroup = (items: MarketOption[], currentlyAllVisible: boolean) => {
    for (const item of items) {
      if (currentlyAllVisible) {
        if (visibleMarkets.has(item.key)) {
          onToggleMarket(item.key);
        }
      } else {
        if (!visibleMarkets.has(item.key)) {
          onToggleMarket(item.key);
        }
      }
    }
  };

  // Toggle l'expansion d'un groupe
  const toggleExpanded = (groupKey: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Columns3 className="h-4 w-4" />
          Colonnes
          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
            {visibleMarkets.size}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b">
            <h4 className="font-semibold text-sm">Colonnes visibles</h4>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowAll}
                className="h-7 px-2 text-xs"
                title="Tout afficher"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Tout
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onHideAll}
                className="h-7 px-2 text-xs"
                title="Tout masquer"
              >
                <EyeOff className="h-3.5 w-3.5 mr-1" />
                Aucun
              </Button>
            </div>
          </div>

          {/* Liste des groupes */}
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {groupedMarkets.map((group) => {
              const { visible, total } = getGroupVisibility(group.items);
              const isExpanded = expandedGroups.has(group.baseKey);
              const allVisible = visible === total;
              const hasVariations = group.items.some(m => m.point !== undefined);

              return (
                <div key={group.baseKey} className="rounded-md border bg-card">
                  {/* Groupe header */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 rounded-t-md",
                      !isExpanded && "rounded-b-md"
                    )}
                    onClick={() => hasVariations && toggleExpanded(group.baseKey)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{group.baseName}</span>
                      <Badge
                        variant={visible > 0 ? "default" : "secondary"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {visible}/{total}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant={allVisible ? "default" : "outline"}
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroup(group.items, allVisible);
                        }}
                        title={allVisible ? "Masquer le groupe" : "Afficher le groupe"}
                      >
                        {allVisible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </Button>
                      {hasVariations && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* Variations (si expandé) */}
                  {isExpanded && hasVariations && (
                    <div className="px-2 pb-2 pt-1 border-t bg-muted/30">
                      <div className="flex flex-wrap gap-1">
                        {group.items.map((market) => {
                          const isVisible = visibleMarkets.has(market.key);
                          const label = market.point !== undefined
                            ? (market.point > 0 ? `+${market.point}` : `${market.point}`)
                            : 'Base';

                          return (
                            <button
                              key={market.key}
                              onClick={() => onToggleMarket(market.key)}
                              className={cn(
                                "px-2 py-0.5 rounded text-xs font-mono transition-colors",
                                isVisible
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted-foreground/20"
                              )}
                            >
                              {label}
                              {isVisible && <Check className="h-2.5 w-2.5 ml-1 inline" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer avec légende */}
          <div className="pt-2 border-t text-[10px] text-muted-foreground space-y-1">
            <p><strong>O</strong> = Ouverture | <strong>C</strong> = Clôture</p>
            <p><strong>1</strong> = Dom. | <strong>X</strong> = Nul | <strong>2</strong> = Ext.</p>
            <p><strong>+</strong> = Over | <strong>-</strong> = Under</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
