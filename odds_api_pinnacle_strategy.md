# Spécification intégration Odds-API.io (Pinnacle only)

Ce document décrit la stratégie pour utiliser **Odds-API.io** afin de collecter les cotes Pinnacle et reconstruire :

- la **cote d’ouverture observée** (*opening_observed*),
- la **cote de fermeture observée** (*closing_observed*),
- l’historique minimal utile,
- les **scores finaux** et paris gagnants/perdants.

Il est destiné à être donné à un assistant de code (ex : Claude Code) pour implémentation.

---

## 1. Contexte & objectifs

### 1.1 Sports & périmètre

Nous voulons suivre, via **Odds-API.io** :

- **Football** : ~15 championnats (Europe principalement),
- **Hockey** : ~2 championnats,
- **Tennis** : ATP & WTA (hommes & femmes),
- **Volley** : si couvert par l’API.

Bookmaker ciblé : **Pinnacle uniquement**.

### 1.2 Objectifs de données

Pour **chaque match** et pour plusieurs **marchés** (au moins ~6 markets par match, par ex. ML, Handicap, Totals, HT markets, team totals…), nous voulons :

- La **première cote Pinnacle observée avant le match** (*opening_observed*),
- La **dernière cote Pinnacle observée juste avant le coup d’envoi** (*closing_observed*),
- Optionnellement quelques snapshots intermédiaires,
- Le **score final** du match,
- La possibilité de déterminer **quel pari était gagnant/perdant** pour chaque marché / sélection.

Nous disposons d’un plan REST **5 000 requêtes / heure** (et éventuellement WebSocket plus tard).

---

## 2. Rappels sur l’API Odds-API.io

### 2.1 Guides officiels

Docs principales :

- Intro générale : https://docs.odds-api.io/
- Guide *Fetching Odds* : https://docs.odds-api.io/guides/fetching-odds
- Guide *Best Practices* : https://docs.odds-api.io/guides/best-practices
- Guide *WebSocket Real-Time Feed* : https://docs.odds-api.io/guides/websockets

### 2.2 Endpoints principaux utilisés (REST)

1. **`/v3/events`** – liste des matchs (events)  
   - Permet de récupérer : `id`, équipes, `date`, `league`, `sport`, `status` (pending, live, settled), `scores`.  
   - Utilisé pour :
     - Découvrir les matchs par sport/ligue,
     - Récupérer les scores finaux (status = `settled`).

2. **`/v3/odds` et `/v3/odds/multi`** – cotes complètes par eventId  
   - `/v3/odds` : 1 eventId,
   - `/v3/odds/multi` : jusqu’à 10 eventIds en une seule requête (compte pour 1 requête).  
   - Permet de récupérer, pour chaque bookmaker, une liste de markets : `ML`, `Spread`, `Totals`, etc. avec `updatedAt` et la structure d’odds.  
   - Doc : voir section *Fetching Odds*.  

3. **`/v3/odds/updated`** – *incremental feed* REST  
   - Permet de récupérer **uniquement les cotes qui ont changé** depuis un timestamp `since` (UNIX, ≤ 60 secondes dans le passé).  
   - Paramètres clés : `since`, `bookmaker`, `sport`.  
   - Exemple dans la doc : ne retourne que les events/markets pour lesquels les odds ont changé dans la dernière minute.

### 2.3 WebSocket (optionnel)

- WebSocket : même format de réponse que `/v3/odds`, mais en **push temps réel**.  
- Endpoint : `wss://api2.odds-api.io/v3/ws?apiKey=...&sport=football`  
- Permet de recevoir des messages `created` / `updated` / `deleted` pour chaque event + bookmaker.  
- Remplace avantageusement du polling agressif, mais ce document décrit une stratégie qui fonctionne **déjà correctement en REST** avec possibilité d’ajouter le WS plus tard.

### 2.4 Ce que la doc **ne garantit pas**

- La doc **ne précise pas** combien de jours avant un match :  
  - un **event** apparaît dans `/events`,  
  - les **cotes Pinnacle** apparaissent dans `/odds`.  
- Ce délai dépend :
  - du bookmaker (ici Pinnacle),
  - du sport / ligue,
  - de la politique d’ouverture des marchés.

