# 📖 Guide Complet des Cotes du Football

## Vue d'ensemble

Chaque **cote** représente un **pari sportif** avec:
- Un **marché** (type de pari)
- Un **outcome** (résultat possible du pari)
- Une **côte** (la probabilité/rendement)

---

## 🎯 Marchés Principaux

### 1️⃣ **1X2 (Résultat du match)**
C'est le pari le plus simple: qui va gagner le match?

| Outcome | Signification | Exemple |
|---------|---------------|---------|
| **1** | **Home Win** (équipe à domicile gagne) | PSG gagne à domicile → Côte 1.50 |
| **X** | **Draw** (match nul) | Paris - Marseille termine 1-1 → Côte 3.20 |
| **2** | **Away Win** (équipe visiteur gagne) | PSG gagne en déplacement → Côte 2.80 |

**Affichage dans le tableau:**
```
1X2 | 1 (Home Win) Open    1X2 | 1 (Home Win) Close
1X2 | X (Draw) Open        1X2 | X (Draw) Close
1X2 | 2 (Away Win) Open    1X2 | 2 (Away Win) Close
```

---

### 2️⃣ **Spreads (Asian Handicap)**
Donne un "handicap" virtuel à une équipe pour équilibrer les cotes.

**Exemples avec une ligne de -0.5:**

| Outcome | Explication | Résultat |
|---------|-------------|----------|
| **Home -0.5** | Home doit gagner | PSG gagne 1-0 → ✅ Gagnant. PSG perd → ❌ Perdant |
| **Away +0.5** | Away peut perdre ou faire nul | PSG gagne 1-0 → ❌ Perdant. PSG 0-0 → ✅ Gagnant. PSG perd → ✅ Gagnant |

**Autres lignes courantes:**
- `-1.0` / `+1.0`: Home gagne de 2+ buts pour gagnant
- `-0.25` / `+0.25`: Split bet (moitié mise à -0, moitié à -0.5)
- `+1.5` / `-1.5`: Away peut perdre jusqu'à 1 but

**Affichage dans le tableau:**
```
Spreads | Home Open    Spreads | Home Close
Spreads | Away Open    Spreads | Away Close
```

⚠️ **Note:** Nos données Pinnacle ne contiennent PAS les lignes (handicap values). Affichage simplifié: juste Home/Away

---

### 3️⃣ **Totals (Over/Under - Nombre total de buts)**
Pariez sur le nombre TOTAL de buts marqués par les deux équipes réunies.

**Exemple avec une ligne 2.5:**

| Outcome | Signification | Résultat |
|---------|---------------|----------|
| **Over 2.5** | Plus de 2.5 buts (= 3+ buts au total) | PSG 2-1 Nice → ✅ Over gagnant (3 buts) |
| **Under 2.5** | Moins de 2.5 buts (= 0, 1 ou 2 buts) | PSG 1-1 Nice → ✅ Under gagnant (2 buts) |

**Autres lignes:**
- `Over 1.5 / Under 1.5`: Total >1 ou ≤1 buts
- `Over 3.5 / Under 3.5`: Total >3 ou ≤3 buts
- `Over 2.0 / Under 2.0`: Total >2 ou ≤2 buts

**Affichage dans le tableau:**
```
Totals | Over Open    Totals | Over Close
Totals | Under Open   Totals | Under Close
```

---

### 4️⃣ **Team Totals (Buts d'une seule équipe)**
Pariez sur le nombre de buts marqués par UNE SEULE équipe.

**Exemple Team Totals Home avec ligne 1.5:**

| Outcome | Signification | Résultat |
|---------|---------------|----------|
| **Over** | Home marque >1.5 buts (2+) | PSG 2-1 Nice → ✅ Over gagnant (PSG: 2 buts) |
| **Under** | Home marque ≤1.5 buts (0 ou 1) | PSG 1-1 Nice → ✅ Under gagnant (PSG: 1 but) |

**Affichage dans le tableau:**
```
Team Totals Home | Over Open      Team Totals Home | Over Close
Team Totals Home | Under Open     Team Totals Home | Under Close
Team Totals Away | Over Open      Team Totals Away | Over Close
Team Totals Away | Under Open     Team Totals Away | Under Close
```

---

### 5️⃣ **Corners Spread (Asian Handicap sur les corners)**
Même principe que Spreads, mais appliqué au nombre de CORNERS (coups francs).

| Outcome | Explication |
|---------|------------|
| **Home** | Home team aura plus de corners (avec handicap) |
| **Away** | Away team aura plus de corners (avec handicap) |

