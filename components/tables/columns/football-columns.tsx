"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";

import { FOOTBALL_TOTAL_LINES } from "@/lib/config/markets";
import { cn } from "@/lib/utils";
import type { FixtureWithEnrichedOdds, OddWithDetails } from "@/types/fixture";
import type { Market } from "@/hooks/use-markets";

type FootballTableRow = FixtureWithEnrichedOdds;

interface FootballOddsDefinition {
  id: string;
  label: string;
  matcher: (odd: OddWithDetails) => boolean;
}

const MATCH_RESULT_CODES = [
  { code: "1", label: "1 (Home Win)" },
  { code: "X", label: "X (Draw)" },
  { code: "2", label: "2 (Away Win)" },
] as const;
const OVER_UNDER_LINES = FOOTBALL_TOTAL_LINES.map((line) =>
  line % 1 === 0 ? line.toFixed(0) : line.toFixed(1)
);
const ASIAN_HANDICAP_CODES = [
  { id: "AH-H", label: "AH Home", token: "HOME" },
  { id: "AH-A", label: "AH Away", token: "AWAY" },
] as const;

const MATCH_RESULT_DEFINITIONS: FootballOddsDefinition[] = MATCH_RESULT_CODES.map(
  ({ code, label }) => ({
    id: code,
    label,
    matcher: (odd: OddWithDetails) =>
      matchesMarketToken(odd, "1X2") && matchesOutcomeToken(odd, code),
  })
);

const OVER_UNDER_DEFINITIONS: FootballOddsDefinition[] = OVER_UNDER_LINES.flatMap((line) => {
  const overCode = `O${line}`;
  const underCode = `U${line}`;
  const normalizedOver = overCode.replace(".", "");
  const normalizedUnder = underCode.replace(".", "");
  return [
    {
      id: overCode,
      label: `Over ${line}`,
      matcher: (odd: OddWithDetails) =>
        matchesMarketToken(odd, "TOTAL") && matchesOutcomeToken(odd, normalizedOver),
    },
    {
      id: underCode,
      label: `Under ${line}`,
      matcher: (odd: OddWithDetails) =>
        matchesMarketToken(odd, "TOTAL") && matchesOutcomeToken(odd, normalizedUnder),
    },
  ];
});

const ASIAN_HANDICAP_DEFINITIONS: FootballOddsDefinition[] = ASIAN_HANDICAP_CODES.map(
  ({ id, label, token }) => ({
    id,
    label,
    matcher: (odd: OddWithDetails) =>
      matchesMarketToken(odd, "ASIANHANDICAP") && matchesOutcomeToken(odd, token),
  })
);

const FOOTBALL_ODDS_DEFINITIONS: FootballOddsDefinition[] = [
  ...MATCH_RESULT_DEFINITIONS,
  ...OVER_UNDER_DEFINITIONS,
  ...ASIAN_HANDICAP_DEFINITIONS,
];

/**
 * Crée les définitions d'odds dynamiquement depuis les marchés en DB
 */
function createOddsDefinitionsFromMarkets(markets: Market[]): FootballOddsDefinition[] {
  const definitionsMap = new Map<string, FootballOddsDefinition>();

  for (const market of markets) {
    const marketType = market.market_type.toLowerCase();
    const period = market.period;
    const periodSuffix = period === "p1" ? " (HT)" : ""; // p1 = first half

    for (const outcome of market.outcomes) {
      const def = buildDefinitionForOutcome(market, outcome, periodSuffix);
      if (def) {
        // Utiliser l'ID comme clé pour dédupliquer
        definitionsMap.set(def.id, def);
      }
    }
  }

  return Array.from(definitionsMap.values());
}

