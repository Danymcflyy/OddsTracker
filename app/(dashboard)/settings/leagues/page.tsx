"use client";

import * as React from "react";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface League {
  id: string;
  name: string;
  display_name: string;
  country_id: string;
  country_name: string;
  tracked: boolean;
}

export default function LeaguesV3Page() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [leagues, setLeagues] = React.useState<League[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  const loadLeagues = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v3/settings/leagues?sport=football');
      const result = await response.json();

      if (result.success) {
        setLeagues(result.data);
      } else {
        alert(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erreur lors du chargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadLeagues();
  }, [loadLeagues]);

  const handleToggle = async (leagueId: string, currentValue: boolean) => {
    setSaving(leagueId);
    try {
      const response = await fetch(`/api/v3/settings/leagues/${leagueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracked: !currentValue }),
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour localement
        setLeagues(prev =>
          prev.map(league =>
            league.id === leagueId
              ? { ...league, tracked: !currentValue }
              : league
          )
        );
      } else {
        alert(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Chargement des ligues...
      </div>
    );
  }

  // Filtrer les ligues selon le terme de recherche
  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.country_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grouper par pays
  const leaguesByCountry = filteredLeagues.reduce((acc, league) => {
    const country = league.country_name;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(league);
    return acc;
  }, {} as Record<string, League[]>);

  const trackedCount = leagues.filter(l => l.tracked).length;
  const totalCount = leagues.length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Réglages V3</p>
        <h1 className="text-3xl font-semibold text-slate-900">⚽ Ligues suivies</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Activez ou désactivez les ligues pour lesquelles vous souhaitez importer les matchs et cotes.
          <br />
          <span className="font-medium">{trackedCount} / {totalCount} ligues actives</span>
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Recherche</CardTitle>
          <CardDescription>Filtrez les ligues par nom ou pays</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Rechercher une ligue ou un pays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {Object.keys(leaguesByCountry).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune ligue trouvée pour "{searchTerm}"
          </CardContent>
        </Card>
      ) : (
        Object.entries(leaguesByCountry)
          .sort(([countryA], [countryB]) => countryA.localeCompare(countryB))
          .map(([country, countryLeagues]) => (
            <Card key={country}>
              <CardHeader>
                <CardTitle className="text-lg">{country}</CardTitle>
                <CardDescription>
                  {countryLeagues.filter(l => l.tracked).length} / {countryLeagues.length} ligues actives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {countryLeagues
                    .sort((a, b) => a.display_name.localeCompare(b.display_name))
                    .map((league) => {
                      const isSaving = saving === league.id;

                      return (
                        <div
                          key={league.id}
                          className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {league.display_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {league.name}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {league.tracked ? (
                              <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                                <Check className="h-4 w-4" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                                <X className="h-4 w-4" />
                                Inactive
                              </span>
                            )}

                            <Switch
                              checked={league.tracked}
                              onCheckedChange={() => handleToggle(league.id, league.tracked)}
                              disabled={isSaving}
                            />

                            {isSaving && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );
}
