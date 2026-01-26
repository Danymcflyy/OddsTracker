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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
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
  scan_frequency_minutes: number;
  use_historical_fallback: boolean;
  use_sql_search: boolean;
}

export default function DataCollectionSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [settings, setSettings] = useState<Settings>({
    tracked_sports: [],
    tracked_markets: [],
    scan_frequency_minutes: 10,
    use_historical_fallback: false,
    use_sql_search: false,
  });

  // Load sports and settings
  useEffect(() => {
    async function loadData() {
      try {
        // Load sports
        const sportsRes = await fetch('/api/v4/sports');
        const sportsData = await sportsRes.json();

        if (sportsData.success && Array.isArray(sportsData.sports)) {
          setSports(sportsData.sports);
        }

        // Load settings
        const settingsRes = await fetch('/api/v4/settings');
        const settingsData = await settingsRes.json();

        if (settingsData.success && settingsData.settings) {
          setSettings({
            tracked_sports: settingsData.settings.tracked_sports || [],
            tracked_markets: settingsData.settings.tracked_markets || MVP_MARKETS,
            scan_frequency_minutes: settingsData.settings.scan_frequency_minutes || 10,
            use_historical_fallback: settingsData.settings.use_historical_fallback || false,
            use_sql_search: settingsData.settings.use_sql_search || false,
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
        { key: 'scan_frequency_minutes', value: settings.scan_frequency_minutes },
        { key: 'use_historical_fallback', value: settings.use_historical_fallback },
        { key: 'use_sql_search', value: settings.use_sql_search },
      ];

      for (const update of updates) {
        const res = await fetch('/api/v4/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(`Failed to update ${update.key}`);
        }
      }

      toast({
        title: 'Succès',
        description: 'Réglages sauvegardés avec succès',
      });
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
                  {sport.title}
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

      {/* Scan Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>⏱️ Fréquence de Scan</CardTitle>
          <CardDescription>
            Fréquence de vérification des cotes d'ouverture (actuellement fixée à 10 minutes via GitHub Actions)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            disabled
            value={settings.scan_frequency_minutes.toString()}
            onValueChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                scan_frequency_minutes: parseInt(value),
              }))
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="freq-5" disabled />
              <Label htmlFor="freq-5" className="cursor-not-allowed opacity-50">
                5 minutes (très réactif, plus d'usage GitHub Actions)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10" id="freq-10" disabled />
              <Label htmlFor="freq-10" className="cursor-not-allowed opacity-50">
                10 minutes (recommandé) ✓ Actuellement configuré
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="15" id="freq-15" disabled />
              <Label htmlFor="freq-15" className="cursor-not-allowed opacity-50">
                15 minutes (modéré)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30" id="freq-30" disabled />
              <Label htmlFor="freq-30" className="cursor-not-allowed opacity-50">
                30 minutes (économique)
              </Label>
            </div>
          </RadioGroup>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="text-muted-foreground">
              ℹ️ <strong>Note:</strong> La fréquence est actuellement codée en dur dans le workflow GitHub Actions (cron: <code className="bg-background px-1">2-59/10</code>).
              Pour la rendre dynamique, il faudrait utiliser un service de cron externe (payant) au lieu de GitHub Actions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Options Avancées</CardTitle>
          <CardDescription>Paramètres additionnels pour la collecte de données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="historical-fallback">Utiliser l'API Historique en Fallback</Label>
              <p className="text-sm text-muted-foreground">
                Si les closing odds échouent après 3 jours, utiliser l'endpoint historique (coût 10×)
              </p>
            </div>
            <Switch
              id="historical-fallback"
              checked={settings.use_historical_fallback}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  use_historical_fallback: checked,
                }))
              }
            />
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
