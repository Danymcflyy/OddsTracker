# Proposition : Sélection des Variations de Marchés

Date: 21 Janvier 2026

---

## ❌ Ce qui N'EST PAS Possible

**L'API The Odds ne permet PAS de sélectionner des variations individuelles.**

Vous ne pouvez pas demander :
- "Je veux seulement Handicap -0.5 et -1.5"
- "Je veux seulement Over/Under 2.5 et 3.5"

L'API ne fonctionne pas ainsi.

---

## ✅ Ce qui EST Possible

### Option 1 : Toggle Standard / Alternate par Marché

**Interface proposée :**

Pour chaque marché avec variations (spreads, totals), ajouter un choix :

```
📊 Handicap
   ○ Standard (1 crédit, ligne principale uniquement)
   ● Alternate (3 crédits, toutes les variations)

📊 Over/Under
   ○ Standard (1 crédit, ligne principale uniquement)
   ● Alternate (3 crédits, toutes les variations)
```

**Avantages :**
- ✅ Contrôle du coût API par marché
- ✅ Choix entre couverture complète ou ligne principale
- ✅ Interface simple et claire

**Inconvénient :**
- ⚠️ Vous ne pouvez toujours pas choisir des variations spécifiques

---

### Option 2 : Filtrage Post-Récupération

**Concept :**
1. Récupérer TOUTES les variations via alternate (3 crédits)
2. Filtrer dans l'interface quelles variations afficher

**Interface proposée :**

Dans `/settings/data-collection`, ajouter une section :

```
🎯 Filtres de Variations (appliqués après récupération)

Handicap - Variations à afficher :
☑ -2.5
☑ -2.0
☑ -1.5
☑ -1.0
☑ -0.5
☑ 0.0
☐ +0.5
☐ +1.0
☐ +1.5

Over/Under - Variations à afficher :
☑ 1.5
☑ 2.0
☑ 2.5
☑ 3.0
☑ 3.5
☐ 4.0
☐ 4.5
```

**Avantages :**
- ✅ Interface simplifiée en masquant les variations non pertinentes
- ✅ Contrôle total sur l'affichage
- ✅ Sauvegarde de l'état par utilisateur

**Inconvénients :**
- ❌ Ne sauvegarde PAS de crédits API (vous payez pour toutes les variations)
- ⚠️ Les variations sont toujours stockées en DB

---

## 💡 Solution Recommandée : Combinaison des Deux

### Interface Proposée

**Étape 1 : Choix Standard/Alternate**

```tsx
{/* Section Marchés avec Variations */}
<Card>
  <CardHeader>
    <CardTitle>📊 Marchés avec Variations</CardTitle>
    <CardDescription>
      Choisissez entre la ligne principale (1 crédit) ou toutes les variations (3 crédits)
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">

      {/* Handicap */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={tracked_markets.includes('spreads') || tracked_markets.includes('alternate_spreads')}
              onCheckedChange={() => toggleHandicapTracking()}
            />
            <Label className="font-medium">Handicap</Label>
          </div>
          <span className="text-xs text-muted-foreground">
            {useAlternate.spreads ? '3 crédits' : '1 crédit'}
          </span>
        </div>

        {(tracked_markets.includes('spreads') || tracked_markets.includes('alternate_spreads')) && (
          <RadioGroup
            value={useAlternate.spreads ? 'alternate' : 'standard'}
            onValueChange={(value) => handleAlternateToggle('spreads', value === 'alternate')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="spreads-standard" />
              <Label htmlFor="spreads-standard">
                Standard - Ligne principale uniquement (1 crédit)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="alternate" id="spreads-alternate" />
              <Label htmlFor="spreads-alternate">
                Alternate - Toutes les variations (3 crédits)
              </Label>
            </div>
          </RadioGroup>
        )}
      </div>

      {/* Over/Under */}
      <div className="border rounded-lg p-4">
        {/* Même structure pour totals */}
      </div>

      {/* Handicap 1ère MT */}
      <div className="border rounded-lg p-4">
        {/* Même structure pour spreads_h1 */}
      </div>

      {/* O/U 1ère MT */}
      <div className="border rounded-lg p-4">
        {/* Même structure pour totals_h1 */}
      </div>

    </div>
  </CardContent>
</Card>
```

**Étape 2 : Filtrage des Variations (Optionnel)**

Si l'utilisateur choisit "Alternate", afficher une section supplémentaire :

