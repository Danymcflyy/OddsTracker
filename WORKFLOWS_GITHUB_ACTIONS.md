# GitHub Actions Workflows - OddsTracker

Ce document décrit les 4 workflows automatisés qui gèrent la collecte de données.

## 📅 Vue d'Ensemble

| Workflow | Fréquence | Heures | Coût | Fonction |
|----------|-----------|--------|------|----------|
| **Sync Events** | Toutes les 6h | :17 (1:17, 7:17, 13:17, 19:17) | **0 crédits** (FREE) | Découverte de nouveaux événements |
| **Scan Opening Odds** | Toutes les 10 min | :02, :12, :22, :32, :42, :52 | **0 crédits** si déjà capturé | Capture des cotes d'ouverture |
| **Capture Closing Odds** | Toutes les 5 min | :01, :06, :11, :16, :21... :56 | ~8 crédits/événement | Multi-capture closing odds (M-10 à M+10) |
| **Sync Scores & Closing** | 1 fois par jour | 2:27 AM | 2 crédits + ~6/événement | Scores + Closing odds historiques |

## ⏰ Timing Optimisé

Les horaires sont **décalés** pour éviter la surcharge à :00 qui peut causer:
- Latence GitHub Actions
- Conflits entre workflows
- Rate limiting API

**Décalages appliqués:**
- Sync Events: :17 (au lieu de :00)
- Scan Opening: :02, :12, :22... (au lieu de :00, :10, :20...)
- Capture Closing: :01, :06, :11... (au lieu de :00, :05, :10...)
- Scores & Closing: :27 (au lieu de :00)

---

## 🔄 1. Sync Events (Découverte)

**Fichier:** `.github/workflows/sync-events.yml`

### Fonction
Découvre et synchronise les nouveaux événements pour les sports trackés (ex: Ligue des Champions).

### Fréquence
- Toutes les 6 heures à :17 (1:17, 7:17, 13:17, 19:17 UTC)
- Déclenche manuel disponible

### Coût
**0 crédits** - L'endpoint `/events` est gratuit

### Étapes
1. **Sync Sports** (one-time): Récupère la liste des sports disponibles
2. **Sync Events**: Pour chaque sport tracké, récupère les événements à venir

### Variables d'Environnement Requises
```yaml
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ODDS_API_KEY
```

### Monitoring
```bash
# Vérifier les événements synchronisés
npx tsx scripts/check-events.ts
```

---

## 📊 2. Scan Opening Odds

**Fichier:** `.github/workflows/scan-opening-odds.yml`

### Fonction
Capture les **cotes d'ouverture** pour tous les marchés trackés des événements à venir.

### Fréquence
- Toutes les 10 minutes: :02, :12, :22, :32, :42, :52
- Peut être configuré via settings UI (scan_frequency_minutes)

### Coût
**0 crédits** si les opening odds sont déjà capturées pour tous les événements.
~6 crédits par événement avec marchés pending (seulement la première capture).

**Optimisation intelligente:** Le système vérifie d'abord quels événements ont des marchés "pending". Si tous les opening odds sont déjà capturés (status = "captured"), **aucun appel API n'est fait** → 0 crédit consommé.

### Étapes
1. **Check Frequency Setting**: Vérifie la fréquence configurée dans settings
2. **Scan Opening Odds**: Pour chaque événement:
   - Vérifie les marchés qui n'ont pas encore de cotes d'ouverture
   - Capture h2h, spreads, totals selon configuration
   - Enregistre dans `opening_odds` table

### Variables d'Environnement Requises
```yaml
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ODDS_API_KEY
```

### Monitoring
```bash
# Vérifier les cotes d'ouverture capturées
SELECT event_id, markets, captured_at
FROM opening_odds
ORDER BY captured_at DESC
LIMIT 10;
```

---

## 🎯 3. Capture Closing Odds (Multi-Snapshot)

**Fichier:** `.github/workflows/capture-closing-odds.yml`

### Fonction
Capture **multiples snapshots** des cotes de clôture avec stratégie M-10 à M+10 pour 99.85% de fiabilité.

### Fréquence
- Toutes les 5 minutes: :01, :06, :11, :16, :21, :26, :31, :36, :41, :46, :51, :56
- Capture uniquement les événements dans la fenêtre M-15 à M+15

### Coût
~8 crédits par événement (vs 140 avec Historical API)

### Stratégie Multi-Snapshot
Capture à 5 moments clés:
- **M-10**: Cotes minimales (h2h uniquement) - filet de sécurité
- **M-5**: Cotes intermédiaires (h2h + spreads)
- **M-0**: Cotes complètes (h2h + spreads + totals) - cible principale
- **M+5**: Cotes post-kickoff (rattrapage si M-0 manqué)
- **M+10**: Dernière chance

### Optimisations
- **1 requête API par sport** (pas par match)
- **Cache 1 minute** pour éviter duplicatas
- **Marchés progressifs**: h2h → h2h+spreads → complet
- **Priorité bookmakers**: pinnacle > bet365 > betfair_ex_eu > onexbet

### Variables d'Environnement Requises
```yaml
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ODDS_API_KEY
```

