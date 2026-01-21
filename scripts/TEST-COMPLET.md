# 🧪 Test Complet - OddsTracker v4

## Objectif
Tester l'ensemble du système de bout en bout après les corrections :
- ✅ Extraction home/away/draw/over/under
- ✅ Multiples variations de points (spreads, totals)
- ✅ Interface de sélection des marchés
- ✅ Affichage dans le tableau

---

## Étape 1 : Vider la Base de Données

```bash
npx tsx scripts/clean-database.ts
```

**Résultat attendu** :
```
📊 Avant nettoyage:
  - Events: XXX
  - Market States: XXX

✅ Base de données nettoyée avec succès!

📊 Après nettoyage:
  - Events: 0
  - Market States: 0

✅ Données préservées:
  - Sports: 70
  - Settings: X
```

---

## Étape 2 : Lancer l'Application

```bash
npm run dev
```

Accéder à : **http://localhost:3000/login**

---

## Étape 3 : Configurer les Ligues et Marchés

### 3.1 Accéder aux Settings
**URL** : http://localhost:3000/settings/data-collection

### 3.2 Sélectionner des Ligues (Sports)

**Recommandation** : Commencer avec 2-3 ligues populaires

Exemples :
- ✅ **England - Premier League** (EPL)
- ✅ **Spain - La Liga**
- ✅ **France - Ligue 1**

### 3.3 Sélectionner des Marchés

**Configuration Recommandée (Test MVP)** :

#### Full Time - Main Markets
- ✅ **Match Winner (1X2)** - h2h
- ✅ **Handicap** - spreads (sera converti en alternate_spreads)
- ✅ **Over/Under Goals** - totals (sera converti en alternate_totals)

#### First Half Markets
- ✅ **1st Half Winner** - h2h_h1
- ✅ **1st Half Handicap** - spreads_h1
- ✅ **1st Half Over/Under** - totals_h1

**Coût estimé** : ~16 crédits par événement

### 3.4 Sauvegarder
Cliquer sur **"Save Settings"**

---

## Étape 4 : Découvrir les Événements

```bash
npx tsx scripts/github-actions-discover.ts
```

**Résultat attendu** :
```
🔍 Découverte des événements...
✅ EPL: 5 événements découverts
✅ La Liga: 3 événements découverts
✅ Ligue 1: 4 événements découverts

📊 Total: 12 nouveaux événements
```

---

## Étape 5 : Capturer les Cotes d'Ouverture

```bash
npx tsx scripts/github-actions-opening.ts
```

**Résultat attendu** :
```
📊 Événements à scanner: 12
🎯 Marchés configurés: h2h, spreads, totals, h2h_h1, spreads_h1, totals_h1

Event 1/12: Arsenal vs Chelsea
  ✅ Captured h2h (3 outcomes)
  ✅ Captured spreads (18 variation(s))
  ✅ Captured totals (8 variation(s))
  ✅ Captured h2h_h1 (3 outcomes)
  ✅ Captured spreads_h1 (7 variation(s))
  ✅ Captured totals_h1 (4 variation(s))

...

✅ 12/12 événements scannés
```

---

## Étape 6 : Vérifier les Données en Base

```bash
npx tsx scripts/debug-odds-data.ts
```

**Vérifications** :

### ✅ Cotes home/away/draw présentes
```json
{
  "h2h": {
    "home": 2.51,
    "away": 2.66,
    "draw": 3.63
  }
}
```

### ✅ Multiples variations pour spreads
```json
{
  "spreads": [
    { "point": -2.25, "home": 1.85, "away": 2.05 },
    { "point": -1.5, "home": 1.90, "away": 1.95 },
    { "point": 0, "home": 2.00, "away": 1.90 },
    ...
    // 18 variations au total
  ]
}
```

### ✅ Multiples variations pour totals
```json
{
  "totals": [
    { "point": 1.5, "over": 1.30, "under": 3.50 },
    { "point": 2.5, "over": 1.90, "under": 1.95 },
    { "point": 3.5, "over": 3.00, "under": 1.40 },
    ...
    // 8-10 variations au total
  ]
}
```

---

## Étape 7 : Vérifier l'Interface Utilisateur

### 7.1 Accéder au Tableau
**URL** : http://localhost:3000/football

### 7.2 Vérifications dans le Tableau

#### ✅ Colonnes générées automatiquement
Devrait afficher :
```
| Date | Sport | Domicile | Extérieur | Statut |
| Match Winner (Ouverture) | Match Winner (Clôture) |
| Handicap (-2.25) (Ouverture) | Handicap (-2.25) (Clôture) |
| Handicap (-1.5) (Ouverture) | Handicap (-1.5) (Clôture) |
| ... (18 variations de spreads) |
| Over/Under (2.5) (Ouverture) | Over/Under (2.5) (Clôture) |
| ... (8 variations de totals) |
```

#### ✅ Contenu des cellules (sans coloration)
Pour **h2h** :
```
1: 2.51
X: 3.63
2: 2.66
```

Pour **spreads (-1.5)** :
```
1: 1.90 (-1.5)
2: 1.95 (+1.5)
```

Pour **totals (2.5)** :
```
O: 1.90 (2.5)
U: 1.95 (2.5)
```

#### ✅ Sélecteur de colonnes
- Cliquer sur **"Colonnes (X/Y)"**
- Vérifier le groupement par marché
- Tester "Tout afficher" / "Tout masquer"
- Tester la désactivation d'une variation spécifique

---

## Étape 8 : Test Optionnel - Closing Odds

Si des événements sont terminés :

```bash
npx tsx scripts/github-actions-closing.ts
```

**Vérifications** :
- ✅ Scores capturés (home_score, away_score)
- ✅ Closing odds présentes
- ✅ Colonne "Clôture" remplie dans le tableau

---

## ✅ Checklist de Validation

- [ ] DB vidée avec succès
- [ ] Ligues sélectionnées dans l'interface
- [ ] Marchés sélectionnés dans l'interface
- [ ] Settings sauvegardés
- [ ] Événements découverts (>0)
- [ ] Cotes d'ouverture capturées
- [ ] home/away/draw présents dans h2h
- [ ] 18 variations pour spreads
- [ ] 8+ variations pour totals
- [ ] Colonnes dynamiques affichées dans le tableau
- [ ] Contenu des cellules correct (sans coloration)
- [ ] Sélecteur de colonnes fonctionne
- [ ] Groupement par marché fonctionne

---

## 🐛 Dépannage

### Problème : Aucun événement découvert
**Solution** : Vérifier que les ligues sont bien activées dans Settings

### Problème : Seulement 1 variation pour spreads/totals
**Solution** : Vérifier les logs, devrait voir "alternate_spreads" dans les requêtes API

### Problème : Pas de cotes home/away
**Solution** : Vérifier les noms d'équipes dans les logs, matching devrait être exact

### Problème : Colonnes manquantes
**Solution** : Rafraîchir la page, vérifier le localStorage (F12 > Application > Local Storage)

---

## 📊 Consommation de Crédits Attendue

Pour **12 événements** avec **6 marchés** :
- h2h : 1 crédit × 12 = 12 crédits
- alternate_spreads : 3 crédits × 12 = 36 crédits
- alternate_totals : 3 crédits × 12 = 36 crédits
- h2h_h1 : 1 crédit × 12 = 12 crédits
- alternate_spreads_h1 : 3 crédits × 12 = 36 crédits
- alternate_totals_h1 : 3 crédits × 12 = 36 crédits

**Total** : ~168 crédits

---

**Date** : 20 Janvier 2026
**Version** : OddsTracker v4.0.0