```tsx
{useAlternate.spreads && (
  <Card className="ml-4 mt-2">
    <CardHeader>
      <CardTitle className="text-sm">Filtres d'Affichage - Handicap</CardTitle>
      <CardDescription className="text-xs">
        Masquer certaines variations dans le tableau (n'affecte pas l'API)
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-4 gap-2">
        {[-2.5, -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5].map(point => (
          <div key={point} className="flex items-center space-x-2">
            <Checkbox
              checked={visibleVariations.spreads.includes(point)}
              onCheckedChange={() => toggleVariation('spreads', point)}
            />
            <Label className="text-xs">{point > 0 ? `+${point}` : point}</Label>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)}
```

---

## 🔧 Modifications Nécessaires

### 1. Interface Settings

**Fichier:** `app/(dashboard)/settings/data-collection/page.tsx`

**Ajouts:**
```typescript
const [useAlternate, setUseAlternate] = useState({
  spreads: true,      // true = alternate, false = standard
  totals: true,
  spreads_h1: true,
  totals_h1: true,
});

const [visibleVariations, setVisibleVariations] = useState({
  spreads: [-2.5, -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5],
  totals: [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5],
  // ... etc
});
```

**Sauvegarde:**
```typescript
// Sauvegarder dans settings
await fetch('/api/v4/settings', {
  method: 'PUT',
  body: JSON.stringify({
    key: 'market_variation_config',
    value: { useAlternate, visibleVariations },
  }),
});
```

### 2. Service Opening Odds

**Fichier:** `lib/services/theoddsapi/opening-odds.ts`

**Modification de la conversion:**

```typescript
// AVANT (toujours converti en alternate)
const apiMarkets = trackedMarkets.map(m => {
  if (m === 'spreads') return 'alternate_spreads';
  if (m === 'totals') return 'alternate_totals';
  // ...
  return m;
});

// APRÈS (respecter la config)
const apiMarkets = trackedMarkets.map(m => {
  // Charger la config
  const config = await getMarketVariationConfig();

  // Si alternate activé, convertir
  if (m === 'spreads' && config.useAlternate.spreads) {
    return 'alternate_spreads';
  }
  if (m === 'totals' && config.useAlternate.totals) {
    return 'alternate_totals';
  }

  // Sinon, garder standard
  return m;
});
```

### 3. Filtrage Frontend

**Fichier:** `app/(dashboard)/football/page.tsx`

**Filtrer les variations affichées:**

```typescript
const marketPointCombinations = React.useMemo(() => {
  const combinations = new Map();

  // Charger les filtres de variations
  const variationFilters = columnConfig.visibleVariations || {};

  for (const event of events) {
    for (const market of event.opening_odds) {
      const point = market.odds?.point;

      // Si le marché a un point, vérifier s'il est dans les variations visibles
      if (point !== undefined) {
        const baseKey = market.market_key.replace('alternate_', '');
        const visiblePoints = variationFilters[baseKey] || [];

        // Skip si ce point n'est pas dans les variations visibles
        if (visiblePoints.length > 0 && !visiblePoints.includes(point)) {
          continue;
        }
      }

      // Ajouter à la combinaison
      combinations.set(combinationKey, { key, name, point });
    }
  }

  return Array.from(combinations.values());
}, [events, columnConfig]);
```

---

## 💰 Économies Possibles

### Exemple : 50 matchs Champions League

**Configuration Actuelle (tout en alternate):**
```
50 matchs × 14 crédits = 700 crédits
```

**Configuration Optimisée (standard pour certains):**
```
h2h: 50 × 1 = 50
spreads (standard): 50 × 1 = 50        ← Économie de 100 crédits
totals (alternate): 50 × 3 = 150       ← Gardé en alternate
h2h_h1: 50 × 1 = 50
spreads_h1 (standard): 50 × 1 = 50    ← Économie de 100 crédits
totals_h1 (standard): 50 × 1 = 50     ← Économie de 100 crédits
-------------------------------------
TOTAL: 400 crédits (au lieu de 700)
ÉCONOMIE: 300 crédits (43%)
```

---

## 🎯 Recommandation Finale

### Phase 1 : Toggle Standard/Alternate
**Priorité : HAUTE**
- Permet de contrôler les coûts API
- Simple à implémenter
- Impact immédiat sur le budget

### Phase 2 : Filtrage des Variations
**Priorité : MOYENNE**
- Améliore l'UX en simplifiant l'affichage
- N'économise pas de crédits
- Utile si vous avez beaucoup de variations

---

## ✅ Voulez-vous que j'implémente la Phase 1 ?

Je peux créer l'interface de sélection Standard/Alternate qui vous permettra de choisir pour chaque marché si vous voulez :
- ✅ **Standard** (1 crédit, ligne principale)
- ✅ **Alternate** (3 crédits, toutes variations)

Cela vous fera économiser jusqu'à **40-50% de crédits API** selon votre usage.
