# 🎯 Plan d'Action - Correction des Cotes

## 🔍 Problèmes Identifiés

### 1. Données Manquantes (home/away)
**Symptôme** : Les cotes stockées n'ont pas `home` et `away`, seulement `draw` et `under`

**Exemple actuel en DB** :
```json
{
  "draw": 3.29,
  "under": 2.94
}
```

**Attendu** :
```json
{
  "home": 1.50,
  "away": 2.94,
  "draw": 3.29
}
```

### 2. Une Seule Variation par Marché
**Symptôme** : Seulement 1 variation au lieu de 3-4

**Exemple actuel** :
- `totals` : 1 variation (2.25)
- `spreads` : 1 variation (0)

**Attendu** :
- `totals` : 3+ variations (2.5, 3.5, 4.5)
- `spreads` : 3+ variations (-0.5, -1.0, -1.5)

### 3. Affichage Frontend Chaotique
**Symptôme** : Trop de colonnes créées, beaucoup vides

---

## 📋 Tests à Effectuer (Coût: ~12 crédits)

### Test 1 : Vérifier Réponse Brute API (6 crédits)
```bash
export $(cat .env.local | grep -v '^#' | xargs) && npx tsx scripts/test-api-raw-response.ts
```

**Ce que ça teste** :
- Format exact des `outcome.name` retournés par l'API
- Pourquoi home/away ne sont pas extraits
- Combien de variations l'API retourne

**Résultat attendu** :
- Voir les noms exacts (ex: "West Ham United" au lieu de "home")
- Confirmer si l'API retourne 1 ou plusieurs variations

---

### Test 2 : Tester avec Alternate Markets (6 crédits)
Si le Test 1 confirme qu'il faut utiliser `alternate_spreads` et `alternate_totals`, on teste :

```typescript
// Modifier le test pour utiliser :
markets: 'h2h,alternate_spreads,alternate_totals'
```

---

## 🔧 Corrections à Appliquer (Selon Résultats)

### Correction A : Mapping des Outcome Names
Si l'API retourne les noms d'équipes complets au lieu de "home"/"away"

**Fichier** : `lib/services/theoddsapi/opening-odds.ts`

**Modification** :
```typescript
function extractOddsFromMarket(market: ApiMarket): OpeningOdds | null {
  const odds: any = {};

  for (const outcome of market.outcomes) {
    const name = outcome.name.toLowerCase();

    // ACTUEL (ne fonctionne pas)
    if (name.includes('home') || name === market.outcomes[0]?.name) {
      odds.home = outcome.price;
    }

    // NOUVEAU (utilise l'index)
    if (outcome === market.outcomes[0]) {
      odds.home = outcome.price;
    } else if (outcome === market.outcomes[market.outcomes.length - 1]) {
      odds.away = outcome.price;
    } else if (name.includes('draw') || name.includes('tie')) {
      odds.draw = outcome.price;
    }
    // ...
  }
}
```

### Correction B : Utiliser Alternate Markets
Si l'API ne retourne qu'une variation avec les markets standards

**Fichier** : `lib/services/theoddsapi/opening-odds.ts` (ligne ~77)

**Modification** :
```typescript
// ACTUEL
const missingMarketKeys = pendingMarkets.map(m => m.market_key);

// NOUVEAU - Remplacer spreads/totals par alternate_spreads/alternate_totals
const missingMarketKeys = pendingMarkets.map(m => {
  if (m.market_key === 'spreads') return 'alternate_spreads';
  if (m.market_key === 'totals') return 'alternate_totals';
  if (m.market_key === 'spreads_h1') return 'alternate_spreads';
  if (m.market_key === 'totals_h1') return 'alternate_totals';
  return m.market_key;
});
```

**⚠️ Impact** : Coûtera plus de crédits API

### Correction C : Limiter les Colonnes Frontend
**Fichier** : `components/tables/v4/column-builder.tsx`

Filtrer les variations pour ne garder que les plus populaires :
- Totals : Garder seulement 2.5, 3.5
- Spreads : Garder seulement -0.5, -1.0

---

## 🎯 Ordre d'Exécution Recommandé

### 1. Lancer Test 1 (Vérifier réponse API)
```bash
npx tsx scripts/test-api-raw-response.ts
```

### 2. Analyser les Résultats
Vérifier :
- Les noms d'outcomes exacts
- Le nombre de variations retournées

### 3. Appliquer les Corrections Nécessaires
Selon les résultats :
- **Si outcome.name = "West Ham United"** → Appliquer Correction A
- **Si 1 seule variation** → Appliquer Correction B
- **Si trop de colonnes** → Appliquer Correction C

### 4. Nettoyer et Re-tester
```bash
# Supprimer les anciennes données
# Re-scanner avec le code corrigé
./scripts/test-opening-odds.sh

# Vérifier les nouvelles données
./scripts/debug-odds-data.ts
```

---

## 💰 Estimation des Coûts

### Tests
- Test 1 (réponse brute) : 6 crédits
- Test 2 (alternate markets) : 6 crédits
- **Total tests** : 12 crédits

### Re-scan Complet (si nécessaire)
- ~30 événements × 6 crédits = 180 crédits
- Avec alternate markets : ~30 × 12 crédits = 360 crédits

---

## ✅ Checklist

- [ ] Nouvelle clé API configurée
- [ ] Test 1 exécuté et résultats analysés
- [ ] Corrections identifiées
- [ ] Code modifié
- [ ] Build réussi (`npm run build`)
- [ ] Re-scan avec nouvelles données
- [ ] Vérification DB
- [ ] Vérification Frontend
- [ ] Tout fonctionne ✨

---

**Prêt à lancer quand vous aurez la nouvelle clé !** 🚀
