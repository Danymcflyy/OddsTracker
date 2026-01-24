# 📊 Liste Complète des Marchés Disponibles

## Marchés Principaux (Tous Sports)

| Clé du Marché | Description | Disponibilité Soccer |
|---|---|---|
| **h2h** | Match winner (1X2 avec nul pour le soccer) | ✅ Haute |
| **spreads** | Handicap / Point Spread | ⚠️ Limitée |
| **totals** | Over/Under buts | ✅ Haute |
| **outrights** | Vainqueur de tournoi/championnat | ✅ Disponible |

## Marchés Soccer Spécifiques

### Marchés Principaux Match
| Clé du Marché | Description | Coût Crédits |
|---|---|---|
| **h2h_3_way** | Vainqueur du match (1X2) | 1 |
| **btts** | Les deux équipes marquent (Oui/Non) | 1 |
| **draw_no_bet** | Vainqueur sans nul (remboursement si nul) | 1 |
| **double_chance** | Combinaison de 2 résultats (1X, X2, 12) | 1 |

### Marchés Totaux par Équipe
| Clé du Marché | Description | Coût Crédits |
|---|---|---|
| **team_totals** | Over/Under buts d'une équipe (principal) | 1 |
| **alternate_team_totals** | Over/Under buts équipe (toutes variations) | 3 |

### Marchés Alternatifs (Multiples Variations)
| Clé du Marché | Description | Coût Crédits |
|---|---|---|
| **alternate_spreads** | Handicap (toutes variations de points) | 3 |
| **alternate_totals** | Over/Under (toutes variations de points) | 3 |

### Marchés Corners & Cartons
| Clé du Marché | Description | Coût Crédits |
|---|---|---|
| **alternate_spreads_corners** | Handicap sur les corners | 3 |
| **alternate_totals_corners** | Over/Under corners | 3 |
| **alternate_spreads_cards** | Handicap sur les cartons | 3 |
| **alternate_totals_cards** | Over/Under cartons | 3 |

### Marchés 1ère Mi-Temps
| Clé du Marché | Description | Coût Crédits |
|---|---|---|
| **h2h_h1** | Vainqueur 1ère mi-temps (1X2) | 1 |
| **spreads_h1** | Handicap 1ère mi-temps (principal) | 1 |
| **totals_h1** | Over/Under 1ère mi-temps (principal) | 1 |
| **alternate_spreads_h1** | Handicap 1ère mi-temps (toutes variations) | 3 |
| **alternate_totals_h1** | Over/Under 1ère mi-temps (toutes variations) | 3 |

### Marchés 2ème Mi-Temps
| Clé du Marché | Description | Coût Crédits |
|---|---|---|
| **h2h_h2** | Vainqueur 2ème mi-temps (1X2) | 1 |
| **spreads_h2** | Handicap 2ème mi-temps (principal) | 1 |
| **totals_h2** | Over/Under 2ème mi-temps (principal) | 1 |
| **alternate_spreads_h2** | Handicap 2ème mi-temps (toutes variations) | 3 |
| **alternate_totals_h2** | Over/Under 2ème mi-temps (toutes variations) | 3 |

## Marchés Player Props (Joueurs)

⚠️ **Disponibilité limitée** - Principalement pour EPL, Ligue 1, Bundesliga, Serie A, La Liga, MLS avec bookmakers US.

### Buteurs
| Clé du Marché | Description |
|---|---|
| **player_goal_scorer_anytime** | Buteur à tout moment |
| **player_goal_scorer_first** | Premier buteur |
| **player_goal_scorer_last** | Dernier buteur |

### Discipline
| Clé du Marché | Description |
|---|---|
| **player_to_receive_card** | Joueur reçoit un carton |
| **player_to_receive_red_card** | Joueur reçoit un carton rouge |

### Statistiques
| Clé du Marché | Description |
|---|---|
| **player_shots_on_target** | Tirs cadrés d'un joueur |
| **player_shots** | Tirs totaux d'un joueur |
| **player_assists** | Passes décisives d'un joueur |

## 💰 Coût en Crédits API

### Par Requête
- **Marchés standards** (h2h, spreads, totals, etc.) : **1 crédit**
- **Marchés alternates** (alternate_spreads, alternate_totals) : **3 crédits**
- **Chaque marché additionnel** : **+1 crédit**

### Exemple de Coût
Si vous suivez pour un événement:
- `h2h` : 1 crédit
- `alternate_spreads` : 3 crédits
- `alternate_totals` : 3 crédits
- `btts` : 1 crédit
- **Total par événement** : **8 crédits**

## 📋 Marchés Actuellement Suivis par OddsTracker

```
✅ h2h               - Match winner (1X2)
✅ spreads           - Handicap (converti en alternate_spreads)
✅ totals            - Over/Under (converti en alternate_totals)
✅ h2h_h1            - 1ère mi-temps winner
✅ spreads_h1        - 1ère mi-temps handicap (converti)
✅ totals_h1         - 1ère mi-temps over/under (converti)
```

## 🎯 Recommandations

### Marchés Essentiels (Haute Valeur)
1. **h2h** - Le marché le plus important
2. **totals** / **alternate_totals** - Très populaire
3. **btts** - Simple et populaire

### Marchés Avancés
4. **team_totals** - Stratégies avancées
5. **draw_no_bet** - Alternative au h2h
6. **double_chance** - Réduction du risque

### Marchés Spécialisés
7. **alternate_spreads_corners** - Pour traders corners
8. **alternate_totals_cards** - Niché mais profitable

## 📚 Sources

- [The Odds API - Betting Markets](https://the-odds-api.com/sports-odds-data/betting-markets.html)
- [The Odds API v4 Documentation](https://the-odds-api.com/liveapi/guides/v4/)

---

**Note**: La disponibilité des marchés varie selon:
- Le bookmaker sélectionné (Pinnacle a la meilleure couverture)
- La ligue/compétition
- Le moment de la requête (plus de marchés disponibles proche du kick-off)
