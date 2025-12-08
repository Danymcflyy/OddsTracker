"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface TournamentOption {
  sportId: string;
  tournamentId: number;
  name: string;
  country: string;
}

export interface TournamentSelectorSport {
  sportId: string;
  sportLabel: string;
  options: TournamentOption[];
  selected: number[];
}

interface TournamentSelectorProps {
  sports: TournamentSelectorSport[];
  onToggle: (sportId: string, tournamentId: number, nextValue: boolean) => void;
  className?: string;
}

export function TournamentSelector({ sports, onToggle, className }: TournamentSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {sports.map((sport) => {
        const selectedCount = sport.selected.length;
        const label =
          selectedCount > 0 ? `${sport.sportLabel} • ${selectedCount} sélectionné${selectedCount > 1 ? "s" : ""}` : sport.sportLabel;

        return (
          <DropdownMenu key={sport.sportId}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="truncate">{label}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              <DropdownMenuLabel>{sport.sportLabel}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-auto">
                {sport.options.map((option) => {
                  const checked = sport.selected.includes(option.tournamentId);
                  return (
                    <DropdownMenuCheckboxItem
                      key={option.tournamentId}
                      checked={checked}
                      onCheckedChange={(next) =>
                        onToggle(sport.sportId, option.tournamentId, Boolean(next))
                      }
                      className="flex items-start gap-3 py-2"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 text-primary transition",
                          checked ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium leading-tight text-slate-900">{option.name}</p>
                        <p className="text-xs text-muted-foreground">{option.country}</p>
                      </div>
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}
