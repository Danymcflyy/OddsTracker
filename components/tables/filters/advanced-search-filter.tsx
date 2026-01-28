"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface AdvancedSearchParams {
  // Separate opening odds range
  openingOddsMin?: number;
  openingOddsMax?: number;
  // Separate closing odds range
  closingOddsMin?: number;
  closingOddsMax?: number;
  // Movement direction filter
  movementDirection?: 'all' | 'up' | 'down' | 'stable';
  // Common filters
  oddsType: 'opening' | 'closing' | 'both';
  outcome?: 'home' | 'away' | 'draw' | 'over' | 'under' | 'yes' | 'no' | 'all';
  marketType?: 'all' | 'h2h' | 'spreads' | 'totals' | 'h2h_h1' | 'spreads_h1' | 'totals_h1' | 'btts' | 'draw_no_bet' | 'team_totals_home' | 'team_totals_away';
  pointValue?: number;
  status?: 'all' | 'upcoming' | 'completed';
}

interface AdvancedSearchFilterProps {
  value: AdvancedSearchParams;
  onChange: (params: AdvancedSearchParams) => void;
  className?: string;
}

export function AdvancedSearchFilter({
  value,
  onChange,
  className,
}: AdvancedSearchFilterProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleReset = () => {
    onChange({
      oddsType: 'both',
      outcome: 'all',
      marketType: 'all',
      status: 'all',
    });
  };

  const hasActiveFilters =
    value.openingOddsMin !== undefined ||
    value.openingOddsMax !== undefined ||
    value.closingOddsMin !== undefined ||
    value.closingOddsMax !== undefined ||
    (value.movementDirection && value.movementDirection !== 'all') ||
    (value.outcome && value.outcome !== 'all') ||
    (value.marketType && value.marketType !== 'all') ||
    value.pointValue !== undefined ||
    (value.status && value.status !== 'all');

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <Search className="h-3 w-3" />
          Recherche Avancée
        </Label>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? 'Masquer' : 'Afficher'}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border rounded-md p-4 bg-background space-y-4 shadow-sm">
          {/* Opening & Closing Odds Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opening Odds Range */}
            <div className="space-y-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <Label className="text-sm font-semibold text-blue-700">Cotes Opening</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block uppercase">Min</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="2.10"
                    value={value.openingOddsMin ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      onChange({ ...value, openingOddsMin: val });
                    }}
                    className="h-8 text-sm bg-white"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block uppercase">Max</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="2.30"
                    value={value.openingOddsMax ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      onChange({ ...value, openingOddsMax: val });
                    }}
                    className="h-8 text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Closing Odds Range */}
            <div className="space-y-2 p-3 bg-green-50/50 rounded-lg border border-green-100">
              <Label className="text-sm font-semibold text-green-700">Cotes Closing</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block uppercase">Min</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="2.50"
                    value={value.closingOddsMin ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      onChange({ ...value, closingOddsMin: val });
                    }}
                    className="h-8 text-sm bg-white"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block uppercase">Max</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="2.60"
                    value={value.closingOddsMax ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      onChange({ ...value, closingOddsMax: val });
                    }}
                    className="h-8 text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Movement Direction */}
          <div className="space-y-2 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
            <Label className="text-sm font-semibold text-amber-700">Direction du mouvement</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'all', label: 'Tous', icon: '↔️' },
                { value: 'down', label: 'Baisse', icon: '⬇️' },
                { value: 'up', label: 'Hausse', icon: '⬆️' },
                { value: 'stable', label: 'Stable', icon: '➡️' },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={value.movementDirection === opt.value || (!value.movementDirection && opt.value === 'all') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onChange({ ...value, movementDirection: opt.value as any })}
                  className="h-8 text-xs"
                >
                  <span className="mr-1">{opt.icon}</span>
                  {opt.label}
                </Button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Baisse = closing &lt; opening (steam move) | Hausse = closing &gt; opening (reverse steam)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type de résultat */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Type de résultat</Label>
              <Select
                value={value.outcome ?? 'all'}
                onValueChange={(val) => onChange({ ...value, outcome: val as any })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les résultats</SelectItem>
                  <SelectItem value="home">1 (Domicile)</SelectItem>
                  <SelectItem value="draw">X (Nul)</SelectItem>
                  <SelectItem value="away">2 (Extérieur)</SelectItem>
                  <SelectItem value="over">Over (+)</SelectItem>
                  <SelectItem value="under">Under (-)</SelectItem>
                  <SelectItem value="yes">Oui (BTTS)</SelectItem>
                  <SelectItem value="no">Non (BTTS)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type de marché */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Type de marché</Label>
              <Select
                value={value.marketType ?? 'all'}
                onValueChange={(val) => onChange({ ...value, marketType: val as any })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les marchés</SelectItem>
                  <SelectItem value="h2h">Moneyline (1X2)</SelectItem>
                  <SelectItem value="spreads">Asian Handicap</SelectItem>
                  <SelectItem value="totals">Over/Under</SelectItem>
                  <SelectItem value="h2h_h1">1X2 Mi-temps</SelectItem>
                  <SelectItem value="spreads_h1">Handicap Mi-temps</SelectItem>
                  <SelectItem value="totals_h1">O/U Mi-temps</SelectItem>
                  <SelectItem value="btts">Les 2 marquent (BTTS)</SelectItem>
                  <SelectItem value="draw_no_bet">Draw No Bet</SelectItem>
                  <SelectItem value="team_totals_home">Team Totals Dom.</SelectItem>
                  <SelectItem value="team_totals_away">Team Totals Ext.</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Statut du match */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Statut du match</Label>
              <Select
                value={value.status ?? 'all'}
                onValueChange={(val) => onChange({ ...value, status: val as any })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="upcoming">À venir / En cours</SelectItem>
                  <SelectItem value="completed">Terminés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valeur du point */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Valeur du point</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.25"
                  placeholder="Ex: 2.5 ou -1.0"
                  value={value.pointValue ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : undefined;
                    onChange({ ...value, pointValue: val });
                  }}
                  className="h-8 text-sm"
                />
                {value.pointValue !== undefined && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...value, pointValue: undefined })} className="h-8 px-2">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Indicateur de filtres actifs */}
          {hasActiveFilters && (
            <div className="pt-2 border-t mt-2">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-primary">Filtres actifs :</span>

                {(value.openingOddsMin !== undefined || value.openingOddsMax !== undefined) && (
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                    Open: {value.openingOddsMin ?? '?'} - {value.openingOddsMax ?? '?'}
                  </span>
                )}

                {(value.closingOddsMin !== undefined || value.closingOddsMax !== undefined) && (
                  <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                    Close: {value.closingOddsMin ?? '?'} - {value.closingOddsMax ?? '?'}
                  </span>
                )}

                {value.movementDirection && value.movementDirection !== 'all' && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                    {value.movementDirection === 'down' ? '⬇️ Baisse' : value.movementDirection === 'up' ? '⬆️ Hausse' : '➡️ Stable'}
                  </span>
                )}

                {value.outcome && value.outcome !== 'all' && (
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">Choix: {value.outcome}</span>
                )}

                {value.marketType && value.marketType !== 'all' && (
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">Marché: {value.marketType}</span>
                )}

                {value.pointValue !== undefined && (
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">Ligne: {value.pointValue}</span>
                )}

                {value.status && value.status !== 'all' && (
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">Statut: {value.status}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
