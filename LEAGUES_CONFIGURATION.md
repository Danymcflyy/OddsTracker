# 🏆 Configuration des Ligues - The Odds API

Ce document liste toutes les ligues disponibles sur The Odds API avec Pinnacle.

## ⚠️ Important

**Limitations par rapport au PROJECT_SPEC** :
- ❌ **Volleyball non disponible** sur The Odds API
- ⚠️ Données historiques seulement depuis **juin 2020** (pas janvier 2019)
- ⚠️ Historique **payant** (service additionnel)

---

## 📋 Configuration Actuelle

Dans `lib/oddspapi/sync-service.ts`, vous avez actuellement **5 ligues** :

```typescript
export const SPORTS_CONFIG = [
  {
    key: "soccer_epl",
    name: "Premier League",
    sport_slug: "football",
    country: "England",
  },
  {
    key: "soccer_spain_la_liga",
    name: "La Liga",
    sport_slug: "football",
    country: "Spain",
  },
  {
    key: "soccer_germany_bundesliga",
    name: "Bundesliga",
    sport_slug: "football",
    country: "Germany",
  },
  {
    key: "icehockey_nhl",
    name: "NHL",
    sport_slug: "hockey",
    country: "USA",
  },
  {
    key: "tennis_atp_french_open",
    name: "Roland Garros",
    sport_slug: "tennis",
    country: "France",
  },
];
```

**Coût par sync complète** : ~25 requêtes

---

## ⚽ Football (Soccer) - Ligues Recommandées

### Top 5 Ligues Européennes (MUST HAVE)

```typescript
// Angleterre
{ key: "soccer_epl", name: "Premier League", sport_slug: "football", country: "England" },
{ key: "soccer_efl_champ", name: "Championship", sport_slug: "football", country: "England" },

// Espagne
{ key: "soccer_spain_la_liga", name: "La Liga", sport_slug: "football", country: "Spain" },
{ key: "soccer_spain_segunda_division", name: "La Liga 2", sport_slug: "football", country: "Spain" },

// Allemagne
{ key: "soccer_germany_bundesliga", name: "Bundesliga", sport_slug: "football", country: "Germany" },
{ key: "soccer_germany_bundesliga2", name: "Bundesliga 2", sport_slug: "football", country: "Germany" },

// Italie
{ key: "soccer_italy_serie_a", name: "Serie A", sport_slug: "football", country: "Italy" },
{ key: "soccer_italy_serie_b", name: "Serie B", sport_slug: "football", country: "Italy" },

// France
{ key: "soccer_france_ligue_one", name: "Ligue 1", sport_slug: "football", country: "France" },
{ key: "soccer_france_ligue_two", name: "Ligue 2", sport_slug: "football", country: "France" },
```

### Autres Ligues Européennes

```typescript
// Portugal
{ key: "soccer_portugal_primeira_liga", name: "Primeira Liga", sport_slug: "football", country: "Portugal" },

// Pays-Bas
{ key: "soccer_netherlands_eredivisie", name: "Eredivisie", sport_slug: "football", country: "Netherlands" },

// Belgique
{ key: "soccer_belgium_first_div", name: "Pro League", sport_slug: "football", country: "Belgium" },

// Turquie
{ key: "soccer_turkey_super_league", name: "Süper Lig", sport_slug: "football", country: "Turkey" },

// Écosse
{ key: "soccer_spl", name: "Scottish Premiership", sport_slug: "football", country: "Scotland" },

// Grèce
{ key: "soccer_greece_super_league", name: "Super League", sport_slug: "football", country: "Greece" },

// Autriche
{ key: "soccer_austria_bundesliga", name: "Austrian Bundesliga", sport_slug: "football", country: "Austria" },

// Suisse
{ key: "soccer_switzerland_superleague", name: "Super League", sport_slug: "football", country: "Switzerland" },
```

### Coupes Européennes (IMPORTANT)

