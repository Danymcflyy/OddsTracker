# 🚀 COMMANDES À COPIER-COLLER

## Scripts Individuels (Prêts à lancer)

### Test 1: Sync Sports & Events
```bash
./scripts/test-sync-events.sh
```

### Test 2: Scan Opening Odds
```bash
./scripts/test-opening-odds.sh
```

### Test 3: Sync Odds V2 Parallel
```bash
./scripts/test-sync-odds.sh
```

### Test 4: Sync Scores & Closing Odds
```bash
./scripts/test-closing-odds.sh
```

---

## Script Maître - TOUS LES TESTS

```bash
./scripts/test-all.sh
```

---

## Si "Permission Denied"

```bash
chmod +x scripts/test-*.sh
```

---

## Voir la Documentation

```bash
cat scripts/README-TESTS.md
```

---

## ⚠️ IMPORTANT

Assurez-vous d'avoir un fichier `.env.local` à la racine du projet avec :
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ODDS_API_KEY=...
ODDS_API_IO_KEY=...
```
