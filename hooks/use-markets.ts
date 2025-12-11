"use client";

import { useState, useEffect } from "react";

export interface Market {
  id: number;
  oddspapi_id: number;
  name: string;
  market_type: string;
  period: string;
  handicap: number | null;
  outcomes: Array<{
    id: number;
    oddspapi_id: number;
    name: string;
    description: string | null;
  }>;
}

export function useMarkets(sportSlug: string) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true);
        const response = await fetch(`/api/markets?sport=${sportSlug}`, {
          cache: "force-cache",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const { data } = await response.json();
        setMarkets(data || []);
        setError(null);
      } catch (err) {
        console.error("[useMarkets] Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
  }, [sportSlug]);

  return { markets, loading, error };
}
