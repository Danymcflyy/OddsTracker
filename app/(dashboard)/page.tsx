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
import { getDashboardStats } from "@/lib/db/queries-frontend";

const SPORTS_META = [
  {
    name: "Football",
    slug: "football",
    accent: "bg-emerald-50 text-emerald-600",
    emoji: "⚽",
    description: "Toutes les ligues - The Odds API v4",
    comingSoon: false,
  },
  {
    name: "Tennis",
    slug: "tennis",
    accent: "bg-yellow-50 text-yellow-600",
    emoji: "🎾",
    description: "ATP, WTA, Grand Slams",
    comingSoon: true,
  },
  {
    name: "Hockey",
    slug: "hockey",
    accent: "bg-blue-50 text-blue-600",
    emoji: "🏒",
    description: "NHL et ligues européennes",
    comingSoon: true,
  },
  {
    name: "Handball",
    slug: "handball",
    accent: "bg-orange-50 text-orange-600",
    emoji: "🤾",
    description: "Championnats et coupes",
    comingSoon: true,
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
  comingSoon: boolean;
};

async function fetchSportCards(): Promise<SportCardData[]> {
  const formatter = new Intl.NumberFormat("fr-FR");
  const cards: SportCardData[] = [];

  // Get stats only once for Football
  const stats = await getDashboardStats();

  for (const sport of SPORTS_META) {
    if (sport.comingSoon) {
      // Coming soon sports don't have stats
      cards.push({
        ...sport,
        matches: "-",
        lastSync: "-",
      });
    } else {
      const matches = formatter.format(stats.eventsCount);
      const lastSync = stats.lastSync
        ? formatDateTime(stats.lastSync)
        : "Aucune sync";

      cards.push({
        ...sport,
        matches,
        lastSync,
      });
    }
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
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
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
              The Odds API v4 - Synchronisation automatique des cotes
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Dernière synchronisation :{" "}
            <span className="font-medium text-slate-900">
              {stats.lastSync ? formatDateTime(stats.lastSync) : "Aucune sync"}
            </span>
          </div>
        </div>
      </header>

      {/* API Usage Today */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consommation API aujourd'hui</CardTitle>
          <CardDescription>
            Crédits utilisés sur The Odds API (quota : 5M crédits/mois)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.creditsUsedToday.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">crédits</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Dernier job : {stats.lastSyncJob || 'Aucun'}
          </p>
        </CardContent>
      </Card>

      {/* Sports disponibles */}
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
              ({ emoji, slug, name, matches, accent, description, lastSync, comingSoon }) => {
                const cardContent = (
                  <>
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
                      {comingSoon ? (
                        <div className="flex w-full items-center justify-center">
                          <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500">
                            Coming Soon
                          </span>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </>
                );

                if (comingSoon) {
                  return (
                    <div
                      key={slug}
                      className="group flex flex-col rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-slate-500"
                    >
                      {cardContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                  >
                    {cardContent}
                  </Link>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
