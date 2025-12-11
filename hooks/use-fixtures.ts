"use client";

import { useState, useEffect } from "react";
import type { FixtureWithEnrichedOdds, OddWithDetails } from "@/types/fixture";

const now = new Date();

function createOdd({
  id,
  fixtureId,
  marketId,
  outcomeId,
  opening,
  closing,
  isWinner,
  marketName,
  marketDescription,
  outcomeName,
}: {
  id: number;
  fixtureId: number;
  marketId: number;
  outcomeId: number;
  opening: number;
  closing: number;
  isWinner: boolean | null;
  marketName: string;
  marketDescription?: string | null;
  outcomeName: string;
}): OddWithDetails {
  const timestamp = new Date(now.getTime() - id * 3600 * 1000).toISOString();

  return {
    id,
    fixture_id: fixtureId,
    market_id: marketId,
    outcome_id: outcomeId,
    opening_price: opening,
    closing_price: closing,
    opening_timestamp: timestamp,
    closing_timestamp: timestamp,
    is_winner: isWinner,
    created_at: timestamp,
    market: {
      id: marketId,
      oddspapi_id: marketId,
      name: marketName,
      description: marketDescription ?? null,
    },
    outcome: {
      id: outcomeId,
      oddspapi_id: outcomeId,
      market_id: marketId,
      name: outcomeName,
      description: null,
    },
  };
}

/**
 * Données fictives utilisées en environnement de développement
 * ⚠️ À supprimer lors du branchement sur les vraies données OddsPapi/Supabase
 */
