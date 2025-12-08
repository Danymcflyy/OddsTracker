"use client";

import * as React from "react";
import { Loader2, RefreshCw, Settings as SettingsIcon, Shield, Signal, Database, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { FollowedTournamentsMap } from "@/lib/config/tournaments";
import { TournamentSelector } from "@/components/settings/tournament-selector";

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
  const [syncing, setSyncing] = React.useState(false);
  const [syncingSport, setSyncingSport] = React.useState<number | null>(null);
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

  const handleManualSync = async (sportId?: number) => {
    setSyncing(true);
    setSyncingSport(sportId ?? null);
    try {
      const query = sportId ? `?sport=${sportId}` : "";
      const res = await fetch(`/api/sync/manual${query}`, { method: "POST" });
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur inconnue");
      }
      const label = sportId ? data.tournaments.labels[String(sportId)] ?? `Sport ${sportId}` : null;
      alert(
        `✅ Synchronisation réussie${
          label ? ` (${label})` : ""
        } !\n\n${result.message}\n\nFixtures traités: ${result.stats.fixturesProcessed}\nRequêtes API: ${result.stats.requestsUsed}`
      );
      await loadSettings();
    } catch (error) {
      alert(`❌ Synchronisation impossible : ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    } finally {
      setSyncing(false);
      setSyncingSport(null);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoSyncEnabled: form.autoSyncEnabled,
          autoSyncTime: form.autoSyncTime,
          extraSyncEnabled: form.extraSyncEnabled,
          extraSyncTime: form.extraSyncTime,
          followedTournaments: form.followedTournaments,
          closingStrategy: form.closingStrategy,
        }),
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

  const handleTournamentToggle = React.useCallback(
    (sportId: string, tournamentId: number, nextValue: boolean) => {
      setForm((prev) => {
        if (!prev) return prev;
        const current = prev.followedTournaments[sportId] ?? [];
        let nextValues = current;
        if (nextValue && !current.includes(tournamentId)) {
          nextValues = [...current, tournamentId];
        } else if (!nextValue && current.includes(tournamentId)) {
          nextValues = current.filter((id) => id !== tournamentId);
        }
        const nextFollowed = { ...prev.followedTournaments };
        if (nextValues.length) {
          nextFollowed[sportId] = nextValues;
        } else {
          delete nextFollowed[sportId];
        }
        return { ...prev, followedTournaments: nextFollowed };
      });
    },
    []
  );

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
  const lastSyncLabel = data.lastSync ? new Date(data.lastSync).toLocaleString("fr-FR") : "Jamais";
  const selectorSports = Object.entries(data.tournaments.available).map(([sportId, options]) => ({
    sportId,
    sportLabel: data.tournaments.labels[sportId] ?? `Sport ${sportId}`,
    options: options.map((option) => ({
      ...option,
      sportId,
    })),
    selected: form.followedTournaments[sportId] ?? [],
  }));
  const sportButtons = Object.entries(data.tournaments.labels || {});
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
              <SettingsIcon className="h-5 w-5" />
              Synchronisation
            </CardTitle>
            <CardDescription>
              Lancez une sync manuelle ou configurez les horaires automatiques.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Dernière synchronisation</p>
                <p className="text-sm text-muted-foreground">{lastSyncLabel}</p>
              </div>
              <Button className="gap-2" onClick={() => handleManualSync()} disabled={syncing}>
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {syncingSport === null ? "Synchronisation..." : "Sync en cours"}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Sync manuelle
                  </>
                )}
              </Button>
            </div>

            {sportButtons.length > 0 && (
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Sync par sport</p>
                  <p className="text-xs text-muted-foreground">Déclenchez uniquement les championnats sélectionnés pour un sport donné.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sportButtons.map(([sportId, label]) => {
                    const numericId = Number(sportId);
                    const isActive = syncing && syncingSport === numericId;
                    return (
                      <Button
                        key={sportId}
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleManualSync(numericId)}
                        disabled={syncing}
                      >
                        {isActive ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {label}
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            {label}
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sync automatique principale</p>
                  <p className="text-xs text-muted-foreground">Exécution quotidienne</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={form.autoSyncTime}
                    onChange={(event) => updateForm({ autoSyncTime: event.target.value || "06:00" })}
                    className="h-9 rounded-md border px-2 text-sm"
                  />
                  <Switch
                    checked={form.autoSyncEnabled}
                    onCheckedChange={(checked) => updateForm({ autoSyncEnabled: checked })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sync supplémentaire</p>
                  <p className="text-xs text-muted-foreground">Permet une mise à jour en soirée</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={form.extraSyncTime}
                    onChange={(event) => updateForm({ extraSyncTime: event.target.value || "18:00" })}
                    className="h-9 rounded-md border px-2 text-sm"
                  />
                  <Switch
                    checked={form.extraSyncEnabled}
                    onCheckedChange={(checked) => updateForm({ extraSyncEnabled: checked })}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Clôture des cotes</p>
                  <p className="text-xs text-muted-foreground">
                    Choisissez la stratégie utilisée lorsque les matchs sont finalisés.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {strategyOptions.map((option) => {
                    const isActive = form.closingStrategy === option.value;
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        className="justify-start text-left"
                        onClick={() => updateForm({ closingStrategy: option.value })}
                      >
                        <div>
                          <p className="text-sm font-medium">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Signal className="h-5 w-5" />
              Utilisation API OddsPapi
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
          <CardTitle>Championnat suivis</CardTitle>
          <CardDescription>
            Sélectionnez les compétitions pour lesquelles les imports OddsPapi seront exécutés.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TournamentSelector
            sports={selectorSports}
            onToggle={handleTournamentToggle}
          />
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
              {data.syncLogs.map((log) => (
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