function buildDefinitionForOutcome(
  market: Market,
  outcome: { id: number; oddspapi_id: number; name: string; description: string | null },
  periodSuffix: string
): FootballOddsDefinition | null {
  const marketType = market.market_type.toLowerCase();
  const handicap = market.handicap;

  // 1X2 markets
  if (marketType === "1x2") {
    return {
      id: outcome.name + periodSuffix.replace(/\s/g, ""),
      label: `${outcome.name} ${outcome.description || ""}${periodSuffix}`.trim(),
      matcher: (odd: OddWithDetails) =>
        matchesMarketToken(odd, "1X2") && matchesOutcomeToken(odd, outcome.name),
    };
  }

  // Totals markets
  if (marketType === "totals" && handicap !== null) {
    const line = formatLine(handicap);
    const isOver =
      outcome.name.toUpperCase().includes("OVER") || outcome.name.toUpperCase().startsWith("O");
    const code = isOver ? `O${line}` : `U${line}`;
    const label = `${isOver ? "Over" : "Under"} ${line}${periodSuffix}`;

    return {
      id: code.replace(".", "") + periodSuffix.replace(/\s/g, ""),
      label,
      matcher: (odd: OddWithDetails) =>
        matchesMarketToken(odd, "TOTAL") && matchesOutcomeToken(odd, code.replace(".", "")),
    };
  }

  // Spreads markets (Asian Handicap)
  if (marketType === "spreads" && handicap !== null) {
    const line = formatLine(handicap);
    const isHome = outcome.name.toUpperCase().includes("HOME") || outcome.name === "1";
    const sign = handicap > 0 ? "+" : "";
    const id = `AH${sign}${line}${isHome ? "H" : "A"}` + periodSuffix.replace(/\s/g, "");
    const label = `AH ${sign}${line} ${isHome ? "Home" : "Away"}${periodSuffix}`;

    // Capturer le handicap pour la closure
    const targetHandicap = handicap;
    const targetPeriod = market.period;

    return {
      id,
      label,
      matcher: (odd: OddWithDetails) => {
        // Vérifier que c'est un marché Asian Handicap/Spreads
        if (!matchesMarketToken(odd, "ASIANHANDICAP") && !matchesMarketToken(odd, "SPREAD")) {
          return false;
        }

        // Vérifier la période
        if (odd.market?.period !== targetPeriod) {
          return false;
        }

        // Vérifier le handicap numérique (tolérance pour les arrondis)
        const oddHandicap = odd.market?.handicap;
        if (oddHandicap === null || oddHandicap === undefined) {
          return false;
        }
        if (Math.abs(oddHandicap - targetHandicap) > 0.001) {
          return false;
        }

        // Vérifier si c'est Home ou Away
        return matchesOutcomeToken(odd, isHome ? "HOME" : "AWAY");
      },
    };
  }

  return null;
}

