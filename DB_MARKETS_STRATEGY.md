# Stratégie d'intégration des marchés Pinnacle dans la DB

## 📊 Situation actuelle

Votre table `markets` est basique et ne contient pas toutes les métadonnées nécessaires :
- ✗ Pas de lien avec le sport
- ✗ Pas de type de marché (1x2, totals, spreads)
- ✗ Pas de période (fulltime, halftime)
- ✗ Pas de ligne de handicap

## 🎯 Objectif

Améliorer la table `markets` pour supporter tous les marchés Pinnacle et n'insérer que les **marchés principaux** pour chaque sport.

## ✅ Plan d'action en 4 étapes

### Étape 1 : Appliquer la migration SQL

Exécutez la migration pour ajouter les colonnes manquantes :

```bash
# Connectez-vous à votre DB et exécutez :
psql -U votre_user -d votre_db -f lib/db/migrations/003_improve_markets_table.sql
```

Ou via Supabase Dashboard : SQL Editor → Coller le contenu de `003_improve_markets_table.sql`

**Colonnes ajoutées** :
- `sport_id` : Référence au sport (10=Football, 12=Tennis, etc.)
- `market_type` : Type de marché (1x2, totals, spreads)
- `period` : Période (fulltime, halftime)
- `handicap` : Ligne de handicap (ex: 2.5, -1.5)
- `player_prop` : Booléen pour les marchés de joueur
- `active` : Booléen pour activer/désactiver un marché

### Étape 2 : Vérifier les marchés disponibles

Si vous voulez voir tous les marchés Pinnacle disponibles avant de les insérer :

```bash
npm run export-markets
```

Cela génère `PINNACLE_MARKETS.md` avec tous les marchés par sport.

### Étape 3 : Insérer les marchés principaux

Exécutez le script de seed qui insère automatiquement les marchés principaux :

```bash
npm run seed-markets
```

**Ce script insère** :

#### Football (10)
- **Fulltime** :
  - 1X2 : Full Time Result
  - Totals : 0.5, 1.5, 2.5, 3.5, 4.5, 5.5
  - Spreads : -3 à +3 (par paliers de 0.5)
- **Halftime** :
  - 1X2 : First Half Result
  - Totals : 0.5, 1.5, 2.5
  - Spreads : -2 à +2 (par paliers de 0.5)

#### Tennis (12)
- **Fulltime** :
  - 1X2 : Match Winner
  - Totals Sets : 2.5, 3.5, 4.5
  - Totals Games : 20.5, 22.5, 24.5
  - Spreads : -5.5 à +5.5

#### Hockey (15)
- **Fulltime** :
  - 1X2 : Match Winner
  - Totals : 4.5, 5.5, 6.5, 7.5
  - Spreads : -2.5 à +2.5

#### Volleyball (23)
- **Fulltime** :
  - 1X2 : Match Winner
  - Totals : 145.5, 150.5, 155.5, 160.5, 165.5
  - Spreads : -15, -10, -5, +5, +10, +15

### Étape 4 : Vérifier l'insertion

Le script affiche automatiquement un résumé. Vous pouvez aussi vérifier manuellement :

```sql
SELECT
  s.name as sport,
  m.market_type,
  m.period,
  COUNT(*) as count
FROM markets m
JOIN sports s ON m.sport_id = s.id
GROUP BY s.name, m.market_type, m.period
ORDER BY s.name, m.market_type, m.period;
```

## 📝 Personnalisation

Si vous voulez ajouter/retirer des marchés, éditez le fichier :
[scripts/seed-main-markets.ts](scripts/seed-main-markets.ts)

Modifiez la constante `MAIN_MARKETS_CONFIG` :

```typescript
const MAIN_MARKETS_CONFIG = {
  10: { // Football
    types: ["1x2", "totals", "spreads"],
    periods: ["fulltime", "halftime"],
    totalsLines: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5],
    totalsLinesHalftime: [0.5, 1.5, 2.5],
    // ... etc
  }
}
```

Puis relancez `npm run seed-markets`.

## 🔄 Mise à jour des Outcomes

N'oubliez pas de mettre à jour aussi la table `outcomes` pour chaque marché inséré. Les outcomes principaux sont :

- **1X2** : 1, X, 2
- **Totals** : Over, Under
- **Spreads** : 1, 2

Vous pouvez créer un script similaire pour seed les outcomes si nécessaire.

## ⚠️ Important

- Le script utilise `upsert` avec `onConflict: "oddspapi_id"` : pas de doublons
- Les marchés existants seront mis à jour avec les nouvelles colonnes
- Utilisez `active = false` pour désactiver un marché sans le supprimer

## 🚀 Résumé des commandes

```bash
# 1. Voir tous les marchés disponibles (optionnel)
npm run export-markets

# 2. Insérer les marchés principaux dans la DB
npm run seed-markets

# 3. Vérifier dans Supabase Dashboard ou via SQL
```

Voilà ! Votre base de données aura tous les marchés principaux correctement structurés. 🎉
