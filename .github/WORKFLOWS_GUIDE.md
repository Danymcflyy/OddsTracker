# Guide des Workflows GitHub Actions

## 📋 Workflows disponibles

Vous avez maintenant **3 workflows** différents pour synchroniser les cotes. Voici comment choisir:

---

### ✅ **RECOMMANDÉ: `sync-odds-direct.yml`** (Option 1)

**Exécute le code directement dans GitHub Actions**

```yaml
Timeout: 6 heures
Coût: Gratuit (repo public)
Scalabilité: 10+ ligues
Fréquence: Toutes les 10 minutes
```

**Avantages:**
- ✅ Aucune limite de timeout
- ✅ Très scalable
- ✅ Pas de dépendance Vercel pour le sync
- ✅ Meilleurs logs

**Quand l'utiliser:**
- Vous voulez ajouter plusieurs ligues (3+)
- Vous voulez éviter les risques de timeout
- Vous voulez la meilleure architecture long terme

**Setup:**
Voir [DIRECT_SYNC_SETUP.md](DIRECT_SYNC_SETUP.md)

---

### ⚠️ `sync-odds-10min.yml` (Option 3 - Appelle Vercel)

**Appelle l'endpoint Vercel `/api/cron/sync-odds` toutes les 10 minutes**

```yaml
Timeout: 60 secondes (limite Vercel Hobby)
Coût: Gratuit
Scalabilité: 1-2 ligues max
Fréquence: Toutes les 10 minutes
```

**Avantages:**
- ✅ Plus simple (moins de secrets)
- ✅ Code reste sur Vercel

**Inconvénients:**
- ❌ Limite de 60 secondes stricte
- ❌ Risque de timeout avec plusieurs ligues

**Quand l'utiliser:**
- Seulement 1 ligue (Premier League)
- Vous voulez la solution la plus simple

**Setup:**
Secrets requis: `CRON_SECRET`, `VERCEL_URL`

---

### ⚠️ `sync-odds.yml` (Appelle Vercel - 5 minutes)

**Appelle l'endpoint Vercel toutes les 5 minutes**

```yaml
Timeout: 60 secondes (limite Vercel Hobby)
Fréquence: Toutes les 5 minutes
```

**Avantages:**
- ✅ Synchronisation plus fréquente

**Inconvénients:**
- ❌ Même limite de 60 secondes
- ❌ Plus de requêtes API (144/h vs 108/h)

**Quand l'utiliser:**
- Vous avez besoin de mises à jour très fréquentes
- Seulement 1 ligue

---

## 🎯 Notre Recommandation

### Pour votre cas (départ avec Premier League, possibilité d'ajouter des ligues):

**→ Utilisez `sync-odds-direct.yml`**

**Pourquoi:**
1. ✅ Pas de souci de timeout (6h vs 60s)
2. ✅ Peut gérer 10+ ligues facilement
3. ✅ Meilleure architecture long terme
4. ✅ Gratuit illimité sur repo public

**Comment faire:**
1. Suivez le guide [DIRECT_SYNC_SETUP.md](DIRECT_SYNC_SETUP.md)
2. Ajoutez les 4 secrets GitHub
3. Testez manuellement le workflow
4. Désactivez les autres workflows

---

## 🔧 Comment activer/désactiver un workflow

### Via l'interface GitHub

1. Allez sur **Actions** → Workflow
2. Cliquez sur le workflow
3. Cliquez sur "..." → **Disable workflow** ou **Enable workflow**

### Via suppression de fichier

```bash
# Supprimer les workflows que vous n'utilisez pas
rm .github/workflows/sync-odds.yml
rm .github/workflows/sync-odds-10min.yml

git add .github/workflows/
git commit -m "Keep only direct sync workflow"
git push
```

---

## 📊 Comparaison rapide

| Workflow | Timeout | Setup | Scalabilité | Recommandation |
|----------|---------|-------|-------------|----------------|
| **sync-odds-direct.yml** | 6h | Moyen | 10+ ligues | ⭐⭐⭐⭐⭐ |
| sync-odds-10min.yml | 60s | Simple | 1-2 ligues | ⭐⭐⭐ |
| sync-odds.yml | 60s | Simple | 1 ligue | ⭐⭐ |

---

## ❓ Questions fréquentes

### Puis-je garder plusieurs workflows actifs en même temps?

❌ **Non recommandé** - Cela ferait tourner plusieurs syncs en parallèle et:
- Risque de conflits DB
- Consomme plus de quota API
- Crée de la confusion dans les logs

**Mieux:** Désactivez tous les workflows sauf un.

### Quel workflow consomme le moins de quota API?

Tous consomment pareil **par exécution**, mais la fréquence change:

```
sync-odds-direct.yml:   6 runs/h = 108 req API/h
sync-odds-10min.yml:    6 runs/h = 108 req API/h
sync-odds.yml:          12 runs/h = 144 req API/h
```

### Je veux ajouter Ligue 1, quel workflow?

→ **sync-odds-direct.yml** obligatoire
- 2 ligues = ~60-80s de traitement
- Vercel Hobby (60s max) sera trop juste

### Puis-je changer de workflow plus tard?

✅ **Oui** - Les workflows sont indépendants:
1. Désactivez l'ancien
2. Activez le nouveau
3. Aucune migration de données nécessaire

---

## 🚀 Setup rapide

**Si vous voulez démarrer rapidement avec le workflow recommandé:**

```bash
# 1. Allez sur GitHub → Settings → Secrets → Actions
# 2. Ajoutez les 4 secrets (voir DIRECT_SYNC_SETUP.md)
# 3. Désactivez les anciens workflows

gh workflow disable sync-odds.yml
gh workflow disable sync-odds-10min.yml

# 4. Testez le nouveau

gh workflow run sync-odds-direct.yml
```

Voir [DIRECT_SYNC_SETUP.md](DIRECT_SYNC_SETUP.md) pour les détails complets.
