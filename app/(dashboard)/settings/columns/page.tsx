'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowUp, ArrowDown, Save, RotateCcw } from 'lucide-react';

interface ColumnConfig {
  id: string;
  defaultName: string;
  customName: string;
  order: number;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'date', defaultName: 'Date', customName: '', order: 0, visible: true },
  { id: 'sport', defaultName: 'Sport / Ligue', customName: '', order: 1, visible: true },
  { id: 'home_team', defaultName: 'Domicile', customName: '', order: 2, visible: true },
  { id: 'away_team', defaultName: 'Extérieur', customName: '', order: 3, visible: true },
  { id: 'score', defaultName: 'Score', customName: '', order: 4, visible: true },
];

const DEFAULT_MARKET_LABELS: Record<string, string> = {
  h2h: '1X2',
  spreads: 'Handicap',
  totals: 'Over/Under',
  h2h_h1: '1X2 (1ère MT)',
  spreads_h1: 'Handicap (1ère MT)',
  totals_h1: 'O/U (1ère MT)',
  team_totals: 'Total Équipe',
};

const DEFAULT_MARKET_ORDER: string[] = [
  'h2h',
  'spreads',
  'totals',
  'h2h_h1',
  'spreads_h1',
  'totals_h1',
  'team_totals',
];

const DEFAULT_OUTCOME_LABELS: Record<string, string> = {
  home: 'Domicile',
  away: 'Extérieur',
  draw: 'Nul',
  over: 'Plus',
  under: 'Moins',
};