Conclusion : on ne peut pas se baser sur une valeur fixe (ex : “toujours J-20”). Il faut **détecter dynamiquement** l’apparition des cotes Pinnacle.

---

## 3. Principe de la stratégie (haut niveau)

### 3.1 Idée générale

On découpe la vie d’un match en trois phases :

1. **Découverte & première cote Pinnacle (opening_observed)**  
   - Dès qu’un match reçoit pour la première fois des cotes Pinnacle, on enregistre la *première cote observée*.

2. **Sommeil jusqu’à 1h avant le match**  
   - Si le match est encore loin dans le temps, on **arrête de le scanner** pour économiser les requêtes.

3. **Phase “pré-KO” (1h avant le match)**  
   - À partir de 60 minutes avant le coup d’envoi, on remet ce match dans une boucle de scan plus fréquente (toutes les 5 minutes) pour suivre les derniers mouvements et fixer la **closing_observed** juste avant le début.

En parallèle, on utilise `/events` pour :

- connaître la `date` du match (`event_date`),
- suivre son `status` (`pending` → `live` → `settled`),
- récupérer les `scores.home` / `scores.away` une fois `settled`.

### 3.2 Détection optimisée de la “première cote Pinnacle”

Pour éviter de scanner **des dizaines de jours d’events sans cotes**, on exploite :

- soit **`/v3/odds/updated`** (REST incremental feed),
- soit, plus tard, le **WebSocket**.

#### Variante REST avec `/v3/odds/updated` (recommandée au départ)

- Toutes les **60 secondes** (limite `since`), pour chaque sport suivi (football, hockey, tennis, volley), on appelle :

```http
GET https://api2.odds-api.io/v3/odds/updated
  ?apiKey=...
  &since=UNIX_TIMESTAMP_60s_ago
  &sport=Football
  &bookmaker=Pinnacle
```

- L’API renvoie uniquement les events/markets Pinnacle dont les cotes ont changé dans la dernière minute.  
- Lorsqu’un **event apparaît pour la première fois** dans cette réponse :
  - c’est qu’il vient de recevoir ses premières cotes Pinnacle (ou tout au moins ses premiers changements visibles),
  - on peut donc considérer ces cotes comme notre **opening_observed**.

Cela permet de **ne pas scanner /events sur une fenêtre de 60 jours** juste pour savoir si Pinnacle a ouvert ses lignes :  
on réagit **aux updates d’odds**, pas aux events “vides”.

---

## 4. États et machine à états par match

On gère un état interne par `event_id` dans une table `events_to_track`.

### 4.1 États possibles

- `DISCOVERED_NO_ODDS`  
  On connaît l’event (via `/events` ou via un enrichissement ponctuel), mais **aucune cote Pinnacle observée**.

- `OPENING_CAPTURED_SLEEPING`  
  On a vu **Pinnacle pour la première fois** : `opening_observed` est fixée. Le match est encore loin → on le met en sommeil.

- `ACTIVE_NEAR_KO`  
  On est à **moins d’1h du coup d’envoi** → on relance le match dans la boucle de scan “toutes les 5 minutes” pour mettre à jour `closing_observed`.

- `FINISHED`  
  Match `settled` → on ne scanne plus les odds.

### 4.2 Transitions typiques

1. `DISCOVERED_NO_ODDS` → `OPENING_CAPTURED_SLEEPING`  
   - Déclenchée lorsque `/v3/odds/updated` ou `/v3/odds/multi` fournit des cotes Pinnacle pour cet event pour la **première fois**.
   - On enregistre `opening_price_observed` et `opening_time_observed` pour chaque marché / sélection.

2. `OPENING_CAPTURED_SLEEPING` → `ACTIVE_NEAR_KO`  
   - Quand `now >= event_date - 1h` (utiliser l’heure du match dans `/events`).  
   - On remet le match dans la boucle de scan “5 minutes” pour suivre la closing.

3. `ACTIVE_NEAR_KO` → `FINISHED`  
   - Quand `now >= event_date` et/ou `status = settled` dans `/events`.  
   - On arrête de mettre à jour les odds, on garde `closing_observed` telle quelle.

---

## 5. Schéma de base de données (simplifié)

### 5.1 Table `events_to_track`