**Affichage:**
```
Corners Spread | Home Open    Corners Spread | Home Close
Corners Spread | Away Open    Corners Spread | Away Close
```

---

### 6️⃣ **Corners Totals (Over/Under sur les corners)**
Pariez sur le nombre TOTAL de corners du match.

**Exemple avec ligne 9.5:**

| Outcome | Signification |
|---------|---------------|
| **Over** | Plus de 9.5 corners au total (10+) |
| **Under** | Moins de 9.5 corners (0-9) |

**Affichage:**
```
Corners Totals | Over Open    Corners Totals | Over Close
Corners Totals | Under Open   Corners Totals | Under Close
```

---

### 7️⃣ **Bookings Spread & Totals (Sur les cartons)**
Pariez sur le nombre de **cartons jaunes** du match.

**Bookings Spread:** Handicap par équipe (Home vs Away)
**Bookings Totals:** Over/Under sur le nombre TOTAL de cartons

**Affichage:**
```
Bookings Spread | Home Open     Bookings Spread | Away Open
Bookings Totals | Over Open     Bookings Totals | Under Open
```

---

### 8️⃣ **Half-Time (HT) Markets**
Mêmes marchés que fulltime, mais pour la **première mi-temps SEULEMENT**.

| Marché | Explication |
|--------|------------|
| **HT 1X2** | Qui gagne à la 45e minute? |
| **HT Totals** | Over/Under de buts en première mi-temps |
| **Corners HT Spread** | Coins par équipe en première mi-temps |
| **Corners HT Totals** | Total de corners en première mi-temps |

**Affichage:**
```
HT 1X2 | 1 Open          HT 1X2 | 1 Close
HT Totals | Over Open    HT Totals | Over Close
Corners Spread HT | Home Open
```

---

## 📊 Tableau Récapitulatif

| Marché | Type | Valeur de Ligne | Exemples d'Outcomes |
|--------|------|-----------------|-------------------|
| **1X2** | Moneyline | N/A | 1, X, 2 |
| **Spreads** | Handicap | -1.5, -0.5, +0.5, +1.5 | Home, Away |
| **Totals** | Over/Under | 2.5, 3.0, 3.5 | Over, Under |
| **Team Totals** | Over/Under (1 équipe) | 1.5, 2.0, 2.5 | Over, Under |
| **Corners Spread** | Handicap (corners) | -2.5, -1.5, +1.5 | Home, Away |
| **Corners Totals** | Over/Under (corners) | 9.5, 10.5, 11.5 | Over, Under |
| **Bookings Spread** | Handicap (cartons) | -3.5, -2.5, +2.5 | Home, Away |
| **Bookings Totals** | Over/Under (cartons) | 35.5, 40.5, 45.5 | Over, Under |

---

## ❓ Pourquoi certaines cotes manquent?

1. **Pinnacle n'offre pas toutes les lignes:** Chaque marché a des lignes différentes (2.5, 3.0 pour Totals; -0.5, -1.0 pour Spreads, etc.)
2. **Pas tous les handicaps sont disponibles:** On ne reçoit que les lignes que Pinnacle propose
3. **Pas tous les marchés pour chaque match:** Certains petits matchs n'ont pas les Corners Totals, par exemple

---

## 💡 Exemple complet d'un match

**PSG 2 - Nice 1**

| Marché | 1 | X | 2 | Over 2.5 | Under 2.5 |
|--------|---|---|---|----------|-----------|
| **Cote** | 1.50 | 3.20 | 2.80 | 1.80 | 1.95 |
| **Résultat** | ✅ Gagnant | ❌ Perdant | ❌ Perdant | ✅ Gagnant (3 buts) | ❌ Perdant |

---

## 🚀 Interpréter les colonnes du tableau

Quand vous voyez: `1X2 | 1 (Home Win) Open: 1.50`

Cela signifie:
- **Marché:** 1X2 (Résultat du match)
- **Outcome:** 1 = Home Win
- **Type:** Open = Cote d'ouverture
- **Valeur:** 1.50 = Pour chaque €1 parié, vous gagnez €1.50

---

## 📝 Glossaire

| Terme | Signification |
|-------|---------------|
| **Open** | Cote d'ouverture (première cote du jour) |
| **Close** | Cote de fermeture (juste avant le match) |
| **Line** | La valeur du handicap/total (ex: 2.5 pour Over/Under) |
| **Outcome** | Un résultat possible du pari (ex: "Over" ou "Home") |
| **Market** | Le type de pari (ex: "1X2", "Totals") |

---

Vous avez encore des questions sur une cote spécifique? 😊
