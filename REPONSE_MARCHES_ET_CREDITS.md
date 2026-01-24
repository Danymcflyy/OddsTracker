# Réponses sur les Marchés et Crédits API

Date: 21 Janvier 2026

---

## 1️⃣ Comment fonctionne le système de crédits pour les marchés avec variations ?

### Question
> "1 requête correspond au marché global ? C'est à dire 1 requête handicap correspond au marché global des handicaps ?"

### ✅ RÉPONSE COURTE
**NON, ça dépend si vous demandez le marché standard ou le marché alternate.**

---

## 📊 Système de Crédits Détaillé

### Marchés Standards vs Alternates

The Odds API distingue deux types de marchés pour les handicaps et totaux:

#### 🔹 Marchés Standards (1 crédit)
**Clés:** `spreads`, `totals`, `spreads_h1`, `totals_h1`

- ✅ **1 seule variation** (la ligne principale du bookmaker)
- ✅ **1 crédit API**
- ⚠️ Vous obtenez UNE seule valeur de point

**Exemple `spreads` standard:**
```json
{
  "market_key": "spreads",
  "outcomes": [
    { "name": "Real Madrid", "price": 1.90, "point": -1.5 },
    { "name": "Barcelona", "price": 1.95, "point": 1.5 }
  ]
}
```
**→ Vous obtenez SEULEMENT le handicap -1.5/+1.5 (ligne principale)**

---

#### 🔹 Marchés Alternates (3 crédits)
**Clés:** `alternate_spreads`, `alternate_totals`, `alternate_spreads_h1`, `alternate_totals_h1`

- ✅ **TOUTES les variations** disponibles
- ✅ **3 crédits API**
- ✅ Vous obtenez TOUS les points (ex: -0.5, -1, -1.5, -2, etc.)

**Exemple `alternate_spreads`:**
```json
{
  "market_key": "alternate_spreads",
  "outcomes": [
    { "name": "Real Madrid", "price": 1.50, "point": -0.5 },
    { "name": "Real Madrid", "price": 1.70, "point": -1.0 },
    { "name": "Real Madrid", "price": 1.90, "point": -1.5 },
    { "name": "Real Madrid", "price": 2.15, "point": -2.0 },
    { "name": "Real Madrid", "price": 2.45, "point": -2.5 },
    { "name": "Barcelona", "price": 2.55, "point": 0.5 },
    { "name": "Barcelona", "price": 2.20, "point": 1.0 },
    { "name": "Barcelona", "price": 1.95, "point": 1.5 },
    // ... toutes les autres variations
  ]
}
```
**→ Vous obtenez TOUTES les lignes disponibles**

---

## 💰 Coût Comparatif

| Marché | Clé API | Variations Obtenues | Coût |
|--------|---------|---------------------|------|
| **Handicap Standard** | `spreads` | 1 seule (ligne principale) | 1 crédit |
| **Handicap Complet** | `alternate_spreads` | Toutes (~10-20 lignes) | 3 crédits |
| **O/U Standard** | `totals` | 1 seule (ligne principale) | 1 crédit |
| **O/U Complet** | `alternate_totals` | Toutes (~10-15 lignes) | 3 crédits |

---

## 🎯 Configuration Actuelle OddsTracker

Dans votre application, vous suivez actuellement:

```typescript
// MVP_MARKETS (6 marchés)
const MVP_MARKETS = [
  'h2h',        // 1X2          → 1 crédit
  'spreads',    // Handicap     → 1 crédit (MAIS converti en alternate_spreads = 3 crédits)
  'totals',     // Over/Under   → 1 crédit (MAIS converti en alternate_totals = 3 crédits)
  'h2h_h1',     // 1X2 H1       → 1 crédit
  'spreads_h1', // Handicap H1  → 1 crédit (MAIS converti en alternate_spreads_h1 = 3 crédits)
  'totals_h1',  // O/U H1       → 1 crédit (MAIS converti en alternate_totals_h1 = 3 crédits)
];
```

### 💡 IMPORTANT: Conversion Automatique

Dans votre code actuel (`lib/services/theoddsapi/opening-odds.ts`), les marchés standards sont **automatiquement convertis en alternates** pour obtenir toutes les variations:

```typescript
// Le code convertit:
'spreads' → 'alternate_spreads'
'totals' → 'alternate_totals'
'spreads_h1' → 'alternate_spreads_h1'
'totals_h1' → 'alternate_totals_h1'
```

**Coût réel par événement:**
- h2h: 1 crédit
- alternate_spreads: 3 crédits
- alternate_totals: 3 crédits
- h2h_h1: 1 crédit
- alternate_spreads_h1: 3 crédits
- alternate_totals_h1: 3 crédits

**= 14 crédits par événement**

---

## 📝 Exemple Concret

### Scénario: Vous scannez 10 matchs de Champions League

**Configuration:** 6 marchés MVP (avec conversion alternates)

**Coût:**
```
10 matchs × 14 crédits par match = 140 crédits
```

**Si vous aviez utilisé les marchés standards uniquement:**
```
10 matchs × 6 crédits par match = 60 crédits
```

**Différence:** Vous payez ~2.3× plus cher pour avoir TOUTES les variations de chaque marché.

---

## 2️⃣ Draw No Bet et Double Chance disponibles ?

### Question
> "Ils n'ont pas le marché DnB et DC ?"