```sql
CREATE TABLE events_to_track (
  event_id        BIGINT PRIMARY KEY,
  sport_slug      TEXT,
  league_slug     TEXT,
  home_team       TEXT,
  away_team       TEXT,
  event_date      TIMESTAMPTZ,
  status          TEXT,         -- pending, live, settled
  state           TEXT,         -- DISCOVERED_NO_ODDS, OPENING_CAPTURED_SLEEPING, ACTIVE_NEAR_KO, FINISHED
  next_scan_at    TIMESTAMPTZ,  -- pour le scheduler
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Table `opening_closing_observed`

```sql
CREATE TABLE opening_closing_observed (
  event_id          BIGINT,
  sport_slug        TEXT,
  league_slug       TEXT,
  bookmaker         TEXT,       -- 'Pinnacle'
  market_name       TEXT,       -- 'ML', 'Spread', 'Totals', etc.
  selection         TEXT,       -- 'home', 'draw', 'away', 'over', 'under', etc.
  line              NUMERIC,    -- handicap/total si applicable, sinon NULL

  opening_price_observed   NUMERIC,
  opening_time_observed    TIMESTAMPTZ,

  closing_price_observed   NUMERIC,
  closing_time_observed    TIMESTAMPTZ,

  event_date        TIMESTAMPTZ,

  PRIMARY KEY (event_id, bookmaker, market_name, selection, line)
);
```

> Important : le préfixe `*_observed` est volontaire.  
> Il indique que ces valeurs correspondent à la **première / dernière cote que NOUS avons vue via l’API**, et non nécessairement à l’“opening officiel” interne de Pinnacle.

### 5.3 Table `match_results`

```sql
CREATE TABLE match_results (
  event_id     BIGINT PRIMARY KEY,
  sport_slug   TEXT,
  league_slug  TEXT,
  home_team    TEXT,
  away_team    TEXT,
  home_score   INT,
  away_score   INT,
  event_date   TIMESTAMPTZ,
  status       TEXT          -- pending, live, settled
);
```

Cette table est alimentée via `/v3/events` avec `status=settled` pour connaître les scores finaux.

---

## 6. Flots de jobs & scheduling

### 6.1 Job A – Poll incremental odds (`/v3/odds/updated`)

**Fréquence** : toutes les 60 secondes par sport (`sport=Football`, `Ice-Hockey`, etc.).

**Rôle** : détecter l’apparition de **nouvelles cotes Pinnacle** sans scanner tout l’horizon J+X.

Pseudo-logic :

1. Conserver côté backend une variable `last_since` (UNIX) par sport.  
2. Toutes les 60s :

```text
GET /v3/odds/updated?apiKey=...&since=last_since&sport=Football&bookmaker=Pinnacle
```

3. Pour chaque event retourné :

   - Si `event_id` inconnu → créer une entrée dans `events_to_track` avec `state = DISCOVERED_NO_ODDS`.  
   - Si c’est la **première fois que Pinnacle apparaît** pour ce `(event_id, market, selection, line)` :
     - Créer/mettre à jour `opening_closing_observed` avec :
       - `opening_price_observed = price`,
       - `opening_time_observed = now`,
       - `closing_price_observed = price`,
       - `closing_time_observed = now`.
   - Mettre à jour `events_to_track.state` en `OPENING_CAPTURED_SLEEPING` si cette event avait `DISCOVERED_NO_ODDS`.

4. Mettre à jour `last_since = now` (ou le timestamp max reçu).

### 6.2 Job B – Enrichissement & scores via `/v3/events`

**Fréquence :**

- Découverte & refresh status : toutes les **30–60 minutes** par ligue.  
- Scores finaux : 1 fois par jour (fenêtre `from`/`to` sur la veille).

Rôles :

1. **Enrichir `events_to_track`** pour les nouveaux eventIds détectés via Job A (nom des équipes, league, `event_date`, etc.).  
2. **Mettre à jour `status`** (`pending`, `live`, `settled`).  
3. Quand `status = settled`, remplir `match_results` avec les scores finaux.

### 6.3 Job C – Scan haute fréquence pré-KO (5 minutes)

**Fréquence** : toutes les 5 minutes.

1. Sélectionner tous les events dans `events_to_track` :

   - dont `state = OPENING_CAPTURED_SLEEPING` et `now >= event_date - 1h` → passer `state = ACTIVE_NEAR_KO`.
   - dont `state = ACTIVE_NEAR_KO` et `now < event_date` → les garder actifs.

2. Construire la liste d’`event_id` à scanner (tous ceux en `ACTIVE_NEAR_KO`).  
   Les grouper par paquets de 10 eventIds et appeler :

```text
GET /v3/odds/multi?apiKey=...&eventIds=...&bookmakers=Pinnacle
```

3. Pour chaque market/selection/line retourné avant le match (`now < event_date`) :

   - Mettre à jour **uniquement** :  
     - `closing_price_observed = price`  
     - `closing_time_observed = now`

4. Quand `now >= event_date` ou qu’on voit via Job B que `status` bascule à `live`/`settled`, on arrête de toucher la closing.

---

## 7. Gestion des coûts de requêtes

Le plan REST donne **5 000 requêtes / heure**.

Avec l’architecture ci-dessus :

- Job A (`/v3/odds/updated`) :  
  - ~4 sports × 60 req/h = **240 req/h** max.

- Job B (`/v3/events`) :  
  - ~20 ligues × 2 fois/h max ≈ **40 req/h** (ou moins).

- Job C (`/v3/odds/multi`, 5 min, matchs en `ACTIVE_NEAR_KO`) :  
  - nombre de matchs dans l’heure précédant le coup d’envoi << nombre total de matchs “pending J+20”.  
  - typiquement : quelques dizaines de matchs → quelques requêtes `/odds/multi` par cycle (ex : 3–10 req / 5 min) soit **36–120 req/h**.

Total typique : **< 500–600 requêtes / heure**, très en-dessous des 5 000 req/h autorisées.  
Même en cas de pic (week-end européen chargé), la marge reste importante.

---

## 8. Options d’évolution (WebSocket)

Une fois la version REST stabilisée, on peut :

- Remplacer Job A (odds/updated) par un **listener WebSocket** filtré sur `sport=football` (puis autres sports).
- Utiliser le flux WS pour alimenter directement `opening_closing_observed` et, si souhaité, une table d’historique plus détaillée (`odds_snapshots`).
- Réduire encore le nombre de requêtes REST (garder seulement `/events` pour les métadonnées et scores finaux).

Le WebSocket pousse les mêmes structures que `/v3/odds`, mais en temps réel, avec des messages typés (`created`, `updated`, etc.).

---

## 9. Points à bien documenter dans le code

- Toutes les colonnes nommées `*_observed` représentent **la première / dernière cote que NOUS avons observée via Odds-API.io**, pas nécessairement l’opening/closing “officiel” interne de Pinnacle si les marchés ont ouvert avant que notre système soit en place.
- Les fréquences (60s, 5 min, 30 min) sont paramétrables et doivent être exposées comme configuration.
- Il faut logguer les volumes de requêtes (par type d’endpoint) pour vérifier que l’on reste bien en-dessous du quota 5 000 req/h.
- Sécuriser la clé API (variable d’environnement / secret manager), **jamais** dans le code client.

---

## 10. Résumé très court (pour rappel développeur)

1. Utiliser `/v3/odds/updated` (toutes les 60s, par sport, bookmaker = Pinnacle) pour **détecter l’apparition des premières cotes** sans scanner des dizaines de jours de matchs.
2. Quand un event Pinnacle apparaît pour la première fois :
   - fixer `opening_price_observed` et `opening_time_observed`,
   - mettre l’event en `OPENING_CAPTURED_SLEEPING` et programmer `next_scan_at = event_date - 1h`.
3. 1h avant le match, passer en `ACTIVE_NEAR_KO` et scanner via `/v3/odds/multi` toutes les 5 minutes pour mettre à jour `closing_price_observed` jusqu’au coup d’envoi.
4. Utiliser `/v3/events` périodiquement pour enrichir les events (nom équipes, ligue, `event_date`) et récupérer les scores finaux (`status=settled` → table `match_results`).

Ce design permet de récupérer **opening/closing observés + résultats** pour tous les sports ciblés tout en restant **très largement dans les limites du plan REST 5 000 req/h**, même si l’API expose des events très en amont (J+20, J+60, etc.).