export default function ColumnsSettingsPage() {
  const [columns, setColumns] = React.useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [marketLabels, setMarketLabels] = React.useState<Record<string, string>>(DEFAULT_MARKET_LABELS);
  const [marketOrder, setMarketOrder] = React.useState<string[]>(DEFAULT_MARKET_ORDER);
  const [outcomeLabels, setOutcomeLabels] = React.useState<Record<string, string>>(DEFAULT_OUTCOME_LABELS);
  const [variationTemplate, setVariationTemplate] = React.useState<string>('{{market}} ({{point}})');
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Charger la configuration au montage
  React.useEffect(() => {
    loadConfiguration();
  }, []);

  async function loadConfiguration() {
    try {
      const response = await fetch('/api/v4/settings?key=column_config');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          if (result.data.columns) setColumns(result.data.columns);
          if (result.data.marketLabels) setMarketLabels(result.data.marketLabels);
          if (result.data.marketOrder) setMarketOrder(result.data.marketOrder);
          if (result.data.outcomeLabels) setOutcomeLabels(result.data.outcomeLabels);
          if (result.data.variationTemplate) setVariationTemplate(result.data.variationTemplate);
        }
      }
    } catch (error) {
      console.error('Erreur chargement configuration:', error);
    }
  }

  async function saveConfiguration() {
    setSaveStatus('saving');

    try {
      const response = await fetch('/api/v4/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'column_config',
          value: {
            columns,
            marketLabels,
            marketOrder,
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
      console.error('Erreur sauvegarde:', error);
      setSaveStatus('error');
    }
  }

  function resetToDefaults() {
    setColumns(DEFAULT_COLUMNS);
    setMarketLabels(DEFAULT_MARKET_LABELS);
    setMarketOrder(DEFAULT_MARKET_ORDER);
    setOutcomeLabels(DEFAULT_OUTCOME_LABELS);
    setVariationTemplate('{{market}} ({{point}})');
  }

  function moveMarket(index: number, direction: 'up' | 'down') {
    const newOrder = [...marketOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setMarketOrder(newOrder);
  }

  function moveColumn(index: number, direction: 'up' | 'down') {
    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newColumns.length) return;

    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    newColumns.forEach((col, idx) => {
      col.order = idx;
    });

    setColumns(newColumns);
  }

  function updateColumnName(id: string, customName: string) {
    setColumns(columns.map(col => col.id === id ? { ...col, customName } : col));
  }

  function updateMarketLabel(key: string, label: string) {
    setMarketLabels({ ...marketLabels, [key]: label });
  }

  function updateOutcomeLabel(key: string, label: string) {
    setOutcomeLabels({ ...outcomeLabels, [key]: label });
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Personnalisation des Colonnes</h1>
        <p className="text-muted-foreground">
          Personnalisez les noms et l&apos;ordre des colonnes du tableau
        </p>
      </div>

      {saveStatus === 'success' && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            ✅ Configuration sauvegardée avec succès
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            ❌ Erreur lors de la sauvegarde
          </AlertDescription>
        </Alert>
      )}

      {/* Colonnes fixes */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📋 Colonnes Fixes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Personnalisez les noms et l&apos;ordre des colonnes standard
        </p>

        <div className="space-y-4">
          {columns.map((column, index) => (
            <div key={column.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveColumn(index, 'up')}
                  disabled={index === 0}
                  className="h-6 w-6 p-0"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveColumn(index, 'down')}
                  disabled={index === columns.length - 1}
                  className="h-6 w-6 p-0"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nom par défaut</Label>
                  <div className="font-medium">{column.defaultName}</div>
                </div>
                <div>
                  <Label htmlFor={`custom-${column.id}`} className="text-xs">
                    Nom personnalisé
                  </Label>
                  <Input
                    id={`custom-${column.id}`}
                    value={column.customName}
                    onChange={(e) => updateColumnName(column.id, e.target.value)}
                    placeholder={column.defaultName}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Labels des marchés */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📊 Noms des Marchés</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Personnalisez les noms des types de marchés
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(marketLabels).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={`market-${key}`} className="text-xs text-muted-foreground">
                {key}
              </Label>
              <Input
                id={`market-${key}`}
                value={label}
                onChange={(e) => updateMarketLabel(key, e.target.value)}
                className="h-8"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Ordre des marchés */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🔢 Ordre d&apos;Affichage des Marchés</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Définissez l&apos;ordre d&apos;apparition des marchés dans le tableau
        </p>

        <div className="space-y-3">
          {marketOrder.map((marketKey, index) => (
            <div key={marketKey} className="flex items-center gap-4 p-3 border rounded-lg bg-slate-50">
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveMarket(index, 'up')}
                  disabled={index === 0}
                  className="h-6 w-6 p-0"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveMarket(index, 'down')}
                  disabled={index === marketOrder.length - 1}
                  className="h-6 w-6 p-0"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl font-bold text-muted-foreground w-8 text-center">
                  {index + 1}
                </span>
                <div>
                  <div className="font-semibold">{marketLabels[marketKey] || marketKey}</div>
                  <div className="text-xs text-muted-foreground">{marketKey}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Template des variations */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🏷️ Format des Variations</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Définissez comment afficher les variations avec points (ex: Handicap -0.25)
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="variation-template" className="text-sm font-medium">
              Template
            </Label>
            <Input
              id="variation-template"
              value={variationTemplate}
              onChange={(e) => setVariationTemplate(e.target.value)}
              className="h-9 font-mono text-sm"
              placeholder="{{market}} ({{point}})"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Variables disponibles: <code className="px-1 py-0.5 bg-slate-100 rounded">{'{{market}}'}</code> et <code className="px-1 py-0.5 bg-slate-100 rounded">{'{{point}}'}</code>
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Exemples d&apos;affichage:</p>
            <div className="space-y-2 text-sm">
              {[
                { market: 'Handicap', point: -0.25 },
                { market: 'O/U', point: 2.5 },
                { market: 'Handicap', point: 1.5 },
              ].map((example, i) => {
                const formatted = variationTemplate
                  .replace('{{market}}', example.market)
                  .replace('{{point}}', example.point > 0 ? `+${example.point}` : `${example.point}`);

                return (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-muted-foreground w-32">{example.market} {example.point}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{formatted}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Templates suggérés:</p>
            <div className="flex flex-wrap gap-2">
              {[
                '{{market}} ({{point}})',
                '{{market}} {{point}}',
                '{{market}} [{{point}}]',
                '{{point}} {{market}}',
              ].map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  size="sm"
                  onClick={() => setVariationTemplate(template)}
                  className="text-xs font-mono"
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Labels des outcomes */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🎯 Noms des Outcomes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Personnalisez les noms des résultats possibles
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(outcomeLabels).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={`outcome-${key}`} className="text-xs text-muted-foreground">
                {key}
              </Label>
              <Input
                id={`outcome-${key}`}
                value={label}
                onChange={(e) => updateOutcomeLabel(key, e.target.value)}
                className="h-8"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={saveConfiguration} disabled={saveStatus === 'saving'} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saveStatus === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>

        <Button onClick={resetToDefaults} variant="outline" size="lg">
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
