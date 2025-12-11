# 🧪 Test Job A - Single League Workflow

**Objectif**: Valider le workflow d'insertion de données avant d'étendre à tous les championnats

## 📋 Prérequis

1. ✅ Variables d'environnement configurées:
   - `ODDS_API_IO_KEY` - Clé API Odds-API.io
   - `SUPABASE_URL` - URL Supabase
   - `SUPABASE_ANON_KEY` - Clé anonyme Supabase

2. ✅ Base de données v2 initialisée:
   ```bash
   # Exécuter les migrations
   npx supabase migration up
   ```

3. ✅ Tables créées:
   - `sports_v2`
   - `leagues_v2`
   - `teams_v2`
   - `players_v2`
   - `events_to_track`
   - `opening_closing_observed`

## 🚀 Étapes du test

### Étape 1: Exécuter le test

```bash
npm run test-job-a-single
```

**Ce que le script fait:**
1. ✅ Récupère les événements d'England Premier League via `/v3/events`
2. ✅ Affiche les 3 premiers événements
3. ✅ Récupère les cotes du premier événement via `/v3/odds`
4. ✅ Affiche les marchés Pinnacle disponibles
5. ✅ Vérifie les événements existants en DB
6. ✅ Insère le premier nouvel événement dans `events_to_track`
7. ✅ Insère toutes les cotes dans `opening_closing_observed`
8. ✅ Vérifie les données insérées

### Étape 2: Valider les outputs

**Résultat attendu:**

```
✅ Test completed successfully!

📋 Summary:
  ✓ API connection: OK
  ✓ Event fetching: OK (X events)
  ✓ Pinnacle odds: OK (N markets)
  ✓ Event insertion: OK
  ✓ Odds insertion: OK (N odds)
  ✓ Data verification: OK
```

## 🔍 Checklist de validation

Après l'exécution du test, vérifier:

- [ ] **API Connection**
  - [ ] Données récupérées sans erreur
  - [ ] Bookmaker Pinnacle trouvé
  - [ ] Marchés disponibles (h2h, spreads, totals)

- [ ] **Database Insertion**
  - [ ] Événement inséré dans `events_to_track`
  - [ ] État = `OPENING_CAPTURED_SLEEPING`
  - [ ] Toutes les cotes insérées dans `opening_closing_observed`
  - [ ] Pas d'erreur de contrainte unique

- [ ] **Data Structure**
  - [ ] `event_id` correct (ID Odds-API.io)
  - [ ] `opening_price_observed` en float
  - [ ] `opening_time_observed` en ISO 8601
  - [ ] `market_name` et `selection` corrects
  - [ ] Pas de doublon

- [ ] **Marchés présents**
  - [ ] h2h (Moneyline): `home`, `draw`, `away`
  - [ ] spreads: `home`, `away` + lignes multiples
  - [ ] totals: `over`, `under` + lignes multiples

## 📊 Exemples de réponses

### Si tout fonctionne ✅

```
🧪 Testing Job A - Single League

League: england-premier-league

📌 Step 1: Fetching events from API...
✅ Found 23 events

📋 Sample events from API:

  Event 1:
    ID: 61300825
    Match: Liverpool vs Brighton & Hove Albion
    Date: 2025-12-13T15:00:00Z
    Status: pending

...

✅ Event inserted successfully!

💾 Step 6: Inserting odds...
✅ Inserted 87 odds

🔍 Step 7: Verifying inserted data...
Event in DB: { event_id: 61300825, sport_slug: 'football', ... }

First 5 odds in DB:
[
  { market_name: 'h2h', selection: 'home', opening_price_observed: 1.694 },
  { market_name: 'h2h', selection: 'draw', opening_price_observed: 4.3 },
  ...
]
```

### Si erreur API ❌

```
❌ Error: API Key invalid or rate limit exceeded
```

**Solution:**
- Vérifier `ODDS_API_IO_KEY`
- Attendre avant de relancer
- Vérifier quota: `npm run list-bookmakers`

### Si erreur Database ❌

```
❌ Error inserting event: duplicate key value violates unique constraint
```

**Solution:**
- Événement déjà inséré précédemment
- Supprimer manuellement ou utiliser `upsert` au lieu de `insert`

### Si pas de Pinnacle ❌

```
❌ Pinnacle not available
```

**Solution:**
- Vérifier le nom exact du bookmaker
- Tester: `npm run list-bookmakers`
- Pinnacle doit être listée

## 📝 Prochaines étapes après validation

Si le test passe ✅:

1. **Tester avec plusieurs événements**
   - Modifier le script pour insérer les 5 premiers nouveaux événements
   - Valider les insertions multiples

2. **Tester avec 2-3 championnats**
   - Ajouter d'autres ligues (La Liga, Serie A)
   - Valider la scalabilité

3. **Mesurer les performances**
   - Temps pour 15 ligues
   - Nombre total de requêtes API
   - Espace DB utilisé

4. **Exécuter Job A complet**
   - Déployer sur tous les 15 championnats
   - Activer la synchronisation horaire

5. **Exécuter Jobs B et C**
   - Enrichissement des événements
   - Mise à jour des cotes avant KO

## ⚙️ Configuration test-job-a-single

**Fichier:** `scripts/test-job-a-single-league.ts`

**Variables:**
- `FOOTBALL = 'football'` - Sport slug
- `TEST_LEAGUE = 'england-premier-league'` - Ligue de test

**Pour changer de ligue:**

```typescript
const TEST_LEAGUE = 'spain-la-liga'; // La Liga
const TEST_LEAGUE = 'italy-serie-a';  // Serie A
const TEST_LEAGUE = 'germany-bundesliga'; // Bundesliga
```

## 🔄 Réinitialiser les données de test

Pour supprimer les données insérées pendant le test:

```sql
-- ⚠️ DANGER: Supprimer tous les événements et cotes
DELETE FROM opening_closing_observed WHERE league_slug = 'england-premier-league';
DELETE FROM events_to_track WHERE league_slug = 'england-premier-league';

-- Plus sécurisé: Supprimer un seul événement
DELETE FROM opening_closing_observed WHERE event_id = 61300825;
DELETE FROM events_to_track WHERE event_id = 61300825;
```

---

**Status:** Prêt à tester! 🚀
