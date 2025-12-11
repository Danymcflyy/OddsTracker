# 🔍 Odds-API.io Discovery Results

Documentation des données réelles de l'API Odds-API.io pour la migration.

---

## 1️⃣ Sports Disponibles

✅ **Source** : `GET /v3/sports`

**Résultat** : 34 sports disponibles

```json
[
  {"name":"Football","slug":"football"},
  {"name":"Basketball","slug":"basketball"},
  {"name":"Tennis","slug":"tennis"},
  {"name":"Baseball","slug":"baseball"},
  {"name":"American Football","slug":"american-football"},
  {"name":"Ice Hockey","slug":"ice-hockey"},
  {"name":"Esports","slug":"esports"},
  {"name":"Darts","slug":"darts"},
  {"name":"MMA","slug":"mixed-martial-arts"},
  {"name":"Boxing","slug":"boxing"},
  {"name":"Handball","slug":"handball"},
  {"name":"Volleyball","slug":"volleyball"},
  {"name":"Snooker","slug":"snooker"},
  {"name":"Table Tennis","slug":"table-tennis"},
  {"name":"Rugby","slug":"rugby"},
  {"name":"Cricket","slug":"cricket"},
  {"name":"Waterpolo","slug":"water-polo"},
  {"name":"Futsal","slug":"futsal"},
  {"name":"Beach Volley","slug":"beach-volleyball"},
  {"name":"Aussie Rules","slug":"aussie-rules"},
  {"name":"Floorball","slug":"floorball"},
  {"name":"Squash","slug":"squash"},
  {"name":"Beach Soccer","slug":"beach-soccer"},
  {"name":"Lacrosse","slug":"lacrosse"},
  {"name":"Curling","slug":"curling"},
  {"name":"Padel","slug":"padel"},
  {"name":"Bandy","slug":"bandy"},
  {"name":"Gaelic Football","slug":"gaelic-football"},
  {"name":"Beach Handball","slug":"beach-handball"},
  {"name":"Athletics","slug":"athletics"},
  {"name":"Badminton","slug":"badminton"},
  {"name":"Cross-Country","slug":"cross-country"},
  {"name":"Golf","slug":"golf"},
  {"name":"Cycling","slug":"cycling"}
]
```

**Cibles du projet :**
- ✅ `football` - Pour 15+ ligues
- ✅ `tennis` - Pour tournois ATP/WTA

---

## 2️⃣ Événements Football

✅ **Statut** : England Premier League - Testée

### Événement Example Structure

**Source** : `GET /v3/events?sport=football&league=england-premier-league`

**Exemple de réponse** :

```json
{
  "id": 61300827,
  "home": "Manchester United",
  "away": "AFC Bournemouth",
  "homeId": 35,
  "awayId": 60,
  "date": "2025-12-13T15:00:00Z",
  "sport": {
    "name": "Football",
    "slug": "football"
  },
  "league": {
    "name": "England - Premier League",
    "slug": "england-premier-league"
  },
  "status": "cancelled",
  "scores": {
    "home": 0,
    "away": 0
  }
}
```

**Structure identifiée** :
- ✅ `id` - Numéro entier unique (clé primaire API)
- ✅ `home` - Nom équipe domicile (string)
- ✅ `away` - Nom équipe extérieur (string)
- ✅ `homeId` - ID équipe domicile (entier)
- ✅ `awayId` - ID équipe extérieur (entier)
- ✅ `date` - Format ISO 8601 (ex: 2025-12-13T15:00:00Z)
- ✅ `sport.slug` - Toujours "football"
- ✅ `league.slug` - Slug ligue (ex: "england-premier-league")
- ✅ `status` - "pending", "live", "settled", "cancelled"
- ✅ `scores.home` / `scores.away` - 0 si non joué

**Observations** :
- Les équipes ont des IDs internes (homeId, awayId)
- Les dates sont en UTC
- Status peut être "cancelled" (match annulé)
- Réponse est un array de matchs

**Autres ligues à tester** :

```bash
curl "https://api2.odds-api.io/v3/events?sport=football&league=spain-la-liga&apiKey=YOUR_KEY"
curl "https://api2.odds-api.io/v3/events?sport=football&league=italy-serie-a&apiKey=YOUR_KEY"
```

---

## 3️⃣ Événements Tennis

⏳ **Statut** : En cours de découverte

Commandes à exécuter :

```bash
# Tournois à tester
curl "https://api2.odds-api.io/v3/events?sport=tennis&league=australian-open&apiKey=YOUR_KEY" | jq '.' | head -50

curl "https://api2.odds-api.io/v3/events?sport=tennis&league=wimbledon&apiKey=YOUR_KEY" | jq '.' | head -50
```

**Données reçues :**

```json
(À compléter)
```

---

## 4️⃣ Bookmakers Disponibles

✅ **Statut** : Pinnacle trouvé - Plusieurs variantes

**Source** : `GET /v3/bookmakers`

**Bookmakers Pinnacle disponibles** :

```json
[
  {
    "name": "Pin88",
    "active": true
  },
  {
    "name": "Pinnacle",
    "active": true
  },
  {
    "name": "Pinnacle.bet.br",
    "active": true
  },
  {
    "name": "Pinnacle_2",
    "active": true
  }
]
```

**Pinnacle trouvé ?**
- ✅ OUI - Plusieurs variantes disponibles !

