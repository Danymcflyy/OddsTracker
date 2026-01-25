'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, RotateCcw } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MarketGroup {
  id: string;
  name: string;
  label: string;
  example: string;
}

const MARKET_GROUPS: MarketGroup[] = [
  { id: 'h2h', name: 'Vainqueur (1X2)', label: '1X2', example: 'Match' },
  { id: 'spreads', name: 'Handicap', label: 'Handicap', example: 'AH' },
  { id: 'totals', name: 'Total (Over/Under)', label: 'Over/Under', example: 'Buts' },
  { id: 'double_chance', name: 'Double Chance', label: 'Double Chance', example: 'DC' },
  { id: 'btts', name: 'Les 2 marquent', label: 'BTTS', example: 'GG/NG' },
  { id: 'draw_no_bet', name: 'Remboursé si nul', label: 'DNB', example: 'DNB' },
];

const PRESETS = {
  compact: {
    marketLabels: { h2h: '1X2', spreads: 'AH', totals: 'O/U', double_chance: 'DC', btts: 'BTTS', draw_no_bet: 'DNB' },
    outcomeLabels: { home: '1', draw: 'X', away: '2', over: '+', under: '-' },
    variationTemplate: '{{market}} {{point}}',
  },
  standard: {
    marketLabels: { h2h: 'Vainqueur', spreads: 'Handicap', totals: 'Total', double_chance: 'Double Chance', btts: 'Les 2 marquent', draw_no_bet: 'Remboursé si nul' },
    outcomeLabels: { home: 'Dom', draw: 'Nul', away: 'Ext', over: 'Plus', under: 'Moins' },
    variationTemplate: '{{market}} {{point}} ({{outcome}})',
  },
  detailed: {
    marketLabels: { h2h: 'Résultat Match', spreads: 'Asian Handicap', totals: 'Total Buts', double_chance: 'Double Chance', btts: 'Buts pour les 2', draw_no_bet: 'Draw No Bet' },
    outcomeLabels: { home: 'Domicile', draw: 'Match Nul', away: 'Extérieur', over: 'Over', under: 'Under' },
    variationTemplate: '{{market}} {{point}} - {{outcome}}',
  },
};