```typescript
{ key: "soccer_uefa_champs_league", name: "UEFA Champions League", sport_slug: "football", country: "Europe" },
{ key: "soccer_uefa_europa_league", name: "UEFA Europa League", sport_slug: "football", country: "Europe" },
{ key: "soccer_uefa_europa_conference_league", name: "Conference League", sport_slug: "football", country: "Europe" },
```

### Coupes Nationales

```typescript
{ key: "soccer_fa_cup", name: "FA Cup", sport_slug: "football", country: "England" },
{ key: "soccer_efl_cup", name: "League Cup", sport_slug: "football", country: "England" },
{ key: "soccer_spain_copa_del_rey", name: "Copa del Rey", sport_slug: "football", country: "Spain" },
{ key: "soccer_germany_dfb_pokal", name: "DFB Pokal", sport_slug: "football", country: "Germany" },
{ key: "soccer_france_coupe_de_france", name: "Coupe de France", sport_slug: "football", country: "France" },
```

### Amérique

```typescript
// USA
{ key: "soccer_usa_mls", name: "MLS", sport_slug: "football", country: "USA" },

// Mexique
{ key: "soccer_mexico_ligamx", name: "Liga MX", sport_slug: "football", country: "Mexico" },

// Brésil
{ key: "soccer_brazil_campeonato", name: "Brasileirão Série A", sport_slug: "football", country: "Brazil" },
{ key: "soccer_brazil_serie_b", name: "Brasileirão Série B", sport_slug: "football", country: "Brazil" },

// Argentine
{ key: "soccer_argentina_primera_division", name: "Primera División", sport_slug: "football", country: "Argentina" },

// Chili
{ key: "soccer_chile_campeonato", name: "Primera División", sport_slug: "football", country: "Chile" },

// Colombie
{ key: "soccer_colombia_primera_a", name: "Primera A", sport_slug: "football", country: "Colombia" },
```

### Coupes Continentales Amérique

```typescript
{ key: "soccer_conmebol_copa_libertadores", name: "Copa Libertadores", sport_slug: "football", country: "South America" },
{ key: "soccer_conmebol_copa_sudamericana", name: "Copa Sudamericana", sport_slug: "football", country: "South America" },
```

### Asie & Océanie

```typescript
// Japon
{ key: "soccer_japan_j_league", name: "J1 League", sport_slug: "football", country: "Japan" },

// Corée du Sud
{ key: "soccer_korea_kleague1", name: "K League 1", sport_slug: "football", country: "South Korea" },

// Australie
{ key: "soccer_australia_aleague", name: "A-League", sport_slug: "football", country: "Australia" },

// Chine
{ key: "soccer_china_superleague", name: "Chinese Super League", sport_slug: "football", country: "China" },
```

### Compétitions Internationales

```typescript
{ key: "soccer_fifa_world_cup", name: "FIFA World Cup", sport_slug: "football", country: "International" },
{ key: "soccer_uefa_european_championship", name: "Euro", sport_slug: "football", country: "Europe" },
{ key: "soccer_conmebol_copa_america", name: "Copa America", sport_slug: "football", country: "South America" },
```

---

## 🏒 Hockey sur Glace - Ligues Recommandées

### Amérique du Nord (MUST HAVE)

```typescript
{ key: "icehockey_nhl", name: "NHL", sport_slug: "hockey", country: "USA/Canada" },
{ key: "icehockey_nhl_preseason", name: "NHL Preseason", sport_slug: "hockey", country: "USA/Canada" },
{ key: "icehockey_ahl", name: "AHL", sport_slug: "hockey", country: "USA/Canada" },
```

### Europe

