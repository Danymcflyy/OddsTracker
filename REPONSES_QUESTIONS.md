# 📋 Réponses aux Questions - OddsTracker v4

## 1️⃣ Peut-on récupérer les résultats des paris avec The Odds API ?

### ✅ OUI - Endpoint `/scores` disponible

**The Odds API v4** fournit un endpoint `/scores` qui permet de récupérer les **résultats finaux des matchs**.

**Endpoint :**
```
GET /v4/sports/{sport}/scores/
```

**Paramètres :**
- `daysFrom` - Nombre de jours passés (1-3) pour récupérer les matchs complétés
- `eventIds` - IDs spécifiques des matchs (optionnel)
- `dateFormat` - Format des timestamps (iso ou unix)
- `apiKey` - Votre clé API

**Exemple de réponse :**
```json
{
  "id": "abc123",
  "sport_key": "soccer_epl",
  "commence_time": "2026-01-15T19:00:00Z",
  "completed": true,
  "home_team": "Arsenal",
  "away_team": "Chelsea",
  "scores": [
    {
      "name": "Arsenal",
      "score": "2"
    },
    {
      "name": "Chelsea",
      "score": "1"
    }
  ]
}
```

**Coût :** 0 crédits (FREE) ✅

---

## 2️⃣ Comment déterminer les paris gagnants/perdants ?

### 🔄 Processus en 3 étapes

**Étape 1 : Récupérer les scores**
```typescript
const scores = await client.getScores('soccer_epl', { daysFrom: 3 });
```

**Étape 2 : Croiser avec les cotes stockées**
```sql
SELECT
  e.id,
  e.home_team,
  e.away_team,
  e.home_score,
  e.away_score,
  ms.market_key,
  ms.opening_odds,
  co.markets as closing_odds
FROM events e
LEFT JOIN market_states ms ON ms.event_id = e.id
LEFT JOIN closing_odds co ON co.event_id = e.id
WHERE e.completed = true;
```

**Étape 3 : Calculer le résultat selon le type de marché**

### 📊 Logique de calcul par marché

#### **h2h (Moneyline 1X2)**
```typescript
function calculateH2hResult(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return { winner: 'home', loser: ['draw', 'away'] };
  if (awayScore > homeScore) return { winner: 'away', loser: ['home', 'draw'] };
  return { winner: 'draw', loser: ['home', 'away'] };
}
```

#### **totals (Over/Under)**
```typescript
function calculateTotalsResult(homeScore: number, awayScore: number, point: number) {
  const totalScore = homeScore + awayScore;
  if (totalScore > point) return { winner: 'over', loser: 'under' };
  if (totalScore < point) return { winner: 'under', loser: 'over' };
  return { winner: null, loser: null }; // Push
}
```

#### **spreads (Handicap)**
```typescript
function calculateSpreadsResult(homeScore: number, awayScore: number, point: number) {
  const homeWithSpread = homeScore + point;
  if (homeWithSpread > awayScore) return { winner: 'home', loser: 'away' };
  if (homeWithSpread < awayScore) return { winner: 'away', loser: 'home' };
  return { winner: null, loser: null }; // Push
}
```

---

## 3️⃣ Colorer les paris gagnants/perdants

### 🎨 Proposition d'implémentation

**Créer un service de calcul des résultats :**

```typescript
// lib/services/betting-results.ts

interface BettingResult {
  marketKey: string;
  outcome: 'home' | 'away' | 'draw' | 'over' | 'under';
  status: 'won' | 'lost' | 'push';
  stake: number; // Mise fictive
  return: number; // Gain/perte
  odds: number;   // Cote utilisée
}

export function calculateBettingResults(
  event: Event,
  marketStates: MarketState[],
  closingOdds?: ClosingOdds
): BettingResult[] {
  if (!event.home_score || !event.away_score) return [];

  const results: BettingResult[] = [];

  for (const ms of marketStates) {
    if (ms.status !== 'captured') continue;

    const odds = closingOdds?.markets?.[ms.market_key] || ms.opening_odds;
    if (!odds) continue;

    switch (ms.market_key) {
      case 'h2h':
        results.push(...calculateH2hResults(event, odds));
        break;
      case 'totals':
        results.push(...calculateTotalsResults(event, odds));
        break;
      case 'spreads':
        results.push(...calculateSpreadsResults(event, odds));
        break;
    }
  }

  return results;
}
```

**Colorer les cellules dans le tableau :**

```typescript
// components/tables/v4/column-builder.tsx

function getCellClassName(outcome: string, result: BettingResult | undefined) {
  if (!result) return '';

  const isWinning = result.status === 'won';
  const isLosing = result.status === 'lost';

  if (isWinning) {
    return 'bg-green-50 text-green-900 font-semibold border-green-200';
  }
  if (isLosing) {
    return 'bg-red-50 text-red-900 border-red-200';
  }
  return 'bg-yellow-50 text-yellow-900 border-yellow-200'; // Push
}

// Dans la colonne :
{
  accessorKey: `odds.${marketKey}.home`,
  header: 'Home',
  cell: ({ row }) => {
    const event = row.original;
    const result = calculateBettingResults(event, ...)[0];
    return (
      <div className={getCellClassName('home', result)}>
        {odds.home}
      </div>
    );
  }
}
```

