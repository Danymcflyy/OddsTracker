'use client';

/**
 * Page de Réglages de Collecte de Données
 * Configuration: sports suivis, marchés, fréquence de scan, fallback historique
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { formatLeagueTitle } from '@/lib/utils';
import { MARKET_NAMES, MVP_MARKETS, MARKET_GROUPS } from '@/lib/api/theoddsapi/constants';

interface Sport {
  id: string;
  api_key: string;
  title: string;
  description: string | null;
}

interface Settings {
  tracked_sports: string[];
  tracked_markets: string[];
}

export default function DataCollectionSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [settings, setSettings] = useState<Settings>({
    tracked_sports: [],
    tracked_markets: [],
  });

  // Load sports and settings
  useEffect(() => {
    async function loadData() {
      try {
        // Load sports
        const sportsRes = await fetch('/api/v4/sports');
        const sportsData = await sportsRes.json();

        if (sportsData.success && Array.isArray(sportsData.data)) {
          setSports(sportsData.data);
        }

        // Load settings
        const settingsRes = await fetch('/api/v4/settings');
        const settingsData = await settingsRes.json();

        if (settingsData.success && settingsData.settings) {
          setSettings({
            tracked_sports: settingsData.settings.tracked_sports || [],
            tracked_markets: settingsData.settings.tracked_markets || MVP_MARKETS,
          });
        }
      } catch (error) {
        console.error('Échec du chargement:', error);
        toast({
          title: 'Erreur',
          description: 'Échec du chargement des réglages',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [toast]);

  // Toggle sport tracking
  const toggleSport = (sportKey: string) => {
    setSettings((prev) => ({
      ...prev,
      tracked_sports: prev.tracked_sports.includes(sportKey)
        ? prev.tracked_sports.filter((s) => s !== sportKey)
        : [...prev.tracked_sports, sportKey],
    }));
  };

  // Toggle market tracking
  const toggleMarket = (marketKey: string) => {
    setSettings((prev) => ({
      ...prev,
      tracked_markets: prev.tracked_markets.includes(marketKey)
        ? prev.tracked_markets.filter((m) => m !== marketKey)
        : [...prev.tracked_markets, marketKey],
    }));
  };

  // Save settings
  const saveSettings = async () => {
    setSaving(true);

    try {
      // Update each setting
      const updates = [
        { key: 'tracked_sports', value: settings.tracked_sports },
        { key: 'tracked_markets', value: settings.tracked_markets },
      ];

      let totalMarketsAdded = 0;
      let totalEventsUpdated = 0;

      for (const update of updates) {
        const res = await fetch('/api/v4/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(`Failed to update ${update.key}`);
        }

        // Capture sync results for tracked_markets
        if (update.key === 'tracked_markets' && data.syncResult) {
          totalMarketsAdded = data.syncResult.marketsAdded || 0;
          totalEventsUpdated = data.syncResult.eventsUpdated || 0;
        }
      }

      // Show appropriate message based on sync result
      if (totalMarketsAdded > 0) {
        toast({
          title: 'Succès',
          description: `Réglages sauvegardés. ${totalMarketsAdded} marchés ajoutés à ${totalEventsUpdated} événements.`,
        });
      } else {
        toast({
          title: 'Succès',
          description: 'Réglages sauvegardés avec succès',
        });
      }
    } catch (error) {
      console.error('Échec de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la sauvegarde des réglages',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Réglages de Collecte de Données</h1>
        <p className="text-muted-foreground">
          Configurez quels sports, marchés et fréquences suivre
        </p>
      </div>

      {/* Tracked Sports */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Sports Suivis</CardTitle>
          <CardDescription>
            Sélectionnez quelles ligues de football suivre. Les événements seront découverts automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(sports || []).map((sport) => (
              <div key={sport.id} className="flex items-center space-x-2">
                <Checkbox
                  id={sport.api_key}
                  checked={(settings.tracked_sports || []).includes(sport.api_key)}
                  onCheckedChange={() => toggleSport(sport.api_key)}
                />
                <Label htmlFor={sport.api_key} className="cursor-pointer">
                  {formatLeagueTitle(sport.title)}
                </Label>
              </div>
            ))}
          </div>

          {sports.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun sport disponible. Lancez le workflow sync-events pour découvrir les sports.
            </p>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            Sélectionnés: {settings.tracked_sports.length} sports
          </p>
        </CardContent>
      </Card>

      {/* Tracked Markets */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Marchés Suivis</CardTitle>
          <CardDescription>
            Sélectionnez quels marchés de paris suivre. Note: Les marchés alternatifs coûtent 3 crédits par requête.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(MARKET_GROUPS).map(([groupKey, group]) => (
            <div key={groupKey}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">{group.name}</h3>
                <span className="text-xs text-muted-foreground">{group.cost}</span>
              </div>
              {'availability' in group && group.availability && (
                <p className="text-xs text-orange-600 mb-2">⚠️ {group.availability}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.markets.map((marketKey) => (
                  <div key={marketKey} className="flex items-center space-x-2">
                    <Checkbox
                      id={marketKey}
                      checked={settings.tracked_markets.includes(marketKey)}
                      onCheckedChange={() => toggleMarket(marketKey)}
                    />
                    <Label htmlFor={marketKey} className="cursor-pointer text-sm">
                      {MARKET_NAMES[marketKey as keyof typeof MARKET_NAMES]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground">
              Sélectionnés: {settings.tracked_markets.length} marchés
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Conseil: Commencez avec les marchés principaux (h2h, totals, btts) avant d'ajouter les alternatifs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer les Réglages
        </Button>
      </div>
    </div>
  );
}
