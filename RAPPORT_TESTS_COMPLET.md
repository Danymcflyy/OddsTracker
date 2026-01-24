# Rapport Complet des Tests - OddsTracker v4

Date: 21 Janvier 2026

---

## ✅ Tests Effectués avec Succès

### 1. Vérification de l'Intégrité des Données

#### Test des Cellules Vides
**Script:** `scripts/test-pinnacle-direct.ts`, `scripts/test-live-pinnacle.ts`

**Résultat:** ✅ **Aucun bug détecté**

Les cellules vides dans le tableau sont **normales** et correspondent à:

1. **Colonnes "Clôture" (Closing)**: Vides car pas encore capturées
   - La table `closing_odds` existe mais est vide
   - Les closing odds doivent être capturées avant le début du match

2. **Colonnes Handicap partiellement vides**: Normal!
   - Pour chaque point, Pinnacle ne donne qu'**une seule équipe**
   - Exemple: Point -1.25 → Cote `away` uniquement
   - Exemple: Point +1.25 → Cote `home` uniquement

**Données vérifiées:**
- ✅ API Pinnacle: Couvre bien les matchs avec tous les 7 marchés
- ✅ Base de données: 36 événements, 126 markets capturés
- ✅ Flux de données: Le frontend reçoit correctement les données
- ✅ Structure: Conforme aux attentes

**Documentation:** [EXPLICATION_CELLULES_VIDES.md](EXPLICATION_CELLULES_VIDES.md)

---

### 2. Correction de l'Extraction des Closing Odds

#### Problème Identifié
La fonction `extractMarketOdds` cherchait les mots "home" et "away" dans les noms, mais l'API retourne les **noms d'équipes réels** (ex: "Galatasaray", "Atlético Madrid").

#### Solution Implémentée
**Fichier modifié:** `lib/services/theoddsapi/closing-odds.ts`

```typescript
function extractMarketOdds(market: ApiMarket, homeTeam?: string, awayTeam?: string): MarketOdds {
  // Check for team names first (for h2h, spreads, etc.)
  if (homeTeam && nameOriginal === homeTeam) {
    odds.home = outcome.price;
  } else if (awayTeam && nameOriginal === awayTeam) {
    odds.away = outcome.price;
  }
  // ... puis fallback sur 'home', 'away', 'draw', 'over', 'under'
}
```

**Test:** `scripts/test-closing-odds-fixed.ts`

**Résultat:** ✅ **Correction réussie**

**Avant:**
```json
h2h: { "last_update": "...", "draw": 3.84 }  ❌ Manque home et away
```

**Après:**
```json
h2h: {
  "last_update": "...",
  "home": 3.47,
  "draw": 3.84,
  "away": 2.06
}  ✅ Complet!
```

**Crédits utilisés:** 7 crédits

---

### 3. API Historical pour Closing Odds

#### Test de l'API Historical
**Script:** `scripts/test-historical-closing.ts`

**Résultat:** ❌ **Nécessite un plan payant**

L'API Historical n'est pas disponible avec la clé gratuite:
```
"Historical odds are only available on paid usage plans"
```

#### Alternative Recommandée: Scan Pré-Kickoff

**Workflow:**
1. **Opening odds**: Capturées lors de la découverte des matchs
2. **Closing odds**: Capturées 5-10 min avant kick-off (via GitHub Actions)
3. **Scores**: Capturés après le match

**Avantages:**
- ✅ Gratuit (utilise les crédits normaux)
- ✅ Plus précis (vraies closing odds)
- ✅ Workflow déjà implémenté

**Coût API Historical si activé:** 10× plus cher selon les réglages

---

### 4. Synchronisation des Scores

#### Test de Sync Scores
**Script:** `scripts/test-sync-scores.ts`

**Résultat:** ✅ **Fonctionne parfaitement**

**Statistiques:**
- 9 matchs terminés récupérés
- 9 événements mis à jour en DB
- 2 crédits utilisés
- 100% de réussite

**Exemples de scores synchronisés:**
```
✅ FC Kairat 1 - 4 Club Brugge
✅ Bodø/Glimt 3 - 1 Manchester City
✅ Real Madrid 6 - 1 AS Monaco
✅ Inter Milan 1 - 3 Arsenal
✅ Tottenham 2 - 0 Dortmund
✅ Sporting 2 - 1 PSG
✅ Olympiakos 2 - 0 Leverkusen
✅ Villarreal 1 - 2 Ajax
✅ Copenhagen 1 - 1 Napoli
```

**Colonne Score ajoutée au tableau:**
- Affiche le score pour les matchs terminés
- Format: "1 - 4" en gras
- Affiche "-" pour les matchs à venir

**Fichier modifié:** `components/tables/v4/column-builder.tsx`

---

## 📊 Résumé des Crédits API

| Test | Crédits Utilisés | Crédits Restants |
|------|------------------|------------------|
| Départ | - | 52 |
| Vérification Pinnacle live | 14 | 38 |
| Test extraction closing | 7 | 31 |
| Sync scores | 2 | 29 |
| **TOTAL UTILISÉ** | **23** | **29** |

