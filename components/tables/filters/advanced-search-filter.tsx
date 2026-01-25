"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export interface AdvancedSearchParams {
  oddsMin?: number;
  oddsMax?: number;
  oddsType: 'opening' | 'closing' | 'both';
  outcome?: 'home' | 'away' | 'draw' | 'over' | 'under' | 'all';
  marketType?: 'all' | 'h2h' | 'spreads' | 'totals' | 'h2h_h1' | 'spreads_h1' | 'totals_h1';
  pointValue?: number;
  dropMin?: number;
  status?: 'all' | 'upcoming' | 'completed';
  minSnapshots?: number;
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
    value.oddsMin !== undefined || 
    value.oddsMax !== undefined || 
    (value.outcome && value.outcome !== 'all') || 
    (value.marketType && value.marketType !== 'all') || 
    value.pointValue !== undefined || 
    value.dropMin !== undefined ||
    (value.status && value.status !== 'all') ||
    value.minSnapshots !== undefined;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fourchette de cotes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Fourchette de cotes</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block uppercase">Min</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="1.50"
                    value={value.oddsMin ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      onChange({ ...value, oddsMin: val });
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block uppercase">Max</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="3.00"
                    value={value.oddsMax ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : undefined;
                      onChange({ ...value, oddsMax: val });
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Type de cotes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Type de cotes</Label>
              <Label className="text-[10px] text-muted-foreground mb-1 block uppercase">Application du filtre</Label>
              <Select
                value={value.oddsType}
                onValueChange={(val) => onChange({ ...value, oddsType: val as any })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opening">Ouverture uniquement</SelectItem>
                  <SelectItem value="closing">Clôture uniquement</SelectItem>
                  <SelectItem value="both">Ouverture OU Clôture</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

            {/* Nombre de snapshots */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Fidélité Closing</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Min Snapshots (ex: 3)"
                  value={value.minSnapshots ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : undefined;
                    onChange({ ...value, minSnapshots: val });
                  }}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Valeur du point & Drop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Drop de cote</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Drop Min % (ex: 10)"
                  value={value.dropMin ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : undefined;
                    onChange({ ...value, dropMin: val });
                  }}
                  className="h-8 text-sm"
                />
                {value.dropMin !== undefined && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...value, dropMin: undefined })} className="h-8 px-2">
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
                
                {value.oddsMin !== undefined && (
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">Min: {value.oddsMin}</span>
                )}
                
                {value.oddsMax !== undefined && (
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">Max: {value.oddsMax}</span>
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

                {value.minSnapshots !== undefined && (
                  <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-100">Snaps &ge; {value.minSnapshots}</span>
                )}

                {value.dropMin !== undefined && (
                  <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 font-bold">Drop &gt; {value.dropMin}%</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}