const DEMO_FIXTURES: Record<string, FixtureWithEnrichedOdds[]> = {
  football: [
    {
      id: 1001,
      oddspapi_id: "demo-football-1",
      sport_id: 10,
      league_id: 510,
      home_team_id: 10001,
      away_team_id: 10002,
      start_time: new Date("2024-02-10T18:00:00Z").toISOString(),
      home_score: 3,
      away_score: 1,
      status: "finished",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      odds_locked_at: now.toISOString(),
      home_team: {
        id: 10001,
        name: "Manchester City",
      },
      away_team: {
        id: 10002,
        name: "Arsenal",
      },
      league: {
        id: 510,
        name: "Premier League",
        country: {
          id: 44,
          name: "Angleterre",
        },
      },
      odds: [
        createOdd({
          id: 1,
          fixtureId: 1001,
          marketId: 101,
          outcomeId: 1,
          opening: 1.80,
          closing: 1.75,
          isWinner: true,
          marketName: "1X2",
          outcomeName: "1",
        }),
        createOdd({
          id: 2,
          fixtureId: 1001,
          marketId: 101,
          outcomeId: 2,
          opening: 3.80,
          closing: 3.95,
          isWinner: false,
          marketName: "1X2",
          outcomeName: "X",
        }),
        createOdd({
          id: 3,
          fixtureId: 1001,
          marketId: 101,
          outcomeId: 3,
          opening: 4.10,
          closing: 4.35,
          isWinner: false,
          marketName: "1X2",
          outcomeName: "2",
        }),
        createOdd({
          id: 4,
          fixtureId: 1001,
          marketId: 201,
          outcomeId: 4,
          opening: 1.95,
          closing: 1.88,
          isWinner: true,
          marketName: "Over 2.5",
          marketDescription: "Over/Under",
          outcomeName: "O25",
        }),
        createOdd({
          id: 5,
          fixtureId: 1001,
          marketId: 201,
          outcomeId: 5,
          opening: 1.92,
          closing: 1.97,
          isWinner: false,
          marketName: "Over 2.5",
          marketDescription: "Over/Under",
          outcomeName: "U25",
        }),
        createOdd({
          id: 6,
          fixtureId: 1001,
          marketId: 301,
          outcomeId: 6,
          opening: 1.72,
          closing: 1.68,
          isWinner: true,
          marketName: "Asian Handicap -1.0",
          marketDescription: "Handicap",
          outcomeName: "Home -1.0",
        }),
        createOdd({
          id: 16,
          fixtureId: 1001,
          marketId: 301,
          outcomeId: 16,
          opening: 2.05,
          closing: 2.12,
          isWinner: false,
          marketName: "Asian Handicap -1.0",
          marketDescription: "Handicap",
          outcomeName: "Away +1.0",
        }),
      ],
    },
    {
      id: 1002,
      oddspapi_id: "demo-football-2",
      sport_id: 10,
      league_id: 520,
      home_team_id: 10003,
      away_team_id: 10004,
      start_time: new Date("2024-02-12T20:00:00Z").toISOString(),
      home_score: 0,
      away_score: 0,
      status: "finished",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      odds_locked_at: now.toISOString(),
      home_team: {
        id: 10003,
        name: "Paris SG",
      },
      away_team: {
        id: 10004,
        name: "Olympique Lyonnais",
      },
      league: {
        id: 520,
        name: "Ligue 1",
        country: {
          id: 33,
          name: "France",
        },
      },
      odds: [
        createOdd({
          id: 7,
          fixtureId: 1002,
          marketId: 101,
          outcomeId: 7,
          opening: 1.45,
          closing: 1.50,
          isWinner: false,
          marketName: "1X2",
          outcomeName: "1",
        }),
        createOdd({
          id: 8,
          fixtureId: 1002,
          marketId: 101,
          outcomeId: 8,
          opening: 4.40,
          closing: 4.20,
          isWinner: true,
          marketName: "1X2",
          outcomeName: "X",
        }),
        createOdd({
          id: 9,
          fixtureId: 1002,
          marketId: 101,
          outcomeId: 9,
          opening: 6.00,
          closing: 5.60,
          isWinner: false,
          marketName: "1X2",
          outcomeName: "2",
        }),
        createOdd({
          id: 10,
          fixtureId: 1002,
          marketId: 202,
          outcomeId: 10,
          opening: 2.05,
          closing: 2.15,
          isWinner: false,
          marketName: "Under 2.5",
          marketDescription: "Over/Under",
          outcomeName: "O25",
        }),
        createOdd({
          id: 11,
          fixtureId: 1002,
          marketId: 202,
          outcomeId: 11,
          opening: 1.75,
          closing: 1.68,
          isWinner: true,
          marketName: "Under 2.5",
          marketDescription: "Over/Under",
          outcomeName: "U25",
        }),
        createOdd({
          id: 12,
          fixtureId: 1002,
          marketId: 302,
          outcomeId: 12,
          opening: 1.88,
          closing: 1.92,
          isWinner: true,
          marketName: "Asian Handicap -0.5",
          marketDescription: "Handicap",
          outcomeName: "Home -0.5",
        }),
        createOdd({
          id: 13,
          fixtureId: 1002,
          marketId: 302,
          outcomeId: 13,
          opening: 1.95,
          closing: 2.00,
          isWinner: false,
          marketName: "Asian Handicap -0.5",
          marketDescription: "Handicap",
          outcomeName: "Away +0.5",
        }),
      ],
    },
    {
      id: 1003,
      oddspapi_id: "demo-football-3",
      sport_id: 10,
      league_id: 530,
      home_team_id: 10005,
      away_team_id: 10006,
      start_time: new Date("2024-02-15T17:30:00Z").toISOString(),
      home_score: 1,
      away_score: 2,
      status: "finished",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      odds_locked_at: now.toISOString(),
      home_team: {
        id: 10005,
        name: "Borussia Dortmund",
      },
      away_team: {
        id: 10006,
        name: "Bayern Munich",
      },
      league: {
        id: 530,
        name: "Bundesliga",
        country: {
          id: 49,
          name: "Allemagne",
        },
      },
      odds: [
        createOdd({
          id: 14,
          fixtureId: 1003,
          marketId: 101,
          outcomeId: 14,
          opening: 2.60,
          closing: 2.80,
          isWinner: false,
          marketName: "1X2",
          outcomeName: "1",
        }),
        createOdd({
          id: 15,
          fixtureId: 1003,
          marketId: 101,
          outcomeId: 15,
          opening: 3.60,
          closing: 3.70,
          isWinner: false,
          marketName: "1X2",
          outcomeName: "X",
        }),
        createOdd({
          id: 16,
          fixtureId: 1003,
          marketId: 101,
          outcomeId: 16,
          opening: 2.45,
          closing: 2.30,
          isWinner: true,
          marketName: "1X2",
          outcomeName: "2",
        }),
        createOdd({
          id: 17,
          fixtureId: 1003,
          marketId: 203,
          outcomeId: 17,
          opening: 1.70,
          closing: 1.72,
          isWinner: true,
          marketName: "Over 3.5",
          marketDescription: "Over/Under",
          outcomeName: "O35",
        }),
        createOdd({
          id: 18,
          fixtureId: 1003,
          marketId: 203,
          outcomeId: 18,
          opening: 2.05,
          closing: 2.10,
          isWinner: false,
          marketName: "Over 3.5",
          marketDescription: "Over/Under",
          outcomeName: "U35",
        }),
        createOdd({
          id: 19,
          fixtureId: 1003,
          marketId: 401,
          outcomeId: 19,
          opening: 1.55,
          closing: 1.50,
          isWinner: true,
          marketName: "Double Chance",
          outcomeName: "12",
        }),
      ],
    },
  ],
  hockey: [
    {
      id: 2001,
      oddspapi_id: "demo-hockey-1",
      sport_id: 4,
      league_id: 610,
      home_team_id: 20001,
      away_team_id: 20002,
      start_time: new Date("2024-02-05T23:30:00Z").toISOString(),
      home_score: 4,
      away_score: 2,
      status: "finished",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      odds_locked_at: now.toISOString(),
      home_team: {
        id: 20001,
        name: "Toronto Maple Leafs",
      },
      away_team: {
        id: 20002,
        name: "Montreal Canadiens",
      },
      league: {
        id: 610,
        name: "NHL",
        country: {
          id: 1,
          name: "Canada",
        },
      },
      odds: [
        createOdd({
          id: 101,
          fixtureId: 2001,
          marketId: 301,
          outcomeId: 101,
          opening: 1.70,
          closing: 1.65,
          isWinner: true,
          marketName: "Moneyline",
          outcomeName: "1",
        }),
        createOdd({
          id: 102,
          fixtureId: 2001,
          marketId: 301,
          outcomeId: 102,
          opening: 2.20,
          closing: 2.30,
          isWinner: false,
          marketName: "Moneyline",
          outcomeName: "2",
        }),
        createOdd({
          id: 103,
          fixtureId: 2001,
          marketId: 401,
          outcomeId: 103,
          opening: 1.95,
          closing: 1.90,
          isWinner: true,
          marketName: "Over 5.5",
          marketDescription: "OVER",
          outcomeName: "O55",
        }),
        createOdd({
          id: 104,
          fixtureId: 2001,
          marketId: 401,
          outcomeId: 104,
          opening: 1.85,
          closing: 1.92,
          isWinner: false,
          marketName: "Over 5.5",
          marketDescription: "UNDER",
          outcomeName: "U55",
        }),
        createOdd({
          id: 105,
          fixtureId: 2001,
          marketId: 501,
          outcomeId: 105,
          opening: 2.10,
          closing: 2.05,
          isWinner: true,
          marketName: "Puck Line",
          outcomeName: "-1.5",
        }),
      ],
    },
    {
      id: 2002,
      oddspapi_id: "demo-hockey-2",
      sport_id: 4,
      league_id: 620,
      home_team_id: 20003,
      away_team_id: 20004,
      start_time: new Date("2024-02-08T01:00:00Z").toISOString(),
      home_score: 1,
      away_score: 3,
      status: "finished",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      odds_locked_at: now.toISOString(),
      home_team: {
        id: 20003,
        name: "Los Angeles Kings",
      },
      away_team: {
        id: 20004,
        name: "Seattle Kraken",
      },
      league: {
        id: 620,
        name: "NHL",
        country: {
          id: 2,
          name: "USA",
        },
      },
      odds: [
        createOdd({
          id: 111,
          fixtureId: 2002,
          marketId: 301,
          outcomeId: 111,
          opening: 1.80,
          closing: 1.75,
          isWinner: false,
          marketName: "Moneyline",
          outcomeName: "1",
        }),
        createOdd({
          id: 112,
          fixtureId: 2002,
          marketId: 301,
          outcomeId: 112,
          opening: 2.05,
          closing: 2.10,
          isWinner: true,
          marketName: "Moneyline",
          outcomeName: "2",
        }),
        createOdd({
          id: 113,
          fixtureId: 2002,
          marketId: 402,
          outcomeId: 113,
          opening: 1.90,
          closing: 1.95,
          isWinner: false,
          marketName: "Over 6.5",
          marketDescription: "OVER",
          outcomeName: "O65",
        }),
        createOdd({
          id: 114,
          fixtureId: 2002,
          marketId: 402,
          outcomeId: 114,
          opening: 1.90,
          closing: 1.85,
          isWinner: true,
          marketName: "Over 6.5",
          marketDescription: "UNDER",
          outcomeName: "U65",
        }),
      ],
    },
  ],
  tennis: [
    {
      id: 3001,
      oddspapi_id: "demo-tennis-1",
      sport_id: 2,
      league_id: 710,
      home_team_id: 30001,
      away_team_id: 30002,
      start_time: new Date("2024-02-15T14:00:00Z").toISOString(),
      home_score: 2,
      away_score: 1,
      status: "finished",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      odds_locked_at: now.toISOString(),
      home_team: {
        id: 30001,
        name: "Carlos Alcaraz",
      },
      away_team: {
        id: 30002,
        name: "Daniil Medvedev",
      },
      league: {
        id: 710,
        name: "Australian Open",
        country: {
          id: 36,
          name: "Australie",
        },
      },
      odds: [
        createOdd({
          id: 201,
          fixtureId: 3001,
          marketId: 601,
          outcomeId: 201,
          opening: 1.95,
          closing: 1.85,
          isWinner: true,
          marketName: "Moneyline",
          outcomeName: "1",
        }),
        createOdd({
          id: 202,
          fixtureId: 3001,
          marketId: 601,
          outcomeId: 202,
          opening: 1.90,
          closing: 1.95,
          isWinner: false,
          marketName: "Moneyline",
          outcomeName: "2",
        }),
        createOdd({
          id: 203,
          fixtureId: 3001,
          marketId: 602,
          outcomeId: 203,
          opening: 2.10,
          closing: 2.00,
          isWinner: true,
          marketName: "Set Handicap",
          outcomeName: "-1.5",
        }),
        createOdd({
          id: 204,
          fixtureId: 3001,
          marketId: 603,
          outcomeId: 204,
          opening: 1.85,
          closing: 1.90,
          isWinner: true,
          marketName: "Total Games 22.5",
          marketDescription: "TOTAL",
          outcomeName: "O225",
        }),
      ],
    },
    {
      id: 3002,
      oddspapi_id: "demo-tennis-2",
      sport_id: 2,
      league_id: 720,
      home_team_id: 30003,
      away_team_id: 30004,
      start_time: new Date("2024-02-18T12:00:00Z").toISOString(),
      home_score: 0,
      away_score: 2,
      status: "finished",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      odds_locked_at: now.toISOString(),
      home_team: {
        id: 30003,
        name: "Aryna Sabalenka",
      },
      away_team: {
        id: 30004,
        name: "Iga Swiatek",
      },
      league: {
        id: 720,
        name: "WTA Doha",
        country: {
          id: 634,
          name: "Qatar",
        },
      },
      odds: [
        createOdd({
          id: 211,
          fixtureId: 3002,
          marketId: 601,
          outcomeId: 211,
          opening: 1.65,
          closing: 1.60,
          isWinner: false,
          marketName: "Moneyline",
          outcomeName: "1",
        }),
        createOdd({
          id: 212,
          fixtureId: 3002,
          marketId: 601,
          outcomeId: 212,
          opening: 2.30,
          closing: 2.40,
          isWinner: true,
          marketName: "Moneyline",
          outcomeName: "2",
        }),
        createOdd({
          id: 213,
          fixtureId: 3002,
          marketId: 603,
          outcomeId: 213,
          opening: 1.92,
          closing: 1.88,
          isWinner: false,
          marketName: "Total Games 20.5",
          marketDescription: "TOTAL",
          outcomeName: "O205",
        }),
        createOdd({
          id: 214,
          fixtureId: 3002,
          marketId: 603,
          outcomeId: 214,
          opening: 1.85,
          closing: 1.82,
          isWinner: true,
          marketName: "Total Games 20.5",
          marketDescription: "TOTAL",
          outcomeName: "U205",
        }),
      ],
    },
  ],
  volleyball: [
    {
      id: 4001,
      oddspapi_id: "demo-volleyball-1",
      sport_id: 34,
      league_id: 810,
      home_team_id: 40001,
      away_team_id: 40002,
      start_time: new Date("2024-02-20T18:00:00Z").toISOString(),
      home_score: 3,
      away_score: 1,
      status: "finished",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      odds_locked_at: now.toISOString(),
      home_team: {
        id: 40001,
        name: "Trentino Volley",
      },
      away_team: {
        id: 40002,
        name: "Perugia",
      },
      league: {
        id: 810,
        name: "SuperLega",
        country: {
          id: 380,
          name: "Italie",
        },
      },
      odds: [
        createOdd({
          id: 301,
          fixtureId: 4001,
          marketId: 701,
          outcomeId: 301,
          opening: 1.70,
          closing: 1.62,
          isWinner: true,
          marketName: "Moneyline",
          outcomeName: "1",
        }),
        createOdd({
          id: 302,
          fixtureId: 4001,
          marketId: 702,
          outcomeId: 302,
          opening: 2.20,
          closing: 2.10,
          isWinner: true,
          marketName: "Set Handicap",
          outcomeName: "-1.5",
        }),
        createOdd({
          id: 303,
          fixtureId: 4001,
          marketId: 703,
          outcomeId: 303,
          opening: 1.95,
          closing: 1.90,
          isWinner: false,
          marketName: "Total Points 150.5",
          marketDescription: "TOTAL",
          outcomeName: "O1505",
        }),
        createOdd({
          id: 304,
          fixtureId: 4001,
          marketId: 703,
          outcomeId: 304,
          opening: 1.85,
          closing: 1.88,
          isWinner: true,
          marketName: "Total Points 150.5",
          marketDescription: "TOTAL",
          outcomeName: "U1505",
        }),
      ],
    },
    {
      id: 4002,
      oddspapi_id: "demo-volleyball-2",
      sport_id: 34,
      league_id: 820,
      home_team_id: 40003,
      away_team_id: 40004,
      start_time: new Date("2024-02-22T20:00:00Z").toISOString(),
      home_score: 2,
      away_score: 3,
      status: "finished",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      odds_locked_at: now.toISOString(),
      home_team: {
        id: 40003,
        name: "Turkish Airlines",
      },
      away_team: {
        id: 40004,
        name: "VakifBank",
      },
      league: {
        id: 820,
        name: "Sultans League",
        country: {
          id: 792,
          name: "Turquie",
        },
      },
      odds: [
        createOdd({
          id: 311,
          fixtureId: 4002,
          marketId: 701,
          outcomeId: 311,
          opening: 2.10,
          closing: 2.20,
          isWinner: false,
          marketName: "Moneyline",
          outcomeName: "1",
        }),
        createOdd({
          id: 312,
          fixtureId: 4002,
          marketId: 701,
          outcomeId: 312,
          opening: 1.75,
          closing: 1.70,
          isWinner: true,
          marketName: "Moneyline",
          outcomeName: "2",
        }),
        createOdd({
          id: 313,
          fixtureId: 4002,
          marketId: 702,
          outcomeId: 313,
          opening: 1.95,
          closing: 1.90,
          isWinner: false,
          marketName: "Set Handicap",
          outcomeName: "+1.5",
        }),
        createOdd({
          id: 314,
          fixtureId: 4002,
          marketId: 703,
          outcomeId: 314,
          opening: 1.92,
          closing: 1.96,
          isWinner: true,
          marketName: "Total Points 155.5",
          marketDescription: "TOTAL",
          outcomeName: "O1555",
        }),
      ],
    },
  ],
};

