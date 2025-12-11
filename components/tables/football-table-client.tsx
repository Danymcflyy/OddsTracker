"use client";

import * as React from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/data-table";
import { getStaticFootballColumns, extractUniqueOddsFromFixtures, buildOddColumnForFixture } from "@/components/tables/columns/football-columns-v2";
import type { FixtureWithEnrichedOdds } from "@/types/fixture";

interface FootballTableClientProps {
  data: FixtureWithEnrichedOdds[];
  isLoading: boolean;
  pageCount: number;
  pagination: PaginationState;
  sorting: SortingState;
  onPaginationChange: (pagination: PaginationState) => void;
  onSortingChange: (sorting: SortingState) => void;
  renderToolbar?: (table: any) => React.ReactNode;
}

export function FootballTableClient({
  data,
  isLoading,
  pageCount,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  renderToolbar,
}: FootballTableClientProps) {
  // Générer les colonnes dynamiquement côté client (pas de SSR)
  const columns = React.useMemo(() => {
    const staticColumns = getStaticFootballColumns();

    if (!data || data.length === 0) {
      return staticColumns;
    }

    // Extraire les odds uniques et créer les colonnes
    const oddsDefinitions = extractUniqueOddsFromFixtures(data);
    const oddsColumns = oddsDefinitions.flatMap((oddDef) => [
      buildOddColumnForFixture(oddDef, "opening"),
      buildOddColumnForFixture(oddDef, "closing"),
    ]);

    return [...staticColumns, ...oddsColumns];
  }, [data]);

  return (
    <DataTable
      columns={columns}
      data={data}
      pageCount={pageCount}
      pagination={pagination}
      sorting={sorting}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      isLoading={isLoading}
      renderToolbar={renderToolbar}
    />
  );
}
