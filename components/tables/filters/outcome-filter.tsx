"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export type OutcomeType = 'home' | 'away' | 'draw' | 'over' | 'under';

interface OutcomeFilterProps {
  selectedOutcomes: OutcomeType[];
  onChange: (outcomes: OutcomeType[]) => void;
  label?: string;
  className?: string;
}

const OUTCOME_OPTIONS: { value: OutcomeType; label: string }[] = [
  { value: 'home', label: '1 (Domicile)' },
  { value: 'draw', label: 'X (Nul)' },
  { value: 'away', label: '2 (Extérieur)' },
  { value: 'over', label: 'Over (Plus)' },
  { value: 'under', label: 'Under (Moins)' },
];

export function OutcomeFilter({
  selectedOutcomes,
  onChange,
  label = "Filtrer par résultat",
  className,
}: OutcomeFilterProps) {
  const handleToggle = (outcome: OutcomeType, checked: boolean) => {
    if (checked) {
      // Add outcome to selection
      onChange([...selectedOutcomes, outcome]);
    } else {
      // Remove outcome from selection
      onChange(selectedOutcomes.filter(o => o !== outcome));
    }
  };

  const handleSelectAll = () => {
    if (selectedOutcomes.length === OUTCOME_OPTIONS.length) {
      // Deselect all
      onChange([]);
    } else {
      // Select all
      onChange(OUTCOME_OPTIONS.map(o => o.value));
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs text-primary hover:underline"
        >
          {selectedOutcomes.length === OUTCOME_OPTIONS.length ? 'Désélectionner tout' : 'Tout sélectionner'}
        </button>
      </div>
      <div className="space-y-2 border rounded-md p-3 bg-background">
        {OUTCOME_OPTIONS.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`outcome-${option.value}`}
              checked={selectedOutcomes.includes(option.value)}
              onCheckedChange={(checked) => handleToggle(option.value, checked as boolean)}
            />
            <label
              htmlFor={`outcome-${option.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