### ✅ RÉPONSE: OUI, ILS SONT DISPONIBLES !

---

## 📋 Marchés Draw No Bet & Double Chance

### 🎯 Draw No Bet (DnB)
**Clé API:** `draw_no_bet`

**Description:** Pari sur le vainqueur avec remboursement en cas de nul

**Outcomes:**
- `home` - Victoire domicile (remboursé si nul)
- `away` - Victoire extérieur (remboursé si nul)

**Coût:** 1 crédit

**Exemple:**
```json
{
  "market_key": "draw_no_bet",
  "outcomes": [
    { "name": "Arsenal", "price": 1.62 },    // Win si Arsenal gagne, remboursé si nul
    { "name": "Liverpool", "price": 2.30 }   // Win si Liverpool gagne, remboursé si nul
  ]
}
```

---

### 🎯 Double Chance (DC)
**Clé API:** `double_chance`

**Description:** Combinaison de deux résultats possibles sur trois

**Outcomes:**
- `1X` ou `home_draw` - Victoire domicile OU nul
- `X2` ou `draw_away` - Nul OU victoire extérieur
- `12` ou `home_away` - Victoire domicile OU victoire extérieur

**Coût:** 1 crédit

**Exemple:**
```json
{
  "market_key": "double_chance",
  "outcomes": [
    { "name": "Arsenal ou Draw", "price": 1.18 },      // 1X
    { "name": "Liverpool ou Draw", "price": 1.44 },    // X2
    { "name": "Arsenal ou Liverpool", "price": 1.25 }  // 12
  ]
}
```

---

## 🛠️ Comment les Activer dans OddsTracker ?

### Option 1: Via l'Interface Settings (Recommandé)

1. Aller dans **⚙️ Réglages → Collecte de Données**
2. Section **Marchés à Suivre**
3. Cocher les marchés:
   - ✅ `draw_no_bet` - Draw No Bet
   - ✅ `double_chance` - Double Chance
4. Sauvegarder

### Option 2: Modification Manuelle dans la DB

```sql
-- Voir les marchés actuels
SELECT * FROM tracked_markets;

-- Ajouter DnB
INSERT INTO tracked_markets (market_key, active, priority)
VALUES ('draw_no_bet', true, 7);

-- Ajouter DC
INSERT INTO tracked_markets (market_key, active, priority)
VALUES ('double_chance', true, 8);
```

### Option 3: Script d'Ajout

```bash
npx tsx scripts/add-dnb-dc-markets.ts
```

---

## 📊 Configuration Recommandée avec DnB et DC

```typescript
const RECOMMENDED_MARKETS = [
  // Marchés principaux (6 crédits de base)
  'h2h',              // 1X2                     → 1 crédit
  'spreads',          // Handicap                → converti en alternate_spreads (3 crédits)
  'totals',           // Over/Under              → converti en alternate_totals (3 crédits)

  // Marchés additionnels (2 crédits)
  'draw_no_bet',      // Draw No Bet             → 1 crédit
  'double_chance',    // Double Chance           → 1 crédit

  // Marchés 1ère mi-temps (8 crédits)
  'h2h_h1',           // 1X2 H1                  → 1 crédit
  'spreads_h1',       // Handicap H1             → converti en alternate (3 crédits)
  'totals_h1',        // O/U H1                  → converti en alternate (3 crédits)

  // Marché populaire (1 crédit)
  'btts',             // Both Teams to Score     → 1 crédit
];

// COÛT TOTAL PAR ÉVÉNEMENT: 17 crédits
```

---

## 💡 Recommandations

### Si Budget Limité
**Suivre uniquement:** `h2h`, `draw_no_bet`, `double_chance`, `btts`
- **Coût:** 4 crédits par événement
- **Avantage:** Marchés simples et populaires

### Si Budget Moyen
**Suivre:** Configuration MVP actuelle + DnB + DC + BTTS
- **Coût:** 17 crédits par événement
- **Avantage:** Couverture complète des marchés principaux

### Si Budget Élevé
**Suivre:** Tous les marchés + Corners + Cards
- **Coût:** 25-30 crédits par événement
- **Avantage:** Couverture maximale pour analyse avancée

---

## 🎯 Résumé des Réponses

### Question 1: Système de Crédits
✅ **NON**, 1 requête ≠ marché global automatiquement

- **Marché standard** (`spreads`) = 1 crédit = **1 seule variation**
- **Marché alternate** (`alternate_spreads`) = 3 crédits = **TOUTES les variations**

**Votre config actuelle** convertit automatiquement en alternates → vous payez 3 crédits mais obtenez toutes les lignes.

### Question 2: DnB et DC
✅ **OUI**, ils sont disponibles !

- **`draw_no_bet`** → 1 crédit
- **`double_chance`** → 1 crédit

Ils sont déjà définis dans le code (`lib/api/theoddsapi/constants.ts`) mais pas encore activés dans les marchés suivis.

---

## 📁 Fichiers à Consulter

- [lib/api/theoddsapi/constants.ts](lib/api/theoddsapi/constants.ts) - Définition de tous les marchés
- [docs/MARCHES-DISPONIBLES.md](docs/MARCHES-DISPONIBLES.md) - Documentation complète
- Tableau de bord monitoring - Voir les crédits consommés en temps réel

---

**Besoin d'ajouter DnB et DC ?** Je peux créer un script pour les activer automatiquement.