---

## 4️⃣ Filtres actuellement fonctionnels

### ✅ Filtres implémentés

| Filtre | Type | Fonctionnel | Description |
|--------|------|-------------|-------------|
| **Date Range** | Plage de dates | ✅ OUI | Filtre par période (from/to) |
| **Team Search** | Recherche texte | ✅ OUI | Recherche par nom d'équipe (home ou away) |
| **Market Filter** | Select | ⚠️ AFFICHÉ MAIS NON UTILISÉ | Filtre par type de marché |
| **Sorting** | Tri | ✅ OUI | Tri par colonne (commence_time, team, etc.) |
| **Pagination** | Pages | ✅ OUI | Offset + cursor-based |

### ⚠️ Filtre Market pas connecté

Le `MarketFilter` est affiché mais **selectedMarket n'est pas utilisé** dans la requête API.

**Correction nécessaire :**

```typescript
// app/(dashboard)/football/page.tsx:84

// Ajouter après teamSearch :
if (selectedMarket) {
  params.set('marketKey', selectedMarket);
}
```

Puis dans `lib/db/queries-frontend.ts` :

```typescript
export async function fetchEventsForTable(params: {
  // ... existing params
  marketKey?: string; // Ajouter ce paramètre
}) {
  // ...

  // Ajouter ce filtre :
  if (marketKey) {
    query = query.eq('market_states.market_key', marketKey);
  }
}
```

---

## 5️⃣ Masquer/Afficher des marchés

### ✅ DÉJÀ IMPLÉMENTÉ !

Le système de visibilité des colonnes est **déjà fonctionnel** via `ColumnVisibilitySelector`.

**Comment ça marche :**

```typescript
// État actuel :
const [visibleMarkets, setVisibleMarkets] = useState<Set<string>>(new Set());

// Toggle un marché :
handleToggleMarket('h2h'); // Affiche/masque le marché h2h

// Afficher tous :
handleShowAllMarkets();

// Masquer tous :
handleHideAllMarkets();
```

**Interface utilisateur :**

Le composant `ColumnVisibilitySelector` dans les filtres permet de :
- ✅ Cocher/décocher chaque marché individuellement
- ✅ Bouton "Tout afficher"
- ✅ Bouton "Tout masquer"

---

## 6️⃣ Trier à l'intérieur d'un marché

### ❌ PAS ENCORE IMPLÉMENTÉ

Actuellement, on peut **trier par colonne** (commence_time, home_team, away_team) mais pas **filtrer les outcomes à l'intérieur d'un marché**.

### 💡 Proposition d'amélioration

**Exemple : Afficher seulement les cotes > 2.0 dans h2h**

```typescript
interface OutcomeFilter {
  marketKey: string;
  minOdds?: number;
  maxOdds?: number;
  outcomes?: ('home' | 'away' | 'draw' | 'over' | 'under')[];
}

// Filtre avancé :
const [outcomeFilters, setOutcomeFilters] = useState<OutcomeFilter[]>([]);

// Exemple :
setOutcomeFilters([
  {
    marketKey: 'h2h',
    minOdds: 2.0,
    outcomes: ['home', 'away'] // Masquer le draw
  },
  {
    marketKey: 'totals',
    outcomes: ['over'] // Afficher seulement over
  }
]);
```

---

## 📋 Récapitulatif

### ✅ Ce qui fonctionne déjà

1. ✅ **Filtres de base** - Date, équipe, tri, pagination
2. ✅ **Visibilité des colonnes** - Masquer/afficher des marchés entiers
3. ✅ **Colonnes dynamiques** - Colonnes créées selon les marchés trackés

### 🔧 Ce qui nécessite des ajouts

1. ⚠️ **Filtre par marché** - Affiché mais pas connecté à l'API
2. ❌ **Récupération des scores** - Endpoint `/scores` pas encore utilisé
3. ❌ **Calcul paris gagnants** - Logique à implémenter
4. ❌ **Coloration des cellules** - Vert/rouge selon résultat
5. ❌ **Filtres avancés par outcome** - Filtrer à l'intérieur d'un marché

---

## 🚀 Prochaines étapes recommandées

### Priorité 1 - Correction
- [ ] Connecter le filtre Market à l'API

### Priorité 2 - Scores et résultats
- [ ] Créer service `closing-odds.ts` qui récupère les scores
- [ ] Stocker les scores dans table `events` (colonnes home_score, away_score)
- [ ] Créer `betting-results.ts` pour calculer les gains/pertes

### Priorité 3 - UI/UX
- [ ] Colorer les cellules selon résultat (vert/rouge)
- [ ] Ajouter colonne "Résultat" avec gain/perte
- [ ] Ajouter filtres avancés par outcome

---

## 📚 Sources

- [The Odds API v4 Documentation](https://the-odds-api.com/liveapi/guides/v4/)
- [Postman Documentation](https://www.postman.com/odds-api/the-odds-api-workspace/documentation/my4qrii/the-odds-api)

---

**Voulez-vous que j'implémente l'une de ces fonctionnalités ?**
