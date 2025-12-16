import Link from "next/link";

export default function HockeyPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
      <p className="text-lg font-semibold text-slate-900">
        Cette version du tableau Hockey est désactivée.
      </p>
      <p>Merci d&apos;utiliser la nouvelle interface lorsque disponible.</p>
    </div>
  );
}

// Ancienne implémentation conservée pour référence :
// "use client";
// import * as React from "react";
// import type { PaginationState, SortingState, Table as TanstackTable } from "@tanstack/react-table";
// import { Filter, RefreshCw } from "lucide-react";
// import { DataTable } from "@/components/tables/data-table";
// import { createHockeyColumns } from "@/components/tables/columns/hockey-columns";
// import { ColumnVisibilityToggle } from "@/components/tables/column-visibility";
// import { ExportButtons } from "@/components/tables/export-buttons";
// import { DateRangeFilter } from "@/components/tables/filters/date-range-filter";
// import { CountryFilter } from "@/components/tables/filters/country-filter";
// import { LeagueFilter } from "@/components/tables/filters/league-filter";
// import { TeamFilter } from "@/components/tables/filters/team-filter";
// import { MarketFilter } from "@/components/tables/filters/market-filter";
// import { OddsRangeFilter } from "@/components/tables/filters/odds-range-filter";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useFilters } from "@/hooks/use-filters";
// import { useFixtures } from "@/hooks/use-fixtures";
// import { useMarkets } from "@/hooks/use-markets";
// import type { FixtureWithEnrichedOdds, OddWithDetails } from "@/types/fixture";
// import type { Filters } from "@/types/filters";
