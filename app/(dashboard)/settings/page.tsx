"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Shield, Signal, Database, Check, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { FollowedTournamentsMap } from "@/lib/config/tournaments";

interface TournamentOption {
  sportId: number;
  tournamentId: number;
  name: string;
  country: string;
  slug: string;
}

interface SettingsResponse {
  lastSync: string | null;
  autoSyncEnabled: boolean;
  autoSyncTime: string;
  extraSyncEnabled: boolean;
  extraSyncTime: string;
  closingStrategy: "historical" | "tournament";
  oddsApiKeyPreview: string | null;
  oddsApiKeyManagedByEnv: boolean;
  apiUsage: {
    used: number;
    limit: number;
    resetDate: string | null;
  };
  syncLogs: {
    id: number;
    date: string | null;
    sport: string;
    status: string;
    details: string;
  }[];
  tournaments: {
    available: Record<string, TournamentOption[]>;
    labels: Record<string, string>;
  };
  followedTournaments: FollowedTournamentsMap;
}

interface FormState {
  autoSyncEnabled: boolean;
  autoSyncTime: string;
  extraSyncEnabled: boolean;
  extraSyncTime: string;
  followedTournaments: FollowedTournamentsMap;
  closingStrategy: "historical" | "tournament";
  oddsApiKeyInput: string;
  oddsApiKeyShouldClear: boolean;
}

async function fetchSettingsData(): Promise<SettingsResponse> {
  const response = await fetch("/api/settings");
  if (!response.ok) {
    throw new Error("Impossible de charger les réglages");
  }
  return response.json();
}

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [data, setData] = React.useState<SettingsResponse | null>(null);
  const [form, setForm] = React.useState<FormState | null>(null);

  const loadSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchSettingsData();
      setData(result);
      setForm({
        autoSyncEnabled: result.autoSyncEnabled,
        autoSyncTime: result.autoSyncTime,
        extraSyncEnabled: result.extraSyncEnabled,
        extraSyncTime: result.extraSyncTime,
        followedTournaments: result.followedTournaments,
        closingStrategy: result.closingStrategy,
        oddsApiKeyInput: "",
        oddsApiKeyShouldClear: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateForm = (patch: Partial<FormState>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        autoSyncEnabled: form.autoSyncEnabled,
        autoSyncTime: form.autoSyncTime,
        extraSyncEnabled: form.extraSyncEnabled,
        extraSyncTime: form.extraSyncTime,
        followedTournaments: form.followedTournaments,
        closingStrategy: form.closingStrategy,
      };

      if (!data?.oddsApiKeyManagedByEnv) {
        payload.oddsApiKey = form.oddsApiKeyShouldClear
          ? ""
          : form.oddsApiKeyInput.trim() !== ""
            ? form.oddsApiKeyInput.trim()
            : undefined;
      }

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Impossible d'enregistrer les paramètres");
      }

      alert("✅ Paramètres enregistrés");
      await loadSettings();
    } catch (error) {
      alert(`❌ Enregistrement impossible : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data || !form) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Chargement des paramètres...
      </div>
    );
  }

  const apiUsagePercent = Math.min(
    100,
    Math.round((data.apiUsage.used / data.apiUsage.limit) * 100) || 0
  );
  const oddsApiKeyPreview = data.oddsApiKeyPreview ?? null;
  const oddsApiKeyManagedByEnv = data.oddsApiKeyManagedByEnv;
  const FOOTBALL_SPORT_ID = "10";
  const strategyOptions: Array<{
    value: "historical" | "tournament";
    label: string;
    description: string;
  }> = [
    {
      value: "historical",
      label: "Option A · Historical odds",
      description: "Ouverture & fermeture basées sur /v4/historical-odds (le plus précis).",
    },
    {
      value: "tournament",
      label: "Option B · Odds by tournaments",
      description: "Ferme les matchs terminés avec /v4/odds-by-tournaments (moins de requêtes).",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Réglages</p>
          <h1 className="text-3xl font-semibold text-slate-900">⚙️ Paramètres</h1>
          <p className="text-sm text-muted-foreground">
            Gérez la synchronisation des données, le quota API et les réglages de sécurité.
          </p>
        </div>
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Enregistrer
            </>
          )}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Signal className="h-5 w-5" />
              Utilisation API Odds-API.io
            </CardTitle>
            <CardDescription>Surveillez le quota mensuel et la prochaine réinitialisation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-semibold text-slate-900">
              {data.apiUsage.used.toLocaleString("fr-FR")} / {data.apiUsage.limit.toLocaleString("fr-FR")}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Réinitialisation le {data.apiUsage.resetDate ?? "—"}
            </p>
            <div className="w-full rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-primary transition-all"
                style={{ width: `${apiUsagePercent}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {apiUsagePercent}% du quota consommé
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5" />
            Clé API Odds-API.io
          </CardTitle>
          <CardDescription>Mettre à jour la clé utilisée par les imports (serveur + Vercel).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Clé enregistrée</p>
            <p className="text-sm text-muted-foreground">
              {oddsApiKeyPreview ? oddsApiKeyPreview : "Aucune clé sauvegardée"}
            </p>
            {oddsApiKeyManagedByEnv && (
              <p className="text-xs text-muted-foreground">
                Clé gérée via l&apos;environnement (`ODDS_API_IO_KEY`) et masquée pour la sécurité.
              </p>
            )}
          </div>
          {!oddsApiKeyManagedByEnv && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nouvelle clé</Label>
                <Input
                  type="password"
                  value={form.oddsApiKeyInput}
                  onChange={(event) =>
                    updateForm({
                      oddsApiKeyInput: event.target.value,
                      oddsApiKeyShouldClear: false,
                    })
                  }
                  placeholder="pk_live_XXXXXXXX"
                  disabled={form.oddsApiKeyShouldClear}
                />
                <p className="text-xs text-muted-foreground">
                  Laissez vide pour conserver la clé actuelle. Entrez une nouvelle valeur pour la remplacer.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {form.oddsApiKeyShouldClear ? (
                  <>
                    <p className="text-sm text-rose-600 font-medium">La clé sera supprimée lors de l&apos;enregistrement.</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateForm({ oddsApiKeyShouldClear: false })}
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateForm({ oddsApiKeyShouldClear: true, oddsApiKeyInput: "" })}
                  >
                    Supprimer la clé
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle>Championnats suivis</CardTitle>
          <CardDescription>
            Gérez la liste complète depuis l’assistant dédié.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/settings/leagues">Ouvrir la configuration avancée</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>Mettez à jour le mot de passe de l’application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Mot de passe actuel</Label>
              <Input type="password" placeholder="••••••••" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium">Nouveau mot de passe</Label>
              <Input type="password" placeholder="Minimum 8 caractères" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium">Confirmation</Label>
              <Input type="password" placeholder="Confirmez le mot de passe" className="mt-1" />
            </div>
            <Button className="w-full">Mettre à jour</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Logs de synchronisation
            </CardTitle>
            <CardDescription>Historique des dernières synchronisations par sport.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {data.syncLogs
                .filter((log) => log.sport === (data.tournaments.labels?.[FOOTBALL_SPORT_ID] ?? "Football"))
                .map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{log.sport}</p>
                      <p className="text-xs text-muted-foreground">{log.date}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-xs font-medium",
                          log.status === "success" ? "text-emerald-600" : "text-rose-600"
                        )}
                      >
                        {log.status === "success" ? "✅ OK" : "⚠️ Erreur"}
                      </p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
