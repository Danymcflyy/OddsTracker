# 🧹 Rapport de Nettoyage - Migration The Odds API v4

## 📊 Résumé
- **Fichiers obsolètes identifiés :** ~50 fichiers
- **Dossiers à supprimer :** 7 dossiers
- **Fichiers à conserver :** Utilitaires génériques, auth, supabase

---

## ❌ FICHIERS OBSOLÈTES À SUPPRIMER

### 1. Ancien Client API (lib/api/oddsapi/)
**Remplacé par :** `lib/api/theoddsapi/`

```
lib/api/oddsapi/client.ts
lib/api/oddsapi/normalizer.ts
lib/api/oddsapi/rate-limiter.ts
lib/api/oddsapi/types.ts
```

**Raison :** Ancienne API remplacée par The Odds API v4

---

### 2. Anciennes Queries v3 (lib/db/queries/v3/)
**Remplacé par :** `lib/db/helpers.ts` (nouvelle version)

```
lib/db/queries/v3/matches.ts
lib/db/queries/v3/markets.ts
lib/db/queries/v3/filter-options.ts
```

**Raison :** Structure DB complètement changée (tables `events`, `market_states`, etc.)

---

### 3. Anciennes Queries Générales (lib/db/queries/)
**Remplacé par :** `lib/db/helpers.ts`

```
lib/db/queries/fixtures.ts
lib/db/queries/odds.ts
lib/db/queries/leagues.ts
lib/db/queries/settings.ts
```

**Raison :** Tables `fixtures`, `odds`, `leagues` n'existent plus

---

### 4. Services de Sync Anciens (lib/sync/)
**Remplacé par :** `lib/services/theoddsapi/`

```
lib/sync/sync-service.ts
lib/sync/daily-sync.ts
lib/sync/historical-sync.ts
lib/sync/auto-sync-service.ts
lib/sync/state-machine-service.ts
lib/sync/league-mappings.ts
lib/sync/jobs/job-a-incremental-odds.ts
lib/sync/jobs/job-b-events-enrichment.ts
lib/sync/jobs/job-c-pre-kickoff-scan.ts
```

**Raison :** Nouvelle architecture de sync (discovery, opening-odds, closing-odds)

---

### 5. Découverte V3 (lib/api/v3/)
**Remplacé par :** `lib/services/theoddsapi/discovery.ts`

```
lib/api/v3/league-discovery.ts
lib/api/v3/match-discovery.ts
lib/api/v3/match-discovery-per-league.ts
lib/api/v3/odds-capture.ts
lib/api/v3/odds-capture-per-league.ts
```

**Raison :** Nouvelle API et architecture

---

### 6. Configurations Anciennes (lib/config/)
**Remplacé par :** Table `settings` en DB + `lib/api/theoddsapi/constants.ts`

```
lib/config/markets-config.ts
lib/config/markets.ts
lib/config/tournaments.ts
lib/config/leagues-config.ts
```

**Raison :** Configuration maintenant dynamique en DB

---

### 7. Settings Anciens (lib/settings/)
**Remplacé par :** Table `settings` + API `/api/v4/settings`

```
lib/settings/odds-api-key.ts
lib/settings/closing-strategy.ts
lib/settings/followed-tournaments.ts
```

**Raison :** Settings maintenant en DB

---

### 8. Import/Export (si non utilisé)
**À évaluer :** Garder si besoin d'exporter les données

```
lib/import/catalog.ts
lib/export/csv-export.ts
lib/export/xlsx-export.ts
```

**Action :** Garder temporairement, supprimer si pas utilisé par le frontend

---

### 9. OddsAPI Utils (lib/oddspapi/)
**Obsolète**

```
lib/oddspapi.ts
lib/oddspapi/ (tout le dossier)
```

**Raison :** Ancien client API

---

### 10. Fichiers Types Anciens
**Remplacé par :** `lib/db/types.ts` (nouveau)

```
lib/api/types.ts (si ancienne version)
```

---

## ✅ FICHIERS À CONSERVER

### Utilitaires (lib/utils/)
```
lib/utils.ts
lib/utils/date.ts
lib/utils/odds-format.ts
lib/utils/winner-detection.ts
```
**Raison :** Utilitaires génériques réutilisables

### Auth (lib/auth/)
```
lib/auth/middleware.ts
lib/auth/session.ts
```
**Raison :** Système d'authentification toujours utilisé

### Supabase (lib/supabase/)
```
lib/supabase/admin.ts
lib/supabase/client.ts
```
**Raison :** Clients Supabase essentiels

### Nouveaux Fichiers v4
```
lib/api/theoddsapi/
lib/services/theoddsapi/
lib/db/helpers.ts (nouveau)
lib/db/types.ts (nouveau)
```

---

## 🎯 PLAN D'ACTION SUGGÉRÉ

### Phase 1 : Backup (FAIT ✅)
- Migration DB appliquée
- Ancien schéma supprimé

### Phase 2 : Suppression Sécurisée

**Étape 1 : Supprimer les anciens clients API**
```bash
rm -rf lib/api/oddsapi/
rm -rf lib/api/v3/
rm -f lib/api/oddspapi.ts
rm -rf lib/oddspapi/
```

**Étape 2 : Supprimer les anciens services de sync**
```bash
rm -rf lib/sync/
```

**Étape 3 : Supprimer les anciennes queries**
```bash
rm -rf lib/db/queries/
```

**Étape 4 : Supprimer les anciennes configs**
```bash
rm -rf lib/config/
rm -rf lib/settings/
```

**Étape 5 : Évaluer import/export**
```bash
# À faire après adaptation du frontend
# Si non utilisé :
rm -rf lib/import/
rm -rf lib/export/
```

### Phase 3 : Vérification
- Build TypeScript : `npm run build`
- Vérifier qu'aucune référence aux anciens fichiers

---

## 📝 WORKFLOWS GITHUB ACTIONS

### Anciens Workflows (à supprimer)
```
.github/workflows/sync-v1-*.yml
.github/workflows/sync-v2-*.yml
```

### Nouveaux Workflows (à garder)
```
.github/workflows/sync-events.yml
.github/workflows/scan-opening-odds.yml
.github/workflows/sync-scores-closing.yml
```

---

## 🔍 RISQUES & PRÉCAUTIONS

**Risque faible :** Backend complètement refait, frontend à adapter
**Risque moyen :** Composants frontend pourraient référencer anciens fichiers
**Risque élevé :** Aucun (DB déjà migrée, backup disponible)

**Recommandation :** Supprimer après avoir adapté le frontend pour éviter les erreurs de compilation.

---

## 📊 GAIN ESTIMÉ

- **Fichiers supprimés :** ~50 fichiers
- **Lignes de code réduites :** ~5000 lignes
- **Clarté du code :** +++ (séparation claire v4)
- **Maintenance :** Simplifiée

---

**Date :** 2026-01-18
**Status :** En attente d'adaptation frontend