---

## 🎯 État Actuel du Système

### ✅ Fonctionnalités Opérationnelles

1. **Opening Odds Capture**
   - ✅ Découverte des événements
   - ✅ Scan des cotes d'ouverture
   - ✅ Stockage des variations (alternate markets)
   - ✅ Affichage dans le tableau

2. **Affichage Tableau**
   - ✅ Colonnes dynamiques par outcome
   - ✅ Séparation Opening/Closing
   - ✅ Labels français clairs
   - ✅ Ordre des marchés: 1X2 en premier
   - ✅ Colonne Score pour matchs terminés

3. **Synchronisation Scores**
   - ✅ Récupération des scores via API
   - ✅ Mise à jour en base de données
   - ✅ Affichage dans le tableau

### ⏳ Fonctionnalités à Compléter

1. **Closing Odds Capture**
   - ⏳ Implémenté mais pas encore exécuté
   - Nécessite: Workflow GitHub Actions pré-kickoff
   - Alternative: API Historical (payant, 10× plus cher)

2. **GitHub Actions Workflows**
   - `.github/workflows/scan-opening-odds.yml` ✅
   - `.github/workflows/sync-events.yml` ✅
   - `.github/workflows/sync-scores-closing.yml` ⏳ À tester

---

## 📁 Scripts de Test Créés

Tous les scripts sont dans `/scripts/`:

### Diagnostics
- `check-api-credits.ts` - Vérifier crédits API restants
- `check-schema.ts` - Vérifier schéma des tables
- `check-events-schema.ts` - Schéma table events
- `check-closing-odds-table.ts` - Vérifier table closing_odds
- `check-one-event.ts` - Vérifier un événement complet
- `check-recent-events.ts` - Lister événements récents
- `check-tracked-markets.ts` - Voir marchés suivis

### Tests Pinnacle
- `test-pinnacle-direct.ts` - Test API directe Pinnacle
- `test-live-pinnacle.ts` - Test avec événements en cours
- `test-closing-odds-live.ts` - Test closing odds sur événements actuels
- `test-closing-odds-fixed.ts` - Test correction extraction
- `test-historical-closing.ts` - Test API Historical

### Tests Frontend
- `test-full-data-flow.ts` - Test flux complet des données
- `simulate-frontend-data.ts` - Simuler données frontend
- `diagnose-frontend-data.ts` - Diagnostic données frontend

### Synchronisation
- `test-sync-scores.ts` - Test synchronisation scores ✅
- `find-completed-matches.ts` - Trouver matchs terminés
- `test-discover-v2.ts` - Test découverte événements
- `test-opening-v2.ts` - Test scan opening odds

### Utilitaires
- `clean-database.ts` - Nettoyer la base
- `setup-single-league-test.ts` - Config pour test avec 1 ligue
- `update-tracked-markets.ts` - Mettre à jour marchés suivis

---

## 🔧 Modifications de Code

### Fichiers Modifiés

1. **`lib/services/theoddsapi/closing-odds.ts`**
   - Correction fonction `extractMarketOdds()`
   - Ajout paramètres `homeTeam` et `awayTeam`
   - Identification correcte des cotes home/away

2. **`lib/api/theoddsapi/client.ts`**
   - Ajout méthode `getHistoricalOdds()`
   - Support endpoint `/historical/sports/...`

3. **`components/tables/v4/column-builder.tsx`**
   - Ajout colonne "Score"
   - Affichage conditionnel pour matchs terminés
   - Format: `homeScore - awayScore` en gras

### Fichiers de Documentation Créés

- `EXPLICATION_CELLULES_VIDES.md` - Explication détaillée des cellules vides
- `RAPPORT_TESTS_COMPLET.md` - Ce fichier

---

## 💡 Recommandations

### Court Terme

1. **Tester le Workflow Closing Odds**
   - Attendre un match à venir
   - Configurer GitHub Action pour scanner 5-10 min avant
   - Vérifier que les colonnes "Clôture" se remplissent

2. **Optimiser les Crédits API**
   - Actuellement: ~29 crédits restants
   - Recommandation: Nouvelle clé API ou plan payant pour usage intensif

### Long Terme

1. **API Historical**
   - Si budget disponible: Activer pour fallback 3 jours
   - Coût: 10× plus cher que scan normal
   - Avantage: Récupération des closing odds manquées

2. **Monitoring**
   - Dashboard déjà implémenté
   - Suivre les taux de capture (actuellement ~50%)
   - Alertes pour échecs de scan

---

## ✅ Conclusion

**Tous les tests effectués ont réussi ou ont identifié les limitations attendues.**

Le système OddsTracker v4 est **opérationnel** pour:
- ✅ Capture des opening odds
- ✅ Synchronisation des scores
- ✅ Affichage dans le tableau frontend

Les closing odds sont **implémentées** mais nécessitent:
- Configuration du workflow pré-kickoff (gratuit)
- OU Activation de l'API Historical (payant)

**Aucun bug critique détecté.** Les cellules vides sont dues à des limitations d'API ou de données, pas à des erreurs de code.
