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
  pointValue?: number; // Valeur du point (handicap ou total)
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
    });
  };

  const hasActiveFilters = value.oddsMin !== undefined || value.oddsMax !== undefined || value.outcome !== 'all' || value.marketType !== 'all' || value.pointValue !== undefined;

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
        <div className="border rounded-md p-4 bg-background space-y-4">
          {/* Fourchette de cotes */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Fourchette de cotes</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Cote minimum</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Ex: 1.50"
                  value={value.oddsMin ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : undefined;
                    onChange({ ...value, oddsMin: val });
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Cote maximum</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Ex: 3.00"
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
            <Select
              value={value.oddsType}
              onValueChange={(val) => onChange({ ...value, oddsType: val as 'opening' | 'closing' | 'both' })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opening">Cotes d'ouverture uniquement</SelectItem>
                <SelectItem value="closing">Cotes de clôture uniquement</SelectItem>
                <SelectItem value="both">Ouverture et clôture</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                <SelectItem value="home">1 (Domicile) uniquement</SelectItem>
                <SelectItem value="draw">X (Nul) uniquement</SelectItem>
                <SelectItem value="away">2 (Extérieur) uniquement</SelectItem>
                <SelectItem value="over">Over uniquement</SelectItem>
                <SelectItem value="under">Under uniquement</SelectItem>
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
                <SelectItem value="h2h_h1">Moneyline H1</SelectItem>
                <SelectItem value="spreads_h1">Asian Handicap H1</SelectItem>
                <SelectItem value="totals_h1">Over/Under H1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valeur du point (Handicap/Total) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Valeur du point (Handicap/Total)</Label>
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange({ ...value, pointValue: undefined })}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Exemples : 2.5 (O/U 2.5), -1.0 (AH -1.0), 0.5 (AH +0.5)
            </p>
          </div>

          {/* Indicateur de filtres actifs */}
          {hasActiveFilters && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-primary">Filtres actifs :</span>
                {' '}
                {value.oddsMin && `Min: ${value.oddsMin}`}
                {value.oddsMin && value.oddsMax && ' • '}
                {value.oddsMax && `Max: ${value.oddsMax}`}
                {(value.oddsMin || value.oddsMax) && value.outcome !== 'all' && ' • '}
                {value.outcome !== 'all' && `Résultat: ${value.outcome}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