export function useFixtures(sportSlug: string) {
  const [fixtures, setFixtures] = useState<FixtureWithEnrichedOdds[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);

  useEffect(() => {
    async function fetchFixtures() {
      try {
        setLoading(true);
        const fetchPage = async (pageSizeValue: number) => {
          const params = new URLSearchParams({
            page: "1",
            pageSize: pageSizeValue.toString(),
            sortBy: "start_time",
            sortOrder: "desc",
          });
          const response = await fetch(`/api/fixtures/${sportSlug}?${params.toString()}`, {
            cache: "no-store",
          });
          if (!response.ok) throw new Error("Failed to fetch fixtures");
          return response.json();
        };

        const initialPayload = await fetchPage(1);
        const initialData = extractData(initialPayload);
        const total = initialPayload?.pagination?.total ?? initialData.length;

        let fixturesData = initialData;

        if (total > initialData.length) {
          const fullPayload = await fetchPage(total);
          fixturesData = extractData(fullPayload);
        }

        if (fixturesData.length > 0) {
          setFixtures(fixturesData as FixtureWithEnrichedOdds[]);
          setIsDemoData(false);
          setError(null);
        } else {
          console.warn(`[useFixtures] Réponse vide pour ${sportSlug}. Utilisation données démo.`);
          setFixtures(DEMO_FIXTURES[sportSlug] ?? []);
          setIsDemoData(Boolean(DEMO_FIXTURES[sportSlug]?.length));
        }
      } catch (err) {
        console.warn(
          `[useFixtures] Impossible de récupérer les fixtures ${sportSlug}. Utilisation des données démo.`,
          err
        );
        setError(err instanceof Error ? err.message : "Unknown error");
        setFixtures(DEMO_FIXTURES[sportSlug] ?? []);
        setIsDemoData(Boolean(DEMO_FIXTURES[sportSlug]?.length));
      } finally {
        setLoading(false);
      }
    }

    fetchFixtures();
  }, [sportSlug]);

  return { fixtures, loading, error, isDemoData };
}

function extractData(payload: any) {
  return Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];
}