export default function ColumnsSettingsPage() {
  const [preset, setPreset] = React.useState<string>('custom');
  const [marketLabels, setMarketLabels] = React.useState<Record<string, string>>(PRESETS.compact.marketLabels);
  const [outcomeStyle, setOutcomeStyle] = React.useState<string>('numeric');
  const [variationTemplate, setVariationTemplate] = React.useState<string>(PRESETS.compact.variationTemplate);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Load configuration
  React.useEffect(() => {
    loadConfiguration();
  }, []);

  async function loadConfiguration() {
    try {
      const response = await fetch('/api/v4/settings?key=column_config');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          if (result.data.marketLabels) setMarketLabels(result.data.marketLabels);
          if (result.data.outcomeLabels) {
            // Detect outcome style
            const home = result.data.outcomeLabels.home;
            if (home === '1') setOutcomeStyle('numeric');
            else if (home === 'Dom') setOutcomeStyle('french');
            else if (home === 'Home') setOutcomeStyle('english');
            else setOutcomeStyle('custom');
          }
          if (result.data.variationTemplate) setVariationTemplate(result.data.variationTemplate);
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  async function saveConfiguration() {
    setSaveStatus('saving');

    // Generate outcome labels based on style
    let outcomeLabels = PRESETS.compact.outcomeLabels;
    if (outcomeStyle === 'french') outcomeLabels = PRESETS.standard.outcomeLabels;
    if (outcomeStyle === 'english') outcomeLabels = PRESETS.detailed.outcomeLabels;

    try {
      const response = await fetch('/api/v4/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'column_config',
          value: {
            marketLabels,
            outcomeLabels,
            variationTemplate,
          },
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
    }
  }

  function applyPreset(name: string) {
    setPreset(name);
    const p = PRESETS[name as keyof typeof PRESETS];
    setMarketLabels(p.marketLabels);
    setVariationTemplate(p.variationTemplate);
    
    // Set outcome style
    if (name === 'compact') setOutcomeStyle('numeric');
    if (name === 'standard') setOutcomeStyle('french');
    if (name === 'detailed') setOutcomeStyle('english');
  }

  function updateMarketLabel(id: string, value: string) {
    setMarketLabels(prev => ({ ...prev, [id]: value }));
    setPreset('custom');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Personnalisation des Colonnes</h1>
        <p className="text-muted-foreground">
          Simplifiez l&apos;affichage du tableau selon vos préférences
        </p>
      </div>

      {saveStatus === 'success' && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            ✅ Configuration sauvegardée avec succès
          </AlertDescription>
        </Alert>
      )}

      {/* 1. Presets */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">1. Style Global</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant={preset === 'compact' ? 'default' : 'outline'} 
            onClick={() => applyPreset('compact')}
            className="h-24 flex flex-col gap-2"
          >
            <span className="font-bold text-lg">Compact</span>
            <span className="text-xs font-normal opacity-80">AH -0.5 • 1</span>
          </Button>
          <Button 
            variant={preset === 'standard' ? 'default' : 'outline'} 
            onClick={() => applyPreset('standard')}
            className="h-24 flex flex-col gap-2"
          >
            <span className="font-bold text-lg">Standard</span>
            <span className="text-xs font-normal opacity-80">Handicap -0.5 • Dom</span>
          </Button>
          <Button 
            variant={preset === 'detailed' ? 'default' : 'outline'} 
            onClick={() => applyPreset('detailed')}
            className="h-24 flex flex-col gap-2"
          >
            <span className="font-bold text-lg">Détaillé</span>
            <span className="text-xs font-normal opacity-80">Asian Handicap • Domicile</span>
          </Button>
        </div>
      </Card>

      {/* 2. Noms des Marchés */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">2. Noms des Marchés</h2>
        <div className="space-y-4">
          {MARKET_GROUPS.map((group) => (
            <div key={group.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <div className="font-medium text-sm md:text-right text-muted-foreground">
                {group.name}
              </div>
              <div className="md:col-span-2">
                <Input
                  value={marketLabels[group.id] || ''}
                  onChange={(e) => updateMarketLabel(group.id, e.target.value)}
                  placeholder={group.label}
                  className="max-w-xs"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Exemple : {group.example}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Vocabulaire */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">3. Vocabulaire (Outcomes)</h2>
        <RadioGroup value={outcomeStyle} onValueChange={(v) => { setOutcomeStyle(v); setPreset('custom'); }}>
          <div className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50">
            <RadioGroupItem value="numeric" id="r1" />
            <Label htmlFor="r1" className="cursor-pointer flex-1">
              <span className="font-bold">1 / X / 2</span> et <span className="font-bold">+ / -</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50">
            <RadioGroupItem value="french" id="r2" />
            <Label htmlFor="r2" className="cursor-pointer flex-1">
              <span className="font-bold">Dom / Nul / Ext</span> et <span className="font-bold">Plus / Moins</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50">
            <RadioGroupItem value="english" id="r3" />
            <Label htmlFor="r3" className="cursor-pointer flex-1">
              <span className="font-bold">Home / Draw / Away</span> et <span className="font-bold">Over / Under</span>
            </Label>
          </div>
        </RadioGroup>
      </Card>

      <div className="flex gap-4 sticky bottom-6 bg-white p-4 border rounded-lg shadow-lg z-10">
        <Button onClick={saveConfiguration} disabled={saveStatus === 'saving'} size="lg" className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {saveStatus === 'saving' ? 'Sauvegarde...' : 'Appliquer les changements'}
        </Button>
        <Button onClick={() => applyPreset('compact')} variant="outline" size="lg">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}