"use client";

import * as React from "react";
import type { Column, Table } from "@tanstack/react-table";
import { Check, EyeOff } from "lucide-react";

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

interface ColumnVisibilityToggleProps<TData> {
  table: Table<TData>;
  storageKey: string;
  triggerLabel?: string;
  minVisibleColumns?: number;
}

/**
 * Dropdown pour afficher/masquer les colonnes
 * - Persistance locale via localStorage
 * - Empêche de masquer toutes les colonnes
 */
export function ColumnVisibilityToggle<TData>({
  table,
  storageKey,
  triggerLabel = "Colonnes",
  minVisibleColumns = 4,
}: ColumnVisibilityToggleProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  // Hydrater depuis localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, boolean>;
        Object.entries(parsed).forEach(([columnId, isVisible]) => {
          const column = table.getColumn(columnId);
          if (column) {
            column.toggleVisibility(isVisible);
          }
        });
      } catch (error) {
        console.warn("[ColumnVisibilityToggle] Impossible de lire localStorage:", error);
      }
    }
    setReady(true);
  }, [storageKey, table]);

  // Sauvegarder les changements
  React.useEffect(() => {
    if (!ready) return;
    if (typeof window === "undefined") {
      return;
    }

    const visibility: Record<string, boolean> = {};

    table.getAllLeafColumns().forEach((column) => {
      visibility[column.id] = column.getIsVisible();
    });

    localStorage.setItem(storageKey, JSON.stringify(visibility));
  }, [ready, storageKey, table, table.getState().columnVisibility]);

  const visibleCount = table.getAllLeafColumns().filter((column) => column.getIsVisible()).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <EyeOff className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Colonnes affichées</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table.getAllLeafColumns().map((column) => {
          const disabled = column.getIsVisible() && visibleCount <= minVisibleColumns;
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))}
              disabled={disabled}
            >
              <span className="flex items-center gap-2">
                <Check
                  className={cn(
                    "h-4 w-4 text-primary transition",
                    column.getIsVisible() ? "opacity-100" : "opacity-0"
                  )}
                />
                {getColumnLabel(column)}
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getColumnLabel<TData>(column: Column<TData, unknown>) {
  const metaLabel = column.columnDef.meta && "label" in column.columnDef.meta
    ? (column.columnDef.meta as { label?: string }).label
    : undefined;

  if (metaLabel) {
    return metaLabel;
  }

  const header = column.columnDef.header;

  if (typeof header === "string" || typeof header === "number") {
    return String(header);
  }

  if (React.isValidElement(header)) {
    return column.id;
  }

  if (typeof header === "function") {
    return column.id;
  }

  return column.id;
}
