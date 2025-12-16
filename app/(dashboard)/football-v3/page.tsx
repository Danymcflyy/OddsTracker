"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { buildFootballColumns } from "@/components/tables/v3/column-builder";
import { DataTable } from "@/components/tables/data-table";
import type { MatchWithDetails } from "@/lib/db/queries/v3/matches";
import type { MarketWithOutcomes } from "@/lib/db/queries/v3/markets";

export default function FootballV3Page() {
  const [loading, setLoading] = React.useState(true);
  const [markets, setMarkets] = React.useState<MarketWithOutcomes[]>([]);
  const [matches, setMatches] = React.useState<MatchWithDetails[]>([]);
  const [total, setTotal] = React.useState(0);

  // TanStack Table states
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Charger les marchés actifs (pour générer les colonnes)
  const loadMarkets = React.useCallback(async () => {
    try {
      const response = await fetch('/api/v3/markets?sport=football');
      const result = await response.json();

      if (result.success) {
        setMarkets(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement marchés:', error);
    }
  }, []);

  // Charger les matchs
  const loadMatches = React.useCallback(async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const response = await fetch(
        `/api/v3/matches?sport=football&page=${page}&pageSize=${pagination.pageSize}`
      );
      const result = await response.json();

      if (result.success) {
        setMatches(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Erreur chargement matchs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  React.useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  React.useEffect(() => {
    if (markets.length > 0) {
      loadMatches();
    }
  }, [markets.length, loadMatches]);

  // Générer les colonnes dynamiquement
  const columns = React.useMemo(() => {
    if (markets.length === 0) return [];
    return buildFootballColumns(markets);
  }, [markets]);

  // Calculer le nombre de pages
  const pageCount = Math.ceil(total / pagination.pageSize);

  if (markets.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Chargement des marchés...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Football V3</p>
        <h1 className="text-3xl font-semibold text-slate-900">⚽ Matchs & Cotes</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {total} matchs • {markets.length} marchés actifs • Colonnes dynamiques
        </p>
      </header>

      <DataTable
        columns={columns}
        data={matches}
        pageCount={pageCount}
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        isLoading={loading}
        pageSizeOptions={[25, 50, 100]}
      />
    </div>
  );
}