```typescript
// Suède
{ key: "icehockey_sweden_hockey_league", name: "SHL", sport_slug: "hockey", country: "Sweden" },
{ key: "icehockey_sweden_allsvenskan", name: "HockeyAllsvenskan", sport_slug: "hockey", country: "Sweden" },

// Finlande
{ key: "icehockey_finland_liiga", name: "Liiga", sport_slug: "hockey", country: "Finland" },
{ key: "icehockey_finland_mestis", name: "Mestis", sport_slug: "hockey", country: "Finland" },

// Russie/KHL
{ key: "icehockey_khl", name: "KHL", sport_slug: "hockey", country: "Russia" },

// République tchèque
{ key: "icehockey_czech_extraliga", name: "Czech Extraliga", sport_slug: "hockey", country: "Czech Republic" },

// Suisse
{ key: "icehockey_nla", name: "National League", sport_slug: "hockey", country: "Switzerland" },

// Allemagne
{ key: "icehockey_germany_del", name: "DEL", sport_slug: "hockey", country: "Germany" },

// Autriche
{ key: "icehockey_austria_ebel", name: "ICE Hockey League", sport_slug: "hockey", country: "Austria" },

// Norvège
{ key: "icehockey_norway_eliteserien", name: "GET-ligaen", sport_slug: "hockey", country: "Norway" },

// Danemark
{ key: "icehockey_denmark_metal_ligaen", name: "Metal Ligaen", sport_slug: "hockey", country: "Denmark" },
```

---

## 🎾 Tennis - Tournois Recommandés

### Grand Slams (MUST HAVE)

```typescript
// Australian Open
{ key: "tennis_atp_australian_open", name: "Australian Open (ATP)", sport_slug: "tennis", country: "Australia" },
{ key: "tennis_wta_australian_open", name: "Australian Open (WTA)", sport_slug: "tennis", country: "Australia" },

// Roland Garros
{ key: "tennis_atp_french_open", name: "Roland Garros (ATP)", sport_slug: "tennis", country: "France" },
{ key: "tennis_wta_french_open", name: "Roland Garros (WTA)", sport_slug: "tennis", country: "France" },

// Wimbledon
{ key: "tennis_atp_wimbledon", name: "Wimbledon (ATP)", sport_slug: "tennis", country: "UK" },
{ key: "tennis_wta_wimbledon", name: "Wimbledon (WTA)", sport_slug: "tennis", country: "UK" },

// US Open
{ key: "tennis_atp_us_open", name: "US Open (ATP)", sport_slug: "tennis", country: "USA" },
{ key: "tennis_wta_us_open", name: "US Open (WTA)", sport_slug: "tennis", country: "USA" },
```

### Masters 1000 / Premier (ATP/WTA)

```typescript
// Indian Wells
{ key: "tennis_atp_indian_wells", name: "Indian Wells (ATP)", sport_slug: "tennis", country: "USA" },
{ key: "tennis_wta_indian_wells", name: "Indian Wells (WTA)", sport_slug: "tennis", country: "USA" },

// Miami
{ key: "tennis_atp_miami", name: "Miami Open (ATP)", sport_slug: "tennis", country: "USA" },
{ key: "tennis_wta_miami", name: "Miami Open (WTA)", sport_slug: "tennis", country: "USA" },

// Monte Carlo
{ key: "tennis_atp_monte_carlo", name: "Monte Carlo Masters", sport_slug: "tennis", country: "Monaco" },

// Madrid
{ key: "tennis_atp_madrid", name: "Madrid Open (ATP)", sport_slug: "tennis", country: "Spain" },
{ key: "tennis_wta_madrid", name: "Madrid Open (WTA)", sport_slug: "tennis", country: "Spain" },

// Rome
{ key: "tennis_atp_rome_masters", name: "Rome Masters (ATP)", sport_slug: "tennis", country: "Italy" },
{ key: "tennis_wta_rome", name: "Rome Masters (WTA)", sport_slug: "tennis", country: "Italy" },

// Canada
{ key: "tennis_atp_canadian_open", name: "Canadian Open (ATP)", sport_slug: "tennis", country: "Canada" },
{ key: "tennis_wta_canadian_open", name: "Canadian Open (WTA)", sport_slug: "tennis", country: "Canada" },

// Cincinnati
{ key: "tennis_atp_cincinnati_masters", name: "Cincinnati Masters (ATP)", sport_slug: "tennis", country: "USA" },
{ key: "tennis_wta_cincinnati", name: "Cincinnati Masters (WTA)", sport_slug: "tennis", country: "USA" },

// Shanghai
{ key: "tennis_atp_shanghai_masters", name: "Shanghai Masters", sport_slug: "tennis", country: "China" },

// Paris
{ key: "tennis_atp_paris_masters", name: "Paris Masters", sport_slug: "tennis", country: "France" },
```

