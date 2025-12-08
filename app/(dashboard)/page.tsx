export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdminAvailable, supabase, supabaseAdmin } from "@/lib/db";

const SPORTS_META = [
  {
    sportId: 10,
    name: "Football",
    slug: "football",
    accent: "bg-emerald-50 text-emerald-600",
    emoji: "⚽",
    description: "Toutes les ligues Pinnacle depuis 2019",
  },
  {
    sportId: 4,
    name: "Hockey",
    slug: "hockey",
    accent: "bg-sky-50 text-sky-600",
    emoji: "🏒",
    description: "Lignes Moneyline & puck line",
  },
  {
    sportId: 2,
    name: "Tennis",
    slug: "tennis",
    accent: "bg-amber-50 text-amber-600",
    emoji: "🎾",
    description: "ATP, WTA et tournois majeurs",
  },
  {
    sportId: 34,
    name: "Volleyball",
    slug: "volleyball",
    accent: "bg-purple-50 text-purple-600",
    emoji: "🏐",
    description: "Cotes Moneyline & handicaps sets",
  },
] as const;

type SportCardData = {
  name: string;
  slug: string;
  accent: string;
  emoji: string;
  description: string;
  matches: string;
  lastSync: string;
};

type SyncLogRow = {
  completed_at: string | null;
  started_at: string | null;
};

async function fetchSportCards(): Promise<SportCardData[]> {
  const client = isAdminAvailable() ? supabaseAdmin : supabase;
  const formatter = new Intl.NumberFormat("fr-FR");

  const cards: SportCardData[] = [];
  for (const sport of SPORTS_META) {
    const fixturesQuery = client
      .from("fixtures")
      .select("id", { count: "exact", head: true })
      .eq("sport_id", sport.sportId);

    const logQuery = client
      .from("sync_logs")
      .select<SyncLogRow>("completed_at, started_at")
      .eq("sport_id", sport.sportId)
      .order("started_at", { ascending: false })
      .limit(1);

    const [{ count, error: fixturesError }, { data: logData, error: logError }] =
      await Promise.all([fixturesQuery, logQuery]);

    if (fixturesError) {
      console.error("[dashboard] fixtures count error", fixturesError);
    }
    if (logError) {
      console.error("[dashboard] sync log error", logError);
    }

    const matches = formatter.format(count ?? 0);

    const lastLog = logData && logData.length > 0 ? logData[0] : null;
    const lastTimestamp =
      lastLog?.completed_at ?? lastLog?.started_at ?? null;
    const lastSync = lastTimestamp
      ? formatDateTime(lastTimestamp)
      : "Aucune sync";

    cards.push({
      ...sport,
      matches,
      lastSync,
    });
  }

  return cards;
}

function formatDateTime(value: string) {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      return "Aucune sync";
    }
    const formatted = date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return formatted.replace(",", " •");
  } catch {
    return "Aucune sync";
  }
}

export default async function DashboardHomePage() {
  const sportCards = await fetchSportCards();

  return (
    <div className="space-y-8">
      {/* Header - même structure que Hockey */}
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/70">
          Tableau de bord
        </p>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              📊 Vue d'ensemble
            </h1>
            <p className="text-sm text-muted-foreground">
              État des synchronisations, quota API et accès rapide aux sports.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Dernière synchronisation :{" "}
            <span className="font-medium text-slate-900">
              04/12/2025 • 06:02
            </span>
          </div>
        </div>
      </header>

      {/* État global - même structure que Card Filtres de Hockey */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">État global</CardTitle>
          <CardDescription>
            Synchronisation, quota API et état du système
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Grid simple sans cartes internes */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Dernière sync */}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dernière sync
              </p>
              <p className="text-2xl font-semibold text-slate-900">
                04/12/2025 • 06:02
              </p>
              <p className="text-sm text-muted-foreground">
                Football synchronisé en dernier
              </p>
            </div>

            {/* Quota API */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Quota API
                </p>
                <span className="text-xs font-semibold text-primary">
                  1 234 / 5 000
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: "24%" }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  24% utilisé • Reset le 01/01/2026
                </p>
              </div>
            </div>

            {/* Statut système */}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Statut système
              </p>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-slate-900">
                  Opérationnel
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tous les services fonctionnent normalement
              </p>
            </div>
          </div>

          {/* Alerte démo */}
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">
              <span className="font-medium">Mode démo :</span> Les données
              affichées sont des exemples. Configurez Supabase et OddsPapi pour
              utiliser des données réelles.{" "}
              <Link
                href="/settings"
                className="font-semibold underline underline-offset-2"
              >
                Ouvrir les paramètres →
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sports disponibles - même structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sports disponibles</CardTitle>
          <CardDescription>
            Sélectionnez un sport pour consulter et filtrer les cotes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {sportCards.map(
              ({ emoji, slug, name, matches, accent, description, lastSync }) => (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${accent}`}
                    >
                      <span role="img" aria-hidden="true">
                        {emoji}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Matchs disponibles
                      </p>
                      <p className="text-3xl font-semibold text-slate-900">
                        {matches}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sync : {lastSync}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary transition group-hover:gap-3">
                      Explorer
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