function formatLine(value: number): string {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

/**
 * Fonction factory qui crée les colonnes dynamiquement
 */
export function createFootballColumns(markets?: Market[]): ColumnDef<FootballTableRow>[] {
  const oddsDefinitions =
    markets && markets.length > 0
      ? createOddsDefinitionsFromMarkets(markets)
      : FOOTBALL_ODDS_DEFINITIONS;

  return [
    ...getStaticColumns(),
    ...createOddsColumns(oddsDefinitions),
  ];
}

/**
 * Export pour compatibilité - utilise les définitions hardcodées
 */
export const footballColumns = createFootballColumns();

function getStaticColumns(): ColumnDef<FootballTableRow>[] {
  return [
    {
      accessorKey: "start_time",
      header: "Date",
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return (
          <div className="font-medium">
            {value ? format(new Date(value), "dd MMM yyyy HH:mm", { locale: fr }) : "-"}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: "country",
      header: "Pays",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.league?.country?.name ?? "-"}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "league",
      header: "Ligue",
      cell: ({ row }) => <div className="font-medium">{row.original.league?.name ?? "-"}</div>,
      enableSorting: true,
    },
    {
      accessorKey: "home_team.name",
      header: "Home",
      cell: ({ row }) => (
        <div className="font-semibold text-slate-900">{row.original.home_team?.name ?? "-"}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "away_team.name",
      header: "Away",
      cell: ({ row }) => (
        <div className="font-semibold text-slate-900">{row.original.away_team?.name ?? "-"}</div>
      ),
      enableSorting: true,
    },
    {
      id: "home_score",
      header: () => <div className="text-center">Score Home</div>,
      cell: ({ row }) => {
        const value = row.original.home_score;
        return (
          <div className={cn("rounded-md px-2 py-1 text-center text-sm font-semibold", scoreVariant(row.original, "home"))}>
            {value ?? "-"}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: "away_score",
      header: () => <div className="text-center">Score Away</div>,
      cell: ({ row }) => {
        const value = row.original.away_score;
        return (
          <div className={cn("rounded-md px-2 py-1 text-center text-sm font-semibold", scoreVariant(row.original, "away"))}>
            {value ?? "-"}
          </div>
        );
      },
      enableSorting: true,
    },
  ];
}

function createOddsColumns(definitions: FootballOddsDefinition[]): ColumnDef<FootballTableRow>[] {
  return definitions.flatMap((definition) => [
    buildOddsColumn(definition, "opening"),
    buildOddsColumn(definition, "closing"),
  ]);
}

function buildOddsColumn(
  definition: FootballOddsDefinition,
  priceType: "opening" | "closing"
): ColumnDef<FootballTableRow> {
  const suffix = priceType === "opening" ? "Open" : "Close";
  return {
    id: `${definition.id}-${suffix}`,
    header: `${definition.label}-${suffix}`,
    cell: ({ row }) => {
      const odd = findOdd(row.original, definition.matcher);
      const value =
        priceType === "opening" ? odd?.opening_price : odd?.closing_price;
      const isWinner = odd?.is_winner === true;
      const isLoser = odd?.is_winner === false;
      const isAsianHandicap = definition.id.startsWith("AH-");
      const handicapLabel = isAsianHandicap ? extractHandicapLabel(odd) : null;

      return (
        <div className="space-y-0.5">
          <div
            className={cn(
              "rounded-md px-2 py-1 text-right font-mono text-sm",
              isWinner && "bg-emerald-50 text-emerald-700 font-semibold",
              isLoser && "bg-rose-50 text-rose-700"
            )}
          >
            {value !== null && value !== undefined ? value.toFixed(2) : "-"}
          </div>
          {handicapLabel && (
            <p className="text-right text-[11px] text-muted-foreground">
              {handicapLabel}
            </p>
          )}
        </div>
      );
    },
    enableSorting: true,
  };
}

function findOdd(
  row: FootballTableRow,
  matcher: (odd: OddWithDetails) => boolean
): OddWithDetails | undefined {
  return row.odds?.find(matcher);
}

function matchesOutcomeToken(odd: OddWithDetails, token: string) {
  const normalizedToken = normalizeToken(token);
  const outcomeName = normalizeToken(odd.outcome?.name);
  const outcomeDescription = normalizeToken(odd.outcome?.description ?? "");

  return (
    outcomeName.includes(normalizedToken) ||
    outcomeDescription.includes(normalizedToken)
  );
}

function matchesMarketToken(odd: OddWithDetails, token: string) {
  const normalizedToken = normalizeToken(token);
  const marketName = normalizeToken(odd.market?.name ?? "");
  const marketDescription = normalizeToken(odd.market?.description ?? "");
  return (
    marketName.includes(normalizedToken) ||
    marketDescription.includes(normalizedToken)
  );
}

function normalizeToken(value?: string | null) {
  return value
    ? value.replace(/[^\w]/g, "").toUpperCase()
    : "";
}

function extractHandicapLabel(odd?: OddWithDetails) {
  if (!odd?.market?.name) return null;
  const match = odd.market.name.match(/-?\d+(\.\d+)?/);
  return match ? `Ligne ${match[0]}` : null;
}

function scoreVariant(row: FootballTableRow, team: "home" | "away") {
  const home = row.home_score;
  const away = row.away_score;

  if (home === null || home === undefined || away === null || away === undefined) {
    return "bg-slate-50 text-slate-500";
  }

  if (home === away) {
    return "bg-slate-100 text-slate-700";
  }

  const isWinner = (team === "home" ? home > away : away > home);
  return isWinner ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
}