### ATP 500 / WTA 500

```typescript
{ key: "tennis_atp_dubai", name: "Dubai (ATP)", sport_slug: "tennis", country: "UAE" },
{ key: "tennis_atp_barcelona", name: "Barcelona Open", sport_slug: "tennis", country: "Spain" },
{ key: "tennis_atp_hamburg", name: "Hamburg Open", sport_slug: "tennis", country: "Germany" },
{ key: "tennis_atp_washington", name: "Washington Open", sport_slug: "tennis", country: "USA" },
{ key: "tennis_atp_vienna", name: "Vienna Open", sport_slug: "tennis", country: "Austria" },
{ key: "tennis_atp_basel", name: "Basel Open", sport_slug: "tennis", country: "Switzerland" },
```

### Finals

```typescript
{ key: "tennis_atp_finals", name: "ATP Finals", sport_slug: "tennis", country: "Italy" },
{ key: "tennis_wta_finals", name: "WTA Finals", sport_slug: "tennis", country: "International" },
```

---

## ❌ Volleyball

**Non disponible** sur The Odds API.

Options :
1. **Retirer ce sport** du projet
2. **Utiliser une autre API** pour le volleyball uniquement
3. **Attendre** que The Odds API l'ajoute

---

## 💡 Configurations Recommandées

### Configuration Minimale (15 ligues) - ~40 req/sync

**Football** (10 ligues) :
- Top 5 européennes (EPL, La Liga, Bundesliga, Serie A, Ligue 1)
- UEFA Champions League
- UEFA Europa League
- MLS
- Liga MX
- Copa Libertadores

**Hockey** (3 ligues) :
- NHL
- SHL
- Liiga

**Tennis** (2 tournois) :
- Australian Open (ATP + WTA)
- Roland Garros (ATP + WTA)

**Coût** : ~40 requêtes/sync → Plan Rookie (20k) = 500 syncs/mois

---

### Configuration Complète (50+ ligues) - ~150 req/sync

Inclut toutes les ligues listées ci-dessus.

**Coût** : ~150 requêtes/sync → Plan Rookie (20k) = 133 syncs/mois (~4x/jour)

---

### Configuration Intensive (100+ ligues) - ~300 req/sync

Inclut absolument tout (y compris divisions 2, coupes nationales, etc.)

**Coût** : ~300 requêtes/sync → Plan Champion (90k) = 300 syncs/mois (~10x/jour)

---

## 🚀 Comment Ajouter des Ligues

1. **Modifier** `lib/oddspapi/sync-service.ts`
2. **Ajouter** les objets dans `SPORTS_CONFIG`
3. **Tester** avec `npm run test:single-league` (modifier la clé de test)
4. **Synchroniser** avec `npm run sync:odds`

**Exemple** :

```typescript
export const SPORTS_CONFIG = [
  // Vos ligues actuelles...

  // Ajouter Serie A
  {
    key: "soccer_italy_serie_a",
    name: "Serie A",
    sport_slug: "football",
    country: "Italy",
  },

  // Ajouter Primeira Liga
  {
    key: "soccer_portugal_primeira_liga",
    name: "Primeira Liga",
    sport_slug: "football",
    country: "Portugal",
  },
];
```

---

## 📚 Sources

- [The Odds API - Sports APIs](https://the-odds-api.com/sports-odds-data/sports-apis.html)
- [The Odds API - Documentation](https://the-odds-api.com/liveapi/guides/v4/)
- [The Odds API - Bookmaker APIs](https://the-odds-api.com/sports-odds-data/bookmaker-apis.html)

---

**Dernière mise à jour** : 2025-12-05