**Observations** :
- Pinnacle est disponible en 4 variantes
- La variante principale est `"Pinnacle"` (c'est celle à utiliser)
- `Pinnacle.bet.br` = Pinnacle Brésil
- `Pinnacle_2` = Pinnacle secondaire (raison inconnue)
- `Pin88` = Variante asiatique
- **À utiliser pour les requêtes** : `"Pinnacle"` (sans variantes)

---

## 5️⃣ Structure des Cotes (Sample Event)

✅ **Statut** : Testée - Liverpool vs Brighton

**Source** : `GET /v3/odds?eventId=61300825&bookmakers=Pinnacle`

**Exemple de réponse** :

```json
{
  "id": 61300825,
  "home": "Liverpool FC",
  "away": "Brighton & Hove Albion",
  "date": "2025-12-13T15:00:00Z",
  "sport": {
    "name": "Football",
    "slug": "football"
  },
  "league": {
    "name": "England - Premier League",
    "slug": "england-premier-league"
  },
  "urls": {
    "Pinnacle": "https://www.pinnacle.com/..."
  },
  "bookmakers": {
    "Pinnacle": [
      {
        "name": "ML",
        "updatedAt": "2025-12-11T05:22:23.55Z",
        "odds": [
          {
            "home": "1.694",
            "draw": "4.300",
            "away": "4.670",
            "max": 3000
          }
        ]
      },
      {
        "name": "Spread",
        "updatedAt": "2025-12-11T05:22:23.55Z",
        "odds": [
          {
            "hdp": -0.25,
            "home": "1.505",
            "away": "2.720",
            "max": 3000
          },
          {
            "hdp": -0.75,
            "home": "1.884",
            "away": "2.020",
            "max": 3000
          },
          {
            "hdp": -1,
            "home": "2.170",
            "away": "1.746",
            "max": 3000
          }
        ]
      },
      {
        "name": "Totals",
        "updatedAt": "2025-12-11T05:22:23.55Z",
        "odds": [
          {
            "hdp": 2,
            "over": "1.224",
            "under": "4.460",
            "max": 2000
          }
        ]
      }
    ]
  }
}
```

**Structure identifiée** :
- ✅ `bookmakers.Pinnacle` - Array de marchés disponibles
- ✅ Market types : `ML` (Moneyline), `Spread`, `Totals`
- ✅ Chaque marché a : `name`, `updatedAt` (ISO format), `odds` array
- ✅ ML odds : `home`, `draw`, `away`, `max` (limite de mise)
- ✅ Spread odds : `hdp` (handicap), `home`, `away`, `max`
- ✅ Totals odds : `hdp` (total), `over`, `under`, `max`
- ✅ Tous les odds sont des strings (ex: "1.694")

**Observations critiques** :
1. Structure de clé dynamique : `bookmakers.Pinnacle` au lieu de `bookmakers[0]`
2. Odds sont en **strings** (pas des nombres!) - à convertir en float pour calculs
3. `updatedAt` en format ISO 8601 - utile pour tracking
4. `max` = limite de mise maximale pour ce odd
5. Réponse contient aussi les URLs de Pinnacle
6. Handicaps (spreads/totals) avec lignes multiples (0.25, 0.75, 1, 1.25, 1.75, etc.)

**À capturer en base de données** :
- `opening_price_observed` = premier odd reçu
- `opening_time_observed` = `updatedAt` du premier odd
- `closing_price_observed` = dernier odd reçu
- `closing_time_observed` = `updatedAt` du dernier odd

---

## 6️⃣ Endpoint /v3/odds/updated

❌ **Statut** : ENDPOINT N'EXISTE PAS (ou API différente)

### Tests effectués

**Test 1** : Avec `sport=football`
```bash
curl "https://api2.odds-api.io/v3/odds/updated?sport=football&since=UNIX_TS&bookmaker=Pinnacle&apiKey=KEY"
```
**Résultat** : `"error": "football is not a valid sport, use /v3/sports to get a list of valid sports"`

**Test 2** : Sans sport parameter
```bash
curl "https://api2.odds-api.io/v3/odds/updated?since=UNIX_TS&bookmaker=Pinnacle&apiKey=KEY"
```
**Résultat** : `"error": "Missing sport parameter"`

### Conclusion

⚠️ L'endpoint `/v3/odds/updated` **n'existe pas** sur cette API (ou fonctionne avec une structure différente).

### Stratégie alternative pour polling

Puisque `/v3/odds/updated` n'existe pas, utiliser à la place :

1. **Job A - Poll pour découvrir les nouveaux matchs** :
   - Utiliser `/v3/events?sport=football&league=LEAGUE_SLUG` régulièrement (toutes les heures)
   - Comparer avec les matchs en DB pour détecter les nouveaux
   - Récupérer les cotes du match via `/v3/odds?eventId=X&bookmakers=Pinnacle`

2. **Job B - Enrichissement des matchs** :
   - Utiliser `/v3/events` pour récupérer status et scores
   - Mettre à jour la DB quand status change

3. **Job C - Mise à jour des cotes** :
   - Récupérer les cotes via `/v3/odds?eventId=X` pour les matchs actifs
   - Capturer opening/closing prices

**Coût estimé** : À calculer basé sur nombre de ligues + fréquence polling

---

## 📊 Résumé de Configuration

| Élément | Statut | Valeur |
|---------|--------|--------|
| Sport Football slug | ✅ | `football` |
| Sport Tennis slug | ✅ | `tennis` |
| Bookmaker Pinnacle | ⏳ | À confirmer |
| Ligues Football | ⏳ | À lister |
| Tournois Tennis | ⏳ | À lister |
| Markets disponibles | ⏳ | À identifier |

---

**Mis à jour** : 2025-12-11