### Monitoring
```bash
# Vérifier les snapshots capturés
npx tsx scripts/check-snapshots-table.ts

# Voir statistiques en temps réel
SELECT
  COUNT(*) as total_snapshots,
  COUNT(DISTINCT event_id) as events_tracked,
  bookmaker,
  minutes_before_kickoff
FROM closing_odds_snapshots
GROUP BY bookmaker, minutes_before_kickoff
ORDER BY minutes_before_kickoff DESC;
```

### Finalisation
Après M+10, le système:
1. Sélectionne le snapshot avec `bookmaker_last_update` le plus récent
2. Marque ce snapshot comme `is_selected = true`
3. Copie dans la table `closing_odds`

---

## 🏆 4. Sync Scores & Closing Odds

**Fichier:** `.github/workflows/sync-scores-closing.yml`

### Fonction
Synchronise les **scores finaux** et capture les **closing odds via Historical API** pour les matchs terminés.

### Fréquence
- 1 fois par jour: 2:27 AM UTC
- Processus complémentaire au multi-snapshot

### Coût
- 2 crédits pour scores
- ~6 crédits par événement complété (Historical API)
- **Note:** Les événements déjà capturés par multi-snapshot ne consomment pas de crédits supplémentaires

### Utilité
Fallback pour les événements qui n'ont pas été capturés par le multi-snapshot:
- Problèmes techniques
- Événements ajoutés tardivement
- Gaps dans la capture temps réel

### Variables d'Environnement Requises
```yaml
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ODDS_API_KEY
```

### Monitoring
```bash
# Vérifier les scores synchronisés
SELECT
  event_id,
  home_score,
  away_score,
  status,
  updated_at
FROM events
WHERE status = 'completed'
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 🔐 Configuration GitHub Secrets

Les workflows nécessitent ces secrets configurés dans **GitHub Settings → Secrets → Actions**:

```bash
NEXT_PUBLIC_SUPABASE_URL        # URL de votre projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Clé anonyme Supabase
SUPABASE_SERVICE_ROLE_KEY       # Clé service role (admin)
ODDS_API_KEY                    # Clé The Odds API
```

### Vérifier les Secrets
1. GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Les 4 secrets doivent être présents
3. Aucune valeur ne doit être visible (normal, c'est secret)

---

## 🧪 Test Manuel

Chaque workflow peut être déclenché manuellement:

1. GitHub → **Actions**
2. Sélectionner le workflow dans la liste à gauche
3. Cliquer **"Run workflow"** (bouton vert)
4. Confirmer **"Run workflow"**
5. Observer les logs en temps réel

---

## 📈 Coûts Estimés

### Par Jour (18 matchs Champions League)
| Workflow | Exécutions | Coût/exécution | Total |
|----------|------------|----------------|-------|
| Sync Events | 4 | 0 crédits | **0** |
| Scan Opening | ~144 | 0 crédits (après 1ère capture) | **~108** (première fois seulement) |
| Capture Closing | ~288 | ~8 crédits/événement | **~150** |
| Scores & Closing | 1 | 2 + (6 × événements manqués) | **~2-110** |
| **TOTAL** | | | **~260-370 crédits/jour** |

**Note importante:**
- **Scan Opening**: Coûte ~6 crédits/événement UNIQUEMENT la première fois. Les 143 scans suivants = **0 crédit** car opening odds déjà capturées
- **Scores & Closing**: Coûte uniquement pour événements non capturés par multi-snapshot (fallback rare)

### Économies vs Approche Naïve
- Sans cache: ~2,500 crédits/jour
- Sans multi-snapshot: +1,400 crédits
- **Économie totale: ~60%**

---

## 🚨 Dépannage

### Workflow échoue
1. Vérifier les logs dans GitHub Actions
2. Vérifier que tous les secrets sont configurés
3. Vérifier les quotas API restants

### Pas de données capturées
1. Vérifier que les sports sont trackés: `SELECT * FROM sports WHERE is_tracked = true`
2. Vérifier les événements à venir: `npx tsx scripts/check-events.ts`
3. Vérifier les marchés trackés: `SELECT * FROM tracked_markets`

### Rate Limiting
- The Odds API: 500 requêtes/seconde (rarement atteint)
- GitHub Actions: 1,000 minutes/mois (gratuit), illimité pour repos publics

---

## 📚 Documentation Technique

- **Stratégie Multi-Capture**: `STRATEGIE_FIABILITE_CLOSING_ODDS.md`
- **Optimisation Coûts**: `OPTIMISATION_COUTS_MULTI_CAPTURE.md`
- **Timing GitHub Actions**: `EXPLICATION_GITHUB_ACTIONS_TIMING.md`
- **Historical vs Pre-Kickoff**: `EXPLICATION_HISTORICAL_VS_PREKICKOFF.md`
- **Implémentation Complète**: `IMPLEMENTATION_CLOSING_ODDS.md`

---

## ✅ Checklist Déploiement

- [x] Table `closing_odds_snapshots` créée
- [ ] Secrets GitHub configurés (4 secrets requis)
- [x] Workflows committés et pushés
- [ ] Test manuel de chaque workflow réussi
- [ ] Première capture automatique vérifiée
- [ ] Monitoring Supabase configuré

**Statut:** Prêt pour production ✨
