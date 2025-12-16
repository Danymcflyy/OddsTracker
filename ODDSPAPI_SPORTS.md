# Odds-API.io – Liste des sports et IDs

Ce document conserve la correspondance `sportId` ↔ `slug` ↔ `nom` renvoyée par l’endpoint `/v4/sports`.  
Les IDs marqués ✅ sont ceux utilisés par OddsTracker (Football, Hockey sur glace, Tennis, Volleyball).

| # | sportId | Nom Odds-API.io            | Slug               | Suivi |
|---|--------:|------------------------|--------------------|:-----:|
| 1 | 10 | Soccer | soccer | ✅ |
| 2 | 11 | Basketball | basketball | |
| 3 | 12 | Tennis | tennis | ✅ |
| 4 | 13 | Baseball | baseball | |
| 5 | 14 | American Football | american-football | |
| 6 | 15 | Ice Hockey | ice-hockey | ✅ |
| 7 | 16 | ESport Dota | esport-dota | |
| 8 | 17 | ESport Counter-Strike | esport-counter-strike | |
| 9 | 18 | ESport League of Legends | esport-league-of-legends | |
| 10 | 19 | Darts | darts | |
| 11 | 20 | MMA | mma | |
| 12 | 21 | Boxing | boxing | |
| 13 | 22 | Handball | handball | |
| 14 | 23 | Volleyball | volleyball | ✅ |
| 15 | 24 | Snooker | snooker | |
| 16 | 25 | Table Tennis | table-tennis | |
| 17 | 26 | Rugby | rugby | |
| 18 | 27 | Cricket | cricket | |
| 19 | 28 | Waterpolo | waterpolo | |
| 20 | 29 | Futsal | futsal | |
| 21 | 30 | Beach Volley | beach-volley | |
| 22 | 31 | Aussie Rules | aussie-rules | |
| 23 | 32 | Field hockey | field-hockey | |
| 24 | 33 | Floorball | floorball | |
| 25 | 34 | Squash | squash | |
| 26 | 35 | Basketball 3x3 | basketball-3x3 | |
| 27 | 36 | Beach Soccer | beach-soccer | |
| 28 | 37 | Pesapallo | pesapallo | |
| 29 | 38 | Lacrosse | lacrosse | |
| 30 | 39 | Curling | curling | |
| 31 | 40 | Padel | padel | |
| 32 | 41 | Bandy | bandy | |
| 33 | 42 | Kabaddi | kabaddi | |
| 34 | 43 | Rink Hockey | rink-hockey | |
| 35 | 44 | Soccer Specials | soccer-specials | |
| 36 | 45 | Gaelic Football | gaelic-football | |
| 37 | 46 | Netball | netball | |
| 38 | 47 | Beach Handball | beach-handball | |
| 39 | 48 | Athletics | athletics | |
| 40 | 49 | Badminton | badminton | |
| 41 | 50 | Bowls | bowls | |
| 42 | 51 | Cross-Country | cross-country | |
| 43 | 52 | Gaelic Hurling | gaelic-hurling | |
| 44 | 53 | Softball | softball | |
| 45 | 54 | eSoccer | esoccer | |
| 46 | 55 | eBasketball | ebasketball | |
| 47 | 56 | ESport Call of Duty | esport-call-of-duty | |
| 48 | 57 | ESport Overwatch | esport-overwatch | |
| 49 | 58 | ESport Rainbow Six | esport-rainbow-six | |
| 50 | 59 | ESport Rocket League | esport-rocket-league | |
| 51 | 60 | ESport StarCraft | esport-starcraft | |
| 52 | 61 | ESport Valorant | esport-valorant | |
| 53 | 62 | ESport Arena of Valor | esport-arena-of-valor | |
| 54 | 63 | ESport King of Glory | esport-king-of-glory | |
| 55 | 64 | Judo | judo | |
| 56 | 65 | ESport Honor of Kings | esport-honor-of-kings | |
| 57 | 66 | Speedway | speedway | |
| 58 | 67 | Golf | golf | |
| 59 | 68 | Cycling | cycling | |

## Sports suivis par OddsTracker

- ⚽ Football → `sportId=10`
- 🎾 Tennis → `sportId=12`
- 🏒 Hockey sur glace → `sportId=15`
- 🏐 Volleyball → `sportId=23`

## Commandes utiles (pour lister les tournois majeurs)

```bash
# Football (Premier League, etc.)
node --import tsx ./scripts/test-tournaments.ts --sport=10 --search=premier

# Hockey sur glace (NHL, SHL, …)
node --import tsx ./scripts/test-tournaments.ts --sport=15 --search=nhl

# Tennis (Grand Slams)
node --import tsx ./scripts/test-tournaments.ts --sport=12 --search=open

# Volleyball (SuperLega, PlusLiga, …)
node --import tsx ./scripts/test-tournaments.ts --sport=23 --search=lega
```

Ces commandes filtrent la liste des tournois pour aider à sélectionner les championnats à suivre en production.
