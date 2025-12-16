# IDs des Tournois Odds-API.io

Ce fichier référence les IDs des tournois suivis par OddsTracker et conserve les exports complets générés depuis l’API Odds-API.io.

## ⚽ Football (sportId : 10)

### Championnats suivis en production
- **Premier League (Angleterre)** – `17`
- **Ligue 1 (France)** – `34`
- **LaLiga (Espagne)** – `8`
- **Bundesliga (Allemagne)** – `35`
- **Serie A (Italie)** – `23`
- **UEFA Champions League** – `7`
- **UEFA Euro** – `1`

### Notes
- Toutes les autres ligues sont listées dans la section « Dump complet » (sport 10).
- Pour ajouter une ligue supplémentaire, récupérer son `tournamentId` dans ce fichier ou via `scripts/test-tournaments.ts`.

---

## 🏒 Hockey sur glace (sportId : 15)

### Championnats suivis en production
- **NHL (USA/Canada)** – `234`
- **AHL (USA/Canada)** – `844`
- **KHL (Russie)** – `268`
- **SHL (Suède)** – `261`
- **Liiga (Finlande)** – `134`

### Notes
- La table complète « Mise à jour automatique – Sport 15 » contient également SHL Allsvenskan, SDHL, National League, etc.

---

## 🎾 Tennis (sportId : 12)

### Tournois prioritaires
- **Australian Open** – ATP `2567`, WTA `2571`
- **Roland-Garros** – ATP `2579`, WTA `2583`
- **Wimbledon** – ATP `2555`, WTA `2559`
- **US Open** – ATP `2591`, WTA `2595`

### Notes
- Les doubles, juniors, wheelchair, et autres tournois WTA/ATP 500/250 sont listés dans la section « Mise à jour automatique – Sport 12 ».

---

## 🏐 Volleyball (sportId : 23)

### Championnats suivis en production
- **SuperLega (Italie)** – `517`
- **Serie A1 Femminile (Italie)** – `567`
- **Liga Siatkówki / PlusLiga (Pologne)** – `831`
- **Liga Siatkówki Kobiet (Pologne)** – `1173`
- **KOVO V-League (Corée)** – `2148` (Hommes) / `2150` (Femmes)

### Notes
- Les autres compétitions (Supercoupes, coupes nationales, championnats asiatiques, etc.) figurent dans la section « Mise à jour automatique – Sport 23 ».

---

## Commandes utiles (rappel)

### Rechercher un tournoi par nom
```bash
npm run test:tournaments -- --sport=10 --search=premier
```

### Lister tous les tournois d'un pays
```bash
npm run test:tournaments -- --sport=10 --country=england
```

### Importer les matchs d'un tournoi (mode test)
```bash
npm run manual:oddspapi -- --sport=10 --tournament=17 --days=7 --limit=5
```

### Importer les matchs d'un tournoi (insertion en base)
```bash
npm run manual:oddspapi -- --sport=10 --tournament=17 --days=7 --limit=5 --insert
```

---

## Dumps complets (référence brute)

Les sections suivantes sont générées automatiquement par `scripts/fetch-tournaments.mjs <sportId>`. Elles servent de base pour récupérer rapidement un `tournamentId`.  
_Dernières générations disponibles : sport 10 (05/12/2025), sport 15 (08/12/2025), sport 23 (08/12/2025), sport 12 (08/12/2025)._

### Mise à jour automatique - Sport 10
*(Généré le 2025-12-05T10:25:40.816Z)*

| Pays | ID | Tournoi | Matchs à venir |
|------|----|---------|----------------|
| albania | 722 | Kategoria e Pare | 48 |
| albania | 720 | Kategoria Superiore | 110 |
| albania | 756 | Kupa e Shqiperise | 0 |
| albania | 1107 | Superkupa e Shqiperise | 0 |
| algeria | 1588 | Coupe d Algerie | 21 |
| algeria | 841 | Ligue 1 | 9 |
| algeria | 36189 | Ligue 1, Reserves | 0 |
| algeria | 14321 | Ligue 2 | 0 |
| algeria | 20780 | Supercoupe | 0 |
| andorra | 881 | Copa Constitucio | 0 |
| andorra | 742 | Primera Divisio | 88 |
| andorra | 743 | Second Divisio | 56 |
| andorra | 33632 | Supercopa | 0 |
| angola | 2171 | Girabola | 150 |
| angola | 48765 | Supertaca | 0 |
| antigua-and-barbuda | 23553 | Premier Division | 0 |
| argentina | 1024 | Copa Argentina | 0 |
| argentina | 28538 | Copa de la Liga | 0 |
| argentina | 40663 | Copa de la Liga, Women | 0 |
| argentina | 36945 | Copa Proyeccion Final, Reserves | 0 |
| argentina | 40649 | Copa Proyeccion, Reserves | 0 |
| argentina | 155 | Liga Profesional | 2 |
| argentina | 1347 | Primera B | 4 |
| argentina | 26174 | Primera C | 0 |
| argentina | 30254 | Primera D Metropolitana | 0 |
| argentina | 18464 | Primera Division, Women | 2 |
| argentina | 703 | Primera Nacional | 0 |
| argentina | 1618 | Super Cup | 0 |
| argentina | 38915 | Supercopa Internacional | 0 |
| argentina | 30106 | Torneo Federal A | 1 |
| argentina | 35957 | Trofeo de Campeones | 0 |
| argentina | 41935 | Trofeo de Campeones, Reserves | 0 |
| armenia | 778 | Armenian Cup | 0 |
| armenia | 672 | First League | 0 |
| armenia | 671 | Premier League | 0 |
| armenia | 1924 | Super Cup | 0 |
| australia | 136 | A-League | 119 |
| australia | 1894 | A-League, Women | 88 |
| australia | 1786 | Australia Cup | 0 |
| australia | 48507 | Australian Championship | 1 |
| australia | 1260 | Capital NPL 1 | 0 |
| australia | 32349 | Capital NPL, Women | 0 |
| australia | 46714 | Capital Premier League | 0 |
| australia | 32343 | Northern NSW League One | 0 |
| australia | 45773 | Northern NSW League One, Reserves | 0 |
| australia | 1638 | Northern NSW NPL | 0 |
| australia | 45771 | Northern NSW NPL, Reserves | 0 |
| australia | 32363 | Northern NSW Premier League, Women | 0 |
| australia | 32369 | NPL Western Australia, Women | 0 |
| australia | 32355 | NSW League One | 0 |
| australia | 33315 | NSW League One | 0 |
| australia | 32483 | NSW League One, Women | 0 |
| australia | 32357 | NSW League Two | 0 |
| australia | 33309 | NSW League Two | 0 |
| australia | 1274 | NSW NPL 1 | 0 |
| australia | 32351 | NSW Premier League, Women | 0 |
| australia | 1268 | Queensland NPL | 0 |
| australia | 18270 | Queensland NPL, Women | 0 |
| australia | 32341 | Queensland Premier League 1 | 0 |
| australia | 45547 | Queensland Premier League 1, Women | 0 |
| australia | 33950 | Queensland Premier League 2 | 0 |
| australia | 45549 | Queensland Premier League 2, Women | 0 |
| australia | 45525 | Queensland Premier League 3 Metro | 0 |
| australia | 45551 | Queensland Premier League 3 Metro, Women | 0 |
| australia | 45559 | Queensland Premier League 3 South Coast | 0 |
| australia | 45567 | Queensland Premier League 3, South Coast, Women | 0 |
| australia | 45527 | Queensland Premier League 4 Metro | 0 |
| australia | 45561 | Queensland Premier League 4 South Coast | 0 |
| australia | 45529 | Queensland Premier League 5 Metro | 0 |
| australia | 45531 | Queensland Premier League 6 Metro | 0 |
| australia | 33952 | Queensland Super Cup, Women | 0 |
| australia | 1258 | South Australia NPL | 0 |
| australia | 45649 | South Australia NPL, Reserves | 0 |
| australia | 45663 | South Australia NPL, Reserves, Women | 0 |
| australia | 18340 | South Australia NPL, Women | 0 |
| australia | 33954 | South Australia State League 1 | 0 |
| australia | 45653 | South Australia State League 1, Reserves | 0 |
| australia | 45641 | South Australia State League 2 | 0 |
| australia | 45655 | South Australia State League 2, Reserves | 0 |
| australia | 45647 | South Australia State League, Women | 0 |
| australia | 46716 | Tasmania Northern Championship | 0 |
| australia | 1626 | Tasmania NPL | 0 |
| australia | 46718 | Tasmania Southern Championship | 0 |
| australia | 32365 | Tasmania Super League, Women | 0 |
| australia | 32353 | U20 NSW NPL | 0 |
| australia | 33307 | U20 NSW Premier League 2 | 0 |
| australia | 33313 | U23 NSW NPL, Women | 0 |
| australia | 45533 | U23 Queensland NPL | 0 |
| australia | 45553 | U23 Queensland NPL, Women | 0 |
| australia | 45535 | U23 Queensland Premier League 1 | 0 |
| australia | 45555 | U23 Queensland Premier League 1, Women | 0 |
| australia | 45537 | U23 Queensland Premier League 2 | 0 |
| australia | 45557 | U23 Queensland Premier League 2, Women | 0 |
| australia | 45539 | U23 Queensland Premier League 3 Metro | 0 |
| australia | 45563 | U23 Queensland Premier League 3 South Coast | 0 |
| australia | 45541 | U23 Queensland Premier League 4 Metro | 0 |
| australia | 45565 | U23 Queensland Premier League 4 South Coast | 0 |
| australia | 45543 | U23 Queensland Premier League 5 Metro | 0 |
| australia | 45545 | U23 Queensland Premier League 6 Metro | 0 |
| australia | 45673 | U23 Victoria NPL | 0 |
| australia | 45675 | U23 Victoria Premier League 1 | 0 |
| australia | 45677 | U23 Victoria Premier League 2 | 0 |
| australia | 16904 | Victoria NPL, Women | 0 |
| australia | 32367 | Victoria Premier League 1 | 0 |
| australia | 1760 | Victoria Premier League 2 | 0 |
| australia | 45683 | Victoria Premier League, Reserves, Women | 0 |
| australia | 45671 | Victoria Premier League, Women | 0 |
| australia | 45667 | Victoria State League 1 | 0 |
| australia | 45669 | Victoria State League 2 | 0 |
| australia | 1275 | Victoria, NPL | 0 |
| australia | 1270 | Western Australia NPL | 0 |
| australia | 46720 | Western Australia State League 1 | 0 |
| austria | 135 | 2. Liga | 105 |
| austria | 45 | Bundesliga | 42 |
| austria | 445 | OFB Cup | 4 |
| austria-amateur | 14197 | Bundesliga, Women | 26 |
| austria-amateur | 43773 | Burgenland, Burgenlandliga | 120 |
| austria-amateur | 43775 | Burgenland, II. Liga | 0 |
| austria-amateur | 43785 | Karnten, 1. Klasse | 0 |
| austria-amateur | 43781 | Karnten, Karntner Liga | 112 |
| austria-amateur | 43783 | Karnten, Unterliga | 0 |
| austria-amateur | 43771 | Niederosterreich, 1. Landesliga | 120 |
| austria-amateur | 43789 | Oberosterreich, OO Liga | 120 |
| austria-amateur | 47127 | OFB Cup, Women | 0 |
| austria-amateur | 168 | Regionalliga Centre | 120 |
| austria-amateur | 166 | Regionalliga Ost | 251 |
| austria-amateur | 167 | Regionalliga West | 136 |
| austria-amateur | 43839 | Salzburg, 2. Klasse | 0 |
| austria-amateur | 1279 | Salzburg, Salzburger Liga | 120 |
| austria-amateur | 43809 | Steiermark, Gebietsliga | 0 |
| austria-amateur | 43803 | Steiermark, Landesliga | 120 |
| austria-amateur | 43805 | Steiermark, Oberliga | 0 |
| austria-amateur | 43807 | Steiermark, Unterliga | 0 |
| austria-amateur | 43817 | Tirol, Gebietsliga | 0 |
| austria-amateur | 29682 | Tirol, Regionalliga Tirol | 91 |
| austria-amateur | 29684 | Vorarlberg, Eliteliga | 91 |
| austria-amateur | 43833 | Wien, 2. Landesliga | 0 |
| austria-amateur | 43831 | Wien, Wiener Stadtliga | 120 |
| azerbaijan | 740 | Azerbaijan Cup | 0 |
| azerbaijan | 736 | First Division | 90 |
| azerbaijan | 709 | Premier League | 121 |
| bahrain | 19724 | 2nd Division | 36 |
| bahrain | 30152 | Federation Cup | 0 |
| bahrain | 2462 | King of Bahrain Cup | 0 |
| bahrain | 846 | Premier League | 1 |
| bahrain | 34518 | Super Cup | 0 |
| bangladesh | 28877 | Championship | 0 |
| bangladesh | 27254 | Federation Cup | 14 |
| bangladesh | 27821 | Premier League | 24 |
| barbados | 25147 | Champions Cup | 0 |
| barbados | 23471 | Premier League | 0 |
| belarus | 578 | Belarus Cup | 0 |
| belarus | 1776 | Belarus Cup, Women | 0 |
| belarus | 776 | Pervaya Liga | 0 |
| belarus | 775 | Super Cup | 0 |
| belarus | 32311 | Vtoraya Liga | 0 |
| belarus | 32313 | Vysshaya League, Women | 0 |
| belarus | 169 | Vysshaya Liga | 1 |
| belgium | 326 | Beker van Belgie | 0 |
| belgium | 23795 | Beker van Belgie, Women | 4 |
| belgium | 9 | Challenger Pro League | 153 |
| belgium | 40261 | Nationale 1 | 0 |
| belgium | 43373 | Nationale 1 ACFF | 42 |
| belgium | 43371 | Nationale 1 VV | 129 |
| belgium | 38 | Pro League | 112 |
| belgium | 338 | Super Cup | 0 |
| belgium | 2268 | Super League, Women | 46 |
| belgium | 1117 | U21 Pro League | 93 |
| bhutan | 26976 | Premier League | 0 |
| bolivia | 39033 | Copa Division Profesional | 3 |
| bolivia | 19712 | Copa Simon Bolivar | 1 |
| bolivia | 33980 | Division Profesional | 8 |
| bosnia-&-herzegovina | 583 | Bosnia & Herzegovina Cup | 0 |
| bosnia-&-herzegovina | 222 | Premijer Liga | 97 |
| bosnia-&-herzegovina | 716 | Prva Liga, Fed BiH | 91 |
| bosnia-&-herzegovina | 715 | Prva Liga, Rep of Srpska | 0 |
| bosnia-&-herzegovina | 47091 | Super Kup | 0 |
| botswana | 20574 | Premier League | 120 |
| brazil | 15227 | Alagoano | 0 |
| brazil | 40053 | Alagoano, Serie B U23 | 0 |
| brazil | 48341 | Alagoano, Women | 0 |
| brazil | 29118 | Amapaense | 0 |
| brazil | 27983 | Amazonense | 0 |
| brazil | 47121 | Amazonense, Serie B | 0 |
| brazil | 374 | Baiano | 0 |
| brazil | 39789 | Baiano, Serie B | 0 |
| brazil | 48329 | Baiano, Women | 0 |
| brazil | 46945 | Brasileiro A3, Women | 0 |
| brazil | 325 | Brasileiro Serie A | 10 |
| brazil | 32039 | Brasileiro Serie A2, Women | 0 |
| brazil | 390 | Brasileiro Serie B | 0 |
| brazil | 1281 | Brasileiro Serie C | 0 |
| brazil | 15335 | Brasileiro Serie D | 0 |
| brazil | 31839 | Campeonato Acreano | 0 |
| brazil | 35841 | Campeonato Amapaense, Women | 0 |
| brazil | 15091 | Campeonato Brasileiro, Women | 0 |
| brazil | 31795 | Campeonato Capixaba | 0 |
| brazil | 31833 | Campeonato Rondoniense | 0 |
| brazil | 31793 | Campeonato Tocantinense | 0 |
| brazil | 27851 | Candango, Serie A | 0 |
| brazil | 48062 | Candango, Serie B | 0 |
| brazil | 48211 | Capixaba, Serie B | 0 |
| brazil | 92 | Carioca | 0 |
| brazil | 36485 | Carioca, Serie A2 | 0 |
| brazil | 40677 | Carioca, Serie B1 | 1 |
| brazil | 48339 | Carioca, Serie B2 | 1 |
| brazil | 37197 | Carioca, Women | 0 |
| brazil | 376 | Catarinense, Serie A | 0 |
| brazil | 39343 | Catarinense, Serie B | 0 |
| brazil | 47532 | Catarinense, Women | 0 |
| brazil | 378 | Cearense | 0 |
| brazil | 36667 | Cearense, Serie B | 0 |
| brazil | 40055 | Cearense, Serie C | 0 |
| brazil | 41278 | Cearense, Women | 0 |
| brazil | 38883 | Copa Alagoas | 0 |
| brazil | 373 | Copa do Brasil | 4 |
| brazil | 47097 | Copa do Brasil, Women | 0 |
| brazil | 1596 | Copa do Nordeste | 0 |
| brazil | 46811 | Copa Espirito Santo | 0 |
| brazil | 35793 | Copa FGF | 0 |
| brazil | 47740 | Copa Governo do Estado de Sergipe | 0 |
| brazil | 15644 | Copa Paulista | 0 |
| brazil | 40061 | Copa Rio | 0 |
| brazil | 40653 | Copa Santa Catarina | 0 |
| brazil | 14876 | Copa Verde | 0 |
| brazil | 377 | Gaucho, Serie A1 | 2 |
| brazil | 35791 | Gaucho, Serie A2 | 0 |
| brazil | 41085 | Gaucho, Serie B | 1 |
| brazil | 40297 | Gaucho, Women | 0 |
| brazil | 381 | Goiano | 0 |
| brazil | 40059 | Goiano, 2. Divisao | 0 |
| brazil | 48335 | Goiano, 3. Divisao | 0 |
| brazil | 40651 | Goiano, Women | 0 |
| brazil | 24359 | Maranhense | 0 |
| brazil | 27747 | Mato-Grossense | 0 |
| brazil | 47534 | Mato-Grossense, 2. Divisao | 0 |
| brazil | 379 | Mineiro | 0 |
| brazil | 36661 | Mineiro, Modulo II | 0 |
| brazil | 48064 | Mineiro, Segunda Divisao | 0 |
| brazil | 40805 | Mineiro, Women | 0 |
| brazil | 27749 | Paraense | 0 |
| brazil | 15231 | Paraibano | 0 |
| brazil | 382 | Paranaense | 0 |
| brazil | 39439 | Paranaense, 2. Divisao | 0 |
| brazil | 48333 | Paranaense, 3. Divisao | 0 |
| brazil | 41410 | Paranaense, Women | 1 |
| brazil | 372 | Paulista, Serie A1 | 0 |
| brazil | 1234 | Paulista, Serie A2 | 0 |
| brazil | 1614 | Paulista, Serie A3 | 0 |
| brazil | 35795 | Paulista, Serie A4 | 0 |
| brazil | 30913 | Paulista, Women | 0 |
| brazil | 380 | Pernambucano | 0 |
| brazil | 41113 | Pernambucano, Serie A2 | 0 |
| brazil | 27819 | Piauiense | 0 |
| brazil | 48743 | Piauiense, Serie B | 0 |
| brazil | 27739 | Potiguar | 0 |
| brazil | 48891 | Potiguar, 2. Divisao | 0 |
| brazil | 38885 | Recopa Catarinense | 0 |
| brazil | 38887 | Recopa Gaucha | 0 |
| brazil | 32037 | Roraimense | 0 |
| brazil | 15257 | Sergipano | 1 |
| brazil | 48721 | Sergipano, Serie A2 | 0 |
| brazil | 27811 | Sul-Mato-Grossense | 0 |
| brazil | 31699 | Supercopa do Brasil | 0 |
| brazil | 39043 | Supercopa do Brasil, Women | 0 |
| brazil | 40057 | Taca Fares Lopes | 1 |
| brazil | 48337 | Taca FPF Paranaense | 0 |
| brazil | 47123 | U20 Alagoano, Serie A1 | 0 |
| brazil | 46211 | U20 Brasileiro Serie B | 0 |
| brazil | 36663 | U20 Brasiliense | 0 |
| brazil | 34528 | U20 Campeonato Amapaense | 0 |
| brazil | 13685 | U20 Campeonato Brasileiro | 0 |
| brazil | 39459 | U20 Carioca, Serie A | 0 |
| brazil | 48615 | U20 Carioca, Serie A2 | 0 |
| brazil | 46881 | U20 Catarinense, Serie A | 0 |
| brazil | 39781 | U20 Cearense | 0 |
| brazil | 14413 | U20 Copa do Brasil | 0 |
| brazil | 47990 | U20 Copa do Nordeste | 0 |
| brazil | 23517 | U20 Copa Sao Paulo de Juniores | 0 |
| brazil | 39761 | U20 Gaucho, Serie A1 | 0 |
| brazil | 46647 | U20 Goiano, 1. Divisao | 0 |
| brazil | 46651 | U20 Mineiro, 1. Divisao | 0 |
| brazil | 46883 | U20 Paranaense, 1. Divisao | 0 |
| brazil | 15281 | U20 Paulista | 0 |
| brazil | 49522 | U20 Paulista, Women | 0 |
| brazil | 48713 | U20 Pernambucano | 0 |
| brazil | 25071 | U23 Brasileiro | 0 |
| brunei-darussalam | 27388 | Super League | 0 |
| bulgaria | 365 | Bulgarian Cup | 8 |
| bulgaria | 247 | Parva Liga | 89 |
| bulgaria | 510 | Super Cup | 0 |
| bulgaria | 47656 | Treta Liga | 8 |
| bulgaria | 1135 | Vtora Liga | 129 |
| burundi | 37635 | Ligue A | 9 |
| cambodia | 19250 | Cambodian Premier League | 52 |
| cambodia | 36233 | Hun Sen Cup | 0 |
| cameroon | 1006 | Elite One | 0 |
| canada | 13681 | Canadian Championship | 0 |
| canada | 28432 | Canadian Premier League | 0 |
| canada | 482 | Canadian Soccer League | 0 |
| chile | 1221 | Copa Chile | 1 |
| chile | 1240 | Primera B | 1 |
| chile | 27665 | Primera Division | 8 |
| chile | 42285 | Primera Division, Women | 1 |
| chile | 42283 | Segunda Division | 0 |
| chile | 1309 | Supercup | 0 |
| chile | 48427 | Tercera Division | 0 |
| china | 782 | China League 1 | 0 |
| china | 15636 | China League 2 | 0 |
| china | 649 | Chinese Super League | 0 |
| china | 19264 | Chinese Super League, Women | 0 |
| china | 882 | FA Cup | 1 |
| china | 2511 | FA Super Cup | 0 |
| chinese-taipei | 42631 | Mulan Football League, Women | 12 |
| chinese-taipei | 26912 | Premier League | 48 |
| colombia | 1335 | Copa Colombia | 0 |
| colombia | 36281 | Liga Femenina | 0 |
| colombia | 27070 | Primera A, Apertura | 0 |
| colombia | 27072 | Primera A, Clausura | 0 |
| colombia | 1238 | Primera B | 0 |
| colombia | 23455 | Super Liga Cup | 0 |
| congo | 23785 | Premier League | 8 |
| costa-rica | 41310 | Copa Costa Rica | 0 |
| costa-rica | 19454 | Liga de Ascenso | 0 |
| costa-rica | 27767 | Liga de Ascenso, Apertura | 1 |
| costa-rica | 27765 | Liga de Ascenso, Clausura | 0 |
| costa-rica | 27092 | Primera Division, Apertura | 5 |
| costa-rica | 27094 | Primera Division, Clausura | 0 |
| costa-rica | 42421 | Primera Division, Women | 0 |
| costa-rica | 47950 | Recopa | 0 |
| croatia | 40005 | Croatia Cup, Women | 0 |
| croatia | 307 | Croatian Cup | 0 |
| croatia | 38613 | Druga NL | 0 |
| croatia | 37205 | First League Women | 4 |
| croatia | 170 | HNL | 105 |
| croatia | 724 | Prva NL | 31 |
| croatia | 40137 | Treca NL | 0 |
| croatia | 48060 | U19 Prva NL Juniori | 96 |
| cuba | 28909 | Primera Division | 0 |
| cyprus | 171 | 1st Division | 98 |
| cyprus | 23911 | 1st Division, Women | 1 |
| cyprus | 692 | 2nd Division | 40 |
| cyprus | 1460 | 3rd Division | 40 |
| cyprus | 315 | Cyprus Cup | 0 |
| cyprus | 550 | Super Cup | 0 |
| czechia | 172 | 1. Liga | 104 |
| czechia | 823 | 1. Liga, Women | 16 |
| czechia | 47994 | 2. Liga, Women | 31 |
| czechia | 14151 | CFL | 1 |
| czechia | 282 | Cup | 0 |
| czechia | 40727 | Divize A | 0 |
| czechia | 40729 | Divize B | 0 |
| czechia | 40731 | Divize C | 0 |
| czechia | 40733 | Divize D | 0 |
| czechia | 40735 | Divize E | 0 |
| czechia | 40737 | Divize F | 0 |
| czechia | 205 | FNL | 106 |
| czechia | 14147 | MSFL | 0 |
| czechia | 822 | U19 1st Division | 0 |
| czechia | 1224 | Winter League | 0 |
| denmark | 47 | 1. Division | 24 |
| denmark | 65 | 2nd Division | 36 |
| denmark | 34822 | 3rd Division | 36 |
| denmark | 47996 | B Liga, Women | 0 |
| denmark | 18490 | Cup, Women | 0 |
| denmark | 76 | DBU Pokalen | 5 |
| denmark | 14193 | Kvindeligaen, Women | 0 |
| denmark | 39 | Superliga | 30 |
| denmark | 48181 | U19 Ligaen | 95 |
| denmark-amateur | 37195 | Danmarksserien | 80 |
| denmark-amateur | 536 | Jyllandsserien – Pool 1 | 0 |
| denmark-amateur | 538 | Sjallandsserien | 0 |
| dominica | 48413 | DFA Premier | 0 |
| dominican-republic | 24443 | Liga Dominicana de Futbol | 0 |
| ecuador | 29208 | Copa Ecuador | 0 |
| ecuador | 240 | LigaPro Primera A | 7 |
| ecuador | 15027 | Serie B | 0 |
| ecuador | 31787 | Supercopa | 0 |
| ecuador | 46760 | Superliga, Women | 0 |
| egypt | 19492 | 2. Division A | 181 |
| egypt | 2075 | Egypt Cup | 0 |
| egypt | 36193 | League Cup | 63 |
| egypt | 808 | Premier League | 75 |
| egypt | 31965 | Supercup | 0 |
| el-salvador | 27088 | Primera Division, Apertura | 2 |
| el-salvador | 27090 | Primera Division, Clausura | 0 |
| el-salvador | 37331 | Primera Division, Reserves, Apertura | 2 |
| el-salvador | 36167 | Primera Division, Reserves, Clausura | 0 |
| el-salvador | 39173 | Segunda Division | 0 |
| england | 18 | Championship | 336 |
| england | 346 | Community Shield | 0 |
| england | 21 | EFL Cup | 4 |
| england | 334 | EFL Trophy | 1 |
| england | 19 | FA Cup | 20 |
| england | 1696 | FA Cup, Qualification | 0 |
| england | 24 | League One | 338 |
| england | 25 | League Two | 336 |
| england | 173 | National League | 298 |
| england | 45083 | National League Cup | 2 |
| england | 17 | Premier League | 240 |
| england-amateur | 39073 | Central League | 0 |
| england-amateur | 39071 | Central League Cup | 0 |
| england-amateur | 18350 | Championship, Women | 72 |
| england-amateur | 27725 | FA Cup, Women | 0 |
| england-amateur | 628 | FA Trophy | 0 |
| england-amateur | 1991 | FA Trophy, Qualification | 0 |
| england-amateur | 27659 | FA Womens League Cup | 0 |
| england-amateur | 44335 | Isthmian League, Division One North | 0 |
| england-amateur | 44337 | Isthmian League, Division One South Central | 0 |
| england-amateur | 44339 | Isthmian League, Division One South East | 0 |
| england-amateur | 1131 | Isthmian League, Pr. Div | 251 |
| england-amateur | 176 | National League North | 316 |
| england-amateur | 174 | National League South | 314 |
| england-amateur | 44359 | National League, Division One, Women | 0 |
| england-amateur | 44357 | National League, Premier, Women | 0 |
| england-amateur | 1111 | Northern Premier League Premier | 221 |
| england-amateur | 44347 | Northern Premier League, Division One East | 0 |
| england-amateur | 44349 | Northern Premier League, Division One Midlands | 0 |
| england-amateur | 44351 | Northern Premier League, Division One West | 0 |
| england-amateur | 1592 | Premier League Cup | 36 |
| england-amateur | 26056 | Southern League Premier Central | 243 |
| england-amateur | 26058 | Southern League Premier South | 246 |
| england-amateur | 44355 | Southern League, Division One Central | 0 |
| england-amateur | 44353 | Southern League, Division One South | 0 |
| england-amateur | 1044 | Super League Women | 79 |
| england-amateur | 1129 | U21 Premier League 2 | 164 |
| england-amateur | 29842 | U21 Professional Development League | 147 |
| estonia | 731 | Cup | 0 |
| estonia | 1704 | Cup, Women | 0 |
| estonia | 678 | Esiliiga | 0 |
| estonia | 35797 | Esiliiga B | 0 |
| estonia | 46645 | II Liiga | 0 |
| estonia | 35799 | II Liiga Ida/Pohl | 0 |
| estonia | 35801 | II Liiga Louna/Laas | 0 |
| estonia | 18294 | Meistriliiga Women | 0 |
| estonia | 178 | Premium Liiga | 0 |
| estonia | 356 | Super Cup | 0 |
| estonia | 35805 | Super Cup, Women | 0 |
| estonia | 35803 | U19 League | 0 |
| ethiopia | 33656 | Premier League | 110 |
| faroe-islands | 674 | 1st deild | 0 |
| faroe-islands | 779 | Logmanssteypid | 0 |
| faroe-islands | 673 | Premier League | 0 |
| fiji | 28947 | FA Cup | 0 |
| fiji | 23909 | Premier League | 0 |
| finland | 26910 | Kakkonen Playoffs | 0 |
| finland | 179 | Kakkonen, Group A | 0 |
| finland | 180 | Kakkonen, Group B | 0 |
| finland | 181 | Kakkonen, Group C | 0 |
| finland | 1662 | Kansallinen Liiga, Women | 0 |
| finland | 46671 | Kolmonen | 0 |
| finland | 83 | Liigacup | 0 |
| finland | 220 | Suomen Cup | 0 |
| finland | 18486 | Suomen Cup, Women | 0 |
| finland | 47658 | U20 SM | 0 |
| finland | 41 | Veikkausliiga | 0 |
| finland | 42291 | Ykkonen | 0 |
| finland | 18318 | Ykkonen, Women | 0 |
| finland | 55 | Ykkosliiga | 0 |
| finland | 42139 | Ykkosliigacup | 0 |
| france | 26276 | Championnat National U19 | 337 |
| france | 335 | Coupe de France | 0 |
| france | 18364 | Coupe de France, Women | 0 |
| france | 34 | Ligue 1 | 180 |
| france | 182 | Ligue 2 | 171 |
| france | 183 | National | 160 |
| france | 47986 | National 2 | 456 |
| france | 1139 | Premiere Ligue, Women | 90 |
| france | 47992 | Seconde Ligue, Women | 90 |
| france | 339 | Trophee des Champions | 0 |
| georgia | 729 | Cup | 1 |
| georgia | 704 | Erovnuli Liga | 5 |
| georgia | 726 | Erovnuli Liga 2 | 5 |
| georgia | 766 | Super Cup | 0 |
| germany | 44 | 2. Bundesliga | 180 |
| germany | 491 | 3. Liga | 220 |
| germany | 35 | Bundesliga | 198 |
| germany | 217 | DFB Pokal | 0 |
| germany | 799 | Super Cup | 0 |
| germany | 889 | Telekom Cup | 0 |
| germany-amateur | 2322 | 2. Bundesliga, Women | 105 |
| germany-amateur | 809 | A-Junioren-Bundesliga N/N-E | 0 |
| germany-amateur | 811 | A-Junioren-Bundesliga S/S-W | 0 |
| germany-amateur | 810 | A-Junioren-Bundesliga West | 0 |
| germany-amateur | 1089 | Bayernliga North | 110 |
| germany-amateur | 36887 | Bayernliga Relegation/Promotion | 0 |
| germany-amateur | 1091 | Bayernliga South | 104 |
| germany-amateur | 508 | Bremen Liga | 120 |
| germany-amateur | 686 | DFB Pokal Women | 0 |
| germany-amateur | 26280 | DFB-Pokal Junioren | 0 |
| germany-amateur | 184 | Hessenliga | 136 |
| germany-amateur | 1105 | Mittelrheinliga | 136 |
| germany-amateur | 142 | Oberliga BW | 139 |
| germany-amateur | 509 | Oberliga Hamburg | 135 |
| germany-amateur | 1103 | Oberliga Niederrhein | 171 |
| germany-amateur | 813 | Oberliga Niedersachsen | 109 |
| germany-amateur | 489 | Oberliga NOFV | 0 |
| germany-amateur | 145 | Oberliga NOFV North | 127 |
| germany-amateur | 150 | Oberliga NOFV South | 128 |
| germany-amateur | 1109 | Oberliga Rheinland-Pfalz | 137 |
| germany-amateur | 146 | Oberliga Westfalen | 190 |
| germany-amateur | 36943 | Oberliga, Playoffs | 0 |
| germany-amateur | 40135 | Oberliga, Qualification for Regionalliga Southwest | 0 |
| germany-amateur | 1085 | Regionalliga Bavaria | 130 |
| germany-amateur | 42 | Regionalliga North | 120 |
| germany-amateur | 1083 | Regionalliga Northeast | 154 |
| germany-amateur | 24662 | Regionalliga Playoffs | 0 |
| germany-amateur | 1079 | Regionalliga Southwest | 135 |
| germany-amateur | 493 | Regionalliga West | 153 |
| germany-amateur | 512 | Schleswig-Holstein-Liga | 89 |
| germany-amateur | 42969 | Supercup, Women | 0 |
| germany-amateur | 24702 | U19 DFB Nachwuchsliga | 29 |
| germany-amateur | 232 | Women Bundesliga | 106 |
| ghana | 48543 | Champion of Champions | 0 |
| ghana | 2177 | FA Cup | 0 |
| ghana | 1191 | Premier League | 198 |
| gibraltar | 1542 | National League | 58 |
| gibraltar | 48150 | Pepe Reyes Cup | 0 |
| gibraltar | 36159 | Rock Cup | 0 |
| greece | 46053 | Gamma Ethniki | 403 |
| greece | 375 | Greece Cup | 3 |
| greece | 476 | Super Cup | 0 |
| greece | 185 | Super League | 98 |
| greece | 186 | Super League 2 | 61 |
| greece | 46949 | Super League 2 Super Cup | 0 |
| greece | 20226 | Super League, Women | 102 |
| greece | 26384 | U19 Super League | 97 |
| guam | 28241 | Premier Division | 0 |
| guatemala | 27396 | Liga Nacional. Apertura | 8 |
| guatemala | 27398 | Liga Nacional. Clausura | 0 |
| guatemala | 48000 | Primera Division | 1 |
| honduras | 45857 | Liga de Ascenso | 0 |
| honduras | 27414 | Liga Nacional, Apertura | 6 |
| honduras | 925 | Liga Nacional, Relegation Playoff | 0 |
| honduras | 27416 | Liga Nacional. Clausura | 0 |
| hong-kong-china | 19224 | 1. Division | 15 |
| hong-kong-china | 35807 | 2. Division | 1 |
| hong-kong-china | 15219 | FA Cup | 0 |
| hong-kong-china | 38379 | Football League, Women | 0 |
| hong-kong-china | 947 | Premier League | 48 |
| hong-kong-china | 27252 | Reserve Division | 0 |
| hong-kong-china | 35809 | Sapling Cup | 0 |
| hong-kong-china | 48617 | Senior Shield | 0 |
| hungary | 305 | Magyar Kupa | 0 |
| hungary | 187 | NB I | 108 |
| hungary | 19266 | NB I, Women | 60 |
| hungary | 1339 | NB II | 120 |
| hungary | 47952 | NB III | 417 |
| hungary | 48183 | U19 National | 6 |
| iceland | 675 | 1. deild | 0 |
| iceland | 18204 | 1. deild, Women | 0 |
| iceland | 15283 | 2. deild | 0 |
| iceland | 28879 | 3. deild | 0 |
| iceland | 46756 | 4. deild | 0 |
| iceland | 188 | Besta deild | 0 |
| iceland | 15279 | Besta deild, Women | 0 |
| iceland | 504 | Cup | 0 |
| iceland | 19276 | Cup, Women | 0 |
| iceland | 2104 | League Cup A | 0 |
| iceland | 28049 | League Cup A, Women | 0 |
| iceland | 786 | Super Cup | 0 |
| iceland | 28621 | Super Cup, Women | 0 |
| india | 1800 | Calcutta 1st Division | 0 |
| india | 1774 | Calcutta Premier Div. | 0 |
| india | 40511 | Durand Cup | 0 |
| india | 31977 | Goa Pro League | 0 |
| india | 848 | I-League | 0 |
| india | 42093 | I-League 2 | 0 |
| india | 24197 | Indian Super Cup | 0 |
| india | 1900 | Indian Super League | 0 |
| india | 48619 | Mizoram Premier League | 0 |
| indonesia | 1015 | Liga 1 | 193 |
| indonesia | 20560 | Liga 2 | 60 |
| indonesia | 23749 | Piala Presiden | 0 |
| international | 246 | AFC Asian Cup | 0 |
| international | 28 | AFC Asian Cup QF | 13 |
| international | 1692 | AFC Asian Cup, Women | 0 |
| international | 35591 | AFC Asian Cup, Women, Qualification | 0 |
| international | 2515 | AFC Olympic Qualification, Women | 0 |
| international | 270 | Africa Cup of Nations | 52 |
| international | 1848 | Africa Cup of Nations Qualification | 0 |
| international | 14604 | Africa Cup of Nations, Women | 0 |
| international | 637 | African Nations Championship | 0 |
| international | 30678 | African Nations Championship Qualification | 0 |
| international | 411 | Algarve Cup, Women | 0 |
| international | 34504 | Arab Cup | 14 |
| international | 36079 | Arnold Clark Cup, Women | 0 |
| international | 602 | ASEAN Championship | 0 |
| international | 47530 | ASEAN Championship, Women | 0 |
| international | 26006 | Asian Games, Women | 0 |
| international | 1060 | Baltic Cup | 0 |
| international | 42371 | CAF Olympic Qualification, Women | 0 |
| international | 37345 | CAFA Championship, Women | 0 |
| international | 25729 | Central American and Caribbean Games, Women | 0 |
| international | 1954 | CONCACAF Championship, Women | 0 |
| international | 140 | CONCACAF Gold Cup | 0 |
| international | 27420 | CONCACAF Nations League | 0 |
| international | 2494 | CONCACAF Olympic Qualifications, Women | 0 |
| international | 49276 | CONMEBOL Nations League, Women | 20 |
| international | 36497 | CONMEBOL UEFA Cup of Champions | 0 |
| international | 38453 | CONMEBOL UEFA Cup of Champions, Women | 0 |
| international | 133 | Copa America | 0 |
| international | 36571 | Copa America, Women | 0 |
| international | 2161 | COSAFA Cup | 0 |
| international | 1018 | Cyprus Women Cup | 0 |
| international | 392 | EAFF E-1 Football Championship | 0 |
| international | 404 | EAFF E-1 Football Championship, Women | 0 |
| international | 477 | European Championship, Women | 0 |
| international | 309 | FIFA World Cup Qualification OFC | 0 |
| international | 13 | FIFA World Cup, Qualification CAF | 0 |
| international | 49566 | FIFA World Cup, Women, Qualification, OFC | 0 |
| international | 41941 | Gold Cup, Women | 0 |
| international | 622 | Gulf Cup | 0 |
| international | 48571 | Influencer World Cup | 0 |
| international | 851 | Int. Friendly Games | 0 |
| international | 852 | Int. Friendly Games W | 0 |
| international | 24990 | Intercontinental Cup | 0 |
| international | 16356 | Kings Cup | 0 |
| international | 33982 | NIU | 0 |
| international | 27526 | OFC Nations Cup, Women | 0 |
| international | 33746 | Olympic Qualif., Women, CAF-CONMEBOL Playoff | 0 |
| international | 436 | Olympic Tournament | 0 |
| international | 437 | Olympic Tournament, Women | 0 |
| international | 29612 | Pacific Games Women | 0 |
| international | 29398 | Pan American Games, Women | 0 |
| international | 31849 | Pinatar Cup, Women | 0 |
| international | 2438 | SAFF Championship | 0 |
| international | 28287 | SAFF Championship, Women | 0 |
| international | 2505 | SheBelieves Cup, Women | 0 |
| international | 31377 | Southeast Asian Games, Women | 7 |
| international | 33696 | Three Nations, One Goal, Women | 0 |
| international | 31789 | Tournoi de France, Women | 0 |
| international | 1 | UEFA Euro | 0 |
| international | 27 | UEFA EURO, Qualification | 0 |
| international | 23755 | UEFA Nations League | 4 |
| international | 39821 | UEFA Nations League, Women | 0 |
| international | 27583 | UEFA Regions Cup | 0 |
| international | 20434 | WC Qu. Int-Conf. Playoff | 0 |
| international | 295 | WC Qual, CONMEBOL | 0 |
| international | 11 | WC Qualification, UEFA | 12 |
| international | 878 | Womens Euro, Qualif. | 0 |
| international | 780 | World Championship Qualification Women, Europe | 0 |
| international | 16 | World Cup | 0 |
| international | 14 | World Cup Qualification CONCACAF | 0 |
| international | 308 | World Cup Qualification, AFC | 0 |
| international | 27362 | World Cup Qualification, Women, Inter-Confederation Playoffs | 0 |
| international | 290 | World Cup, Women | 0 |
| international-clubs | 42983 | AFC Challenge League | 8 |
| international-clubs | 463 | AFC Champions League Elite | 36 |
| international-clubs | 668 | AFC Champions League Two | 15 |
| international-clubs | 41490 | AFC Club Championship, Women | 0 |
| international-clubs | 42985 | AFC Women's Champions League | 0 |
| international-clubs | 40983 | African Football League | 0 |
| international-clubs | 48058 | ASEAN Club Championship | 14 |
| international-clubs | 23803 | Atlantic Cup | 0 |
| international-clubs | 886 | Audi Cup | 0 |
| international-clubs | 1054 | CAF Champions League | 36 |
| international-clubs | 41488 | CAF Champions League, Women | 0 |
| international-clubs | 1115 | CAF Confederations Cup | 32 |
| international-clubs | 1250 | CAF Super Cup | 0 |
| international-clubs | 26552 | Campeones Cup | 0 |
| international-clubs | 49336 | CFU Club Shield | 0 |
| international-clubs | 853 | Club Friendly Games | 0 |
| international-clubs | 43643 | Club Friendly Games, Women | 0 |
| international-clubs | 40251 | CONCACAF Caribbean Cup | 0 |
| international-clubs | 40249 | CONCACAF Central American Cup | 0 |
| international-clubs | 498 | CONCACAF Champions Cup | 0 |
| international-clubs | 43845 | CONCACAF Champions Cup, Women | 0 |
| international-clubs | 384 | Copa Libertadores | 0 |
| international-clubs | 20178 | Copa Libertadores, Women | 0 |
| international-clubs | 480 | Copa Sudamericana | 0 |
| international-clubs | 1295 | Emirates Cup | 0 |
| international-clubs | 48975 | FIFA Champions Cup, Women | 0 |
| international-clubs | 357 | FIFA Club World Cup | 0 |
| international-clubs | 44289 | FIFA Intercontinental Cup | 1 |
| international-clubs | 14800 | Florida Cup | 0 |
| international-clubs | 29472 | Leagues Cup | 0 |
| international-clubs | 43189 | NWSL x Liga MX Summer Cup, Women | 0 |
| international-clubs | 1222 | OFC Champions League | 0 |
| international-clubs | 42627 | Qatar-UAE Super Cup | 0 |
| international-clubs | 42629 | Qatar-UAE Super Shield | 0 |
| international-clubs | 490 | Recopa Sudamericana | 0 |
| international-clubs | 7 | UEFA Champions League | 54 |
| international-clubs | 696 | UEFA Champions League Women | 18 |
| international-clubs | 34480 | UEFA Conference League | 36 |
| international-clubs | 48603 | UEFA Europa Cup, Women | 0 |
| international-clubs | 679 | UEFA Europa League | 54 |
| international-clubs | 465 | UEFA Super Cup | 0 |
| international-youth | 2430 | AFC U23 Asian Cup | 26 |
| international-youth | 42763 | AFC-CAF Olympic Qualification Playoff | 0 |
| international-youth | 1862 | Asian Games | 0 |
| international-youth | 25655 | Blue Stars / FIFA Youth Cup | 0 |
| international-youth | 25731 | Central American and Caribbean Games | 0 |
| international-youth | 31791 | CONCACAF Olympic Qualification | 0 |
| international-youth | 31631 | CONMEBOL Pre-Olympic Tournament | 0 |
| international-youth | 33688 | Soccer.International Youth.U20 AFC Asian Cup, Women | 0 |
| international-youth | 2183 | Toulon Tournament | 0 |
| international-youth | 47598 | U16 Friendly Games | 0 |
| international-youth | 33690 | U17 AFC Asian Cup | 0 |
| international-youth | 33692 | U17 AFC Asian Cup, Women | 0 |
| international-youth | 26664 | U17 Africa Cup of Nations | 0 |
| international-youth | 2114 | U17 CONCACAF Championship | 0 |
| international-youth | 1530 | U17 CONCACAF Championship, Women | 0 |
| international-youth | 2043 | U17 CONMEBOL Championship | 0 |
| international-youth | 429 | U17 European Championship | 0 |
| international-youth | 753 | U17 European Championship, Women, Qualification | 0 |
| international-youth | 917 | U17 European Women's Championship | 0 |
| international-youth | 279 | U17 FIFA World Cup | 0 |
| international-youth | 827 | U17 FIFA World Cup, Women | 0 |
| international-youth | 858 | U17 Friendly Games | 0 |
| international-youth | 755 | U17 UEFA European Championship, Qualification | 0 |
| international-youth | 47578 | U18 Club Friendly Games | 0 |
| international-youth | 857 | U18 Friendly Games | 0 |
| international-youth | 25403 | U19 AFF Championship | 0 |
| international-youth | 1750 | U19 Baltic Cup | 0 |
| international-youth | 47586 | U19 Club Friendly Games | 0 |
| international-youth | 258 | U19 European Championship | 0 |
| international-youth | 748 | U19 European Championship, Qualification | 0 |
| international-youth | 746 | U19 European Championship, Women, Qualification | 0 |
| international-youth | 39829 | U19 FIFA Youth Cup, Women | 0 |
| international-youth | 856 | U19 Friendly Games | 0 |
| international-youth | 1850 | U19 Friendly Games, Women | 0 |
| international-youth | 1806 | U19 NextGen Cup | 0 |
| international-youth | 695 | U19 UEFA European Championship, Women | 0 |
| international-youth | 33686 | U20 AFC Asian Cup | 0 |
| international-youth | 2108 | U20 Africa Cup of Nations | 0 |
| international-youth | 24441 | U20 Africa Cup of Nations NIU | 0 |
| international-youth | 2332 | U20 African Games | 0 |
| international-youth | 47582 | U20 Club Friendly Games | 0 |
| international-youth | 638 | U20 CONCACAF Championship | 0 |
| international-youth | 1568 | U20 CONCACAF Championship, Women | 0 |
| international-youth | 632 | U20 CONMEBOL Ch.ship | 0 |
| international-youth | 1612 | U20 CONMEBOL, Women | 0 |
| international-youth | 1074 | U20 Copa Libertadores | 0 |
| international-youth | 804 | U20 FIFA World Cup, Women | 0 |
| international-youth | 855 | U20 Friendly Games | 0 |
| international-youth | 40985 | U20 Intercontinental Cup | 0 |
| international-youth | 453 | U20 World Cup | 0 |
| international-youth | 1952 | U21 Baltic Cup | 0 |
| international-youth | 47576 | U21 Club Friendly Games | 0 |
| international-youth | 454 | U21 European Championship | 0 |
| international-youth | 854 | U21 Friendly Games | 0 |
| international-youth | 39285 | U21 Premier League International Cup | 29 |
| international-youth | 26 | U21 UEFA European Championship, Qualification | 113 |
| international-youth | 30148 | U22 international friendly games | 0 |
| international-youth | 19278 | U22 Southeast Asian Games | 6 |
| international-youth | 2152 | U23 AFC Championship, Qualification | 0 |
| international-youth | 981 | U23 Africa Cup of Nations | 0 |
| international-youth | 28671 | U23 Africa Cup of Nations | 0 |
| international-youth | 28155 | U23 ASEAN Championship | 0 |
| international-youth | 47584 | U23 Club Friendly Games | 0 |
| international-youth | 47588 | U23 Club Friendly Games, Women | 0 |
| international-youth | 1072 | U23 Friendly Games | 0 |
| international-youth | 47590 | U23 Friendly Games, Women | 0 |
| international-youth | 41366 | U23 Pan American Games | 0 |
| international-youth | 2374 | U23 WAFF Championship | 0 |
| international-youth | 2324 | UEFA Youth League | 29 |
| international-youth | 1246 | Viareggio Cup | 0 |
| international-youth | 28345 | Viareggio Cup, Women | 0 |
| iran | 23551 | Azadegan League | 18 |
| iran | 19870 | Hazfi Cup | 0 |
| iran | 915 | Pro League | 12 |
| iraq | 26974 | Iraqi League | 0 |
| ireland | 195 | FAI Cup | 0 |
| ireland | 34978 | FAI Cup, Women | 0 |
| ireland | 1632 | FAI Presidents Cup | 0 |
| ireland | 193 | First Division | 0 |
| ireland | 192 | Premier Division | 0 |
| ireland | 28681 | Premier Division, Women | 0 |
| israel | 370 | Israel Cup | 0 |
| israel | 14045 | League Cup, National | 0 |
| israel | 14043 | League Cup, Premier | 0 |
| israel | 23979 | Liga Al, Women | 0 |
| israel | 1970 | Liga Alef | 15 |
| israel | 1974 | Liga Bet South A | 2 |
| israel | 1972 | Liga Bet South B | 0 |
| israel | 727 | National League | 136 |
| israel | 266 | Premier League | 98 |
| israel | 2242 | Super Cup | 0 |
| israel | 36195 | U19 Premier League | 63 |
| italy | 328 | Coppa Italia | 2 |
| italy | 1554 | Coppa Italia Primavera | 0 |
| italy | 824 | Coppa Italia Serie C | 4 |
| italy | 39221 | Coppa Italia Serie D | 0 |
| italy | 28127 | Coppa Italia, Women | 8 |
| italy | 2340 | Primavera 1 | 250 |
| italy | 19202 | Primavera 2 | 320 |
| italy | 23 | Serie A | 250 |
| italy | 47660 | Serie A Cup, Women | 0 |
| italy | 20808 | Serie A, Women | 104 |
| italy | 53 | Serie B | 240 |
| italy | 48215 | Serie B, Women | 112 |
| italy | 26560 | Serie C,  Promotion Playoffs | 0 |
| italy | 28837 | Serie C,  Relegation Playoffs | 0 |
| italy | 26554 | Serie C, Group A | 242 |
| italy | 26556 | Serie C, Group B | 217 |
| italy | 26558 | Serie C, Group C | 220 |
| italy | 1374 | Serie D, Group A | 180 |
| italy | 1376 | Serie D, Group B | 180 |
| italy | 1378 | Serie D, Group C | 180 |
| italy | 1380 | Serie D, Group D | 180 |
| italy | 1382 | Serie D, Group E | 180 |
| italy | 1384 | Serie D, Group F | 180 |
| italy | 1386 | Serie D, Group G | 180 |
| italy | 1388 | Serie D, Group H | 180 |
| italy | 1390 | Serie D, Group I | 180 |
| italy | 1710 | Serie D, Poule Scudetto | 0 |
| italy | 341 | Supercoppa | 2 |
| italy | 884 | Supercoppa di Lega Pro | 0 |
| italy | 1910 | Supercoppa Primavera | 0 |
| italy | 42015 | Supercoppa, Women | 0 |
| ivory-coast | 14145 | Coupe Nationale | 0 |
| ivory-coast | 1211 | Ligue 1 | 0 |
| jamaica | 23975 | KSAFA Championship | 0 |
| jamaica | 1892 | Premier League | 15 |
| japan | 323 | Emperor Cup | 0 |
| japan | 36283 | Empress Cup, Women | 1 |
| japan | 196 | J.League | 10 |
| japan | 402 | J.League 2 | 2 |
| japan | 101 | J.League Cup | 0 |
| japan | 2094 | J3 League | 3 |
| japan | 1824 | Japan Football League | 0 |
| japan | 24235 | Nadeshiko League, Div 2, Women | 0 |
| japan | 2529 | Nadeshiko League, Div. 1, Women | 0 |
| japan | 393 | Super Cup | 0 |
| japan | 48905 | WE League Cup, Women | 0 |
| japan | 34590 | WE League, Women | 6 |
| jordan | 24073 | First Division | 0 |
| jordan | 1822 | Jordan Cup | 0 |
| jordan | 929 | Jordan League | 0 |
| jordan | 36551 | Super Cup | 0 |
| kazakhstan | 749 | Kazakhstan Cup | 0 |
| kazakhstan | 785 | Pervaya Liga | 0 |
| kazakhstan | 682 | Premier League | 0 |
| kazakhstan | 48421 | Premier League, Women | 0 |
| kazakhstan | 773 | Super Cup | 0 |
| kenya | 1644 | Premier League | 209 |
| kenya | 48935 | Super League | 0 |
| kosovo | 14688 | Kosovo FA Cup | 1 |
| kosovo | 14231 | Liga e Pare | 0 |
| kosovo | 14189 | Superliga | 5 |
| kuwait | 939 | Crown Prince Cup | 0 |
| kuwait | 25657 | Emir Cup | 0 |
| kuwait | 1002 | Premier League | 2 |
| kuwait | 31509 | Super Cup | 0 |
| kyrgyzstan | 26622 | Top League | 0 |
| laos | 26980 | Lao Premier League | 0 |
| latvia | 677 | 1.Liga | 0 |
| latvia | 761 | Latvia Cup | 0 |
| latvia | 1266 | Superkauss | 0 |
| latvia | 197 | Virsliga | 0 |
| lebanon | 2053 | Lebanon Cup | 0 |
| lebanon | 2386 | Premier League | 8 |
| lebanon | 2376 | Super Cup | 0 |
| liechtenstein | 757 | Liechtensteiner Cup | 0 |
| lithuania | 676 | 1 Lyga | 0 |
| lithuania | 198 | A Lyga | 0 |
| lithuania | 34066 | II Lyga | 0 |
| lithuania | 812 | LFF Cup | 0 |
| lithuania | 1262 | Super Cup | 0 |
| luxembourg | 765 | Coupe de Luxembourg | 0 |
| luxembourg | 690 | Division Nationale | 127 |
| luxembourg | 723 | Promotion d'Honneur | 128 |
| macao | 27997 | 1st Division | 0 |
| malawi | 19494 | Super League | 28 |
| malaysia | 23745 | FA Cup | 0 |
| malaysia | 43125 | Liga A1 | 143 |
| malaysia | 40513 | Piala Malaysia | 0 |
| malaysia | 48098 | Piala Sumbangsih | 0 |
| malaysia | 1000 | Super League | 97 |
| maldives | 26978 | Dhivehi Premier League | 0 |
| mali | 40817 | Ligue 1 | 9 |
| malta | 630 | Challenge League | 24 |
| malta | 633 | FA Trophy | 7 |
| malta | 23751 | First Division, Women | 0 |
| malta | 629 | Premier League | 12 |
| malta | 725 | Super Cup | 0 |
| mauritania | 48425 | Super D2 | 0 |
| mexico | 47195 | Campeon de Campeones Liga Expansion MX | 0 |
| mexico | 27382 | Liga de Expansion MX, Apertura | 1 |
| mexico | 27384 | Liga de Expansion MX, Clausura | 0 |
| mexico | 27464 | Liga MX, Apertura | 2 |
| mexico | 27466 | Liga MX, Clausura | 0 |
| mexico | 28953 | Liga MX, Women, Apertura | 0 |
| mexico | 28955 | Liga MX, Women, Clausura | 0 |
| mexico | 40533 | Liga Premier Serie A | 260 |
| mexico | 40535 | Liga Premier Serie B | 45 |
| mexico | 37101 | Supercopa Liga MX | 0 |
| mexico | 2244 | Trofeo de Campeon de Campeones | 0 |
| mexico | 36903 | Trofeo de Campeon de Campeones, Women | 0 |
| mexico | 48056 | U21 Liga MX | 0 |
| mexico | 40387 | U23 Liga MX | 0 |
| moldova | 741 | Cupa Moldovei | 8 |
| moldova | 710 | Liga 1 | 0 |
| moldova | 685 | Super Liga | 0 |
| mongolia | 28623 | Premier League | 0 |
| mongolia | 32753 | Super Cup | 0 |
| montenegro | 154 | 1. CFL | 10 |
| montenegro | 717 | 2. CFL | 5 |
| montenegro | 739 | Cup Crne Gore | 0 |
| morocco | 937 | Botola Pro D1 | 0 |
| morocco | 19496 | Botola Pro D2 | 8 |
| morocco | 1434 | Coupe du Trone | 0 |
| mozambique | 20576 | Mocambola | 24 |
| myanmar | 28346 | Cup | 0 |
| myanmar | 19248 | National League | 18 |
| netherlands | 47988 | Derde Divisie | 342 |
| netherlands | 131 | Eerste Divisie | 200 |
| netherlands | 37 | Eredivisie | 180 |
| netherlands | 2270 | Eredivisie, Women | 98 |
| netherlands | 340 | Johan Cruijff Schaal | 0 |
| netherlands | 330 | KNVB beker | 8 |
| netherlands | 19268 | KNVB beker, Women | 8 |
| netherlands | 40531 | Supercup, Women | 0 |
| netherlands | 26278 | Tweede Divisie | 171 |
| netherlands | 34990 | U21, Divisie 1 | 8 |
| new-zealand | 47568 | Chatham Cup | 0 |
| new-zealand | 47570 | Kate Sheppard Cup, Women | 0 |
| new-zealand | 594 | National League | 5 |
| new-zealand | 45047 | National League, Women | 0 |
| new-zealand | 18466 | NRFL Premier League, Women | 0 |
| nicaragua | 48197 | Liga de Ascenso | 0 |
| nicaragua | 19242 | Primera Division | 2 |
| nicaragua | 32239 | U20 Liga Primera Juvenil | 0 |
| nigeria | 2112 | Premier League | 13 |
| north-macedonia | 199 | 1. MFL | 41 |
| north-macedonia | 718 | 2. MFL | 11 |
| north-macedonia | 348 | Macedonia Cup | 0 |
| north-macedonia | 912 | Super Cup | 0 |
| northern-ireland | 19488 | Challenge Cup, Women | 0 |
| northern-ireland | 701 | Championship | 90 |
| northern-ireland | 767 | Irish Cup | 0 |
| northern-ireland | 611 | League Cup | 0 |
| northern-ireland | 17028 | NIFL Charity Shield | 0 |
| northern-ireland | 19486 | Premier League, Women | 0 |
| northern-ireland | 200 | Premiership | 90 |
| norway | 22 | 1st Division | 0 |
| norway | 19272 | 1st Division, Women | 0 |
| norway | 24638 | 2nd Division Group 1 | 0 |
| norway | 24636 | 2nd Division Group 2 | 0 |
| norway | 24642 | 3rd Division Group 1 | 0 |
| norway | 24644 | 3rd Division Group 2 | 0 |
| norway | 24646 | 3rd Division Group 3 | 0 |
| norway | 24648 | 3rd Division Group 4 | 0 |
| norway | 24650 | 3rd Division Group 5 | 0 |
| norway | 24652 | 3rd Division Group 6 | 0 |
| norway | 20 | Eliteserien | 2 |
| norway | 29 | NM Cup | 7 |
| norway | 1062 | NM Cup Women | 0 |
| norway | 351 | Super Cup | 0 |
| norway | 201 | Toppserien, Women | 0 |
| norway | 48179 | U19 Nasjonal | 0 |
| oman | 965 | Omani League | 0 |
| oman | 2032 | Sultan Cup | 0 |
| oman | 47830 | Super Cup | 0 |
| palestine | 2344 | Gaza Strip Premier League | 0 |
| palestine | 2342 | West Bank League | 0 |
| panama | 27102 | Liga Panamena de Futbol, Apertura | 0 |
| panama | 27104 | Liga Panamena de Futbol, Clausura | 0 |
| panama | 19490 | Liga Prom | 0 |
| paraguay | 46758 | Camopeonato Femenino, Women | 0 |
| paraguay | 29003 | Copa Paraguay | 0 |
| paraguay | 27098 | Division de Honor, Apertura | 0 |
| paraguay | 27100 | Division de Honor, Clausura | 0 |
| paraguay | 27214 | Primera Division Reserve, Apertura | 0 |
| paraguay | 27216 | Primera Division Reserve, Clausura | 0 |
| paraguay | 1254 | Segunda Division | 0 |
| paraguay | 35937 | Supercopa Paraguay | 1 |
| peru | 406 | Liga 1 | 1 |
| peru | 15235 | Liga 2 | 0 |
| peru | 13995 | Liga Femenina | 1 |
| philippines | 26372 | Copa Paulino Alcantara | 0 |
| philippines | 1654 | Philippines Footb. League | 5 |
| poland | 48233 | 1. Liga, Women | 0 |
| poland | 1365 | CLJ | 105 |
| poland | 202 | Ekstraklasa | 156 |
| poland | 18188 | Ekstraliga, Women | 0 |
| poland | 229 | I Liga | 144 |
| poland | 515 | II Liga | 135 |
| poland | 25835 | III Liga, Group 1 | 135 |
| poland | 25837 | III Liga, Group 2 | 136 |
| poland | 25839 | III Liga, Group 3 | 135 |
| poland | 25841 | III Liga, Group 4 | 135 |
| poland | 48523 | IV Liga | 0 |
| poland | 281 | Puchar Polski | 0 |
| poland | 42281 | Puchar Polski, Women | 0 |
| poland | 511 | Superpuchar Polski | 0 |
| portugal | 14758 | Campeonato de Portugal | 447 |
| portugal | 19274 | Campeonato Nacional, Women | 60 |
| portugal | 48711 | II Divisao, Women | 8 |
| portugal | 327 | League Cup | 0 |
| portugal | 238 | Liga Portugal | 198 |
| portugal | 239 | Liga Portugal 2 | 196 |
| portugal | 34900 | Liga Portugal 3 | 70 |
| portugal | 345 | Super Cup | 0 |
| portugal | 48231 | Supertaca, Women | 0 |
| portugal | 336 | Taca de Portugal | 9 |
| portugal | 1133 | U19 Campeonato Nacional | 47 |
| portugal | 26080 | U23 Liga Revelacao | 25 |
| portugal | 28735 | U23 Taca Revelacao | 0 |
| puerto-rico | 48769 | LPR Pro | 2 |
| qatar | 19228 | 2nd Division League | 8 |
| qatar | 25659 | Amir Cup | 0 |
| qatar | 31737 | Qatar Cup | 0 |
| qatar | 34184 | QFA Cup | 0 |
| qatar | 1518 | QSL Cup | 27 |
| qatar | 825 | Stars League | 6 |
| qatar | 48509 | U23 Olympic League | 18 |
| republic-of-korea | 410 | K-League 1 | 2 |
| republic-of-korea | 777 | K-League 2 | 0 |
| republic-of-korea | 15123 | K3 League | 0 |
| republic-of-korea | 48521 | K4 League | 0 |
| republic-of-korea | 615 | Korea Cup | 1 |
| republic-of-korea | 1772 | WK-League | 0 |
| romania | 562 | Liga 2 | 66 |
| romania | 39533 | Liga 3 | 341 |
| romania | 355 | Romania Cup | 12 |
| romania | 698 | Super Cup | 0 |
| romania | 152 | Superliga | 96 |
| romania | 48235 | Superliga, Women | 4 |
| russia | 204 | 1. Liga | 0 |
| russia | 40305 | 2. Liga, Division A | 0 |
| russia | 1093 | 2. Liga, Division B, Group 1 | 0 |
| russia | 1099 | 2. Liga, Division B, Group 2 | 0 |
| russia | 1095 | 2. Liga, Division B, Group 3 | 0 |
| russia | 1097 | 2. Liga, Division B, Group 4 | 0 |
| russia | 203 | Premier League | 104 |
| russia | 91 | Russian Cup | 4 |
| russia | 47478 | Russian Cup, Women | 0 |
| russia | 397 | Super Cup | 0 |
| russia | 47279 | Super Cup, Women | 0 |
| russia | 13635 | Superleague, Women | 0 |
| russia | 879 | Youth League | 0 |
| russia | 1784 | Zone Siberia | 0 |
| rwanda | 23805 | Peace Cup | 0 |
| rwanda | 20162 | Premier League | 56 |
| san-marino | 738 | Campionato Sammarinese | 24 |
| san-marino | 737 | Coppa Titano | 0 |
| san-marino | 1343 | Supercup | 0 |
| saudi-arabia | 2298 | Division 1 | 63 |
| saudi-arabia | 2110 | Kings Cup | 0 |
| saudi-arabia | 955 | Saudi Pro League | 225 |
| saudi-arabia | 48511 | Second Division | 320 |
| saudi-arabia | 2296 | Super Cup | 0 |
| saudi-arabia | 48513 | U21 Elite League | 144 |
| scotland | 331 | Challenge Cup | 16 |
| scotland | 206 | Championship | 100 |
| scotland | 44243 | Highland Football League | 0 |
| scotland | 207 | League 1 | 105 |
| scotland | 209 | League 2 | 110 |
| scotland | 332 | League Cup | 1 |
| scotland | 44245 | Lowland League | 0 |
| scotland | 44425 | Premier League 2, Women | 35 |
| scotland | 48613 | Premier League Cup, Women | 2 |
| scotland | 2090 | Premier League, Women | 30 |
| scotland | 36 | Premiership | 111 |
| scotland | 39077 | Reserve Cup | 0 |
| scotland | 26248 | Reserve League | 0 |
| scotland | 347 | Scottish Cup | 1 |
| scotland | 25143 | Scottish Cup, Women | 0 |
| scotland | 42193 | Scottish Women League One | 0 |
| senegal | 1226 | Ligue 1 | 8 |
| serbia | 721 | Prva Liga | 80 |
| serbia | 314 | Serbian Cup | 0 |
| serbia | 48213 | Srpska Liga | 120 |
| serbia | 210 | Superliga | 105 |
| serbia | 48291 | U19 League | 112 |
| simulated-reality-league | 32217 | Bundesliga SRL | 9 |
| simulated-reality-league | 36227 | China Super League SRL | 0 |
| simulated-reality-league | 32383 | Copa Libertadores SRL | 0 |
| simulated-reality-league | 32377 | Eredivisie SRL | 8 |
| simulated-reality-league | 32533 | European Championship SRL | 0 |
| simulated-reality-league | 36225 | K-League 1 SRL | 0 |
| simulated-reality-league | 32219 | LaLiga SRL | 8 |
| simulated-reality-league | 32223 | Ligue 1 SRL | 9 |
| simulated-reality-league | 32215 | Premier League SRL | 10 |
| simulated-reality-league | 32221 | Serie A SRL | 7 |
| simulated-reality-league | 36215 | SRL Club Friendlies | 0 |
| simulated-reality-league | 36217 | SRL International Friendlies | 0 |
| simulated-reality-league | 32225 | Turkey Super Lig SRL | 6 |
| simulated-reality-league | 32303 | UEFA Champions League SRL | 0 |
| simulated-reality-league | 36223 | UEFA Europa League SRL | 0 |
| simulated-reality-league | 36219 | UEFA Nations League SRL | 0 |
| simulated-reality-league | 38785 | World Cup | 0 |
| simulated-reality-league | 36221 | World Cup Qualifiers SRL | 0 |
| singapore | 36175 | Community Shield | 0 |
| singapore | 634 | Premier League | 64 |
| singapore | 48515 | Premier League 2 | 50 |
| singapore | 655 | Singapore Cup | 6 |
| slovakia | 19246 | 1. League Women | 20 |
| slovakia | 224 | 2. Liga | 104 |
| slovakia | 47536 | 3. Liga | 302 |
| slovakia | 40469 | 3. Liga, East | 0 |
| slovakia | 40471 | 3. Liga, West | 0 |
| slovakia | 303 | Slovensky Pohar | 1 |
| slovakia | 211 | Superliga | 36 |
| slovakia | 1327 | U19 1. Liga | 91 |
| slovenia | 532 | 2. Liga | 112 |
| slovenia | 47998 | 3. SNL | 168 |
| slovenia | 212 | PrvaLiga | 95 |
| slovenia | 291 | Slovenia Cup | 0 |
| soccerspecials | 49224 | Kings Cup Brazil | 0 |
| soccerspecials | 47243 | Kings Cup Spain | 0 |
| soccerspecials | 47239 | Kings League Brazil | 0 |
| south-africa | 29468 | Black Label Cup | 0 |
| south-africa | 1906 | Championship | 136 |
| south-africa | 48663 | Diski Challenge, Reserves | 136 |
| south-africa | 1020 | FA Cup | 0 |
| south-africa | 1205 | Knockout Cup | 1 |
| south-africa | 1125 | MTN 8 | 0 |
| south-africa | 358 | Premiership | 119 |
| spain | 24864 | Copa de SM La Reina | 8 |
| spain | 329 | Copa del Rey | 0 |
| spain | 27462 | Copa Federacion | 0 |
| spain | 8 | LaLiga | 238 |
| spain | 54 | LaLiga 2 | 286 |
| spain | 1127 | Primera Division Women | 144 |
| spain | 34834 | Primera Federacion | 481 |
| spain | 47548 | Primera Federacion, Women | 105 |
| spain | 544 | Segunda Federacion | 946 |
| spain | 213 | Supercopa | 0 |
| spain | 31863 | Supercopa, Women | 0 |
| spain | 48343 | U19 Division de Honor Juvenil | 1127 |
| spain-amateur | 26018 | Tercera Federacion, Group 1 | 198 |
| spain-amateur | 26036 | Tercera Federacion, Group 10 | 198 |
| spain-amateur | 26038 | Tercera Federacion, Group 11 | 198 |
| spain-amateur | 26040 | Tercera Federacion, Group 12 | 198 |
| spain-amateur | 26042 | Tercera Federacion, Group 13 | 198 |
| spain-amateur | 26044 | Tercera Federacion, Group 14 | 198 |
| spain-amateur | 26046 | Tercera Federacion, Group 15 | 196 |
| spain-amateur | 26048 | Tercera Federacion, Group 16 | 198 |
| spain-amateur | 26050 | Tercera Federacion, Group 17 | 198 |
| spain-amateur | 26052 | Tercera Federacion, Group 18 | 190 |
| spain-amateur | 26020 | Tercera Federacion, Group 2 | 198 |
| spain-amateur | 26022 | Tercera Federacion, Group 3 | 198 |
| spain-amateur | 26024 | Tercera Federacion, Group 4 | 198 |
| spain-amateur | 26026 | Tercera Federacion, Group 5 | 219 |
| spain-amateur | 26028 | Tercera Federacion, Group 6 | 198 |
| spain-amateur | 26030 | Tercera Federacion, Group 7 | 195 |
| spain-amateur | 26032 | Tercera Federacion, Group 8 | 198 |
| spain-amateur | 26034 | Tercera Federacion, Group 9 | 198 |
| spain-amateur | 17504 | Tercera Federacion, Playoffs | 0 |
| sweden | 40 | Allsvenskan | 0 |
| sweden | 214 | Damallsvenskan | 0 |
| sweden | 868 | Division 2, Norra Gotaland | 0 |
| sweden | 70 | Division 2, Norra Svealand | 0 |
| sweden | 71 | Division 2, Norrland | 0 |
| sweden | 20782 | Division 2, Promotion Playoffs | 0 |
| sweden | 72 | Division 2, Sodra Gotaland | 0 |
| sweden | 74 | Division 2, Sodra Svealand | 0 |
| sweden | 73 | Division 2, Vastra Gotaland | 0 |
| sweden | 67 | Ettan, Norra | 0 |
| sweden | 27412 | Ettan, Relegation/Promotion | 0 |
| sweden | 68 | Ettan, Sodra | 0 |
| sweden | 46 | Superettan | 0 |
| sweden | 80 | Svenska Cup | 0 |
| sweden | 1058 | Svenska Cup Women | 0 |
| sweden-amateur | 520 | Div 3 Mellersta Gotaland | 0 |
| sweden-amateur | 528 | Div 3 Sodra Gotaland | 0 |
| sweden-amateur | 38941 | Elitettan, Women | 0 |
| sweden-amateur | 2539 | U19 Allsvenskan | 0 |
| sweden-amateur | 1016 | U21 Allsvenskan | 0 |
| sweden-amateur | 46587 | U21 Ligacupen Elit | 0 |
| switzerland | 40521 | 2. Liga Interregional | 0 |
| switzerland | 44251 | 3. Liga | 0 |
| switzerland | 44253 | 4. Liga | 0 |
| switzerland | 216 | Challenge League | 16 |
| switzerland | 37051 | Erste Liga | 359 |
| switzerland | 1101 | Promotion League | 153 |
| switzerland | 399 | Schweizer Cup | 0 |
| switzerland | 215 | Super League | 42 |
| switzerland | 29918 | Super League, Women | 35 |
| switzerland | 48289 | U19 Elite | 77 |
| syria | 26922 | Premier League | 0 |
| tajikistan | 26322 | Vysshaya Liga | 0 |
| tanzania | 48933 | Championship League | 176 |
| tanzania | 48767 | Community Shield | 0 |
| tanzania | 46742 | Federation Cup | 1 |
| tanzania | 2436 | Premier League | 174 |
| thailand | 19270 | FA Cup | 0 |
| thailand | 1032 | Thai League 1 | 18 |
| thailand | 19232 | Thai League 2 | 18 |
| trinidad-and-tobago | 19252 | TT Premier League | 96 |
| tunisia | 984 | Ligue 1 | 0 |
| tunisia | 20578 | Ligue 2 | 14 |
| tunisia | 32041 | Supercoupe | 0 |
| tunisia | 1682 | Tunisian Cup | 0 |
| turkiye | 98 | 1. Lig | 230 |
| turkiye | 505 | Super Kupa | 2 |
| turkiye | 52 | Super Lig | 180 |
| turkiye | 48741 | Super Lig, Women | 160 |
| turkiye | 96 | Turkiye Kupasi | 0 |
| turkiye-amateur | 97 | 2. Lig | 388 |
| turkiye-amateur | 26386 | 3. Lig, Group 1 | 150 |
| turkiye-amateur | 26388 | 3. Lig, Group 2 | 151 |
| turkiye-amateur | 26390 | 3. Lig, Group 3 | 151 |
| turkiye-amateur | 33133 | 3. Lig, Group 4 | 151 |
| turkiye-amateur | 34292 | 3. Lig, Playoffs | 0 |
| turkiye-amateur | 29912 | U19 Elit A | 181 |
| turkiye-amateur | 29914 | U19 Elit B | 0 |
| turkmenistan | 28625 | Yokary Liga | 0 |
| uganda | 23747 | Cup | 0 |
| uganda | 14864 | Premier League | 103 |
| uganda | 25867 | Super 8 | 0 |
| uganda | 39561 | Uganda Cup, Women | 0 |
| ukraine | 691 | Persha Liga | 96 |
| ukraine | 218 | Premier League | 128 |
| ukraine | 1307 | U19 | 125 |
| ukraine | 312 | Ukraine Cup | 0 |
| ukraine | 19244 | Vyscha Liga, Women | 0 |
| united-arab-emirates | 971 | Arabian Gulf League | 35 |
| united-arab-emirates | 19238 | First Division | 153 |
| united-arab-emirates | 2513 | Presidents Cup | 4 |
| united-arab-emirates | 1369 | Pro League Cup | 2 |
| united-arab-emirates | 2306 | Super Cup | 1 |
| united-arab-emirates | 48313 | U23 Pro League | 35 |
| uruguay | 37127 | Copa Uruguay | 0 |
| uruguay | 278 | Primera Division | 0 |
| uruguay | 46851 | Primera Division, Women | 0 |
| uruguay | 1908 | Segunda Division | 0 |
| uruguay | 27999 | Supercopa Uruguaya | 0 |
| uruguay | 35811 | Tercera Division, Reserves | 0 |
| uruguay | 35813 | U19 League | 0 |
| usa | 242 | MLS | 16 |
| usa | 1794 | MLS All Star Game | 0 |
| usa | 36479 | MLS Next Pro | 0 |
| usa | 36139 | MLS Preseason | 0 |
| usa | 28424 | National Premier Soccer League | 0 |
| usa | 1690 | National Womens Soccer League | 0 |
| usa | 34228 | NCAA Division I National Championship | 4 |
| usa | 26178 | NCAA Regular Season, Women | 0 |
| usa | 34232 | NCAA, Division I National Championship, Women | 2 |
| usa | 26176 | NCAA, Regular Season | 0 |
| usa | 36475 | NISA | 0 |
| usa | 32559 | NWSL Challenge Cup, Women | 0 |
| usa | 495 | US Open Cup | 0 |
| usa | 28163 | USL Championship | 0 |
| usa | 28165 | USL League One | 0 |
| usa | 42695 | USL League One Cup | 0 |
| usa | 28743 | USL League Two | 0 |
| usa | 43439 | USL Super League, Women | 74 |
| usa | 37169 | USL W League | 0 |
| usa | 28239 | Womens Premier Soccer League | 0 |
| uzbekistan | 19240 | Cup | 0 |
| uzbekistan | 23477 | Pro Liga | 0 |
| uzbekistan | 33890 | Super Cup | 0 |
| uzbekistan | 772 | Superliga | 4 |
| venezuela | 19282 | Copa Venezuela | 0 |
| venezuela | 231 | Primera Division | 1 |
| venezuela | 17302 | Segunda Division | 0 |
| venezuela | 46133 | Supercopa Venezuela | 0 |
| vietnam | 1236 | Super Cup | 0 |
| vietnam | 626 | V-League 1 | 17 |
| vietnam | 771 | V-League 2 | 60 |
| vietnam | 2537 | Vietnam Cup | 0 |
| virtual-football | 26654 | Virtual Football Asian Cup | 0 |
| virtual-football | 34616 | Virtual Football Bundesliga | 0 |
| virtual-football | 35234 | Virtual Football Bundesliga Retail | 0 |
| virtual-football | 35238 | Virtual Football Bundesliga Retail Doxxbet | 0 |
| virtual-football | 35236 | Virtual Football Bundesliga Retail STS | 0 |
| virtual-football | 28199 | Virtual Football Champions Cup | 0 |
| virtual-football | 29308 | Virtual Football Champions Cup 19/20 | 0 |
| virtual-football | 29310 | Virtual Football Champions Cup 19/20 Retail | 0 |
| virtual-football | 30016 | Virtual Football Champions Cup Doxxbet | 0 |
| virtual-football | 28430 | Virtual Football Champions Cup Retail | 0 |
| virtual-football | 31867 | Virtual Football English League | 0 |
| virtual-football | 46215 | Virtual Football English League 2 | 0 |
| virtual-football | 46285 | Virtual Football English League 2 Retail | 0 |
| virtual-football | 2448 | Virtual Football Euro Cup | 0 |
| virtual-football | 13909 | Virtual Football Euro Cup Retail | 0 |
| virtual-football | 32193 | Virtual Football French League | 0 |
| virtual-football | 32189 | Virtual Football German League | 0 |
| virtual-football | 32191 | Virtual Football Italian League | 0 |
| virtual-football | 14149 | Virtual Football League Mode | 0 |
| virtual-football | 28173 | Virtual Football League Mode | 0 |
| virtual-football | 32505 | Virtual Football League Mode Betflag | 0 |
| virtual-football | 14560 | Virtual Football League Mode Betsson | 0 |
| virtual-football | 17786 | Virtual Football League Mode Doxxbet | 0 |
| virtual-football | 14981 | Virtual Football League Mode Eurobet | 0 |
| virtual-football | 14612 | Virtual Football League Mode Interwetten | 0 |
| virtual-football | 30915 | Virtual Football League Mode Microgame | 0 |
| virtual-football | 30140 | Virtual Football League Mode Millenium | 0 |
| virtual-football | 28197 | Virtual Football League Mode PinnacleBet | 0 |
| virtual-football | 14562 | Virtual Football League Mode Retail | 0 |
| virtual-football | 15093 | Virtual Football League Mode Retail Betaland | 0 |
| virtual-football | 15097 | Virtual Football League Mode Retail Eurobet | 0 |
| virtual-football | 15568 | Virtual Football League Mode Retail Millennium | 0 |
| virtual-football | 25329 | Virtual Football League Mode Retail Novomatic | 0 |
| virtual-football | 17334 | Virtual Football League Mode Retail STS | 0 |
| virtual-football | 34578 | Virtual Football League Mode Sportna Loterija | 0 |
| virtual-football | 15095 | Virtual Football League Mode Surebet247 Retail | 0 |
| virtual-football | 26666 | Virtual Football League Retail Min | 0 |
| virtual-football | 15083 | Virtual Football N. Cup Retail Eurobet | 0 |
| virtual-football | 13933 | Virtual Football Nations Cup | 0 |
| virtual-football | 14979 | Virtual Football Nations Cup Eurobet | 0 |
| virtual-football | 30917 | Virtual Football Nations Cup Microgame | 0 |
| virtual-football | 30108 | Virtual Football Nations Cup Millennium | 0 |
| virtual-football | 13967 | Virtual Football Nations Cup Retail | 0 |
| virtual-football | 14836 | Virtual Football Nations Cup Retail 2 | 0 |
| virtual-football | 15081 | Virtual Football Nations Cup Retail Betaland | 0 |
| virtual-football | 15566 | Virtual Football Nations Cup Retail Millennium | 0 |
| virtual-football | 25323 | Virtual Football Nations Cup Retail Novomatic | 0 |
| virtual-football | 24195 | Virtual Football SBO Cup | 0 |
| virtual-football | 32187 | Virtual Football Spanish League | 0 |
| virtual-football | 15446 | Virtual Football World Cup | 0 |
| virtual-football | 24704 | Virtual Football World Cup Doxxbet | 0 |
| virtual-football | 28175 | Virtual Football World Cup InterwettenRGS | 0 |
| virtual-football | 20648 | Virtual Football World Cup Retail | 0 |
| virtual-football | 23523 | Virtual Football World Cup Retail Eurobet | 0 |
| virtual-football | 38973 | Virtual World Match Football S1 | 0 |
| virtual-football | 38975 | Virtual World Match Football S2 | 0 |
| virtual-football | 38977 | Virtual World Match Football S3 | 0 |
| virtual-football | 45145 | Virtual World Match Football S4 | 0 |
| virtual-football | 45199 | Virtual World Match Football S5 | 0 |
| virtual-football | 45201 | Virtual World Match Football S6 | 0 |
| virtual-leagues | 1698 | V. Footb. L. 3 Trustful | 0 |
| virtual-leagues | 913 | Virt. Football League | 0 |
| virtual-leagues | 1078 | Virt. Football League 2 | 0 |
| virtual-leagues | 1668 | Virt. Football League 3 | 0 |
| virtual-leagues | 1363 | Virtua Football ExaLogic | 0 |
| virtual-leagues | 1456 | Virtual Football BetFlag | 0 |
| virtual-leagues | 2120 | Virtual Football Evona | 0 |
| virtual-leagues | 2128 | Virtual Football Gamenet | 0 |
| virtual-leagues | 2017 | Virtual Football League bet-at-home | 0 |
| virtual-leagues | 2286 | Virtual Football League Betcenter | 0 |
| virtual-leagues | 13627 | Virtual Football League Betsson | 0 |
| virtual-leagues | 2458 | Virtual Football League Coral | 0 |
| virtual-leagues | 13721 | Virtual Football League DOXXBet | 0 |
| virtual-leagues | 2228 | Virtual Football League EGaming | 0 |
| virtual-leagues | 2284 | Virtual Football League GANA | 0 |
| virtual-leagues | 2222 | Virtual Football League GLI | 0 |
| virtual-leagues | 2230 | Virtual Football League Goldbet | 0 |
| virtual-leagues | 2236 | Virtual Football League Retail | 0 |
| virtual-leagues | 2292 | Virtual Football League SXM | 0 |
| virtual-leagues | 2521 | Virtual Football League TwinLeague1 | 0 |
| virtual-leagues | 2519 | Virtual Football League TwinLeague2 | 0 |
| virtual-leagues | 1458 | Virtual Football Microg. | 0 |
| virtual-leagues | 2130 | Virtual Football Netbet | 0 |
| virtual-leagues | 2144 | Virtual Football Teycoweb | 0 |
| wales | 29242 | Cymru Championship South | 121 |
| wales | 29244 | Cymru Championship, North | 121 |
| wales | 254 | Cymru Premier | 27 |
| wales | 388 | FAW Welsh Cup | 0 |
| wales | 367 | League Cup | 2 |
| zambia | 2142 | Super League | 189 |
| zimbabwe | 23479 | Premier Soccer League | 0 |

### Mise à jour automatique - Sport 15
*(Généré le 2025-12-08T02:57:47.887Z)*

| Pays | ID | Tournoi | Matchs à venir |
|------|----|---------|----------------|
| australia | 24337 | Australian Ice Hockey League | 0 |
| austria | 256 | ICE Hockey League | 145 |
| austria | 2118 | Young Stars League | 75 |
| belarus | 1370 | Extraliga | 137 |
| belarus | 32961 | Salei Cup | 0 |
| canada | 28661 | CHL Memorial Cup | 0 |
| canada | 1454 | OHL | 392 |
| canada | 30398 | Quebec Major Junior Hockey League | 337 |
| canada | 14361 | WHL | 465 |
| czech-republic | 735 | 1. Liga | 160 |
| czech-republic | 48295 | 2. Liga | 287 |
| czech-republic | 237 | Extraliga | 149 |
| czech-republic | 48297 | U20 Extraliga Junioru | 16 |
| czech-republic | 49318 | University League | 80 |
| denmark | 257 | Superisligaen | 106 |
| england | 48299 | Challenge Cup | 1 |
| england | 1442 | Elite League | 189 |
| estonia | 48851 | Hokiliiga | 20 |
| finland | 134 | Liiga | 255 |
| finland | 259 | Mestis | 135 |
| finland | 34596 | Naisten Liiga, Women | 41 |
| finland | 1878 | Suomi Sarja | 97 |
| finland | 48303 | U20 SM Sarja | 171 |
| france | 1550 | Coupe de France | 0 |
| france | 46287 | Division 1 | 135 |
| france | 599 | Ligue Magnus | 126 |
| germany | 225 | DEL | 181 |
| germany | 267 | DEL 2 | 209 |
| germany | 39345 | Oberliga | 292 |
| international | 14005 | Alps Hockey League | 93 |
| international | 862 | Arosa Challenge | 0 |
| international | 19200 | Asia League | 65 |
| international | 996 | Austria Cup | 0 |
| international | 494 | Champions Hockey League | 9 |
| international | 919 | Club Friendly Games | 0 |
| international | 32915 | Club Friendly Games U21 | 0 |
| international | 386 | Continental Cup | 0 |
| international | 41290 | Deutschland Cup, Women | 0 |
| international | 14335 | Erste Liga | 55 |
| international | 467 | Euro Hockey Tour | 12 |
| international | 44925 | Euro Hockey Tour, Women | 4 |
| international | 49416 | European Cup of Nations | 0 |
| international | 863 | Germany Cup | 0 |
| international | 873 | Int. Friendly Games | 3 |
| international | 35691 | International Friendly Games, Women | 1 |
| international | 664 | Olympic Tournament, Qualification | 0 |
| international | 35514 | Olympic Tournament, Women, Qualifying | 0 |
| international | 1359 | Presidents Cup | 0 |
| international | 481 | Spengler Cup | 2 |
| international | 1042 | U18 World Championship | 0 |
| international | 1040 | U18 World Championship Division 1, Group B | 0 |
| international | 1038 | U18 World Championship, Division I, A | 0 |
| international | 43941 | U20 Friendly Games | 0 |
| international | 769 | U20 World Championship | 28 |
| international | 1213 | U20 World Championship, Division I, Group A | 12 |
| international | 1215 | U20 World Championship, Division I, Group B | 15 |
| international | 27801 | U20 World Championship, Division II, Group A | 0 |
| international | 27803 | U20 World Championship, Division II, Group B | 0 |
| international | 27805 | U20 World Championship, Division III, A | 0 |
| international | 3 | World Championship | 0 |
| international | 320 | World Championship Division 1, Group A | 0 |
| international | 1022 | World Championship Division 1, Group B | 0 |
| international | 28402 | World Championship, Division II, A | 0 |
| international | 28420 | World Championship, Division II, Group B | 0 |
| international | 38927 | World Championship, Division III, Group A | 0 |
| international | 38929 | World Championship, Division III, Group B | 0 |
| international | 428 | World Championship, Women | 0 |
| international | 28400 | World Championship, Women, Div I, Group A | 0 |
| international | 28398 | World Championship, Women, Div I, Group B | 0 |
| italy | 48477 | IHL | 36 |
| kazakhstan | 48301 | Kazakhstan Cup | 0 |
| kazakhstan | 30156 | Pro Hockey League | 30 |
| latvia | 19452 | Latvian Hockey League | 85 |
| new-zealand | 24866 | NZIHL | 0 |
| norway | 828 | 1st Division | 71 |
| norway | 260 | Eliteserien | 103 |
| norway | 48475 | U20 Elite | 0 |
| poland | 42965 | 1. Liga | 0 |
| poland | 49902 | Poland Cup | 0 |
| poland | 243 | Polska Hokej Liga | 36 |
| russia | 268 | KHL | 372 |
| russia | 869 | KHL All Star Game | 0 |
| russia | 1159 | MHL | 607 |
| russia | 1141 | VHL | 495 |
| russia | 35769 | WHL, Women | 57 |
| slovakia | 48545 | 2. SHL | 80 |
| slovakia | 236 | Extraliga | 166 |
| slovakia | 1490 | SHL | 130 |
| slovakia | 48199 | Slovensky Pohar | 0 |
| slovakia | 48473 | U20 Extraliga Juniorov | 108 |
| sweden | 416 | Allsvenskan | 187 |
| sweden | 714 | HockeyEttan | 423 |
| sweden | 1880 | SDHL | 57 |
| sweden | 261 | SHL | 183 |
| sweden | 45491 | U20 Nationell | 146 |
| switzerland | 38127 | MyHockey League | 0 |
| switzerland | 128 | National League | 147 |
| switzerland | 1788 | Swiss Ice Hockey Cup | 0 |
| switzerland | 129 | Swiss League | 126 |
| switzerland | 38129 | Swiss Womens League | 0 |
| switzerland | 41560 | U15 Regional Tournament | 0 |
| switzerland | 39539 | U21 Elit | 120 |
| ukraine | 31599 | UHL | 0 |
| usa | 43909 | 4 Nations Face-Off | 0 |
| usa | 844 | AHL | 801 |
| usa | 2077 | AHL All Star Game | 0 |
| usa | 44421 | AHL Preseason | 0 |
| usa | 29898 | ECHL | 775 |
| usa | 44953 | FPHL | 273 |
| usa | 33992 | NCAA Division I National Championship | 0 |
| usa | 34026 | NCAA Division I National Championship, Women | 0 |
| usa | 24131 | NCAA Women | 325 |
| usa | 30570 | NCAA, Regular Season | 576 |
| usa | 234 | NHL | 852 |
| usa | 870 | NHL All Star Game | 0 |
| usa | 957 | NHL Preseason | 0 |
| usa | 41857 | PWHL, Women | 104 |
| usa | 30074 | SPHL | 208 |

### Mise à jour automatique - Sport 23
*(Généré le 2025-12-08T02:57:49.343Z)*

| Pays | ID | Tournoi | Matchs à venir |
|------|----|---------|----------------|
| argentina | 14556 | Liga Argentina | 45 |
| argentina | 39475 | Liga Argentina, Women | 0 |
| austria | 37987 | 2. Bundesliga, Women | 0 |
| austria | 37981 | Cup | 5 |
| austria | 37983 | Cup, Women | 1 |
| austria | 38019 | Super Cup | 0 |
| austria | 38021 | Super Cup, Women | 0 |
| austria | 298 | Volley League | 33 |
| austria | 37985 | Volley League 2 | 80 |
| austria | 299 | Volley League, Women | 41 |
| belarus | 33123 | Division A | 0 |
| belarus | 33125 | Division A, Women | 0 |
| belgium | 38241 | Liga Dames, Women | 74 |
| belgium | 1922 | Liga Heren | 45 |
| brazil | 35627 | Copa Brasil, Women | 0 |
| brazil | 33648 | Copa do Brazil | 0 |
| brazil | 48305 | Paulista | 0 |
| brazil | 48307 | Paulista, Women | 0 |
| brazil | 35623 | Supercopa de Volei | 0 |
| brazil | 35625 | Supercopa de Volei, Women | 0 |
| brazil | 1452 | Superliga | 15 |
| brazil | 42059 | Superliga B | 79 |
| brazil | 42061 | Superliga B, Women | 88 |
| brazil | 1468 | Superliga, Women | 13 |
| bulgaria | 39039 | Bulgarian Cup | 0 |
| bulgaria | 39041 | Bulgarian Cup, Women | 0 |
| bulgaria | 48903 | Super Cup | 0 |
| bulgaria | 1670 | Super League | 15 |
| bulgaria | 27116 | Volleyball Super League, Women | 5 |
| china | 14558 | China Volleyball League | 0 |
| china | 46091 | China Volleyball League B | 0 |
| china | 46093 | China Volleyball League B, Women | 0 |
| china | 2033 | China Volleyball League, Women | 0 |
| chinese-taipei | 41306 | TVL | 39 |
| croatia | 14732 | Cup | 0 |
| croatia | 14734 | Cup, Women | 0 |
| croatia | 1185 | Superliga | 50 |
| croatia | 24289 | Superliga, Women | 50 |
| czech-republic | 2030 | Czech Cup | 0 |
| czech-republic | 39037 | Czech Cup, Women | 0 |
| czech-republic | 806 | Extraliga | 97 |
| czech-republic | 1177 | Extraliga Women | 76 |
| czechia | 48899 | 1. Liga | 11 |
| czechia | 48901 | 1. Liga, Women | 12 |
| denmark | 2007 | Pokalturneringen | 0 |
| denmark | 1450 | VolleyLigaen | 51 |
| denmark | 14445 | VolleyLigaen Women | 40 |
| estonia | 46035 | Esiliiga | 1 |
| faeroe-islands | 44451 | Meistaradeildin | 0 |
| finland | 832 | Mestaruusliiga | 99 |
| finland | 14474 | Mestaruusliiga, Women | 62 |
| france | 48825 | Championnat Elite, Women | 40 |
| france | 998 | Coupe de France | 2 |
| france | 23439 | Coupe de France, Women | 1 |
| france | 833 | Ligue A | 112 |
| france | 1175 | Ligue A Women | 96 |
| france | 24464 | Ligue B | 120 |
| france | 1950 | Super Coupe | 0 |
| france | 41304 | Super Coupe, Women | 0 |
| germany | 501 | 1st Bundesliga | 131 |
| germany | 500 | 1st Bundesliga Women | 84 |
| germany | 48823 | 2. Bundesliga | 156 |
| germany | 34866 | 2. Bundesliga Women | 127 |
| germany | 2410 | DVV Cup | 0 |
| germany | 2412 | DVV Cup, Women | 2 |
| germany | 20198 | Liga Cup | 0 |
| germany | 20200 | Super Cup, Women | 0 |
| greece | 603 | A1 | 60 |
| greece | 23869 | Cup | 0 |
| greece | 23879 | Cup, Women | 1 |
| greece | 1606 | League Cup | 0 |
| greece | 48773 | Pre League | 60 |
| greece | 26914 | Pre League, Women | 84 |
| greece | 38925 | Super Cup | 0 |
| greece | 1219 | Volley League, Women | 85 |
| hungary | 38217 | Extraliga, Women | 38 |
| hungary | 38219 | NB I Extraliga | 103 |
| iceland | 44427 | Urvalsdeild | 0 |
| iceland | 44429 | Urvalsdeild, Women | 0 |
| indonesia | 42647 | Proliga | 0 |
| indonesia | 42649 | Proliga, Women | 0 |
| international | 13999 | Asean University Games | 0 |
| international | 14001 | Asean University Games, Women | 0 |
| international | 40793 | Asian Championship, Women | 0 |
| international | 39837 | Asian Club Championship | 0 |
| international | 39583 | Asian Club Championship, Women | 0 |
| international | 26098 | Asian Games | 0 |
| international | 26096 | Asian Games, Women | 0 |
| international | 47349 | AVC Cup | 0 |
| international | 47351 | AVC Cup, Women | 0 |
| international | 48827 | Baltic League, Women | 27 |
| international | 48829 | Baltic Supercup | 0 |
| international | 48831 | Baltic Supercup. Women | 0 |
| international | 26862 | Baltic Volleyball League | 32 |
| international | 45993 | BeNe Conference | 0 |
| international | 801 | CEV Challenge Cup | 32 |
| international | 802 | CEV Challenge Cup, Women | 0 |
| international | 587 | CEV Champions League, Women | 40 |
| international | 805 | CEV Cup | 24 |
| international | 807 | CEV Cup, Women | 0 |
| international | 25315 | Challenger Cup | 0 |
| international | 25317 | Challenger Cup, Women | 0 |
| international | 586 | Champions League | 51 |
| international | 859 | Club World Championships | 12 |
| international | 47439 | Copa America | 0 |
| international | 47458 | Copa America, Women | 0 |
| international | 624 | European Championship | 0 |
| international | 286 | European Championship Qualification | 0 |
| international | 289 | European Championship Qualification, Women | 0 |
| international | 139 | European Golden League | 0 |
| international | 625 | European Golden League Women | 0 |
| international | 24718 | European League, Silver | 0 |
| international | 24720 | European League, Silver, Women | 0 |
| international | 860 | FiVB Club World Championships Women | 12 |
| international | 33 | FIVB World Championship | 0 |
| international | 32 | FiVB World Championship Women | 0 |
| international | 26170 | Hubert Wagner Memorial | 0 |
| international | 26266 | International Friendly Games | 0 |
| international | 26268 | International Friendly Games, Women | 0 |
| international | 600 | MEVZA | 7 |
| international | 601 | MEVZA Women | 9 |
| international | 24628 | Nations League | 0 |
| international | 24630 | Nations League, Women | 0 |
| international | 48939 | NORCECA Final Six | 0 |
| international | 496 | Olympic Tournament | 0 |
| international | 29712 | Olympic Tournament Qualification, Intercontinental | 0 |
| international | 1064 | Olympic Tournament Qualification, World, Women | 0 |
| international | 497 | Olympic Tournament Women | 0 |
| international | 48102 | Pan American Cup | 0 |
| international | 48104 | Pan American Cup, Women | 0 |
| international | 29706 | Pan American Games | 0 |
| international | 29694 | Pan American Games, Women | 0 |
| international | 42255 | South American Club Championship | 0 |
| international | 42257 | South American Club Championship, Women | 0 |
| international | 29464 | U16 European Championship, Women | 0 |
| international | 29460 | U17 European Championship | 0 |
| international | 29462 | U17 European Championship, Women | 0 |
| international | 29458 | U18 European Championship | 0 |
| international | 17268 | U19 World Championship | 0 |
| international | 17276 | U19 World Championship, Women | 0 |
| international | 1874 | U20 European Championship | 0 |
| international | 31707 | U20 European Championship, Qualification | 0 |
| international | 15622 | U21 World Championship | 0 |
| international | 15700 | U21 World Championship, Women | 0 |
| international | 36659 | U22 European Championship | 0 |
| international | 324 | World Cup | 0 |
| international | 322 | World Cup Women | 0 |
| iran | 26982 | Super League | 65 |
| israel | 46407 | Premier League | 55 |
| israel | 46409 | Premier League, Women | 70 |
| italy | 14806 | Coppa Italia A1, Women | 0 |
| italy | 23871 | Coppa Italia A2, Women | 0 |
| italy | 14730 | Coppa Italia A2/A3 | 0 |
| italy | 2051 | Coppa Italia Superlega | 0 |
| italy | 567 | Serie A1 Women | 88 |
| italy | 1444 | Serie A2 | 119 |
| italy | 1446 | Serie A2, Women | 63 |
| italy | 46289 | Serie A3 | 125 |
| italy | 1902 | Super Cup | 0 |
| italy | 2368 | Super Cup, Women | 0 |
| italy | 517 | SuperLega | 71 |
| japan | 44099 | SV League | 152 |
| japan | 44101 | SV League, Women | 184 |
| japan | 14526 | V League | 0 |
| japan | 14528 | V League, Women | 0 |
| kazakhstan | 33127 | National League | 0 |
| kazakhstan | 33129 | National League, Women | 0 |
| netherlands | 20186 | Eredivisie | 27 |
| netherlands | 20170 | Eredivisie, Women | 16 |
| norway | 26810 | Eliteserien | 37 |
| norway | 26812 | Eliteserien Women | 39 |
| peru | 44801 | Liga Nacional Superior | 3 |
| peru | 44803 | Liga Nacional Superior, Women | 0 |
| philippines | 37329 | PVL, Women | 0 |
| philippines | 44089 | PVL, Women, Invitational Conference | 0 |
| poland | 39659 | 1. Liga | 137 |
| poland | 39661 | 1. Liga, Women | 72 |
| poland | 831 | Liga Siatkowki | 109 |
| poland | 1173 | Liga Siatkowki, Women | 83 |
| poland | 2061 | Puchar Polski | 0 |
| poland | 2122 | Puchar Polski, Women | 0 |
| poland | 30752 | Superpuchar | 0 |
| poland | 35589 | Superpuchar, Women | 0 |
| portugal | 44849 | Campeonato Nacional, Women | 74 |
| portugal | 1488 | Liga A1 | 76 |
| portugal | 14441 | Supertaca | 0 |
| portugal | 48897 | Supertaca, Women | 0 |
| portugal | 31729 | Taca de Portugal | 2 |
| qatar | 2057 | Qatar Volleyball League | 3 |
| republic-of-korea | 19498 | KOVO Cup | 0 |
| republic-of-korea | 19500 | KOVO Cup, Women | 0 |
| republic-of-korea | 2148 | V League | 82 |
| republic-of-korea | 2150 | V League, Women | 82 |
| romania | 42307 | Cupa Romaniei | 5 |
| romania | 42309 | Cupa Romaniei, Women | 6 |
| romania | 20188 | Divizia A1 | 69 |
| romania | 20196 | Divizia A1, Women | 50 |
| romania | 19948 | Super Cupa | 0 |
| romania | 48895 | Super Cupa, Women | 0 |
| russia | 32175 | Pro League | 5 |
| russia | 32177 | Pro League, Women | 0 |
| russia | 14718 | Russian Cup | 0 |
| russia | 14642 | Russian Cup, Women | 0 |
| russia | 845 | Superliga | 151 |
| russia | 1486 | Superliga, Women | 98 |
| russia | 44505 | Ural League | 0 |
| russia | 44507 | Ural League 2 | 0 |
| russia | 44513 | Ural League 2, Women | 0 |
| russia | 44509 | Ural League 3 | 0 |
| russia | 44515 | Ural League 3, Women | 0 |
| russia | 44511 | Ural League, Women | 0 |
| russia | 44517 | Ural Super League | 0 |
| russia | 44519 | Ural Super League, Women | 0 |
| russia | 2041 | Vysshaya Liga B | 0 |
| russia | 24694 | Youth Cup | 0 |
| russia | 15129 | Youth League | 4 |
| serbia | 38149 | Cup | 0 |
| serbia | 38153 | Cup, Women | 1 |
| serbia | 38151 | Super Cup | 0 |
| serbia | 38155 | Super Cup, Women | 0 |
| serbia | 1199 | Superliga | 86 |
| serbia | 26530 | Superliga, Women | 78 |
| slovakia | 1616 | Cup, Women | 1 |
| slovakia | 1406 | Extraliga | 56 |
| slovakia | 1408 | Extraliga, Women | 45 |
| slovakia | 2096 | Slovensky Pohar | 0 |
| slovenia | 41372 | 1. DOL | 36 |
| slovenia | 41374 | 1. DOL, Women | 19 |
| spain | 1480 | Superliga | 84 |
| spain | 46785 | Superliga 2 | 191 |
| spain | 46787 | Superliga 2, Women | 241 |
| spain | 14478 | Superliga, Women | 72 |
| sweden | 605 | Elitserien | 55 |
| sweden | 606 | Elitserien, Women | 50 |
| sweden | 31725 | Grand Prix | 0 |
| sweden | 31727 | Grand Prix, Women | 0 |
| switzerland | 14476 | Nationalliga A | 20 |
| switzerland | 14480 | Nationalliga A, Women | 45 |
| switzerland | 48977 | Supercup | 0 |
| switzerland | 48979 | Supercup, Women | 0 |
| turkiye | 46217 | 1. Lig | 0 |
| turkiye | 44845 | 1. Lig, Women | 1 |
| turkiye | 23397 | Cup | 0 |
| turkiye | 28368 | Cup, Women | 0 |
| turkiye | 967 | Efeler Ligi | 28 |
| turkiye | 969 | Sultanlar Ligi, Women | 28 |
| turkiye | 2021 | Super Cup | 0 |
| turkiye | 27096 | Super Kupa, Women | 0 |
| usa | 45507 | LOVB Pro, Women | 0 |
| usa | 28619 | NCAA Division I, National Championship | 0 |
| usa | 27488 | NCAA Division I, National Championship, Women | 0 |
| usa | 43847 | NCAA Regular Season, Women | 0 |
| usa | 27743 | NCAA, Regular Season | 0 |
| usa | 42095 | Pro Volleyball Federation, Women | 0 |

### Mise à jour automatique - Sport 12
*(Généré le 2025-12-08T02:58:58.153Z)*

| Pays | ID | Tournoi | Matchs à venir |
|------|----|---------|----------------|
| atp | 2711 | ATP Acapulco, Mexico Men Doubles | 0 |
| atp | 2709 | ATP Acapulco, Mexico Men Singles | 0 |
| atp | 31361 | ATP Adelaide, Australia Men Doubles | 0 |
| atp | 31359 | ATP Adelaide, Australia Men Singles | 0 |
| atp | 41961 | ATP Almaty, Kazakhstan Men Doubles | 0 |
| atp | 41959 | ATP Almaty, Kazakhstan Men Singles | 0 |
| atp | 13445 | ATP Antwerp, Belgium Men Doubles | 0 |
| atp | 13443 | ATP Antwerp, Belgium Men Singles | 0 |
| atp | 33181 | ATP Astana, Kazakhstan Men Doubles | 0 |
| atp | 33179 | ATP Astana, Kazakhstan Men Singles | 0 |
| atp | 48176 | ATP Athens, Greece Men Doubles | 0 |
| atp | 48174 | ATP Athens, Greece Men Singles | 0 |
| atp | 3247 | ATP Atlanta, USA Men Doubles | 0 |
| atp | 3245 | ATP Atlanta, USA Men Singles | 0 |
| atp | 2633 | ATP Auckland, New Zealand Men Doubles | 0 |
| atp | 2631 | ATP Auckland, New Zealand Men Singles | 0 |
| atp | 2771 | ATP Barcelona, Spain Men Doubles | 0 |
| atp | 2769 | ATP Barcelona, Spain Men Singles | 0 |
| atp | 2615 | ATP Basel, Switzerland Men Doubles | 0 |
| atp | 2613 | ATP Basel, Switzerland Men Singles | 0 |
| atp | 2891 | ATP Bastad, Sweden Men Doubles | 0 |
| atp | 2889 | ATP Bastad, Sweden Men Singles | 0 |
| atp | 3027 | ATP Beijing, China Men Doubles | 0 |
| atp | 3025 | ATP Beijing, China Men Singles | 0 |
| atp | 3253 | ATP Belgrade, Serbia Men Doubles | 0 |
| atp | 3251 | ATP Belgrade, Serbia Men Singles | 0 |
| atp | 2621 | ATP Brisbane, Australia Men Doubles | 0 |
| atp | 2619 | ATP Brisbane, Australia Men Singles | 0 |
| atp | 45937 | ATP Brussels, Belgium Doubles | 0 |
| atp | 45935 | ATP Brussels, Belgium Singles | 0 |
| atp | 3009 | ATP Bucharest, Romania Men Doubles | 0 |
| atp | 3007 | ATP Bucharest, Romania Men Singles | 0 |
| atp | 2729 | ATP Buenos Aires, Argentina Men Doubles | 0 |
| atp | 2727 | ATP Buenos Aires, Argentina Men Singles | 0 |
| atp | 14135 | ATP Chengdu, China Men Doubles | 0 |
| atp | 14133 | ATP Chengdu, China Men Singles | 0 |
| atp | 2985 | ATP Cincinnati, USA Men Doubles | 0 |
| atp | 2983 | ATP Cincinnati, USA Men Singles | 0 |
| atp | 27591 | ATP Cordoba, Argentina Men Doubles | 0 |
| atp | 27589 | ATP Cordoba, Argentina Men Singles | 0 |
| atp | 31263 | ATP Cup | 0 |
| atp | 35865 | ATP Dallas, USA Men Doubles | 0 |
| atp | 35867 | ATP Dallas, USA Men Singles | 0 |
| atp | 2735 | ATP Delray Beach, USA Men Doubles | 0 |
| atp | 2733 | ATP Delray Beach, USA Men Singles | 0 |
| atp | 2605 | ATP Doha, Qatar Men Doubles | 0 |
| atp | 2603 | ATP Doha, Qatar Men Singles | 0 |
| atp | 2669 | ATP Dubai, UAE Men Doubles | 0 |
| atp | 2667 | ATP Dubai, UAE Men Singles | 0 |
| atp | 7633 | ATP Eastbourne, Great Britain Men Doubles | 0 |
| atp | 7631 | ATP Eastbourne, Great Britain Men Singles | 0 |
| atp | 12551 | ATP Estoril, Portugal Men Doubles | 0 |
| atp | 12549 | ATP Estoril, Portugal Men Singles | 0 |
| atp | 12317 | ATP Geneva, Switzerland Men Doubles | 0 |
| atp | 12315 | ATP Geneva, Switzerland Men Singles | 0 |
| atp | 37471 | ATP Gijon, Spain Men Doubles | 0 |
| atp | 37469 | ATP Gijon, Spain Men Singles | 0 |
| atp | 2961 | ATP Gstaad, Switzerland Men Doubles | 0 |
| atp | 2959 | ATP Gstaad, Switzerland Men Singles | 0 |
| atp | 2861 | ATP Halle, Germany Men Doubles | 0 |
| atp | 2859 | ATP Halle, Germany Men Singles | 0 |
| atp | 2937 | ATP Hamburg, Germany Men Doubles | 0 |
| atp | 2935 | ATP Hamburg, Germany Men Singles | 0 |
| atp | 42981 | ATP Hangzhou, China Men Doubles | 0 |
| atp | 42979 | ATP Hangzhou, China Men Singles | 0 |
| atp | 41220 | ATP Hong Kong, Hong Kong Men Doubles | 0 |
| atp | 41218 | ATP Hong Kong, Hong Kong Men Singles | 0 |
| atp | 2753 | ATP Houston, USA Men Doubles | 0 |
| atp | 2751 | ATP Houston, USA Men Singles | 0 |
| atp | 2741 | ATP Indian Wells, USA Men Doubles | 0 |
| atp | 2739 | ATP Indian Wells, USA Men Singles | 0 |
| atp | 46305 | ATP Indian Wells, USA Mixed Doubles | 0 |
| atp | 3153 | ATP Kitzbuhel, Austria Men Doubles | 0 |
| atp | 3151 | ATP Kitzbuhel, Austria Men Singles | 0 |
| atp | 2867 | ATP London, Great Britain Men Doubles | 0 |
| atp | 2865 | ATP London, Great Britain Men Singles | 0 |
| atp | 13397 | ATP Los Cabos, Mexico Men Doubles | 0 |
| atp | 13395 | ATP Los Cabos, Mexico Men Singles | 0 |
| atp | 3099 | ATP Lyon, France Men Doubles | 0 |
| atp | 3097 | ATP Lyon, France Men Singles | 0 |
| atp | 2789 | ATP Madrid, Spain Men Doubles | 0 |
| atp | 2787 | ATP Madrid, Spain Men Singles | 0 |
| atp | 31477 | ATP Mallorca, Spain Men Doubles | 0 |
| atp | 31475 | ATP Mallorca, Spain Men Singles | 0 |
| atp | 13565 | ATP Marrakech, Morocco Men Doubles | 0 |
| atp | 13563 | ATP Marrakech, Morocco Men Singles | 0 |
| atp | 2723 | ATP Marseille, France Men Doubles | 0 |
| atp | 2721 | ATP Marseille, France Men Singles | 0 |
| atp | 3003 | ATP Metz, France Men Doubles | 0 |
| atp | 3001 | ATP Metz, France Men Singles | 0 |
| atp | 2747 | ATP Miami, USA Men Doubles | 0 |
| atp | 2745 | ATP Miami, USA Men Singles | 0 |
| atp | 3123 | ATP Monte Carlo, Monaco Men Doubles | 0 |
| atp | 3121 | ATP Monte Carlo, Monaco Men Singles | 0 |
| atp | 4001 | ATP Montpellier, France Men Doubles | 0 |
| atp | 3999 | ATP Montpellier, France Men Singles | 0 |
| atp | 8287 | ATP Montreal, Canada Men Doubles | 0 |
| atp | 8285 | ATP Montreal, Canada Men Singles | 0 |
| atp | 2837 | ATP Munich, Germany Men Doubles | 0 |
| atp | 2835 | ATP Munich, Germany Men Singles | 0 |
| atp | 2885 | ATP Newport, USA Men Doubles | 0 |
| atp | 2883 | ATP Newport, USA Men Singles | 0 |
| atp | 2663 | ATP Paris, France Men Doubles | 0 |
| atp | 2661 | ATP Paris, France Men Singles | 0 |
| atp | 11131 | ATP Rio de Janeiro, Brazil Men Doubles | 0 |
| atp | 11129 | ATP Rio de Janeiro, Brazil Men Singles | 0 |
| atp | 2783 | ATP Rome, Italy Men Doubles | 0 |
| atp | 2781 | ATP Rome, Italy Men Singles | 0 |
| atp | 2681 | ATP Rotterdam, Netherlands Men Doubles | 0 |
| atp | 2679 | ATP Rotterdam, Netherlands Men Singles | 0 |
| atp | 2873 | ATP S-Hertogenbosch, Netherlands Men Doubles | 0 |
| atp | 2871 | ATP S-Hertogenbosch, Netherlands Men Singles | 0 |
| atp | 3241 | ATP Santiago, Chile Men Doubles | 0 |
| atp | 3239 | ATP Santiago, Chile Men Singles | 0 |
| atp | 3087 | ATP Shanghai, China Men Doubles | 0 |
| atp | 3085 | ATP Shanghai, China Men Singles | 0 |
| atp | 13391 | ATP Sofia, Bulgaria Men Doubles | 0 |
| atp | 13389 | ATP Sofia, Bulgaria Men Singles | 0 |
| atp | 3093 | ATP Stockholm, Sweden Men Doubles | 0 |
| atp | 3091 | ATP Stockholm, Sweden Men Singles | 0 |
| atp | 2777 | ATP Stuttgart, Germany Men Doubles | 0 |
| atp | 2775 | ATP Stuttgart, Germany Men Singles | 0 |
| atp | 3033 | ATP Tokyo, Japan Men Doubles | 0 |
| atp | 3031 | ATP Tokyo, Japan Men Singles | 0 |
| atp | 2997 | ATP Toronto, Canada Men Doubles | 0 |
| atp | 2995 | ATP Toronto, Canada Men Singles | 0 |
| atp | 2967 | ATP Umag, Croatia Men Doubles | 0 |
| atp | 2965 | ATP Umag, Croatia Men Singles | 0 |
| atp | 3105 | ATP Vienna, Austria Men Doubles | 0 |
| atp | 3103 | ATP Vienna, Austria Men Singles | 0 |
| atp | 2973 | ATP Washington, USA Men Doubles | 0 |
| atp | 2971 | ATP Washington, USA Men Singles | 0 |
| atp | 4331 | ATP Winston Salem, USA Men Doubles | 0 |
| atp | 4329 | ATP Winston Salem, USA Men Singles | 0 |
| atp | 21408 | ATP World Tour Finals Men Doubles | 0 |
| atp | 21406 | ATP World Tour Finals Men Singles | 0 |
| atp | 27597 | ATP Zhuhai, China Men Doubles | 0 |
| atp | 27595 | ATP Zhuhai, China Men Singles | 0 |
| atp | 2569 | Australian Open Men Doubles | 0 |
| atp | 2567 | Australian Open Men Singles | 0 |
| atp | 2575 | Australian Open Mixed Doubles | 0 |
| atp | 2581 | French Open Men Doubles | 0 |
| atp | 2579 | French Open Men Singles | 0 |
| atp | 2587 | French Open Mixed Doubles | 0 |
| atp | 14754 | Next Gen ATP Finals Men Singles | 0 |
| atp | 8185 | Olympic Tournament Men Doubles | 0 |
| atp | 8183 | Olympic Tournament Men Singles | 0 |
| atp | 8191 | Olympic Tournament Mixed Doubles | 0 |
| atp | 2593 | US Open Men Doubles | 0 |
| atp | 2591 | US Open Men Singles | 0 |
| atp | 2599 | US Open Mixed Doubles | 0 |
| atp | 2557 | Wimbledon Men Doubles | 0 |
| atp | 2555 | Wimbledon Men Singles | 0 |
| atp | 2563 | Wimbledon Mixed Doubles | 0 |
| challenger | 33049 | 2020 Trieste, Italy Doubles | 0 |
| challenger | 48419 | 2025 ATP Challenger Bogota (Los Lagartos), Colombia Men Doubles | 0 |
| challenger | 48417 | 2025 ATP Challenger Bogota (Los Lagartos), Colombia Men Singles | 0 |
| challenger | 3833 | ATP Challenger  Szczecin, Poland Men Doubles | 0 |
| challenger | 46175 | ATP Challenger Abidjan 2, Cote d Ivoire Men Doubles | 0 |
| challenger | 46177 | ATP Challenger Abidjan 2, Cote d Ivoire, Men Singles | 0 |
| challenger | 46171 | ATP Challenger Abidjan, Cote d Ivoire Men Doubles | 0 |
| challenger | 46169 | ATP Challenger Abidjan, Cote d Ivoire Men Singles | 0 |
| challenger | 42229 | ATP Challenger Acapulco, Mexico Men Doubles | 0 |
| challenger | 42227 | ATP Challenger Acapulco, Mexico Men Singles | 0 |
| challenger | 11501 | ATP Challenger Aix en Provence, France Men Doubles | 0 |
| challenger | 11499 | ATP Challenger Aix en Provence, France Men Singles | 0 |
| challenger | 24241 | ATP Challenger Alicante, Spain Men Doubles | 0 |
| challenger | 24239 | ATP Challenger Alicante, Spain Men Singles | 0 |
| challenger | 2831 | ATP Challenger Amersfoort, Netherlands Men Doubles | 0 |
| challenger | 2829 | ATP Challenger Amersfoort, Netherlands Men Singles | 0 |
| challenger | 40301 | ATP Challenger Antofagasta, Chile Men Doubles | 0 |
| challenger | 40303 | ATP Challenger Antofagasta, Chile Men Singles | 0 |
| challenger | 3923 | ATP Challenger Astana, Kazakhstan Men Doubles | 0 |
| challenger | 3921 | ATP Challenger Astana, Kazakhstan Men Singles | 0 |
| challenger | 42091 | ATP Challenger Asuncion, Paraguay Men Doubles | 0 |
| challenger | 42089 | ATP Challenger Asuncion, Paraguay Men Singles | 0 |
| challenger | 3417 | ATP Challenger Athens, Greece Men Doubles | 0 |
| challenger | 3415 | ATP Challenger Athens, Greece Men Singles | 0 |
| challenger | 29482 | ATP Challenger Augsburg, Germany Men Doubles | 0 |
| challenger | 29480 | ATP Challenger Augsburg, Germany Men Singles | 0 |
| challenger | 40399 | ATP Challenger Bad Waltersdorf, Austria Men Doubles | 0 |
| challenger | 40397 | ATP Challenger Bad Waltersdorf, Austria Men Singles | 0 |
| challenger | 26122 | ATP Challenger Barcelona, Spain Men Doubles | 0 |
| challenger | 26120 | ATP Challenger Barcelona, Spain Men Singles | 0 |
| challenger | 3283 | ATP Challenger Barletta, Italy Men Doubles | 0 |
| challenger | 3281 | ATP Challenger Barletta, Italy Men Singles | 0 |
| challenger | 4313 | ATP Challenger Barranquilla, Colombia Men Doubles | 0 |
| challenger | 4311 | ATP Challenger Barranquilla, Colombia Men Singles | 0 |
| challenger | 13133 | ATP Challenger Bengaluru, India Men Doubles | 0 |
| challenger | 13131 | ATP Challenger Bengaluru, India Men Singles | 0 |
| challenger | 3289 | ATP Challenger Bergamo, Italy Men Doubles | 0 |
| challenger | 3287 | ATP Challenger Bergamo, Italy Men Singles | 0 |
| challenger | 3427 | ATP Challenger Biella, Italy Men Doubles | 0 |
| challenger | 3425 | ATP Challenger Biella, Italy Men Singles | 0 |
| challenger | 46479 | ATP Challenger Birmingham, Great Britain Men Doubles | 0 |
| challenger | 46477 | ATP Challenger Birmingham, Great Britain Men Singles | 0 |
| challenger | 9931 | ATP Challenger Blois, France Men Doubles | 0 |
| challenger | 9929 | ATP Challenger Blois, France Men Singles | 0 |
| challenger | 39711 | ATP Challenger Bloomfield Hills, USA Men Doubles | 0 |
| challenger | 39709 | ATP Challenger Bloomfield Hills, USA Men Singles | 0 |
| challenger | 4509 | ATP Challenger Bogota, Colombia Men Doubles | 0 |
| challenger | 4507 | ATP Challenger Bogota, Colombia Men Singles | 0 |
| challenger | 43203 | ATP Challenger Bonn, Germany Men Doubles | 0 |
| challenger | 43201 | ATP Challenger Bonn, Germany Men Singles | 0 |
| challenger | 3439 | ATP Challenger Bordeaux, France Men Doubles | 0 |
| challenger | 3437 | ATP Challenger Bordeaux, France Men Singles | 0 |
| challenger | 24369 | ATP Challenger Braga, Portugal Men Doubles | 0 |
| challenger | 24367 | ATP Challenger Braga, Portugal Men Singles | 0 |
| challenger | 35532 | ATP Challenger Brasilia, Brazil Men Doubles | 0 |
| challenger | 35530 | ATP Challenger Brasilia, Brazil Men Singles | 0 |
| challenger | 3797 | ATP Challenger Brasov, Romania Men Doubles | 0 |
| challenger | 3795 | ATP Challenger Brasov, Romania Men Singles | 0 |
| challenger | 30863 | ATP Challenger Bratislava II, Slovakia Men Doubles | 0 |
| challenger | 30861 | ATP Challenger Bratislava II, Slovakia Men Singles | 0 |
| challenger | 3965 | ATP Challenger Bratislava, Slovakia Men Doubles | 0 |
| challenger | 3963 | ATP Challenger Bratislava, Slovakia Men Singles | 0 |
| challenger | 3573 | ATP Challenger Braunschweig, Germany Men Doubles | 0 |
| challenger | 3571 | ATP Challenger Braunschweig, Germany Men Singles | 0 |
| challenger | 44419 | ATP Challenger Brazzaville, Republic of Congo Men | 0 |
| challenger | 44417 | ATP Challenger Brazzaville, Republic of Congo Men Singles | 0 |
| challenger | 13127 | ATP Challenger Brest, France Men Doubles | 0 |
| challenger | 13125 | ATP Challenger Brest, France Men Singles | 0 |
| challenger | 45065 | ATP Challenger Brisbane 2, Australia Men Doubles | 0 |
| challenger | 45063 | ATP Challenger Brisbane 2, Australia Men Singles | 0 |
| challenger | 48391 | ATP Challenger Brisbane 3, Australia Men Doubles | 0 |
| challenger | 48389 | ATP Challenger Brisbane 3, Australia Men Singles | 0 |
| challenger | 45053 | ATP Challenger Brisbane, Australia Men Doubles | 0 |
| challenger | 45051 | ATP Challenger Brisbane, Australia Men Singles | 0 |
| challenger | 43231 | ATP Challenger Buenos Aires 3, Argentina Men Doubles | 0 |
| challenger | 43229 | ATP Challenger Buenos Aires 3, Argentina Men Singles | 0 |
| challenger | 20104 | ATP Challenger Buenos Aires II, ARG Men Doubles | 0 |
| challenger | 20102 | ATP Challenger Buenos Aires II, ARG Men Singles | 0 |
| challenger | 4085 | ATP Challenger Buenos Aires, Argentina Men Doubles | 0 |
| challenger | 4083 | ATP Challenger Buenos Aires, Argentina Men Singles | 0 |
| challenger | 46499 | ATP Challenger Bunschoten, Netherlands Men Doubles | 0 |
| challenger | 46497 | ATP Challenger Bunschoten, Netherlands Men Singles | 0 |
| challenger | 41913 | ATP Challenger Burnie 2, Australia Men Doubles | 0 |
| challenger | 41911 | ATP Challenger Burnie 2, Australia Men Singles | 0 |
| challenger | 3313 | ATP Challenger Burnie, Australia Men Doubles | 0 |
| challenger | 3311 | ATP Challenger Burnie, Australia Men Singles | 0 |
| challenger | 3449 | ATP Challenger Busan, Korea Republic Men Doubles | 0 |
| challenger | 3447 | ATP Challenger Busan, Korea Republic Men Singles | 0 |
| challenger | 39357 | ATP Challenger Cagliari, Italy Men Doubles | 0 |
| challenger | 39355 | ATP Challenger Cagliari, Italy Men Singles | 0 |
| challenger | 26146 | ATP Challenger Calgary, Canada Men Doubles | 0 |
| challenger | 26144 | ATP Challenger Calgary, Canada Men Singles | 0 |
| challenger | 3863 | ATP Challenger Cali, Colombia Men Doubles | 0 |
| challenger | 3861 | ATP Challenger Cali, Colombia Men Singles | 0 |
| challenger | 5787 | ATP Challenger Campinas, Brazil Men Doubles | 0 |
| challenger | 5785 | ATP Challenger Campinas, Brazil Men Singles | 0 |
| challenger | 13163 | ATP Challenger Canberra, Australia Men Doubles | 0 |
| challenger | 13161 | ATP Challenger Canberra, Australia Men Singles | 0 |
| challenger | 3971 | ATP Challenger Cancun, Mexico Men Doubles | 0 |
| challenger | 3969 | ATP Challenger Cancun, Mexico Men Singles | 0 |
| challenger | 45455 | ATP Challenger Cap Cana, Dominican Republic Men Doubles | 0 |
| challenger | 45453 | ATP Challenger Cap Cana, Dominican Republic Men Singles | 0 |
| challenger | 34896 | ATP Challenger Cary II, USA Men Doubles | 0 |
| challenger | 34894 | ATP Challenger Cary II, USA Men Singles | 0 |
| challenger | 12851 | ATP Challenger Cary, USA Men Doubles | 0 |
| challenger | 12849 | ATP Challenger Cary, USA Men Singles | 0 |
| challenger | 26128 | ATP Challenger Cassis, France Men Doubles | 0 |
| challenger | 26126 | ATP Challenger Cassis, France Men Singles | 0 |
| challenger | 3977 | ATP Challenger Champaign, USA Men Doubles | 0 |
| challenger | 3975 | ATP Challenger Champaign, USA Men Singles | 0 |
| challenger | 37403 | ATP Challenger Charleston, SC, USA Men Doubles | 0 |
| challenger | 37401 | ATP Challenger Charleston, SC, USA Men Singles | 0 |
| challenger | 3215 | ATP Challenger Charlottesville, USA Men Doubles | 0 |
| challenger | 3217 | ATP Challenger Charlottesville, USA Men Singles | 0 |
| challenger | 11185 | ATP Challenger Chennai, India Men Doubles | 0 |
| challenger | 11183 | ATP Challenger Chennai, India Men Singles | 0 |
| challenger | 3329 | ATP Challenger Cherbourg, France Men Doubles | 0 |
| challenger | 3327 | ATP Challenger Cherbourg, France Men Singles | 0 |
| challenger | 26134 | ATP Challenger Chicago, USA Men Doubles | 0 |
| challenger | 26132 | ATP Challenger Chicago, USA Men Singles | 0 |
| challenger | 46073 | ATP Challenger Chisinau, Moldova Men Doubles | 0 |
| challenger | 46071 | ATP Challenger Chisinau, Moldova Men Singles | 0 |
| challenger | 27607 | ATP Challenger Cleveland, USA Men Doubles | 0 |
| challenger | 27605 | ATP Challenger Cleveland, USA Men Singles | 0 |
| challenger | 28891 | ATP Challenger Columbus II, USA Men Doubles | 0 |
| challenger | 28889 | ATP Challenger Columbus II, USA Men Singles | 0 |
| challenger | 12857 | ATP Challenger Columbus, USA Men Doubles | 0 |
| challenger | 12855 | ATP Challenger Columbus, USA Men Singles | 0 |
| challenger | 3779 | ATP Challenger Como, Italy Men Doubles | 0 |
| challenger | 3777 | ATP Challenger Como, Italy Men Singles | 0 |
| challenger | 33662 | ATP Challenger Concepcion, Chile Men Doubles | 0 |
| challenger | 33660 | ATP Challenger Concepcion, Chile Men Singles | 0 |
| challenger | 3583 | ATP Challenger Cordenons, Italy Men Doubles | 0 |
| challenger | 3581 | ATP Challenger Cordenons, Italy Men Singles | 0 |
| challenger | 12053 | ATP Challenger Cordoba, Argentina Men Doubles | 0 |
| challenger | 12051 | ATP Challenger Cordoba, Argentina Men Singles | 0 |
| challenger | 48377 | ATP Challenger Costa do Sauipe, Brazil Men Doubles | 0 |
| challenger | 48375 | ATP Challenger Costa do Sauipe, Brazil Men Singles | 0 |
| challenger | 45467 | ATP Challenger Cuernavaca, Mexico Men Doubles | 0 |
| challenger | 45465 | ATP Challenger Cuernavaca, Mexico Men Singles | 0 |
| challenger | 14063 | ATP Challenger Curitiba, Brazil Men Doubles | 0 |
| challenger | 14061 | ATP Challenger Curitiba, Brazil Men Singles | 0 |
| challenger | 41097 | ATP Challenger Danderyd, Sweden Men Doubles | 0 |
| challenger | 41095 | ATP Challenger Danderyd, Sweden Men Singles | 0 |
| challenger | 48403 | ATP Challenger Decines-Charpieu, France Men Doubles | 0 |
| challenger | 48401 | ATP Challenger Decines-Charpieu, France Men Singles | 0 |
| challenger | 43343 | ATP Challenger Dobrich 2, Bulgaria Men Doubles | 0 |
| challenger | 43341 | ATP Challenger Dobrich 2, Bulgaria Men Singles | 0 |
| challenger | 43337 | ATP Challenger Dobrich, Bulgaria Men Doubles | 0 |
| challenger | 43335 | ATP Challenger Dobrich, Bulgaria Men Singles | 0 |
| challenger | 12293 | ATP Challenger Drummondville, Canada Men Doubles | 0 |
| challenger | 12291 | ATP Challenger Drummondville, Canada Men Singles | 0 |
| challenger | 46051 | ATP Challenger Estoril, Portugal Men Doubles | 0 |
| challenger | 46049 | ATP Challenger Estoril, Portugal Men Singles | 0 |
| challenger | 13115 | ATP Challenger Fairfield, USA Men Doubles | 0 |
| challenger | 13113 | ATP Challenger Fairfield, USA Men Singles | 0 |
| challenger | 6709 | ATP Challenger Florianopolis, Brazil Men Doubles | 0 |
| challenger | 6707 | ATP Challenger Florianopolis, Brazil Men Singles | 0 |
| challenger | 15049 | ATP Challenger Francavilla, Italy Men Doubles | 0 |
| challenger | 15047 | ATP Challenger Francavilla, Italy Men Singles | 0 |
| challenger | 3803 | ATP Challenger Genoa, Italy Men Doubles | 0 |
| challenger | 3801 | ATP Challenger Genoa, Italy Men Singles | 0 |
| challenger | 39005 | ATP Challenger Girona, Spain Men Doubles | 0 |
| challenger | 39003 | ATP Challenger Girona, Spain Men Singles | 0 |
| challenger | 12257 | ATP Challenger Glasgow, Great Britain Men Doubles | 0 |
| challenger | 12255 | ATP Challenger Glasgow, Great Britain Men Singles | 0 |
| challenger | 3589 | ATP Challenger Granby, Canada Men Doubles | 0 |
| challenger | 3587 | ATP Challenger Granby, Canada Men Singles | 0 |
| challenger | 37073 | ATP Challenger Grodzisk Mazowiecki, Poland Men Doubles | 0 |
| challenger | 37071 | ATP Challenger Grodzisk Mazowiecki, Poland Men Singles | 0 |
| challenger | 43219 | ATP Challenger Guangzhou (Huangpu), China Men Doubles | 0 |
| challenger | 43217 | ATP Challenger Guangzhou (Huangpu), China Men Singles | 0 |
| challenger | 47335 | ATP Challenger Guangzhou 2, China Men Doubles | 0 |
| challenger | 47333 | ATP Challenger Guangzhou 2, China Men Singles | 0 |
| challenger | 4633 | ATP Challenger Guangzhou, China Men Doubles | 0 |
| challenger | 4631 | ATP Challenger Guangzhou, China Men Singles | 0 |
| challenger | 3947 | ATP Challenger Guayaquil, Ecuador Men Doubles | 0 |
| challenger | 3945 | ATP Challenger Guayaquil, Ecuador Men Singles | 0 |
| challenger | 13493 | ATP Challenger Gwangju, Korea Republic Men Doubles | 0 |
| challenger | 13491 | ATP Challenger Gwangju, Korea Republic Men Singles | 0 |
| challenger | 46505 | ATP Challenger Hagen, Germany Men Doubles | 0 |
| challenger | 46503 | ATP Challenger Hagen, Germany Men Singles | 0 |
| challenger | 29878 | ATP Challenger Hamburg, Germany Men Doubles | 0 |
| challenger | 29876 | ATP Challenger Hamburg, Germany Men Singles | 0 |
| challenger | 45461 | ATP Challenger Hamilton, Bermuda Men Doubles | 0 |
| challenger | 45459 | ATP Challenger Hamilton, Bermuda Men Singles | 0 |
| challenger | 43479 | ATP Challenger Hangzhou, China Men Doubles | 0 |
| challenger | 43475 | ATP Challenger Hangzhou, China Men Singles | 0 |
| challenger | 3301 | ATP Challenger Heilbronn, Germany Men Doubles | 0 |
| challenger | 3299 | ATP Challenger Heilbronn, Germany Men Singles | 0 |
| challenger | 3989 | ATP Challenger Helsinki, Finland Men Doubles | 0 |
| challenger | 3987 | ATP Challenger Helsinki, Finland Men Singles | 0 |
| challenger | 45809 | ATP Challenger Hersonissos 2, Greece Men Doubles | 0 |
| challenger | 45807 | ATP Challenger Hersonissos 2, Greece Men Singles | 0 |
| challenger | 47608 | ATP Challenger Hersonissos 3, Greece Men Doubles | 0 |
| challenger | 47606 | ATP Challenger Hersonissos 3, Greece Men Singles | 0 |
| challenger | 47626 | ATP Challenger Hersonissos 4, Greece Men Doubles | 0 |
| challenger | 47624 | ATP Challenger Hersonissos 4, Greece Men Singles | 0 |
| challenger | 47724 | ATP Challenger Hersonissos 5, Greece Men Doubles | 0 |
| challenger | 47722 | ATP Challenger Hersonissos 5, Greece Men Singles | 0 |
| challenger | 48361 | ATP Challenger Hersonissos 6, Greece Men Doubles | 0 |
| challenger | 48359 | ATP Challenger Hersonissos 6, Greece Men Singles | 0 |
| challenger | 48433 | ATP Challenger Hersonissos 7, Greece Men Doubles | 0 |
| challenger | 48431 | ATP Challenger Hersonissos 7, Greece Men Singles | 0 |
| challenger | 45803 | ATP Challenger Hersonissos, Greece Men Doubles | 0 |
| challenger | 45801 | ATP Challenger Hersonissos, Greece Men Singles | 0 |
| challenger | 33087 | ATP Challenger Iasi, Romania Men Doubles | 0 |
| challenger | 33089 | ATP Challenger Iasi, Romania Men Singles | 0 |
| challenger | 42617 | ATP Challenger Ibague, Colombia Men Doubles | 0 |
| challenger | 42615 | ATP Challenger Ibague, Colombia Men Singles | 0 |
| challenger | 12431 | ATP Challenger Ilkley, Great Britain Men Doubles | 0 |
| challenger | 12429 | ATP Challenger Ilkley, Great Britain Men Singles | 0 |
| challenger | 41907 | ATP Challenger Indian Wells 2, USA Men Doubles | 0 |
| challenger | 41905 | ATP Challenger Indian Wells 2, USA Men Singles | 0 |
| challenger | 23217 | ATP Challenger Indian Wells, USA Men Doubles | 0 |
| challenger | 23215 | ATP Challenger Indian Wells, USA Men Singles | 0 |
| challenger | 49398 | ATP Challenger Islamabad, Pakistan Men Doubles | 0 |
| challenger | 49396 | ATP Challenger Islamabad, Pakistan Men Singles | 0 |
| challenger | 19138 | ATP Challenger Ismaning, Germany Men Doubles | 0 |
| challenger | 19136 | ATP Challenger Ismaning, Germany Men Singles | 0 |
| challenger | 5805 | ATP Challenger Istanbul, Turkey Men Doubles | 0 |
| challenger | 5803 | ATP Challenger Istanbul, Turkey Men Singles | 0 |
| challenger | 15630 | ATP Challenger Jinan, China Men Doubles | 0 |
| challenger | 15628 | ATP Challenger Jinan, China Men Singles | 0 |
| challenger | 47345 | ATP Challenger Jingshan, China, Men Doubles | 0 |
| challenger | 47347 | ATP Challenger Jingshan, China, Men Singles | 0 |
| challenger | 42217 | ATP Challenger Kachreti, Georgia Men Doubles | 0 |
| challenger | 42215 | ATP Challenger Kachreti, Georgia Men Singles | 0 |
| challenger | 39715 | ATP Challenger Karlsruhe, Germany Men Doubles | 0 |
| challenger | 39717 | ATP Challenger Karlsruhe, Germany Men Singles | 0 |
| challenger | 42071 | ATP Challenger Kigali 1, Rwanda Men Doubles | 0 |
| challenger | 42073 | ATP Challenger Kigali 1, Rwanda Men Singles | 0 |
| challenger | 42085 | ATP Challenger Kigali 2, Rwanda Men Doubles | 0 |
| challenger | 42083 | ATP Challenger Kigali 2, Rwanda Men Singles | 0 |
| challenger | 3953 | ATP Challenger Knoxville, USA Men Doubles | 0 |
| challenger | 3951 | ATP Challenger Knoxville, USA Men Singles | 0 |
| challenger | 13169 | ATP Challenger Kobe, Japan Men Doubles | 0 |
| challenger | 13167 | ATP Challenger Kobe, Japan Men Singles | 0 |
| challenger | 14676 | ATP Challenger Koblenz, Germany Men Doubles | 0 |
| challenger | 14674 | ATP Challenger Koblenz, Germany Men Singles | 0 |
| challenger | 13139 | ATP Challenger Las Vegas , USA Men Doubles | 0 |
| challenger | 13137 | ATP Challenger Las Vegas, USA Men Singles | 0 |
| challenger | 3601 | ATP Challenger Lexington, USA Men Doubles | 0 |
| challenger | 3599 | ATP Challenger Lexington, USA Men Singles | 0 |
| challenger | 10255 | ATP Challenger Liberec, Czech Republic Men Doubles | 0 |
| challenger | 10253 | ATP Challenger Liberec, Czech Republic Men Singles | 0 |
| challenger | 23235 | ATP Challenger Lille, France Men Doubles | 0 |
| challenger | 23233 | ATP Challenger Lille, France Men Singles | 0 |
| challenger | 35420 | ATP Challenger Lima 2, Peru Men Doubles | 0 |
| challenger | 35422 | ATP Challenger Lima 2, Peru Men Singles | 0 |
| challenger | 49242 | ATP Challenger Lima 3, Peru Men Doubles | 0 |
| challenger | 49244 | ATP Challenger Lima 3, Peru Men Singles | 0 |
| challenger | 7795 | ATP Challenger Lima, Peru Men Doubles | 0 |
| challenger | 7793 | ATP Challenger Lima, Peru Men Singles | 0 |
| challenger | 43283 | ATP Challenger Lincoln (NE), USA Men Doubles | 0 |
| challenger | 43281 | ATP Challenger Lincoln (NE), USA Men Singles | 0 |
| challenger | 15055 | ATP Challenger Lisbon, Portugal Men Doubles | 0 |
| challenger | 15053 | ATP Challenger Lisbon, Portugal Men Singles | 0 |
| challenger | 28885 | ATP Challenger Little Rock, USA Men Doubles | 0 |
| challenger | 28883 | ATP Challenger Little Rock, USA Men Singles | 0 |
| challenger | 34632 | ATP Challenger Luedenscheid, Germany Men Doubles | 0 |
| challenger | 34630 | ATP Challenger Luedenscheid, Germany Men Singles | 0 |
| challenger | 33772 | ATP Challenger Lugano, Switzerland Men Doubles | 0 |
| challenger | 3605 | ATP Challenger Lugano, Switzerland Men Singles | 0 |
| challenger | 44401 | ATP Challenger Lyon 2, France Men Doubles | 0 |
| challenger | 44399 | ATP Challenger Lyon 2, France Men Singles | 0 |
| challenger | 13647 | ATP Challenger Lyon, France Men Doubles | 0 |
| challenger | 13645 | ATP Challenger Lyon, France Men Singles | 0 |
| challenger | 5775 | ATP Challenger Madrid, Spain Men Doubles | 0 |
| challenger | 5773 | ATP Challenger Madrid, Spain Men Singles | 0 |
| challenger | 30871 | ATP Challenger Maia, Portugal Men Doubles | 0 |
| challenger | 30869 | ATP Challenger Maia, Portugal Men Singles | 0 |
| challenger | 36531 | ATP Challenger Malaga, Spain Men Doubles | 0 |
| challenger | 36529 | ATP Challenger Malaga, Spain Men Singles | 0 |
| challenger | 24848 | ATP Challenger Manacor, Mallorca, Spain Men Doubles | 0 |
| challenger | 24846 | ATP Challenger Manacor, Mallorca, Spain Men Singles | 0 |
| challenger | 48439 | ATP Challenger Manama 2, Bahrain Men Doubles | 0 |
| challenger | 48437 | ATP Challenger Manama 2, Bahrain Men Singles | 0 |
| challenger | 35538 | ATP Challenger Manama, Bahrain Men Doubles | 0 |
| challenger | 35536 | ATP Challenger Manama, Bahrain Men Singles | 0 |
| challenger | 32085 | ATP Challenger Manzanillo, Mexico Men Doubles | 0 |
| challenger | 32083 | ATP Challenger Manzanillo, Mexico Men Singles | 0 |
| challenger | 37921 | ATP Challenger Maspalomas, Spain Men Doubles | 0 |
| challenger | 37923 | ATP Challenger Maspalomas, Spain Men Singles | 0 |
| challenger | 31825 | ATP Challenger Matsuyama, Japan Men Doubles | 0 |
| challenger | 31823 | ATP Challenger Matsuyama, Japan Men Singles | 0 |
| challenger | 42211 | ATP Challenger Mauthausen, Austria Men Doubles | 0 |
| challenger | 42209 | ATP Challenger Mauthausen, Austria Men Singles | 0 |
| challenger | 45819 | ATP Challenger Menorca, Spain Men Doubles | 0 |
| challenger | 45817 | ATP Challenger Menorca, Spain Men Singles | 0 |
| challenger | 42223 | ATP Challenger Merida, Mexico Men Doubles | 0 |
| challenger | 42221 | ATP Challenger Merida, Mexico Men Singles | 0 |
| challenger | 9643 | ATP Challenger Mexico City, Mexico Men Doubles | 0 |
| challenger | 9641 | ATP Challenger Mexico City, Mexico Men Singles | 0 |
| challenger | 3617 | ATP Challenger Milan, Italy Men Doubles | 0 |
| challenger | 3615 | ATP Challenger Milan, Italy Men Singles | 0 |
| challenger | 39397 | ATP Challenger Modena, Italy Men Doubles | 0 |
| challenger | 39395 | ATP Challenger Modena, Italy Men Singles | 0 |
| challenger | 48383 | ATP Challenger Monastir, Tunisia Men Doubles | 0 |
| challenger | 48381 | ATP Challenger Monastir, Tunisia Men Singles | 0 |
| challenger | 44039 | ATP Challenger Montemar, Spain Men Doubles | 0 |
| challenger | 44037 | ATP Challenger Montemar, Spain Men Singles | 0 |
| challenger | 3869 | ATP Challenger Montevideo, Uruguay Men Doubles | 0 |
| challenger | 3867 | ATP Challenger Montevideo, Uruguay Men Singles | 0 |
| challenger | 3495 | ATP Challenger Monza, Italy Men Doubles | 0 |
| challenger | 3493 | ATP Challenger Monza, Italy Men Singles | 0 |
| challenger | 46009 | ATP Challenger Morelia, Mexico Men Doubles | 0 |
| challenger | 46007 | ATP Challenger Morelia, Mexico Men Singles | 0 |
| challenger | 11227 | ATP Challenger Morelos, Mexico Men Doubles | 0 |
| challenger | 11225 | ATP Challenger Morelos, Mexico Men Singles | 0 |
| challenger | 10825 | ATP Challenger Mouilleron-Le-Captif, France Men Doubles | 0 |
| challenger | 10823 | ATP Challenger Mouilleron-Le-Captif, France Men Singles | 0 |
| challenger | 28386 | ATP Challenger Murcia, Spain Men Doubles | 0 |
| challenger | 28384 | ATP Challenger Murcia, Spain Men Singles | 0 |
| challenger | 42079 | ATP Challenger Naples, Italy Men Doubles | 0 |
| challenger | 42077 | ATP Challenger Naples, Italy Men Singles | 0 |
| challenger | 11233 | ATP Challenger New Delhi, India Men Doubles | 0 |
| challenger | 11231 | ATP Challenger New Delhi, India Men Singles | 0 |
| challenger | 46491 | ATP Challenger Newport, USA Men Doubles | 0 |
| challenger | 46489 | ATP Challenger Newport, USA Men Singles | 0 |
| challenger | 37091 | ATP Challenger Nonthaburi 2, Thailand Men Doubles | 0 |
| challenger | 37089 | ATP Challenger Nonthaburi 2, Thailand Men Singles | 0 |
| challenger | 37397 | ATP Challenger Nonthaburi 3, Thailand Men Doubles | 0 |
| challenger | 37395 | ATP Challenger Nonthaburi 3, Thailand Men Singles | 0 |
| challenger | 43213 | ATP Challenger Nonthaburi 4, Thailand Men Doubles | 0 |
| challenger | 43211 | ATP Challenger Nonthaburi 4, Thailand Men Singles | 0 |
| challenger | 37079 | ATP Challenger Nonthaburi, Thailand Men Doubles | 0 |
| challenger | 37077 | ATP Challenger Nonthaburi, Thailand Men Singles | 0 |
| challenger | 34316 | ATP Challenger Nottingham 2, Great Britain Men Doubles | 0 |
| challenger | 34314 | ATP Challenger Nottingham 2, Great Britain Men Singles | 0 |
| challenger | 46691 | ATP Challenger Nottingham 3, Great Britain Men Doubles | 0 |
| challenger | 46689 | ATP Challenger Nottingham 3, Great Britain Men Singles | 0 |
| challenger | 5169 | ATP Challenger Nottingham, Great Britain Men Doubles | 0 |
| challenger | 5167 | ATP Challenger Nottingham, Great Britain Men Singles | 0 |
| challenger | 3223 | ATP Challenger Noumea, New Caledonia Men Doubles | 0 |
| challenger | 3221 | ATP Challenger Noumea, New Caledonia Men Singles | 0 |
| challenger | 33882 | ATP Challenger Oeiras 1, Portugal Men Doubles | 0 |
| challenger | 33880 | ATP Challenger Oeiras 1, Portugal Men Singles | 0 |
| challenger | 33888 | ATP Challenger Oeiras 2, Portugal Men Doubles | 0 |
| challenger | 33886 | ATP Challenger Oeiras 2, Portugal Men Singles | 0 |
| challenger | 34158 | ATP Challenger Oeiras 3, Portugal Men Doubles | 0 |
| challenger | 34156 | ATP Challenger Oeiras 3, Portugal Men Singles | 0 |
| challenger | 34286 | ATP Challenger Oeiras 4, Portugal Men Doubles | 0 |
| challenger | 34284 | ATP Challenger Oeiras 4, Portugal Men Singles | 0 |
| challenger | 46059 | ATP Challenger Oeiras 5, Portugal Men Doubles | 0 |
| challenger | 46057 | ATP Challenger Oeiras 5, Portugal Men Singles | 0 |
| challenger | 40711 | ATP Challenger Olbia, Italy Men Doubles | 0 |
| challenger | 40709 | ATP Challenger Olbia, Italy Men Singles | 0 |
| challenger | 3917 | ATP Challenger Orleans, France Men Doubles | 0 |
| challenger | 3915 | ATP Challenger Orleans, France Men Singles | 0 |
| challenger | 3959 | ATP Challenger Ortisei, Italy Men Doubles | 0 |
| challenger | 3957 | ATP Challenger Ortisei, Italy Men Singles | 0 |
| challenger | 3501 | ATP Challenger Ostrava, Czech Republic Men Doubles | 0 |
| challenger | 3499 | ATP Challenger Ostrava, Czech Republic Men Singles | 0 |
| challenger | 38679 | ATP Challenger Ottignies-Louvain-la-Neuve, Belgium Men Doubles | 0 |
| challenger | 38677 | ATP Challenger Ottignies-Louvain-la-Neuve, Belgium Men Singles | 0 |
| challenger | 27857 | ATP Challenger Pau, France Men Doubles | 0 |
| challenger | 27855 | ATP Challenger Pau, France Men Singles | 0 |
| challenger | 12455 | ATP Challenger Perugia, Italy Men Doubles | 0 |
| challenger | 12453 | ATP Challenger Perugia, Italy Men Singles | 0 |
| challenger | 49410 | ATP Challenger Phan Thiet 2, Vietnam Men Doubles | 0 |
| challenger | 49408 | ATP Challenger Phan Thiet 2, Vietnam Men Singles | 0 |
| challenger | 49404 | ATP Challenger Phan Thiet, Vietnam Men Doubles | 0 |
| challenger | 49402 | ATP Challenger Phan Thiet, Vietnam Men Singles | 0 |
| challenger | 28205 | ATP Challenger Phoenix, USA Men Doubles | 0 |
| challenger | 28203 | ATP Challenger Phoenix, USA Men Singles | 0 |
| challenger | 38673 | ATP Challenger Piracicaba, Brazil Men Doubles | 0 |
| challenger | 38671 | ATP Challenger Piracicaba, Brazil Men Singles | 0 |
| challenger | 23223 | ATP Challenger Playford City, Australia Men Doubles | 0 |
| challenger | 23221 | ATP Challenger Playford City, Australia Men Singles | 0 |
| challenger | 42839 | ATP Challenger Porto 2, Portugal Men Doubles | 0 |
| challenger | 42841 | ATP Challenger Porto 2, Portugal Men Singles | 0 |
| challenger | 9013 | ATP Challenger Porto Alegre, Brazil Men Doubles | 0 |
| challenger | 9011 | ATP Challenger Porto Alegre, Brazil Men Singles | 0 |
| challenger | 10657 | ATP Challenger Porto, Portugal Men Doubles | 0 |
| challenger | 10655 | ATP Challenger Porto, Portugal Men Singles | 0 |
| challenger | 3645 | ATP Challenger Poznan, Poland Men Doubles | 0 |
| challenger | 3643 | ATP Challenger Poznan, Poland Men Singles | 0 |
| challenger | 3651 | ATP Challenger Pozoblanco, Spain Men Doubles | 0 |
| challenger | 3649 | ATP Challenger Pozoblanco, Spain Men Singles | 0 |
| challenger | 15087 | ATP Challenger Prague 2, Czech Republic Men Doubles | 0 |
| challenger | 15089 | ATP Challenger Prague 2, Czech Republic Men Singles | 0 |
| challenger | 4933 | ATP Challenger Prague, Czech Republic Men Doubles | 0 |
| challenger | 4931 | ATP Challenger Prague, Czech Republic Men Singles | 0 |
| challenger | 3513 | ATP Challenger Prostejov, Czech Republic Men Doubles | 0 |
| challenger | 3511 | ATP Challenger Prostejov, Czech Republic Men Singles | 0 |
| challenger | 24247 | ATP Challenger Puerto Vallarta, Mexico Men Doubles | 0 |
| challenger | 24245 | ATP Challenger Puerto Vallarta, Mexico Men Singles | 0 |
| challenger | 12059 | ATP Challenger Pune, India Men Doubles | 0 |
| challenger | 12057 | ATP Challenger Pune, India Men Singles | 0 |
| challenger | 23241 | ATP Challenger Punta del Este, Uruguay Men Doubles | 0 |
| challenger | 23239 | ATP Challenger Punta del Este, Uruguay Men Singles | 0 |
| challenger | 4211 | ATP Challenger Quimper, France Men Doubles | 0 |
| challenger | 4209 | ATP Challenger Quimper, France Men Singles | 0 |
| challenger | 3901 | ATP Challenger Rennes, France Men Doubles | 0 |
| challenger | 3899 | ATP Challenger Rennes, France Men Singles | 0 |
| challenger | 35434 | ATP Challenger Roanne, France Men Doubles | 0 |
| challenger | 35436 | ATP Challenger Roanne, France, Men Singles | 0 |
| challenger | 4771 | ATP Challenger Rome, Italy Men Doubles | 0 |
| challenger | 4769 | ATP Challenger Rome, Italy Men Singles | 0 |
| challenger | 45059 | ATP Challenger Rosario, Argentina Men Doubles | 0 |
| challenger | 45057 | ATP Challenger Rosario, Argentina Men Singles | 0 |
| challenger | 38965 | ATP Challenger Rovereto, Italy Men Doubles | 0 |
| challenger | 38963 | ATP Challenger Rovereto, Italy Men Singles | 0 |
| challenger | 46485 | ATP Challenger Royan, France Men Doubles | 0 |
| challenger | 46483 | ATP Challenger Royan, France Men Singles | 0 |
| challenger | 34772 | ATP Challenger Saint Tropez, France Men Doubles | 0 |
| challenger | 34770 | ATP Challenger Saint Tropez, France Men Singles | 0 |
| challenger | 36761 | ATP Challenger Salzburg, Austria Men Doubles | 0 |
| challenger | 36763 | ATP Challenger Salzburg, Austria Men Singles | 0 |
| challenger | 45443 | ATP Challenger San Diego, USA, Men Doubles | 0 |
| challenger | 45441 | ATP Challenger San Diego, USA, Men Singles | 0 |
| challenger | 3381 | ATP Challenger San Luis Potosi, Mexico Men Doubles | 0 |
| challenger | 3379 | ATP Challenger San Luis Potosi, Mexico Men Singles | 0 |
| challenger | 3711 | ATP Challenger San Marino, San Marino Men Doubles | 0 |
| challenger | 3709 | ATP Challenger San Marino, San Marino Men Singles | 0 |
| challenger | 42481 | ATP Challenger San Miguel de Tucuman, Argentina Men Doubles | 0 |
| challenger | 42479 | ATP Challenger San Miguel de Tucuman, Argentina Men Singles | 0 |
| challenger | 36095 | ATP Challenger Santa Cruz 2, Bolivia Men Doubles | 0 |
| challenger | 36093 | ATP Challenger Santa Cruz 2, Bolivia Men Singles | 0 |
| challenger | 33938 | ATP Challenger Santa Cruz, Bolivia Men Doubles | 0 |
| challenger | 33936 | ATP Challenger Santa Cruz, Bolivia Men Singles | 0 |
| challenger | 40717 | ATP Challenger Santa Fe 2, Argentina Men Doubles | 0 |
| challenger | 40715 | ATP Challenger Santa Fe 2, Argentina Men Singles | 0 |
| challenger | 40129 | ATP Challenger Santa Fe, Argentina Men Doubles | 0 |
| challenger | 40127 | ATP Challenger Santa Fe, Argentina Men Singles | 0 |
| challenger | 26164 | ATP Challenger Santiago de Queretaro, Mexico Men Doubles | 0 |
| challenger | 26162 | ATP Challenger Santiago de Queretaro, Mexico Men Singles | 0 |
| challenger | 4151 | ATP Challenger Santiago, Chile Men Doubles | 0 |
| challenger | 4149 | ATP Challenger Santiago, Chile Men Singles | 0 |
| challenger | 12281 | ATP Challenger Santo Domingo, Dominican Republic Men Doubles | 0 |
| challenger | 12279 | ATP Challenger Santo Domingo, Dominican Republic Men Singles | 0 |
| challenger | 4687 | ATP Challenger Santos, Brazil Men Doubles | 0 |
| challenger | 4685 | ATP Challenger Santos, Brazil Men Singles | 0 |
| challenger | 6153 | ATP Challenger Sao Leopoldo, Brazil Men Doubles | 0 |
| challenger | 6151 | ATP Challenger Sao Leopoldo, Brazil Men Singles | 0 |
| challenger | 3229 | ATP Challenger Sao Paulo, Brazil Men Doubles | 0 |
| challenger | 3227 | ATP Challenger Sao Paulo, Brazil Men Singles | 0 |
| challenger | 3531 | ATP Challenger Sarasota, USA Men Doubles | 0 |
| challenger | 3529 | ATP Challenger Sarasota, USA Men Singles | 0 |
| challenger | 42535 | ATP Challenger Sassuolo, Italy Men Doubles | 0 |
| challenger | 42533 | ATP Challenger Sassuolo, Italy Men Singles | 0 |
| challenger | 3537 | ATP Challenger Savannah, USA Men Doubles | 0 |
| challenger | 3535 | ATP Challenger Savannah, USA Men Singles | 0 |
| challenger | 3717 | ATP Challenger Segovia, Spain Men Doubles | 0 |
| challenger | 3715 | ATP Challenger Segovia, Spain Men Singles | 0 |
| challenger | 6109 | ATP Challenger Seoul, Korea Republic Men Doubles | 0 |
| challenger | 6111 | ATP Challenger Seoul, Korea Republic Men Singles | 0 |
| challenger | 3815 | ATP Challenger Seville, Spain Men Doubles | 0 |
| challenger | 3813 | ATP Challenger Seville, Spain Men Singles | 0 |
| challenger | 6069 | ATP Challenger Shanghai, China Men Doubles | 0 |
| challenger | 6067 | ATP Challenger Shanghai, China Men Singles | 0 |
| challenger | 19162 | ATP Challenger Shenzhen II, China Men Doubles | 0 |
| challenger | 19160 | ATP Challenger Shenzhen II, China Men Singles | 0 |
| challenger | 11429 | ATP Challenger Shenzhen, China Men Doubles | 0 |
| challenger | 11427 | ATP Challenger Shenzhen, China Men Singles | 0 |
| challenger | 8293 | ATP Challenger Sibiu, Romania Men Doubles | 0 |
| challenger | 8291 | ATP Challenger Sibiu, Romania Men Singles | 0 |
| challenger | 43505 | ATP Challenger Sioux Falls, USA Men Doubles | 0 |
| challenger | 43503 | ATP Challenger Sioux Falls, USA Men Singles | 0 |
| challenger | 42243 | ATP Challenger Skopje, North Macedonia Men Doubles | 0 |
| challenger | 42241 | ATP Challenger Skopje, North Macedonia Men Singles | 0 |
| challenger | 47285 | ATP Challenger Sofia 2, Bulgaria Men Doubles | 0 |
| challenger | 47283 | ATP Challenger Sofia 2, Bulgaria Men Singles | 0 |
| challenger | 47267 | ATP Challenger Sofia, Bulgaria Men Doubles | 0 |
| challenger | 47265 | ATP Challenger Sofia, Bulgaria Men Singles | 0 |
| challenger | 48409 | ATP Challenger Soma Bay, Egypt Men Doubles | 0 |
| challenger | 48407 | ATP Challenger Soma Bay, Egypt Men Singles | 0 |
| challenger | 31831 | ATP Challenger Split, Croatia Men Doubles | 0 |
| challenger | 31829 | ATP Challenger Split, Croatia Men Singles | 0 |
| challenger | 3393 | ATP Challenger St. Brieuc, France Men Doubles | 0 |
| challenger | 3391 | ATP Challenger St. Brieuc, France Men Singles | 0 |
| challenger | 47620 | ATP Challenger Sumter, USA Men Doubles | 0 |
| challenger | 47618 | ATP Challenger Sumter, USA Men Singles | 0 |
| challenger | 12443 | ATP Challenger Surbiton, Great Britain Men Doubles | 0 |
| challenger | 12441 | ATP Challenger Surbiton, Great Britain Men Singles | 0 |
| challenger | 13151 | ATP Challenger Suzhou, China Men Doubles | 0 |
| challenger | 13149 | ATP Challenger Suzhou, China Men Singles | 0 |
| challenger | 9463 | ATP Challenger Sydney, Australia Men Doubles | 0 |
| challenger | 9461 | ATP Challenger Sydney, Australia Men Singles | 0 |
| challenger | 3831 | ATP Challenger Szczecin, Poland Men Singles | 0 |
| challenger | 37927 | ATP Challenger Szekesfehervar, Hungary Men Doubles | 0 |
| challenger | 37929 | ATP Challenger Szekesfehervar, Hungary Men Singles | 0 |
| challenger | 43499 | ATP Challenger Taipei 2, Chinese Taipei Men Doubles | 0 |
| challenger | 43497 | ATP Challenger Taipei 2, Chinese Taipei Men Singles | 0 |
| challenger | 11465 | ATP Challenger Taipei, Chinese Taipei Men Doubles | 0 |
| challenger | 11463 | ATP Challenger Taipei, Chinese Taipei Men Singles | 0 |
| challenger | 3543 | ATP Challenger Tallahassee, USA Men Doubles | 0 |
| challenger | 3541 | ATP Challenger Tallahassee, USA Men Singles | 0 |
| challenger | 3683 | ATP Challenger Tampere, Finland Men Doubles | 0 |
| challenger | 3681 | ATP Challenger Tampere, Finland Men Singles | 0 |
| challenger | 47718 | ATP Challenger Targu Mures 2, Romania Men Doubles | 0 |
| challenger | 47716 | ATP Challenger Targu Mures 2, Romania Men Singles | 0 |
| challenger | 47614 | ATP Challenger Targu Mures, Romania Men Doubles | 0 |
| challenger | 47612 | ATP Challenger Targu Mures, Romania Men Singles | 0 |
| challenger | 46067 | ATP Challenger Tbilisi, Georgia Men Doubles | 0 |
| challenger | 46065 | ATP Challenger Tbilisi, Georgia Men Singles | 0 |
| challenger | 38089 | ATP Challenger Temuco, Chile, Men Doubles | 0 |
| challenger | 38091 | ATP Challenger Temuco, Chile, Men Singles | 0 |
| challenger | 38731 | ATP Challenger Tenerife 2, Spain Men Doubles | 0 |
| challenger | 38733 | ATP Challenger Tenerife 2, Spain Men Singles | 0 |
| challenger | 38959 | ATP Challenger Tenerife 3, Spain Men Doubles | 0 |
| challenger | 38957 | ATP Challenger Tenerife 3, Spain Men Singles | 0 |
| challenger | 35426 | ATP Challenger Tenerife, Spain Men Doubles | 0 |
| challenger | 35428 | ATP Challenger Tenerife, Spain Men Singles | 0 |
| challenger | 45449 | ATP Challenger Thionville, France Men Doubles | 0 |
| challenger | 45447 | ATP Challenger Thionville, France Men Singles | 0 |
| challenger | 3907 | ATP Challenger Tiburon, USA Men Doubles | 0 |
| challenger | 3905 | ATP Challenger Tiburon, USA Men Singles | 0 |
| challenger | 3839 | ATP Challenger Todi, Italy Men Doubles | 0 |
| challenger | 3837 | ATP Challenger Todi, Italy Men Singles | 0 |
| challenger | 33051 | ATP Challenger Trieste, Italy Men Singles | 0 |
| challenger | 36537 | ATP Challenger Troyes, France Men Doubles | 0 |
| challenger | 36535 | ATP Challenger Troyes, France Men Singles | 0 |
| challenger | 34876 | ATP Challenger Tulln, Austria Men Doubles | 0 |
| challenger | 34874 | ATP Challenger Tulln, Austria Men Singles | 0 |
| challenger | 3549 | ATP Challenger Tunis, Tunisia Men Doubles | 0 |
| challenger | 3547 | ATP Challenger Tunis, Tunisia Men Singles | 0 |
| challenger | 3689 | ATP Challenger Turin, Italy Men Doubles | 0 |
| challenger | 3687 | ATP Challenger Turin, Italy Men Singles | 0 |
| challenger | 39379 | ATP Challenger Tyler, USA Men Doubles | 0 |
| challenger | 39377 | ATP Challenger Tyler, USA Men Singles | 0 |
| challenger | 37913 | ATP Challenger Valencia, Spain Men Doubles | 0 |
| challenger | 37915 | ATP Challenger Valencia, Spain Men Singles | 0 |
| challenger | 34638 | ATP Challenger Verona, Italy Men Doubles | 0 |
| challenger | 34636 | ATP Challenger Verona, Italy Men Singles | 0 |
| challenger | 11603 | ATP Challenger Vicenza, Italy Men Doubles | 0 |
| challenger | 11601 | ATP Challenger Vicenza, Italy Men Singles | 0 |
| challenger | 37617 | ATP Challenger Villa Maria, Argentina Men Doubles | 0 |
| challenger | 37615 | ATP Challenger Villa Maria, Argentina Men Singles | 0 |
| challenger | 13653 | ATP Challenger Winnipeg, Canada Men Doubles | 0 |
| challenger | 13651 | ATP Challenger Winnipeg, Canada Men Singles | 0 |
| challenger | 47341 | ATP Challenger Winston Salem, USA Men Doubles | 0 |
| challenger | 47339 | ATP Challenger Winston Salem, USA Men Singles | 0 |
| challenger | 42237 | ATP Challenger Wuxi, China Men Doubles | 0 |
| challenger | 42235 | ATP Challenger Wuxi, China Men Singles | 0 |
| challenger | 29490 | ATP Challenger Yokkaichi, Japan Men Doubles | 0 |
| challenger | 29476 | ATP Challenger Yokkaichi, Japan Men Singles | 0 |
| challenger | 9181 | ATP Challenger Yokohama, Japan Men Doubles | 0 |
| challenger | 9179 | ATP Challenger Yokohama, Japan Men Singles | 0 |
| challenger | 33876 | ATP Challenger Zadar, Croatia Men Doubles | 0 |
| challenger | 33874 | ATP Challenger Zadar, Croatia Men Singles | 0 |
| challenger | 4975 | ATP Challenger Zagreb, Croatia Men Doubles | 0 |
| challenger | 4973 | ATP Challenger Zagreb, Croatia Men Singles | 0 |
| challenger | 18362 | ATP Challenger Zhangjiagang, China Men Doubles | 0 |
| challenger | 18360 | ATP Challenger Zhangjiagang, China Men Singles | 0 |
| challenger | 36791 | ATP Challenger Zug, Switzerland Men Doubles | 0 |
| challenger | 36793 | ATP Challenger Zug, Switzerland Men Singles | 0 |
| davis-cup | 2100 | Davis Cup | 0 |
| electronic-leagues | 32395 | Madrid Virtual Pro, Charity | 0 |
| electronic-leagues | 32393 | Madrid Virtual Pro, Women | 0 |
| exhibition | 49852 | A Racquet at The Rock | 2 |
| exhibition | 49660 | Battle of the Sexes | 0 |
| exhibition | 49846 | Charlotte Invitational | 0 |
| exhibition | 23403 | Czech Tennis Extraliga Men Doubles | 0 |
| exhibition | 14714 | Czech Tennis Extraliga Men Singles | 0 |
| exhibition | 23407 | Czech Tennis Extraliga Mixed Groups | 0 |
| exhibition | 23405 | Czech Tennis Extraliga Women Doubles | 0 |
| exhibition | 23401 | Czech Tennis Extraliga Women Singles | 0 |
| exhibition | 14840 | Exhibition Kooyong Classic Men Singles | 0 |
| exhibition | 23399 | Exhibition Kooyong Classic Women Singles | 0 |
| exhibition | 19450 | Exhibition Laver Cup Men Doubles | 0 |
| exhibition | 19448 | Exhibition Laver Cup Men Singles | 0 |
| exhibition | 33462 | German Championships | 0 |
| exhibition | 33464 | German Championships, Women | 0 |
| exhibition | 41816 | MGM Macau Tennis Masters Men Singles | 0 |
| exhibition | 41820 | MGM Macau Tennis Masters Mixed Doubles | 0 |
| exhibition | 41818 | MGM Macau Tennis Masters Women Singles | 0 |
| exhibition | 49854 | Miami Invitational | 3 |
| exhibition | 32473 | NIU | 0 |
| exhibition | 44567 | Riyadh Exhibition | 0 |
| exhibition | 49850 | The Atlanta Cup | 0 |
| exhibition | 49904 | The Garden Cup | 2 |
| exhibition | 49848 | UTS London Grand Final | 0 |
| exhibition | 38757 | World Tennis League | 0 |
| exhibition | 45687 | World Tennis League Men Doubles | 0 |
| exhibition | 45689 | World Tennis League Women Doubles | 0 |
| exhibition | 38763 | World Tennis League, Mixed Doubles | 0 |
| exhibition | 38761 | World Tennis League, Women Singles | 0 |
| federation-cup | 2102 | Billie Jean King Cup | 0 |
| hopman-cup | 620 | Hopman Cup | 0 |
| itf-men | 38073 | 2022 ITF Australia F12, Men Doubles | 0 |
| itf-men | 903992 | Addis Ababa | 0 |
| itf-men | 903708 | Afula | 0 |
| itf-men | 903854 | Agadir | 0 |
| itf-men | 904112 | Ahmedabad | 0 |
| itf-men | 903580 | Ajaccio | 0 |
| itf-men | 903783 | Akko | 0 |
| itf-men | 903954 | Aktobe | 0 |
| itf-men | 903907 | Al Zahra | 0 |
| itf-men | 904285 | Alaminos | 0 |
| itf-men | 903984 | Alaminos-Larnaca | 0 |
| itf-men | 903897 | Albuquerque | 0 |
| itf-men | 904140 | Alcala de Henares | 0 |
| itf-men | 903871 | Aldershot | 0 |
| itf-men | 903436 | Alkmaar Final | 0 |
| itf-men | 903434 | Alkmaar QF | 0 |
| itf-men | 903432 | Alkmaar R1 | 0 |
| itf-men | 903433 | Alkmaar R16 | 0 |
| itf-men | 903435 | Alkmaar SF | 0 |
| itf-men | 903649 | Allershausen | 0 |
| itf-men | 903581 | Almada | 0 |
| itf-men | 904221 | Amstelveen | 0 |
| itf-men | 903763 | Anapoima | 0 |
| itf-men | 904298 | Andong | 0 |
| itf-men | 903531 | Angers | 0 |
| itf-men | 904408 | Ann Arbor | 0 |
| itf-men | 904075 | Anning | 0 |
| itf-men | 903875 | Anseong | 0 |
| itf-men | 903490 | Antalya | 2 |
| itf-men | 903709 | Aparecida de Goiania | 0 |
| itf-men | 903833 | Aprilia | 0 |
| itf-men | 904106 | Arad | 0 |
| itf-men | 904078 | Arequipa | 0 |
| itf-men | 903810 | Arlon | 0 |
| itf-men | 904056 | Astana | 0 |
| itf-men | 904287 | Asuncion | 0 |
| itf-men | 903710 | Austin | 0 |
| itf-men | 904509 | Azul | 0 |
| itf-men | 903631 | Bacau | 0 |
| itf-men | 903646 | Bad Waltersdorf | 0 |
| itf-men | 904165 | Badalona | 0 |
| itf-men | 903653 | Bagneres De Bigorre | 0 |
| itf-men | 903736 | Bagnoles de l'Or | 0 |
| itf-men | 903759 | Bakersfield | 0 |
| itf-men | 903571 | Bakio | 0 |
| itf-men | 904232 | Bali | 0 |
| itf-men | 904076 | Baotou | 0 |
| itf-men | 904412 | Barueri | 0 |
| itf-men | 904304 | Bastad | 0 |
| itf-men | 904214 | Bastia-Lucciana | 0 |
| itf-men | 903735 | Bath | 0 |
| itf-men | 904072 | Belem | 0 |
| itf-men | 903575 | Belgrade | 0 |
| itf-men | 903752 | Bendigo | 0 |
| itf-men | 903765 | Bengaluru | 0 |
| itf-men | 903487 | Benicarlo | 0 |
| itf-men | 903564 | Bergamo | 0 |
| itf-men | 903819 | Bern | 0 |
| itf-men | 903924 | Bhilal | 0 |
| itf-men | 903757 | Bhopal | 0 |
| itf-men | 904255 | Bhubaneswar | 0 |
| itf-men | 903523 | Biel | 0 |
| itf-men | 904045 | Biella | 0 |
| itf-men | 904068 | Bielsko Biala | 0 |
| itf-men | 904294 | Bistrita | 0 |
| itf-men | 903923 | Boca Raton | 0 |
| itf-men | 903990 | Bodrum | 0 |
| itf-men | 904183 | Bol | 0 |
| itf-men | 904340 | Bologna | 0 |
| itf-men | 903617 | Bolzano | 0 |
| itf-men | 34668 | Bosnia & Herzegovina F5, Men Doubles | 0 |
| itf-men | 34666 | Bosnia & Herzegovina F5, Men Singles | 0 |
| itf-men | 903574 | Bourg-En-Bresse | 0 |
| itf-men | 904176 | Bragado | 0 |
| itf-men | 903703 | Brasilia | 0 |
| itf-men | 904046 | Brasov | 0 |
| itf-men | 903486 | Bratislava | 0 |
| itf-men | 904053 | Brazzaville | 0 |
| itf-men | 903541 | Brcko | 0 |
| itf-men | 903497 | Bressuire | 0 |
| itf-men | 904139 | Brisbane | 0 |
| itf-men | 904213 | Brussels | 0 |
| itf-men | 904329 | Bucaramanga | 0 |
| itf-men | 903449 | Bucharest | 0 |
| itf-men | 903675 | Budapest | 0 |
| itf-men | 903793 | Budva | 0 |
| itf-men | 904089 | Buenos Aires | 0 |
| itf-men | 903946 | Burnie | 0 |
| itf-men | 904101 | Buschhausen | 0 |
| itf-men | 904341 | Buzau | 0 |
| itf-men | 903802 | Bytom | 0 |
| itf-men | 904157 | Cadolzburg | 0 |
| itf-men | 903899 | Cairns | 0 |
| itf-men | 903485 | Cairo | 0 |
| itf-men | 903697 | Calabasas | 0 |
| itf-men | 903842 | Caloundra | 0 |
| itf-men | 904206 | Caltanissetta | 0 |
| itf-men | 903742 | Campos Do Jordao | 0 |
| itf-men | 903746 | Canberra | 0 |
| itf-men | 903670 | Cancun | 0 |
| itf-men | 904010 | Carnac | 0 |
| itf-men | 904261 | Carrara | 0 |
| itf-men | 903828 | Casablanca | 0 |
| itf-men | 903583 | Casinalbo | 0 |
| itf-men | 903444 | Caslano | 0 |
| itf-men | 904120 | Castellon | 0 |
| itf-men | 903458 | Castelo Branco | 0 |
| itf-men | 904022 | Cattolica | 0 |
| itf-men | 903877 | Celje | 0 |
| itf-men | 904299 | Cervia | 0 |
| itf-men | 904318 | Ceska Lipa | 0 |
| itf-men | 904148 | Ceuta | 5 |
| itf-men | 904282 | Chacabuco | 0 |
| itf-men | 903566 | Champaign | 0 |
| itf-men | 904169 | Chandigarh | 0 |
| itf-men | 903879 | Changwon | 0 |
| itf-men | 903973 | Chennai | 0 |
| itf-men | 903731 | Chiang Rai | 0 |
| itf-men | 903805 | Chieti | 0 |
| itf-men | 903654 | Chornomorsk | 0 |
| itf-men | 904024 | Cluj Napoca | 0 |
| itf-men | 903714 | Cochabamba | 0 |
| itf-men | 903844 | Colombo | 0 |
| itf-men | 903711 | Columbus | 0 |
| itf-men | 904146 | Concepcion | 0 |
| itf-men | 903889 | Constanta | 0 |
| itf-men | 904306 | Coquimbo | 0 |
| itf-men | 903527 | Cordoba | 0 |
| itf-men | 903872 | Craiova | 0 |
| itf-men | 903758 | Creteil | 0 |
| itf-men | 904505 | Criciuma | 0 |
| itf-men | 904359 | Cuiaba | 0 |
| itf-men | 903716 | Cundinamarca | 0 |
| itf-men | 903454 | Curtea de Arges | 0 |
| itf-men | 903885 | Daegu | 0 |
| itf-men | 903821 | Dallas | 0 |
| itf-men | 903892 | Danderyd | 0 |
| itf-men | 903890 | Darwin | 0 |
| itf-men | 904123 | Davangere | 0 |
| itf-men | 904200 | Deauville | 0 |
| itf-men | 903616 | Decatur | 0 |
| itf-men | 903820 | Den Haag | 0 |
| itf-men | 903604 | Denia | 0 |
| itf-men | 904117 | Dharwad | 0 |
| itf-men | 903585 | Doboj | 0 |
| itf-men | 903683 | Doha | 0 |
| itf-men | 4145 | Dominican Republic F2 Men Doubles | 0 |
| itf-men | 4143 | Dominican Republic F2 Men Singles | 0 |
| itf-men | 35853 | Dominican Republic F4, Men Singles | 0 |
| itf-men | 903767 | Dubrovnik | 0 |
| itf-men | 903804 | Duffel | 0 |
| itf-men | 903712 | East Lansing | 0 |
| itf-men | 904116 | Edgbaston | 0 |
| itf-men | 903943 | Edmond | 0 |
| itf-men | 904122 | Edmonton | 0 |
| itf-men | 903598 | Edwardsville | 0 |
| itf-men | 903873 | Eindhoven | 0 |
| itf-men | 904209 | Elvas | 0 |
| itf-men | 903595 | Esch-Alzette | 0 |
| itf-men | 903659 | Eupen | 0 |
| itf-men | 903676 | Falun | 0 |
| itf-men | 903507 | Faro | 0 |
| itf-men | 903478 | Fayetteville | 0 |
| itf-men | 904164 | Feira De Santana | 0 |
| itf-men | 904321 | Figueira Da Foz | 0 |
| itf-men | 904289 | Foggia | 0 |
| itf-men | 903460 | Forbach | 0 |
| itf-men | 904086 | Forli | 0 |
| itf-men | 903826 | Fountain Valley | 0 |
| itf-men | 903622 | Frankfurt Am Main | 0 |
| itf-men | 903801 | Frascati | 0 |
| itf-men | 903618 | Frederiksberg | 0 |
| itf-men | 904054 | Fuzhou | 0 |
| itf-men | 903556 | Gaiba | 0 |
| itf-men | 903596 | Gandia | 0 |
| itf-men | 903911 | Gaziantep | 0 |
| itf-men | 903623 | Gdyna | 0 |
| itf-men | 903558 | Genova | 0 |
| itf-men | 903825 | Getxo | 0 |
| itf-men | 904525 | Gimcheon | 0 |
| itf-men | 903694 | Girona | 0 |
| itf-men | 903749 | Glasgow | 0 |
| itf-men | 904143 | Gold Coast | 0 |
| itf-men | 903560 | Grasse | 0 |
| itf-men | 903503 | Grenoble | 0 |
| itf-men | 903614 | Grodzisk Mazowiecki | 0 |
| itf-men | 904492 | Guadalajara | 0 |
| itf-men | 903722 | Guatemala | 0 |
| itf-men | 903615 | Guayaquil | 0 |
| itf-men | 903841 | Gubbio | 0 |
| itf-men | 904103 | Guiyang | 0 |
| itf-men | 903993 | Gurb | 0 |
| itf-men | 903721 | Gurugram | 0 |
| itf-men | 904545 | Gwalior | 0 |
| itf-men | 904182 | Gyula | 0 |
| itf-men | 904155 | Hammamet | 0 |
| itf-men | 903884 | Haren | 0 |
| itf-men | 903706 | Harlingen | 0 |
| itf-men | 903792 | Harmon | 0 |
| itf-men | 904271 | Hazebrouck | 0 |
| itf-men | 903554 | Helsinki | 0 |
| itf-men | 903476 | Heraklion | 0 |
| itf-men | 903861 | Herzlia | 0 |
| itf-men | 904205 | Hillcrest | 0 |
| itf-men | 904167 | Hinode | 0 |
| itf-men | 904085 | Hong Kong | 0 |
| itf-men | 904533 | Hradec Kralove | 0 |
| itf-men | 904128 | Hua Hin | 0 |
| itf-men | 904215 | Huamantla | 0 |
| itf-men | 903991 | Huntsville | 0 |
| itf-men | 904343 | Hurghada | 0 |
| itf-men | 903645 | Huy | 0 |
| itf-men | 904241 | Huzhou | 0 |
| itf-men | 904057 | Hyvinkaa | 0 |
| itf-men | 903660 | Ibague | 0 |
| itf-men | 903588 | Idanha-A-Nova | 0 |
| itf-men | 903510 | Indore | 0 |
| itf-men | 903843 | Innsbruck | 0 |
| itf-men | 904142 | Ipoh Perak | 0 |
| itf-men | 39313 | Iran F2 Men Singles | 0 |
| itf-men | 39975 | Iran F3 Men Singles | 0 |
| itf-men | 904043 | Irvine | 0 |
| itf-men | 44993 | ITF Angola F1, Men Doubles | 0 |
| itf-men | 44991 | ITF Angola F1, Men Singles | 0 |
| itf-men | 45111 | ITF Angola F2, Men Doubles | 0 |
| itf-men | 45109 | ITF Angola F2, Men Singles | 0 |
| itf-men | 18508 | ITF Argentina F1, Men Doubles | 0 |
| itf-men | 18506 | ITF Argentina F1, Men Singles | 0 |
| itf-men | 21634 | ITF Argentina F10, Men Doubles | 0 |
| itf-men | 21632 | ITF Argentina F10, Men Singles | 0 |
| itf-men | 21776 | ITF Argentina F11, Men Doubles | 0 |
| itf-men | 21774 | ITF Argentina F11, Men Singles | 0 |
| itf-men | 18580 | ITF Argentina F2, Men Doubles | 0 |
| itf-men | 18578 | ITF Argentina F2, Men Singles | 0 |
| itf-men | 17476 | ITF Argentina F4, Men Doubles | 0 |
| itf-men | 17474 | ITF Argentina F4, Men Singles | 0 |
| itf-men | 18244 | ITF Argentina F5, Men Doubles | 0 |
| itf-men | 18242 | ITF Argentina F5, Men Singles | 0 |
| itf-men | 18632 | ITF Argentina F6, Men Doubles | 0 |
| itf-men | 18630 | ITF Argentina F6, Men Singles | 0 |
| itf-men | 19338 | ITF Argentina F7, Men Doubles | 0 |
| itf-men | 19336 | ITF Argentina F7, Men Singles | 0 |
| itf-men | 21006 | ITF Argentina F8, Men Doubles | 0 |
| itf-men | 21004 | ITF Argentina F8, Men Singles | 0 |
| itf-men | 21302 | ITF Argentina F9, Men Doubles | 0 |
| itf-men | 21300 | ITF Argentina F9, Men Singles | 0 |
| itf-men | 44485 | ITF Armenia F1, Men Doubles | 0 |
| itf-men | 44483 | ITF Armenia F1, Men Singles | 0 |
| itf-men | 44585 | ITF Armenia F2, Men Doubles | 0 |
| itf-men | 44583 | ITF Armenia F2, Men Singles | 0 |
| itf-men | 17308 | ITF Australia F1, Men Doubles | 0 |
| itf-men | 17306 | ITF Australia F1, Men Singles | 0 |
| itf-men | 37855 | ITF Australia F10, Men Doubles | 0 |
| itf-men | 37857 | ITF Australia F10, Men Singles | 0 |
| itf-men | 37993 | ITF Australia F11, Men Doubles | 0 |
| itf-men | 37991 | ITF Australia F11, Men Singles | 0 |
| itf-men | 38075 | ITF Australia F12, Men Singles | 0 |
| itf-men | 38405 | ITF Australia F13, Men Doubles | 0 |
| itf-men | 38407 | ITF Australia F13, Men Singles | 0 |
| itf-men | 15025 | ITF Australia F2, Men Doubles | 0 |
| itf-men | 15023 | ITF Australia F2, Men Singles | 0 |
| itf-men | 17602 | ITF Australia F3, Men Doubles | 0 |
| itf-men | 17600 | ITF Australia F3, Men Singles | 0 |
| itf-men | 19554 | ITF Australia F4, Men Doubles | 0 |
| itf-men | 19552 | ITF Australia F4, Men Singles | 0 |
| itf-men | 19810 | ITF Australia F5, Men Doubles | 0 |
| itf-men | 19808 | ITF Australia F5, Men Singles | 0 |
| itf-men | 19978 | ITF Australia F6, Men Doubles | 0 |
| itf-men | 19976 | ITF Australia F6, Men Singles | 0 |
| itf-men | 20146 | ITF Australia F7, Men Doubles | 0 |
| itf-men | 20144 | ITF Australia F7, Men Singles | 0 |
| itf-men | 24510 | ITF Australia F8, Men Doubles | 0 |
| itf-men | 24508 | ITF Australia F8, Men Singles | 0 |
| itf-men | 37833 | ITF Australia F9, Men Doubles | 0 |
| itf-men | 37831 | ITF Australia F9, Men Singles | 0 |
| itf-men | 19042 | ITF Austria F1, Men Doubles | 0 |
| itf-men | 19040 | ITF Austria F1, Men Singles | 0 |
| itf-men | 19150 | ITF Austria F2, Men Doubles | 0 |
| itf-men | 19148 | ITF Austria F2, Men Singles | 0 |
| itf-men | 16194 | ITF Austria F3, Men Doubles | 0 |
| itf-men | 16192 | ITF Austria F3, Men Singles | 0 |
| itf-men | 16760 | ITF Austria F5, Men Doubles | 0 |
| itf-men | 16758 | ITF Austria F5, Men Singles | 0 |
| itf-men | 16942 | ITF Austria F6, Men Doubles | 0 |
| itf-men | 16940 | ITF Austria F6, Men Singles | 0 |
| itf-men | 37365 | ITF Austria F7, Men Doubles | 0 |
| itf-men | 37363 | ITF Austria F7, Men Singles | 0 |
| itf-men | 41130 | ITF Austria F9, Men Doubles | 0 |
| itf-men | 41132 | ITF Austria F9, Men Singles | 0 |
| itf-men | 18818 | ITF Belgium F1, Men Doubles | 0 |
| itf-men | 18816 | ITF Belgium F1, Men Singles | 0 |
| itf-men | 15854 | ITF Belgium F4, Men Doubles | 0 |
| itf-men | 15852 | ITF Belgium F4, Men Singles | 0 |
| itf-men | 16200 | ITF Belgium F5, Men Doubles | 0 |
| itf-men | 16198 | ITF Belgium F5, Men Singles | 0 |
| itf-men | 16484 | ITF Belgium F6, Men Doubles | 0 |
| itf-men | 16482 | ITF Belgium F6, Men Singles | 0 |
| itf-men | 16762 | ITF Belgium F7, Men Doubles | 0 |
| itf-men | 16764 | ITF Belgium F7, Men Singles | 0 |
| itf-men | 19590 | ITF Bolivia F1, Men Doubles | 0 |
| itf-men | 19588 | ITF Bolivia F1, Men Singles | 0 |
| itf-men | 19850 | ITF Bolivia F2, Men Doubles | 0 |
| itf-men | 19848 | ITF Bolivia F2, Men Singles | 0 |
| itf-men | 20004 | ITF Bolivia F3, Men Doubles | 0 |
| itf-men | 20002 | ITF Bolivia F3, Men Singles | 0 |
| itf-men | 18180 | ITF Bosnia & Herzegovina F1, Men Doubles | 0 |
| itf-men | 18178 | ITF Bosnia & Herzegovina F1, Men Singles | 0 |
| itf-men | 18420 | ITF Bosnia & Herzegovina F2, Men Doubles | 0 |
| itf-men | 18418 | ITF Bosnia & Herzegovina F2, Men Singles | 0 |
| itf-men | 18514 | ITF Bosnia & Herzegovina F3, Men Doubles | 0 |
| itf-men | 18512 | ITF Bosnia & Herzegovina F3, Men Singles | 0 |
| itf-men | 27715 | ITF Bosnia & Herzegovina F4, Men Doubles | 0 |
| itf-men | 27713 | ITF Bosnia & Herzegovina F4, Men Singles | 0 |
| itf-men | 24455 | ITF Brazil F1, Men Doubles | 0 |
| itf-men | 24453 | ITF Brazil F1, Men Singles | 0 |
| itf-men | 44773 | ITF Brazil F10, Men Doubles | 0 |
| itf-men | 44771 | ITF Brazil F10, Men Singles | 0 |
| itf-men | 44863 | ITF Brazil F11, Men Doubles | 0 |
| itf-men | 44861 | ITF Brazil F11, Men Singles | 0 |
| itf-men | 21160 | ITF Brazil F2, Men Doubles | 0 |
| itf-men | 21158 | ITF Brazil F2, Men Singles | 0 |
| itf-men | 21734 | ITF Brazil F4, Men Doubles | 0 |
| itf-men | 21728 | ITF Brazil F4, Men Singles | 0 |
| itf-men | 13863 | ITF Brazil F5, Men Doubles | 0 |
| itf-men | 13861 | ITF Brazil F5, Men Singles | 0 |
| itf-men | 24746 | ITF Brazil F6, Men Doubles | 0 |
| itf-men | 24744 | ITF Brazil F6, Men Singles | 0 |
| itf-men | 27054 | ITF Brazil F7, Men Doubles | 0 |
| itf-men | 27052 | ITF Brazil F7, Men Singles | 0 |
| itf-men | 25373 | ITF Brazil F8, Men Doubles | 0 |
| itf-men | 25371 | ITF Brazil F8, Men Singles | 0 |
| itf-men | 13583 | ITF Brazil F9, Men Doubles | 0 |
| itf-men | 13581 | ITF Brazil F9, Men Singles | 0 |
| itf-men | 13667 | ITF Bulgaria F1, Men Doubles | 0 |
| itf-men | 13665 | ITF Bulgaria F1, Men Singles | 0 |
| itf-men | 41055 | ITF Bulgaria F1B, Men Doubles | 0 |
| itf-men | 41053 | ITF Bulgaria F1B, Men Singles | 0 |
| itf-men | 29822 | ITF Bulgaria F5, Men Doubles | 0 |
| itf-men | 29820 | ITF Bulgaria F5, Men Singles | 0 |
| itf-men | 17110 | ITF Canada F1, Men Doubles | 0 |
| itf-men | 17108 | ITF Canada F1, Men Singles | 0 |
| itf-men | 17312 | ITF Canada F2, Men Doubles | 0 |
| itf-men | 17310 | ITF Canada F2, Men Singles | 0 |
| itf-men | 18918 | ITF Canada F3, Men Doubles | 0 |
| itf-men | 18916 | ITF Canada F3, Men Singles | 0 |
| itf-men | 19012 | ITF Canada F4, Men Doubles | 0 |
| itf-men | 19010 | ITF Canada F4, Men Singles | 0 |
| itf-men | 18236 | ITF Canada F5, Men Doubles | 0 |
| itf-men | 18234 | ITF Canada F5, Men Singles | 0 |
| itf-men | 21536 | ITF Chile F1, Men Doubles | 0 |
| itf-men | 21534 | ITF Chile F1, Men Singles | 0 |
| itf-men | 21782 | ITF Chile F2, Men Doubles | 0 |
| itf-men | 21780 | ITF Chile F2, Men Singles | 0 |
| itf-men | 22136 | ITF Chile F3, Men Doubles | 0 |
| itf-men | 22134 | ITF Chile F3, Men Singles | 0 |
| itf-men | 45211 | ITF Chile F4, Men Doubles | 0 |
| itf-men | 45213 | ITF Chile F4, Men Singles | 0 |
| itf-men | 16860 | ITF China F1, Men Doubles | 0 |
| itf-men | 16858 | ITF China F1, Men Singles | 0 |
| itf-men | 15580 | ITF China F10, Men Doubles | 0 |
| itf-men | 15578 | ITF China F10, Men Singles | 0 |
| itf-men | 19018 | ITF China F11, Men Doubles | 0 |
| itf-men | 19016 | ITF China F11, Men Singles | 0 |
| itf-men | 19110 | ITF China F12, Men Doubles | 0 |
| itf-men | 19108 | ITF China F12, Men Singles | 0 |
| itf-men | 16152 | ITF China F13, Men Doubles | 0 |
| itf-men | 16150 | ITF China F13, Men Singles | 0 |
| itf-men | 16456 | ITF China F14, Men Doubles | 0 |
| itf-men | 16454 | ITF China F14, Men Singles | 0 |
| itf-men | 17084 | ITF China F2, Men Doubles | 0 |
| itf-men | 17082 | ITF China F2, Men Singles | 0 |
| itf-men | 17122 | ITF China F3, Men Doubles | 0 |
| itf-men | 17120 | ITF China F3, Men Singles | 0 |
| itf-men | 17660 | ITF China F4, Men Doubles | 0 |
| itf-men | 17658 | ITF China F4, Men Singles | 0 |
| itf-men | 15151 | ITF China F5, Men Doubles | 0 |
| itf-men | 15141 | ITF China F5, Men Singles | 0 |
| itf-men | 18044 | ITF China F7, Men Doubles | 0 |
| itf-men | 18042 | ITF China F7, Men Singles | 0 |
| itf-men | 18168 | ITF China F8, Men Doubles | 0 |
| itf-men | 18166 | ITF China F8, Men Singles | 0 |
| itf-men | 18406 | ITF China F9, Men Doubles | 0 |
| itf-men | 18404 | ITF China F9, Men Singles | 0 |
| itf-men | 18556 | ITF Chinese Taipei F1, Men Doubles | 0 |
| itf-men | 18554 | ITF Chinese Taipei F1, Men Singles | 0 |
| itf-men | 18790 | ITF Chinese Taipei F2, Men Doubles | 0 |
| itf-men | 18788 | ITF Chinese Taipei F2, Men Singles | 0 |
| itf-men | 16206 | ITF Colombia F1, Men Doubles | 0 |
| itf-men | 16204 | ITF Colombia F1, Men Singles | 0 |
| itf-men | 16768 | ITF Colombia F3, Men Doubles | 0 |
| itf-men | 16766 | ITF Colombia F3, Men Singles | 0 |
| itf-men | 40425 | ITF Congo F2, Men Doubles | 0 |
| itf-men | 40423 | ITF Congo F2, Men Singles | 0 |
| itf-men | 40333 | ITF Congo Republic F1, Men Doubles | 0 |
| itf-men | 40337 | ITF Congo Republic F1, Men Singles | 0 |
| itf-men | 17318 | ITF Croatia F1, Men Doubles | 0 |
| itf-men | 17316 | ITF Croatia F1, Men Singles | 0 |
| itf-men | 42853 | ITF Croatia F10, Men Doubles | 0 |
| itf-men | 42851 | ITF Croatia F10, Men Singles | 0 |
| itf-men | 44473 | ITF Croatia F12, Men Doubles | 0 |
| itf-men | 44471 | ITF Croatia F12, Men Singles | 0 |
| itf-men | 17650 | ITF Croatia F2, Men Doubles | 0 |
| itf-men | 17648 | ITF Croatia F2, Men Singles | 0 |
| itf-men | 17586 | ITF Croatia F3, Men Doubles | 0 |
| itf-men | 17584 | ITF Croatia F3, Men Singles | 0 |
| itf-men | 13547 | ITF Croatia F4, Men Doubles | 0 |
| itf-men | 13545 | ITF Croatia F4, Men Singles | 0 |
| itf-men | 34330 | ITF Croatia F5, Men Doubles | 0 |
| itf-men | 34332 | ITF Croatia F5, Men Singles | 0 |
| itf-men | 36699 | ITF Croatia F6, Men Doubles | 0 |
| itf-men | 36703 | ITF Croatia F6, Men Singles | 0 |
| itf-men | 40561 | ITF Croatia F7, Men Doubles | 0 |
| itf-men | 40563 | ITF Croatia F7, Men Singles | 0 |
| itf-men | 43237 | ITF Croatia F8, Men Doubles | 0 |
| itf-men | 43235 | ITF Croatia F8, Men Singles | 0 |
| itf-men | 39629 | ITF Cyprus F1, Men Doubles | 0 |
| itf-men | 39631 | ITF Cyprus F1, Men Singles | 0 |
| itf-men | 39677 | ITF Cyprus F2, Men Doubles | 0 |
| itf-men | 39675 | ITF Cyprus F2, Men Singles | 0 |
| itf-men | 41580 | ITF Cyprus F4 Men Singles | 0 |
| itf-men | 41578 | ITF Cyprus F4, Men Doubles | 0 |
| itf-men | 41682 | ITF Cyprus F5 Men Singles | 0 |
| itf-men | 41684 | ITF Cyprus F5, Men Doubles | 0 |
| itf-men | 16158 | ITF Czech Republic F6, Men Doubles | 0 |
| itf-men | 16156 | ITF Czech Republic F6, Men Singles | 0 |
| itf-men | 34814 | ITF Denmark F1, Men Doubles | 0 |
| itf-men | 34812 | ITF Denmark F1, Men Singles | 0 |
| itf-men | 21788 | ITF Dominican Republic F1, Men Doubles | 0 |
| itf-men | 21786 | ITF Dominican Republic F1, Men Singles | 0 |
| itf-men | 27452 | ITF Dominican Republic F3, Men Doubles | 0 |
| itf-men | 27450 | ITF Dominican Republic F3, Men Singles | 0 |
| itf-men | 35855 | ITF Dominican Republic F4, Men Doubles | 0 |
| itf-men | 36169 | ITF Dominican Republic F5, Men Doubles | 0 |
| itf-men | 36173 | ITF Dominican Republic F5, Men Singles | 0 |
| itf-men | 36913 | ITF Dominican Republic F6, Men Doubles | 0 |
| itf-men | 36915 | ITF Dominican Republic F6, Men Singles | 0 |
| itf-men | 15776 | ITF Egypt F1, Men Doubles | 0 |
| itf-men | 15774 | ITF Egypt F1, Men Singles | 0 |
| itf-men | 17582 | ITF Egypt F10, Men Doubles | 0 |
| itf-men | 17580 | ITF Egypt F10, Men Singles | 0 |
| itf-men | 17420 | ITF Egypt F11, Men Doubles | 0 |
| itf-men | 17418 | ITF Egypt F11, Men Singles | 0 |
| itf-men | 17686 | ITF Egypt F12, Men Doubles | 0 |
| itf-men | 17684 | ITF Egypt F12, Men Singles | 0 |
| itf-men | 17802 | ITF Egypt F13, Men Doubles | 0 |
| itf-men | 17800 | ITF Egypt F13, Men Singles | 0 |
| itf-men | 17862 | ITF Egypt F14, Men Doubles | 0 |
| itf-men | 17860 | ITF Egypt F14, Men Singles | 0 |
| itf-men | 17758 | ITF Egypt F15, Men Doubles | 0 |
| itf-men | 17756 | ITF Egypt F15, Men Singles | 0 |
| itf-men | 24570 | ITF Egypt F16, Men Doubles | 0 |
| itf-men | 24568 | ITF Egypt F16, Men Singles | 0 |
| itf-men | 24482 | ITF Egypt F17, Men Doubles | 0 |
| itf-men | 24480 | ITF Egypt F17, Men Singles | 0 |
| itf-men | 18950 | ITF Egypt F18, Men Doubles | 0 |
| itf-men | 18948 | ITF Egypt F18, Men Singles | 0 |
| itf-men | 19060 | ITF Egypt F19, Men Doubles | 0 |
| itf-men | 19058 | ITF Egypt F19, Men Singles | 0 |
| itf-men | 15812 | ITF Egypt F2, Men Doubles | 0 |
| itf-men | 15810 | ITF Egypt F2, Men Singles | 0 |
| itf-men | 19170 | ITF Egypt F20, Men Doubles | 0 |
| itf-men | 19168 | ITF Egypt F20, Men Singles | 0 |
| itf-men | 16212 | ITF Egypt F21, Men Doubles | 0 |
| itf-men | 16210 | ITF Egypt F21, Men Singles | 0 |
| itf-men | 16492 | ITF Egypt F22, Men Doubles | 0 |
| itf-men | 16490 | ITF Egypt F22, Men Singles | 0 |
| itf-men | 16772 | ITF Egypt F23, Men Doubles | 0 |
| itf-men | 16770 | ITF Egypt F23, Men Singles | 0 |
| itf-men | 18644 | ITF Egypt F24, Men Doubles | 0 |
| itf-men | 18642 | ITF Egypt F24, Men Singles | 0 |
| itf-men | 19348 | ITF Egypt F25, Men Doubles | 0 |
| itf-men | 19346 | ITF Egypt F25, Men Singles | 0 |
| itf-men | 19596 | ITF Egypt F26, Men Doubles | 0 |
| itf-men | 19594 | ITF Egypt F26, Men Singles | 0 |
| itf-men | 15878 | ITF Egypt F3, Men Doubles | 0 |
| itf-men | 15876 | ITF Egypt F3, Men Singles | 0 |
| itf-men | 16644 | ITF Egypt F4, Men Doubles | 0 |
| itf-men | 15996 | ITF Egypt F4, Men Singles | 0 |
| itf-men | 16864 | ITF Egypt F5, Men Doubles | 0 |
| itf-men | 16862 | ITF Egypt F5, Men Singles | 0 |
| itf-men | 17092 | ITF Egypt F6, Men Doubles | 0 |
| itf-men | 17090 | ITF Egypt F6, Men Singles | 0 |
| itf-men | 17124 | ITF Egypt F7, Men Doubles | 0 |
| itf-men | 16120 | ITF Egypt F7, Men Singles | 0 |
| itf-men | 17322 | ITF Egypt F8, Men Doubles | 0 |
| itf-men | 17320 | ITF Egypt F8, Men Singles | 0 |
| itf-men | 17642 | ITF Egypt F9, Men Doubles | 0 |
| itf-men | 17640 | ITF Egypt F9, Men Singles | 0 |
| itf-men | 39785 | ITF Ethiopia F1 Men Doubles | 0 |
| itf-men | 39787 | ITF Ethiopia F1 Men Single | 0 |
| itf-men | 39845 | ITF Ethiopia F2 Men Doubles | 0 |
| itf-men | 39847 | ITF Ethiopia F2 Men Singles | 0 |
| itf-men | 14099 | ITF Finland F1, Men Doubles | 0 |
| itf-men | 14097 | ITF Finland F1, Men Singles | 0 |
| itf-men | 15756 | ITF France F1, Men Doubles | 0 |
| itf-men | 15754 | ITF France F1, Men Singles | 0 |
| itf-men | 17924 | ITF France F10, Men Doubles | 0 |
| itf-men | 17922 | ITF France F10, Men Singles | 0 |
| itf-men | 24938 | ITF France F11, Men Doubles | 0 |
| itf-men | 24936 | ITF France F11, Men Singles | 0 |
| itf-men | 23929 | ITF France F12, Men Doubles | 0 |
| itf-men | 23927 | ITF France F12, Men Singles | 0 |
| itf-men | 18926 | ITF France F13, Men Doubles | 0 |
| itf-men | 18924 | ITF France F13, Men Singles | 0 |
| itf-men | 19024 | ITF France F14, Men Doubles | 0 |
| itf-men | 19022 | ITF France F14, Men Singles | 0 |
| itf-men | 19122 | ITF France F15, Men Doubles | 0 |
| itf-men | 19120 | ITF France F15, Men Singles | 0 |
| itf-men | 16218 | ITF France F16, Men Doubles | 0 |
| itf-men | 16216 | ITF France F16, Men Singles | 0 |
| itf-men | 16460 | ITF France F17, Men Doubles | 0 |
| itf-men | 16458 | ITF France F17, Men Singles | 0 |
| itf-men | 18620 | ITF France F18, Men Doubles | 0 |
| itf-men | 18618 | ITF France F18, Men Singles | 0 |
| itf-men | 19312 | ITF France F19, Men Doubles | 0 |
| itf-men | 19310 | ITF France F19, Men Singles | 0 |
| itf-men | 15780 | ITF France F2, Men Doubles | 0 |
| itf-men | 15778 | ITF France F2, Men Singles | 0 |
| itf-men | 19566 | ITF France F20, Men Doubles | 0 |
| itf-men | 19564 | ITF France F20, Men Singles | 0 |
| itf-men | 19862 | ITF France F21, Men Doubles | 0 |
| itf-men | 19860 | ITF France F21, Men Singles | 0 |
| itf-men | 19986 | ITF France F22, Men Doubles | 0 |
| itf-men | 19984 | ITF France F22, Men Singles | 0 |
| itf-men | 20152 | ITF France F23, Men Doubles | 0 |
| itf-men | 20150 | ITF France F23, Men Singles | 0 |
| itf-men | 20390 | ITF France F24, Men Doubles | 0 |
| itf-men | 20388 | ITF France F24, Men Singles | 0 |
| itf-men | 43869 | ITF France F25, Men Doubles | 0 |
| itf-men | 43867 | ITF France F25, Men Singles | 0 |
| itf-men | 43963 | ITF France F26, Men Doubles | 0 |
| itf-men | 43961 | ITF France F26, Men Singles | 0 |
| itf-men | 44467 | ITF France F29, Men Doubles | 0 |
| itf-men | 44465 | ITF France F29, Men Singles | 0 |
| itf-men | 15816 | ITF France F3, Men Doubles | 0 |
| itf-men | 15814 | ITF France F3, Men Singles | 0 |
| itf-men | 44573 | ITF France F30, Men Doubles | 0 |
| itf-men | 44571 | ITF France F30, Men Singles | 0 |
| itf-men | 44215 | ITF France F31, Men Doubles | 0 |
| itf-men | 44213 | ITF France F31, Men Singles | 0 |
| itf-men | 17114 | ITF France F4, Men Doubles | 0 |
| itf-men | 17112 | ITF France F4, Men Singles | 0 |
| itf-men | 17328 | ITF France F5, Men Doubles | 0 |
| itf-men | 17326 | ITF France F5, Men Singles | 0 |
| itf-men | 17638 | ITF France F6, Men Doubles | 0 |
| itf-men | 17636 | ITF France F6, Men Singles | 0 |
| itf-men | 13541 | ITF France F7, Men Doubles | 0 |
| itf-men | 13539 | ITF France F7, Men Singles | 0 |
| itf-men | 17868 | ITF France F8, Men Doubles | 0 |
| itf-men | 17866 | ITF France F8, Men Singles | 0 |
| itf-men | 17906 | ITF France F9, Men Doubles | 0 |
| itf-men | 17904 | ITF France F9, Men Singles | 0 |
| itf-men | 19066 | ITF Georgia F1, Men Doubles | 0 |
| itf-men | 19064 | ITF Georgia F1, Men Singles | 0 |
| itf-men | 19176 | ITF Georgia F2, Men Doubles | 0 |
| itf-men | 19174 | ITF Georgia F2, Men Singles | 0 |
| itf-men | 16224 | ITF Georgia F3, Men Doubles | 0 |
| itf-men | 16222 | ITF Georgia F3, Men Singles | 0 |
| itf-men | 25385 | ITF Georgia F4, Men Doubles | 0 |
| itf-men | 25383 | ITF Georgia F4, Men Singles | 0 |
| itf-men | 41298 | ITF Georgia F5, Men Doubles | 0 |
| itf-men | 41300 | ITF Georgia F5, Men Singles | 0 |
| itf-men | 15760 | ITF Germany F1, Men Doubles | 0 |
| itf-men | 15758 | ITF Germany F1, Men Singles | 0 |
| itf-men | 16966 | ITF Germany F10, Men Doubles | 0 |
| itf-men | 16964 | ITF Germany F10, Men Singles | 0 |
| itf-men | 17198 | ITF Germany F11, Men Doubles | 0 |
| itf-men | 17196 | ITF Germany F11, Men Singles | 0 |
| itf-men | 23579 | ITF Germany F13, Men Doubles | 0 |
| itf-men | 23577 | ITF Germany F13, Men Singles | 0 |
| itf-men | 20194 | ITF Germany F14, Men Doubles | 0 |
| itf-men | 20192 | ITF Germany F14, Men Singles | 0 |
| itf-men | 40411 | ITF Germany F17 Men Singles | 0 |
| itf-men | 40413 | ITF Germany F17, Men Doubles | 0 |
| itf-men | 15784 | ITF Germany F2, Men Doubles | 0 |
| itf-men | 15782 | ITF Germany F2, Men Singles | 0 |
| itf-men | 40925 | ITF Germany F23, Men Doubles | 0 |
| itf-men | 40923 | ITF Germany F23, Men Singles | 0 |
| itf-men | 15804 | ITF Germany F3, Men Doubles | 0 |
| itf-men | 15802 | ITF Germany F3, Men Singles | 0 |
| itf-men | 13857 | ITF Germany F4, Men Doubles | 0 |
| itf-men | 13855 | ITF Germany F4, Men Singles | 0 |
| itf-men | 13887 | ITF Germany F5, Men Doubles | 0 |
| itf-men | 13885 | ITF Germany F5, Men Singles | 0 |
| itf-men | 19072 | ITF Germany F6, Men Doubles | 0 |
| itf-men | 19070 | ITF Germany F6, Men Singles | 0 |
| itf-men | 19182 | ITF Germany F7, Men Doubles | 0 |
| itf-men | 19180 | ITF Germany F7, Men Singles | 0 |
| itf-men | 16164 | ITF Germany F8, Men Doubles | 0 |
| itf-men | 16162 | ITF Germany F8, Men Singles | 0 |
| itf-men | 16780 | ITF Germany F9, Men Doubles | 0 |
| itf-men | 16778 | ITF Germany F9, Men Singles | 0 |
| itf-men | 16146 | ITF Great Britain F1, Men Doubles | 0 |
| itf-men | 16144 | ITF Great Britain F1, Men Singles | 0 |
| itf-men | 37501 | ITF Great Britain F10, Men Doubles | 0 |
| itf-men | 37503 | ITF Great Britain F10, Men Singles | 0 |
| itf-men | 37359 | ITF Great Britain F11, Men Doubles | 0 |
| itf-men | 37357 | ITF Great Britain F11, Men Singles | 0 |
| itf-men | 37665 | ITF Great Britain F12, Men Doubles | 0 |
| itf-men | 37663 | ITF Great Britain F12, Men Singles | 0 |
| itf-men | 37237 | ITF Great Britain F13, Men Doubles | 0 |
| itf-men | 37239 | ITF Great Britain F13, Men Singles | 0 |
| itf-men | 37605 | ITF Great Britain F14, Men Doubles | 0 |
| itf-men | 37603 | ITF Great Britain F14, Men Singles | 0 |
| itf-men | 38133 | ITF Great Britain F15, Men Doubles | 0 |
| itf-men | 38135 | ITF Great Britain F15, Men Singles | 0 |
| itf-men | 16646 | ITF Great Britain F2, Men Doubles | 0 |
| itf-men | 15998 | ITF Great Britain F2, Men Singles | 0 |
| itf-men | 16868 | ITF Great Britain F3, Men Doubles | 0 |
| itf-men | 16866 | ITF Great Britain F3, Men Singles | 0 |
| itf-men | 19602 | ITF Great Britain F5, Men Doubles | 0 |
| itf-men | 19600 | ITF Great Britain F5, Men Singles | 0 |
| itf-men | 14550 | ITF Great Britain F6, Men Doubles | 0 |
| itf-men | 14548 | ITF Great Britain F6, Men Singles | 0 |
| itf-men | 30402 | ITF Great Britain F7, Men Doubles | 0 |
| itf-men | 30404 | ITF Great Britain F7, Men Singles | 0 |
| itf-men | 36653 | ITF Great Britain F8, Men Doubles | 0 |
| itf-men | 36655 | ITF Great Britain F8, Men Singles | 0 |
| itf-men | 40341 | ITF Great Britain F9, Men Doubles | 0 |
| itf-men | 40343 | ITF Great Britain F9, Men Singles | 0 |
| itf-men | 15265 | ITF Greece F1, Men Doubles | 0 |
| itf-men | 15263 | ITF Greece F1, Men Singles | 0 |
| itf-men | 21652 | ITF Greece F10, Men Doubles | 0 |
| itf-men | 21650 | ITF Greece F10, Men Singles | 0 |
| itf-men | 15389 | ITF Greece F2, Men Doubles | 0 |
| itf-men | 15387 | ITF Greece F2, Men Singles | 0 |
| itf-men | 17578 | ITF Greece F3, Men Doubles | 0 |
| itf-men | 17576 | ITF Greece F3, Men Singles | 0 |
| itf-men | 17416 | ITF Greece F4, Men Doubles | 0 |
| itf-men | 17414 | ITF Greece F4, Men Singles | 0 |
| itf-men | 17704 | ITF Greece F5, Men Doubles | 0 |
| itf-men | 17702 | ITF Greece F5, Men Singles | 0 |
| itf-men | 20526 | ITF Greece F6, Men Doubles | 0 |
| itf-men | 20524 | ITF Greece F6, Men Singles | 0 |
| itf-men | 20794 | ITF Greece F7, Men Doubles | 0 |
| itf-men | 20792 | ITF Greece F7, Men Singles | 0 |
| itf-men | 21036 | ITF Greece F8, Men Doubles | 0 |
| itf-men | 21034 | ITF Greece F8, Men Singles | 0 |
| itf-men | 21314 | ITF Greece F9, Men Doubles | 0 |
| itf-men | 21312 | ITF Greece F9, Men Singles | 0 |
| itf-men | 18826 | ITF Guam F1, Men Doubles | 0 |
| itf-men | 18824 | ITF Guam F1, Men Singles | 0 |
| itf-men | 35759 | ITF Guatemala F1, Men Doubles | 0 |
| itf-men | 44767 | ITF Guatemala F2, Men Doubles | 0 |
| itf-men | 44765 | ITF Guatemala F2, Men Singles | 0 |
| itf-men | 35761 | ITF GuatemalaF1, Men Singles | 0 |
| itf-men | 18832 | ITF Hong Kong F1, Men Doubles | 0 |
| itf-men | 18830 | ITF Hong Kong F1, Men Singles | 0 |
| itf-men | 18958 | ITF Hong Kong F2, Men Doubles | 0 |
| itf-men | 18956 | ITF Hong Kong F2, Men Singles | 0 |
| itf-men | 19078 | ITF Hong Kong F3, Men Doubles | 0 |
| itf-men | 19076 | ITF Hong Kong F3, Men Singles | 0 |
| itf-men | 23301 | ITF Hong Kong F4, Men Doubles | 0 |
| itf-men | 23299 | ITF Hong Kong F4, Men Singles | 0 |
| itf-men | 15291 | ITF Hungary F1, Men Doubles | 0 |
| itf-men | 15289 | ITF Hungary F1, Men Singles | 0 |
| itf-men | 18084 | ITF Hungary F2, Men Doubles | 0 |
| itf-men | 18082 | ITF Hungary F2, Men Singles | 0 |
| itf-men | 18194 | ITF Hungary F3, Men Doubles | 0 |
| itf-men | 18192 | ITF Hungary F3, Men Singles | 0 |
| itf-men | 18562 | ITF Hungary F4, Men Doubles | 0 |
| itf-men | 18560 | ITF Hungary F4, Men Singles | 0 |
| itf-men | 14299 | ITF Hungary F5, Men Doubles | 0 |
| itf-men | 14297 | ITF Hungary F5, Men Singles | 0 |
| itf-men | 14347 | ITF Hungary F6, Men Doubles | 0 |
| itf-men | 14345 | ITF Hungary F6, Men Singles | 0 |
| itf-men | 14383 | ITF Hungary F8, Men Doubles | 0 |
| itf-men | 14381 | ITF Hungary F8, Men Singles | 0 |
| itf-men | 16872 | ITF India F1, Men Doubles | 0 |
| itf-men | 16870 | ITF India F1, Men Singles | 0 |
| itf-men | 14939 | ITF India F2, Men Doubles | 0 |
| itf-men | 14941 | ITF India F2, Men Singles | 0 |
| itf-men | 14969 | ITF India F3, Men Doubles | 0 |
| itf-men | 14967 | ITF India F3, Men Singles | 0 |
| itf-men | 14997 | ITF India F4, Men Doubles | 0 |
| itf-men | 14995 | ITF India F4, Men Singles | 0 |
| itf-men | 17626 | ITF India F5, Men Doubles | 0 |
| itf-men | 17624 | ITF India F5, Men Singles | 0 |
| itf-men | 15111 | ITF India F6, Men Doubles | 0 |
| itf-men | 15109 | ITF India F6, Men Singles | 0 |
| itf-men | 18652 | ITF India F7, Men Doubles | 0 |
| itf-men | 18650 | ITF India F7, Men Singles | 0 |
| itf-men | 19370 | ITF India F8, Men Doubles | 0 |
| itf-men | 19368 | ITF India F8, Men Singles | 0 |
| itf-men | 19608 | ITF India F9, Men Doubles | 0 |
| itf-men | 19606 | ITF India F9, Men Singles | 0 |
| itf-men | 16648 | ITF Indonesia F1, Men Doubles | 0 |
| itf-men | 16000 | ITF Indonesia F1, Men Singles | 0 |
| itf-men | 14209 | ITF Indonesia F2, Men Doubles | 0 |
| itf-men | 14207 | ITF Indonesia F2, Men Singles | 0 |
| itf-men | 17104 | ITF Indonesia F3, Men Doubles | 0 |
| itf-men | 17102 | ITF Indonesia F3, Men Singles | 0 |
| itf-men | 17412 | ITF Indonesia F4, Men Doubles | 0 |
| itf-men | 17410 | ITF Indonesia F4, Men Singles | 0 |
| itf-men | 17712 | ITF Indonesia F5, Men Doubles | 0 |
| itf-men | 17708 | ITF Indonesia F5, Men Singles | 0 |
| itf-men | 17808 | ITF Indonesia F6, Men Doubles | 0 |
| itf-men | 17806 | ITF Indonesia F6, Men Singles | 0 |
| itf-men | 39259 | ITF Iran F1, Men Doubles | 0 |
| itf-men | 39261 | ITF Iran F1, Men Singles | 0 |
| itf-men | 39311 | ITF Iran F2, Men Doubles | 0 |
| itf-men | 39973 | ITF Iran F3, Men Doubles | 0 |
| itf-men | 40011 | ITF Iran F4, Men Doubles | 0 |
| itf-men | 40009 | ITF Iran F4, Men Singles | 0 |
| itf-men | 43975 | ITF Iran F7 Men Doubles | 0 |
| itf-men | 43973 | ITF Iran F7 Men Singles | 0 |
| itf-men | 44051 | ITF Iran F8 Men Doubles | 0 |
| itf-men | 44049 | ITF Iran F8 Men Singles | 0 |
| itf-men | 16170 | ITF Ireland F1, Men Doubles | 0 |
| itf-men | 16168 | ITF Ireland F1, Men Singles | 0 |
| itf-men | 23973 | ITF Italy F1, Men Doubles | 0 |
| itf-men | 23971 | ITF Italy F1, Men Singles | 0 |
| itf-men | 17784 | ITF Italy F10, Men Doubles | 0 |
| itf-men | 17782 | ITF Italy F10, Men Singles | 0 |
| itf-men | 17948 | ITF Italy F11, Men Doubles | 0 |
| itf-men | 17946 | ITF Italy F11, Men Singles | 0 |
| itf-men | 15297 | ITF Italy F12, Men Doubles | 0 |
| itf-men | 15295 | ITF Italy F12, Men Singles | 0 |
| itf-men | 13673 | ITF Italy F14, Men Doubles | 0 |
| itf-men | 13671 | ITF Italy F14, Men Singles | 0 |
| itf-men | 18526 | ITF Italy F16, Men Doubles | 0 |
| itf-men | 18524 | ITF Italy F16, Men Singles | 0 |
| itf-men | 18728 | ITF Italy F17, Men Doubles | 0 |
| itf-men | 18726 | ITF Italy F17, Men Singles | 0 |
| itf-men | 18844 | ITF Italy F18, Men Doubles | 0 |
| itf-men | 18842 | ITF Italy F18, Men Singles | 0 |
| itf-men | 18970 | ITF Italy F19, Men Doubles | 0 |
| itf-men | 18968 | ITF Italy F19, Men Singles | 0 |
| itf-men | 17118 | ITF Italy F2, Men Doubles | 0 |
| itf-men | 17116 | ITF Italy F2, Men Singles | 0 |
| itf-men | 13949 | ITF Italy F21, Men Doubles | 0 |
| itf-men | 13947 | ITF Italy F21, Men Singles | 0 |
| itf-men | 16230 | ITF Italy F22, Men Doubles | 0 |
| itf-men | 16228 | ITF Italy F22, Men Singles | 0 |
| itf-men | 16468 | ITF Italy F23, Men Doubles | 0 |
| itf-men | 16466 | ITF Italy F23, Men Singles | 0 |
| itf-men | 14035 | ITF Italy F24, Men Doubles | 0 |
| itf-men | 14033 | ITF Italy F24, Men Singles | 0 |
| itf-men | 16924 | ITF Italy F25, Men Doubles | 0 |
| itf-men | 16922 | ITF Italy F25, Men Singles | 0 |
| itf-men | 17356 | ITF Italy F26, Men Doubles | 0 |
| itf-men | 17354 | ITF Italy F26, Men Singles | 0 |
| itf-men | 18252 | ITF Italy F27, Men Doubles | 0 |
| itf-men | 18250 | ITF Italy F27, Men Singles | 0 |
| itf-men | 14291 | ITF Italy F28, Men Doubles | 0 |
| itf-men | 14289 | ITF Italy F28, Men Singles | 0 |
| itf-men | 19324 | ITF Italy F29, Men Doubles | 0 |
| itf-men | 19322 | ITF Italy F29, Men Singles | 0 |
| itf-men | 13505 | ITF Italy F3, Men Doubles | 0 |
| itf-men | 13503 | ITF Italy F3, Men Singles | 0 |
| itf-men | 19572 | ITF Italy F30, Men Doubles | 0 |
| itf-men | 19570 | ITF Italy F30, Men Singles | 0 |
| itf-men | 19814 | ITF Italy F31, Men Doubles | 0 |
| itf-men | 19816 | ITF Italy F31, Men Singles | 0 |
| itf-men | 19992 | ITF Italy F32, Men Doubles | 0 |
| itf-men | 19990 | ITF Italy F32, Men Singles | 0 |
| itf-men | 20160 | ITF Italy F33, Men Doubles | 0 |
| itf-men | 20158 | ITF Italy F33, Men Singles | 0 |
| itf-men | 20396 | ITF Italy F34, Men Doubles | 0 |
| itf-men | 20394 | ITF Italy F34, Men Singles | 0 |
| itf-men | 20500 | ITF Italy F35, Men Doubles | 0 |
| itf-men | 20498 | ITF Italy F35, Men Singles | 0 |
| itf-men | 20752 | ITF Italy F36 Men Doubles | 0 |
| itf-men | 20750 | ITF Italy F36 Men Singles | 0 |
| itf-men | 44887 | ITF Italy F37, Men Doubles | 0 |
| itf-men | 44885 | ITF Italy F37, Men Singles | 0 |
| itf-men | 17618 | ITF Italy F4, Men Doubles | 0 |
| itf-men | 17616 | ITF Italy F4, Men Singles | 0 |
| itf-men | 17598 | ITF Italy F5, Men Doubles | 0 |
| itf-men | 17596 | ITF Italy F5, Men Singles | 0 |
| itf-men | 17432 | ITF Italy F6, Men Doubles | 0 |
| itf-men | 17430 | ITF Italy F6, Men Singles | 0 |
| itf-men | 17672 | ITF Italy F7, Men Doubles | 0 |
| itf-men | 17668 | ITF Italy F7, Men Singles | 0 |
| itf-men | 17814 | ITF Italy F8, Men Doubles | 0 |
| itf-men | 17812 | ITF Italy F8, Men Singles | 0 |
| itf-men | 42735 | ITF Jamaica F1, Men Doubles | 0 |
| itf-men | 42737 | ITF Jamaica F1, Men Singles | 0 |
| itf-men | 42797 | ITF Jamaica F2, Men Doubles | 0 |
| itf-men | 42795 | ITF Jamaica F2, Men Singles | 0 |
| itf-men | 42859 | ITF Jamaica F3, Men Doubles | 0 |
| itf-men | 42857 | ITF Jamaica F3, Men Singles | 0 |
| itf-men | 17338 | ITF Japan F1, Men Doubles | 0 |
| itf-men | 17336 | ITF Japan F1, Men Singles | 0 |
| itf-men | 43255 | ITF Japan F10, Men Doubles | 0 |
| itf-men | 43253 | ITF Japan F10, Men Singles | 0 |
| itf-men | 43863 | ITF Japan F11, Men Doubles | 0 |
| itf-men | 43861 | ITF Japan F11, Men Singles | 0 |
| itf-men | 43957 | ITF Japan F12, Men Doubles | 0 |
| itf-men | 43955 | ITF Japan F12, Men Singles | 0 |
| itf-men | 44687 | ITF Japan F13, Men Doubles | 0 |
| itf-men | 44689 | ITF Japan F13, Men Singles | 0 |
| itf-men | 17614 | ITF Japan F2, Men Doubles | 0 |
| itf-men | 17612 | ITF Japan F2, Men Singles | 0 |
| itf-men | 17448 | ITF Japan F3, Men Doubles | 0 |
| itf-men | 17446 | ITF Japan F3, Men Singles | 0 |
| itf-men | 17404 | ITF Japan F4, Men Doubles | 0 |
| itf-men | 17402 | ITF Japan F4, Men Singles | 0 |
| itf-men | 17722 | ITF Japan F5, Men Doubles | 0 |
| itf-men | 17720 | ITF Japan F5, Men Singles | 0 |
| itf-men | 18410 | ITF Japan F6, Men Doubles | 0 |
| itf-men | 18408 | ITF Japan F6, Men Singles | 0 |
| itf-men | 13767 | ITF Japan F7, Men Doubles | 0 |
| itf-men | 13765 | ITF Japan F7, Men Singles | 0 |
| itf-men | 18734 | ITF Japan F8, Men Doubles | 0 |
| itf-men | 18732 | ITF Japan F8, Men Singles | 0 |
| itf-men | 44591 | ITF Japan F9, Men Doubles | 0 |
| itf-men | 44589 | ITF Japan F9, Men Singles | 0 |
| itf-men | 15808 | ITF Kazakhstan F1, Men Doubles | 0 |
| itf-men | 15806 | ITF Kazakhstan F1, Men Singles | 0 |
| itf-men | 15874 | ITF Kazakhstan F2, Men Doubles | 0 |
| itf-men | 15872 | ITF Kazakhstan F2, Men Singles | 0 |
| itf-men | 17820 | ITF Kazakhstan F3, Men Doubles | 0 |
| itf-men | 17818 | ITF Kazakhstan F3, Men Singles | 0 |
| itf-men | 17874 | ITF Kazakhstan F4, Men Doubles | 0 |
| itf-men | 17872 | ITF Kazakhstan F4, Men Singles | 0 |
| itf-men | 17734 | ITF Kazakhstan F5, Men Doubles | 0 |
| itf-men | 17732 | ITF Kazakhstan F5, Men Singles | 0 |
| itf-men | 19578 | ITF Kazakhstan F6, Men Doubles | 0 |
| itf-men | 19576 | ITF Kazakhstan F6, Men Singles | 0 |
| itf-men | 19822 | ITF Kazakhstan F7, Men Doubles | 0 |
| itf-men | 19820 | ITF Kazakhstan F7, Men Singles | 0 |
| itf-men | 18448 | ITF Korea F1, Men Doubles | 0 |
| itf-men | 18446 | ITF Korea F1, Men Singles | 0 |
| itf-men | 13851 | ITF Korea F2, Men Doubles | 0 |
| itf-men | 13849 | ITF Korea F2, Men Singles | 0 |
| itf-men | 18740 | ITF Korea F3, Men Doubles | 0 |
| itf-men | 18738 | ITF Korea F3, Men Singles | 0 |
| itf-men | 21048 | ITF Kuwait F2, Men Doubles | 0 |
| itf-men | 21046 | ITF Kuwait F2, Men Singles | 0 |
| itf-men | 21320 | ITF Kuwait F3, Men Doubles | 0 |
| itf-men | 21318 | ITF Kuwait F3, Men Singles | 0 |
| itf-men | 41831 | ITF Kuwait F6, Men Doubles | 0 |
| itf-men | 41829 | ITF Kuwait F6, Men Singles | 0 |
| itf-men | 34752 | ITF Luxembourg F1, Men Doubles | 0 |
| itf-men | 34750 | ITF Luxembourg F1, Men Singles | 0 |
| itf-men | 40265 | ITF Luxembourg F2, Men Doubles | 0 |
| itf-men | 40267 | ITF Luxembourg F2, Men Singles | 0 |
| itf-men | 20426 | ITF Malaysia F1, Men Doubles | 0 |
| itf-men | 20424 | ITF Malaysia F1, Men Singles | 0 |
| itf-men | 20488 | ITF Malaysia F2, Men Doubles | 0 |
| itf-men | 20486 | ITF Malaysia F2, Men Singles | 0 |
| itf-men | 20744 | ITF Malaysia F3, Men Doubles | 0 |
| itf-men | 20738 | ITF Malaysia F3, Men Singles | 0 |
| itf-men | 15319 | ITF Mexico F1, Men Doubles | 0 |
| itf-men | 15317 | ITF Mexico F1, Men Singles | 0 |
| itf-men | 24764 | ITF Mexico F10, Men Doubles | 0 |
| itf-men | 24762 | ITF Mexico F10, Men Singles | 0 |
| itf-men | 15249 | ITF Mexico F2, Men Doubles | 0 |
| itf-men | 15247 | ITF Mexico F2, Men Singles | 0 |
| itf-men | 18004 | ITF Mexico F3, Men Doubles | 0 |
| itf-men | 18002 | ITF Mexico F3, Men Singles | 0 |
| itf-men | 18102 | ITF Mexico F4, Men Doubles | 0 |
| itf-men | 18100 | ITF Mexico F4, Men Singles | 0 |
| itf-men | 21166 | ITF Mexico F5, Men Doubles | 0 |
| itf-men | 21164 | ITF Mexico F5, Men Singles | 0 |
| itf-men | 21658 | ITF Mexico F6, Men Doubles | 0 |
| itf-men | 21656 | ITF Mexico F6, Men Singles | 0 |
| itf-men | 21740 | ITF Mexico F7, Men Doubles | 0 |
| itf-men | 21738 | ITF Mexico F7, Men Singles | 0 |
| itf-men | 22300 | ITF Mexico F8, Men Doubles | 0 |
| itf-men | 22298 | ITF Mexico F8, Men Singles | 0 |
| itf-men | 26838 | ITF Mexico F9, Men Doubles | 0 |
| itf-men | 26836 | ITF Mexico F9, Men Singles | 0 |
| itf-men | 16242 | ITF Morocco F1, Men Doubles | 0 |
| itf-men | 16240 | ITF Morocco F1, Men Singles | 0 |
| itf-men | 16504 | ITF Morocco F2, Men Doubles | 0 |
| itf-men | 16502 | ITF Morocco F2, Men Singles | 0 |
| itf-men | 16784 | ITF Morocco F3, Men Doubles | 0 |
| itf-men | 16782 | ITF Morocco F3, Men Singles | 0 |
| itf-men | 13571 | ITF Mozambique F1, Men Doubles | 0 |
| itf-men | 13569 | ITF Mozambique F1, Men Singles | 0 |
| itf-men | 18856 | ITF Netherlands F1, Men Doubles | 0 |
| itf-men | 18854 | ITF Netherlands F1, Men Singles | 0 |
| itf-men | 19188 | ITF Netherlands F4, Men Doubles | 0 |
| itf-men | 19186 | ITF Netherlands F4, Men Singles | 0 |
| itf-men | 17204 | ITF Netherlands F5, Men Doubles | 0 |
| itf-men | 17202 | ITF Netherlands F5, Men Singles | 0 |
| itf-men | 17502 | ITF Netherlands F6, Men Doubles | 0 |
| itf-men | 17500 | ITF Netherlands F6, Men Singles | 0 |
| itf-men | 14259 | ITF Netherlands F7, Men Doubles | 0 |
| itf-men | 14257 | ITF Netherlands F7, Men Singles | 0 |
| itf-men | 31577 | ITF New Zealand F1, Men Doubles | 0 |
| itf-men | 31573 | ITF New Zealand F1, Men Singles | 0 |
| itf-men | 38809 | ITF New Zealand F2, Men Doubles | 0 |
| itf-men | 38811 | ITF New Zealand F2, Men Singles | 0 |
| itf-men | 29936 | ITF Paraguay F1, Men Doubles | 0 |
| itf-men | 29934 | ITF Paraguay F1, Men Singles | 0 |
| itf-men | 44221 | ITF Paraguay F2 Men Doubles | 0 |
| itf-men | 44219 | ITF Paraguay F2 Men Singles | 0 |
| itf-men | 44063 | ITF Paraguay F3 Men Doubles | 0 |
| itf-men | 44061 | ITF Paraguay F3 Men Singles | 0 |
| itf-men | 22793 | ITF Peru F1, Men Doubles | 0 |
| itf-men | 22791 | ITF Peru F1, Men Singles | 0 |
| itf-men | 23307 | ITF Peru F2, Men Doubles | 0 |
| itf-men | 23305 | ITF Peru F2, Men Singles | 0 |
| itf-men | 18746 | ITF Poland F1, Men Doubles | 0 |
| itf-men | 18744 | ITF Poland F1, Men Singles | 0 |
| itf-men | 17458 | ITF Poland F10, Men Doubles | 0 |
| itf-men | 17456 | ITF Poland F10, Men Singles | 0 |
| itf-men | 18256 | ITF Poland F11, Men Doubles | 0 |
| itf-men | 18254 | ITF Poland F11, Men Singles | 0 |
| itf-men | 15516 | ITF Poland F2, Men Doubles | 0 |
| itf-men | 15514 | ITF Poland F2, Men Singles | 0 |
| itf-men | 40847 | ITF Poland F3B, Men Doubles | 0 |
| itf-men | 40845 | ITF Poland F3B, Men Singles | 0 |
| itf-men | 13809 | ITF Poland F4, Men Doubles | 0 |
| itf-men | 13807 | ITF Poland F4, Men Singles | 0 |
| itf-men | 15586 | ITF Poland F5, Men Doubles | 0 |
| itf-men | 15584 | ITF Poland F5, Men Singles | 0 |
| itf-men | 16248 | ITF Poland F6, Men Doubles | 0 |
| itf-men | 16246 | ITF Poland F6, Men Singles | 0 |
| itf-men | 16508 | ITF Poland F7, Men Doubles | 0 |
| itf-men | 16506 | ITF Poland F7, Men Singles | 0 |
| itf-men | 16788 | ITF Poland F8, Men Doubles | 0 |
| itf-men | 16786 | ITF Poland F8, Men Singles | 0 |
| itf-men | 17174 | ITF Poland F9, Men Doubles | 0 |
| itf-men | 17172 | ITF Poland F9, Men Singles | 0 |
| itf-men | 15950 | ITF Portugal F1, Men Doubles | 0 |
| itf-men | 17126 | ITF Portugal F1, Men Singles | 0 |
| itf-men | 16254 | ITF Portugal F12, Men Doubles | 0 |
| itf-men | 16252 | ITF Portugal F12, Men Singles | 0 |
| itf-men | 16512 | ITF Portugal F13, Men Doubles | 0 |
| itf-men | 16510 | ITF Portugal F13, Men Singles | 0 |
| itf-men | 16972 | ITF Portugal F15, Men Doubles | 0 |
| itf-men | 16970 | ITF Portugal F15, Men Singles | 0 |
| itf-men | 17362 | ITF Portugal F17, Men Doubles | 0 |
| itf-men | 17360 | ITF Portugal F17, Men Singles | 0 |
| itf-men | 18132 | ITF Portugal F18, Men Doubles | 0 |
| itf-men | 18130 | ITF Portugal F18, Men Singles | 0 |
| itf-men | 19614 | ITF Portugal F19, Men Doubles | 0 |
| itf-men | 19612 | ITF Portugal F19, Men Singles | 0 |
| itf-men | 17628 | ITF Portugal F2, Men Doubles | 0 |
| itf-men | 17630 | ITF Portugal F2, Men Singles | 0 |
| itf-men | 19828 | ITF Portugal F20, Men Doubles | 0 |
| itf-men | 19826 | ITF Portugal F20, Men Singles | 0 |
| itf-men | 20016 | ITF Portugal F21, Men Doubles | 0 |
| itf-men | 20014 | ITF Portugal F21, Men Singles | 0 |
| itf-men | 26960 | ITF Portugal F22, Men Doubles | 0 |
| itf-men | 26958 | ITF Portugal F22, Men Singles | 0 |
| itf-men | 44461 | ITF Portugal F23 Men Doubles | 0 |
| itf-men | 44459 | ITF Portugal F23, Men Singles | 0 |
| itf-men | 44869 | ITF Portugal F24, Men Doubles | 0 |
| itf-men | 44867 | ITF Portugal F24, Men Singles | 0 |
| itf-men | 44977 | ITF Portugal F25, Men Doubles | 0 |
| itf-men | 44975 | ITF Portugal F25, Men Singles | 0 |
| itf-men | 15035 | ITF Portugal F3, Men Doubles | 0 |
| itf-men | 15033 | ITF Portugal F3, Men Singles | 0 |
| itf-men | 17400 | ITF Portugal F4, Men Doubles | 0 |
| itf-men | 17398 | ITF Portugal F4, Men Singles | 0 |
| itf-men | 17826 | ITF Portugal F6, Men Doubles | 0 |
| itf-men | 17824 | ITF Portugal F6, Men Singles | 0 |
| itf-men | 15217 | ITF Portugal F7, Men Doubles | 0 |
| itf-men | 15215 | ITF Portugal F7, Men Singles | 0 |
| itf-men | 17740 | ITF Qatar F1, Men Doubles | 0 |
| itf-men | 17738 | ITF Qatar F1, Men Singles | 0 |
| itf-men | 17832 | ITF Qatar F2, Men Doubles | 0 |
| itf-men | 17830 | ITF Qatar F2, Men Singles | 0 |
| itf-men | 17882 | ITF Qatar F3, Men Doubles | 0 |
| itf-men | 17880 | ITF Qatar F3, Men Singles | 0 |
| itf-men | 22312 | ITF Qatar F4, Men Doubles | 0 |
| itf-men | 22310 | ITF Qatar F4, Men Singles | 0 |
| itf-men | 18108 | ITF Romania F1, Men Doubles | 0 |
| itf-men | 18106 | ITF Romania F1, Men Singles | 0 |
| itf-men | 17212 | ITF Romania F10, Men Doubles | 0 |
| itf-men | 17210 | ITF Romania F10, Men Singles | 0 |
| itf-men | 17368 | ITF Romania F11, Men Doubles | 0 |
| itf-men | 17366 | ITF Romania F11, Men Singles | 0 |
| itf-men | 18260 | ITF Romania F12, Men Doubles | 0 |
| itf-men | 18258 | ITF Romania F12, Men Singles | 0 |
| itf-men | 25173 | ITF Romania F13, Men Doubles | 0 |
| itf-men | 25171 | ITF Romania F13, Men Singles | 0 |
| itf-men | 43623 | ITF Romania F15, Men Doubles | 0 |
| itf-men | 43621 | ITF Romania F15, Men Singles | 0 |
| itf-men | 43707 | ITF Romania F16, Men Doubles | 0 |
| itf-men | 43705 | ITF Romania F16, Men Singles | 0 |
| itf-men | 43881 | ITF Romania F17, Men Doubles | 0 |
| itf-men | 43879 | ITF Romania F17, Men Singles | 0 |
| itf-men | 43987 | ITF Romania F18 Men Doubles | 0 |
| itf-men | 43985 | ITF Romania F18 Men Singles | 0 |
| itf-men | 44045 | ITF Romania F19 Men Doubles | 0 |
| itf-men | 44043 | ITF Romania F19 Men Singles | 0 |
| itf-men | 40937 | ITF Romania F1B, Men Doubles | 0 |
| itf-men | 40935 | ITF Romania F1B, Men Singles | 0 |
| itf-men | 18174 | ITF Romania F2, Men Doubles | 0 |
| itf-men | 18172 | ITF Romania F2, Men Singles | 0 |
| itf-men | 44141 | ITF Romania F20 Men Doubles | 0 |
| itf-men | 44139 | ITF Romania F20 Men Singles | 0 |
| itf-men | 18752 | ITF Romania F3, Men Doubles | 0 |
| itf-men | 18750 | ITF Romania F3, Men Singles | 0 |
| itf-men | 18864 | ITF Romania F4, Men Doubles | 0 |
| itf-men | 18862 | ITF Romania F4, Men Singles | 0 |
| itf-men | 13775 | ITF Romania F5, Men Doubles | 0 |
| itf-men | 13773 | ITF Romania F5, Men Singles | 0 |
| itf-men | 16516 | ITF Romania F7, Men Doubles | 0 |
| itf-men | 16514 | ITF Romania F7, Men Singles | 0 |
| itf-men | 16746 | ITF Romania F8, Men Doubles | 0 |
| itf-men | 16748 | ITF Romania F8, Men Singles | 0 |
| itf-men | 16978 | ITF Romania F9, Men Doubles | 0 |
| itf-men | 16976 | ITF Romania F9, Men Singles | 0 |
| itf-men | 40919 | ITF Rwanda F2, Men Doubles | 0 |
| itf-men | 40917 | ITF Rwanda F2, Men Singles | 0 |
| itf-men | 16990 | ITF Serbia F1, Men Doubles | 0 |
| itf-men | 16988 | ITF Serbia F1, Men Singles | 0 |
| itf-men | 40151 | ITF Serbia F10, Men Doubles | 0 |
| itf-men | 40153 | ITF Serbia F10, Men Singles | 0 |
| itf-men | 40407 | ITF Serbia F11, Men Doubles | 0 |
| itf-men | 40405 | ITF Serbia F11, Men Singles | 0 |
| itf-men | 40489 | ITF Serbia F12, Men Doubles | 0 |
| itf-men | 40487 | ITF Serbia F12, Men Singles | 0 |
| itf-men | 43073 | ITF Serbia F13, Men Doubles | 0 |
| itf-men | 43071 | ITF Serbia F13, Men Singles | 0 |
| itf-men | 43249 | ITF Serbia F14, Men Doubles | 0 |
| itf-men | 43247 | ITF Serbia F14, Men Singles | 0 |
| itf-men | 40777 | ITF Serbia F15, Men Doubles | 0 |
| itf-men | 40775 | ITF Serbia F15, Men Singles | 0 |
| itf-men | 40931 | ITF Serbia F16, Men Doubles | 0 |
| itf-men | 40929 | ITF Serbia F16, Men Singles | 0 |
| itf-men | 40997 | ITF Serbia F17, Men Doubles | 0 |
| itf-men | 40999 | ITF Serbia F17, Men Singles | 0 |
| itf-men | 40841 | ITF Serbia F18, Men Doubles | 0 |
| itf-men | 40839 | ITF Serbia F18, Men Singles | 0 |
| itf-men | 41061 | ITF Serbia F19, Men Doubles | 0 |
| itf-men | 41059 | ITF Serbia F19, Men Singles | 0 |
| itf-men | 17224 | ITF Serbia F2, Men Doubles | 0 |
| itf-men | 17222 | ITF Serbia F2, Men Singles | 0 |
| itf-men | 43629 | ITF Serbia F20, Men Doubles | 0 |
| itf-men | 43627 | ITF Serbia F20, Men Singles | 0 |
| itf-men | 43723 | ITF Serbia F21, Men Doubles | 0 |
| itf-men | 43721 | ITF Serbia F21, Men Singles | 0 |
| itf-men | 43875 | ITF Serbia F22, Men Doubles | 0 |
| itf-men | 43873 | ITF Serbia F22, Men Singles | 0 |
| itf-men | 43981 | ITF Serbia F23 Men Doubles | 0 |
| itf-men | 43979 | ITF Serbia F23 Men Singles | 0 |
| itf-men | 44057 | ITF Serbia F24 Men Doubles | 0 |
| itf-men | 44055 | ITF Serbia F24 Men Singles | 0 |
| itf-men | 44135 | ITF Serbia F25 Men Doubles | 0 |
| itf-men | 44133 | ITF Serbia F25 Men Singles | 0 |
| itf-men | 17510 | ITF Serbia F3, Men Doubles | 0 |
| itf-men | 17508 | ITF Serbia F3, Men Singles | 0 |
| itf-men | 18658 | ITF Serbia F5, Men Doubles | 0 |
| itf-men | 18656 | ITF Serbia F5, Men Singles | 0 |
| itf-men | 39909 | ITF Serbia F6, Men Doubles | 0 |
| itf-men | 39907 | ITF Serbia F6, Men Singles | 0 |
| itf-men | 39949 | ITF Serbia F7, Men Doubles | 0 |
| itf-men | 39951 | ITF Serbia F7, Men Singles | 0 |
| itf-men | 40017 | ITF Serbia F8, Men Doubles | 0 |
| itf-men | 40015 | ITF Serbia F8, Men Singles | 0 |
| itf-men | 40087 | ITF Serbia F9, Men Doubles | 0 |
| itf-men | 40085 | ITF Serbia F9, Men Singles | 0 |
| itf-men | 18386 | ITF Singapore F1, Men Doubles | 0 |
| itf-men | 18384 | ITF Singapore F1, Men Singles | 0 |
| itf-men | 16524 | ITF Slovakia F1, Men Doubles | 0 |
| itf-men | 16522 | ITF Slovakia F1, Men Singles | 0 |
| itf-men | 16794 | ITF Slovakia F2, Men Doubles | 0 |
| itf-men | 16796 | ITF Slovakia F2, Men Singles | 0 |
| itf-men | 16996 | ITF Slovakia F3, Men Doubles | 0 |
| itf-men | 16994 | ITF Slovakia F3, Men Singles | 0 |
| itf-men | 33840 | ITF Slovakia F4, Men Doubles | 0 |
| itf-men | 33838 | ITF Slovakia F4, Men Singles | 0 |
| itf-men | 33894 | ITF Slovakia F5, Men Doubles | 0 |
| itf-men | 33896 | ITF Slovakia F5, Men Singles | 0 |
| itf-men | 43289 | ITF Slovenia F10, Men Doubles | 0 |
| itf-men | 43287 | ITF Slovenia F10, Men Singles | 0 |
| itf-men | 43243 | ITF Slovenia F11, Men Doubles | 0 |
| itf-men | 43241 | ITF Slovenia F11, Men Singles | 0 |
| itf-men | 43563 | ITF Slovenia F13, Men Doubles | 0 |
| itf-men | 43565 | ITF Slovenia F13, Men Singles | 0 |
| itf-men | 43617 | ITF Slovenia F14, Men Doubles | 0 |
| itf-men | 43615 | ITF Slovenia F14, Men Singles | 0 |
| itf-men | 43717 | ITF Slovenia F15, Men Doubles | 0 |
| itf-men | 43715 | ITF Slovenia F15, Men Singles | 0 |
| itf-men | 37251 | ITF Slovenia F3, Men Doubles | 0 |
| itf-men | 37253 | ITF Slovenia F3, Men Singles | 0 |
| itf-men | 37687 | ITF Slovenia F5 Men Doubles | 0 |
| itf-men | 37685 | ITF Slovenia F5 Men Singles | 0 |
| itf-men | 37773 | ITF Slovenia F6, Men Doubles | 0 |
| itf-men | 37771 | ITF Slovenia F6, Men Singles | 0 |
| itf-men | 43141 | ITF Slovenia F8, Men Doubles | 0 |
| itf-men | 43139 | ITF Slovenia F8, Men Singles | 0 |
| itf-men | 21664 | ITF South Africa F1, Men Doubles | 0 |
| itf-men | 21662 | ITF South Africa F1, Men Singles | 0 |
| itf-men | 35861 | ITF South Africa F4, Men Doubles | 0 |
| itf-men | 35859 | ITF South Africa F4, Men Singles | 0 |
| itf-men | 43067 | ITF South Africa F5, Men Doubles | 0 |
| itf-men | 43065 | ITF South Africa F5, Men Singles | 0 |
| itf-men | 43147 | ITF South Africa F6, Men Doubles | 0 |
| itf-men | 43145 | ITF South Africa F6, Men Singles | 0 |
| itf-men | 45285 | ITF South Africa F7, Men Doubles | 0 |
| itf-men | 45283 | ITF South Africa F7, Men Singles | 0 |
| itf-men | 15788 | ITF Spain F1, Men Doubles | 0 |
| itf-men | 15786 | ITF Spain F1, Men Singles | 0 |
| itf-men | 17678 | ITF Spain F10, Men Doubles | 0 |
| itf-men | 17676 | ITF Spain F10, Men Singles | 0 |
| itf-men | 17716 | ITF Spain F11, Men Doubles | 0 |
| itf-men | 17714 | ITF Spain F11, Men Singles | 0 |
| itf-men | 17918 | ITF Spain F12, Men Doubles | 0 |
| itf-men | 17916 | ITF Spain F12, Men Singles | 0 |
| itf-men | 18010 | ITF Spain F13, Men Doubles | 0 |
| itf-men | 18008 | ITF Spain F13, Men Singles | 0 |
| itf-men | 18390 | ITF Spain F15, Men Doubles | 0 |
| itf-men | 18388 | ITF Spain F15, Men Singles | 0 |
| itf-men | 13781 | ITF Spain F16, Men Doubles | 0 |
| itf-men | 13779 | ITF Spain F16, Men Singles | 0 |
| itf-men | 18800 | ITF Spain F18, Men Doubles | 0 |
| itf-men | 18798 | ITF Spain F18, Men Singles | 0 |
| itf-men | 18938 | ITF Spain F19, Men Doubles | 0 |
| itf-men | 18936 | ITF Spain F19, Men Singles | 0 |
| itf-men | 15820 | ITF Spain F2, Men Doubles | 0 |
| itf-men | 15818 | ITF Spain F2, Men Singles | 0 |
| itf-men | 19030 | ITF Spain F20, Men Doubles | 0 |
| itf-men | 19028 | ITF Spain F20, Men Singles | 0 |
| itf-men | 19144 | ITF Spain F21, Men Doubles | 0 |
| itf-men | 19142 | ITF Spain F21, Men Singles | 0 |
| itf-men | 16176 | ITF Spain F22, Men Doubles | 0 |
| itf-men | 16174 | ITF Spain F22, Men Singles | 0 |
| itf-men | 16472 | ITF Spain F23, Men Doubles | 0 |
| itf-men | 16470 | ITF Spain F23, Men Singles | 0 |
| itf-men | 25911 | ITF Spain F24, Men Doubles | 0 |
| itf-men | 25909 | ITF Spain F24, Men Singles | 0 |
| itf-men | 17230 | ITF Spain F25, Men Doubles | 0 |
| itf-men | 17228 | ITF Spain F25, Men Singles | 0 |
| itf-men | 17464 | ITF Spain F26, Men Doubles | 0 |
| itf-men | 17462 | ITF Spain F26, Men Singles | 0 |
| itf-men | 18240 | ITF Spain F27, Men Doubles | 0 |
| itf-men | 18238 | ITF Spain F27, Men Singles | 0 |
| itf-men | 14253 | ITF Spain F28, Men Doubles | 0 |
| itf-men | 14251 | ITF Spain F28, Men Singles | 0 |
| itf-men | 16258 | ITF Spain F3, Men Doubles | 0 |
| itf-men | 16256 | ITF Spain F3, Men Singles | 0 |
| itf-men | 19584 | ITF Spain F30, Men Doubles | 0 |
| itf-men | 19582 | ITF Spain F30, Men Singles | 0 |
| itf-men | 19838 | ITF Spain F31, Men Doubles | 0 |
| itf-men | 19836 | ITF Spain F31, Men Singles | 0 |
| itf-men | 20022 | ITF Spain F32, Men Doubles | 0 |
| itf-men | 20020 | ITF Spain F32, Men Singles | 0 |
| itf-men | 20118 | ITF Spain F33, Men Doubles | 0 |
| itf-men | 20116 | ITF Spain F33, Men Singles | 0 |
| itf-men | 30893 | ITF Spain F34, Men Doubles | 0 |
| itf-men | 30891 | ITF Spain F34, Men Singles | 0 |
| itf-men | 41136 | ITF Spain F35 Men Doubles | 0 |
| itf-men | 41138 | ITF Spain F35 Men Singles | 0 |
| itf-men | 41780 | ITF Spain F36 Men Doubles | 0 |
| itf-men | 41782 | ITF Spain F36 Men Singles | 0 |
| itf-men | 41430 | ITF Spain F37, Men Doubles | 0 |
| itf-men | 41428 | ITF Spain F37, Men Singles | 0 |
| itf-men | 45291 | ITF Spain F38, Men Doubles | 0 |
| itf-men | 45289 | ITF Spain F38, Men Singles | 0 |
| itf-men | 6129 | ITF Spain F39 Men Doubles | 0 |
| itf-men | 6127 | ITF Spain F39 Men Singles | 0 |
| itf-men | 16002 | ITF Spain F4, Men Doubles | 0 |
| itf-men | 16852 | ITF Spain F4, Men Singles | 0 |
| itf-men | 41190 | ITF Spain F40, Men Doubles | 0 |
| itf-men | 41192 | ITF Spain F40, Men Singles | 0 |
| itf-men | 41849 | ITF Spain F41, Men Doubles | 0 |
| itf-men | 41847 | ITF Spain F41, Men Singles | 0 |
| itf-men | 41694 | ITF Spain F42, Men Doubles | 0 |
| itf-men | 41696 | ITF Spain F42, Men Singles | 0 |
| itf-men | 43969 | ITF Spain F43, Men Doubles | 0 |
| itf-men | 43967 | ITF Spain F43, Men Singles | 0 |
| itf-men | 44761 | ITF Spain F44, Men Doubles | 0 |
| itf-men | 44759 | ITF Spain F44, Men Singles | 0 |
| itf-men | 44875 | ITF Spain F45, Men Doubles | 0 |
| itf-men | 44873 | ITF Spain F45, Men Singles | 0 |
| itf-men | 44479 | ITF Spain F46, Men Doubles | 0 |
| itf-men | 44477 | ITF Spain F46, Men Singles | 0 |
| itf-men | 44987 | ITF Spain F47, Men Doubles | 0 |
| itf-men | 44985 | ITF Spain F47, Men Singles | 0 |
| itf-men | 45105 | ITF Spain F48, Men Doubles | 0 |
| itf-men | 45103 | ITF Spain F48, Men Singles | 0 |
| itf-men | 16876 | ITF Spain F5, Men Doubles | 0 |
| itf-men | 16874 | ITF Spain F5, Men Singles | 0 |
| itf-men | 14947 | ITF Spain F6, Men Doubles | 0 |
| itf-men | 14945 | ITF Spain F6, Men Singles | 0 |
| itf-men | 15073 | ITF Spain F7, Men Doubles | 0 |
| itf-men | 15071 | ITF Spain F7, Men Singles | 0 |
| itf-men | 17444 | ITF Spain F8, Men Doubles | 0 |
| itf-men | 17442 | ITF Spain F8, Men Singles | 0 |
| itf-men | 17428 | ITF Spain F9, Men Doubles | 0 |
| itf-men | 17426 | ITF Spain F9, Men Singles | 0 |
| itf-men | 17982 | ITF Sweden F1, Men Doubles | 0 |
| itf-men | 17980 | ITF Sweden F1, Men Singles | 0 |
| itf-men | 18072 | ITF Sweden F2, Men Doubles | 0 |
| itf-men | 18070 | ITF Sweden F2, Men Singles | 0 |
| itf-men | 19844 | ITF Sweden F3, Men Doubles | 0 |
| itf-men | 19842 | ITF Sweden F3, Men Singles | 0 |
| itf-men | 19998 | ITF Sweden F4, Men Doubles | 0 |
| itf-men | 19996 | ITF Sweden F4, Men Singles | 0 |
| itf-men | 13553 | ITF Sweden F5, Men Doubles | 0 |
| itf-men | 13551 | ITF Sweden F5, Men Singles | 0 |
| itf-men | 13451 | ITF Switzerland F1, Men Doubles | 0 |
| itf-men | 15994 | ITF Switzerland F1, Men Singles | 0 |
| itf-men | 14909 | ITF Switzerland F2, Men Doubles | 0 |
| itf-men | 14907 | ITF Switzerland F2, Men Singles | 0 |
| itf-men | 14157 | ITF Switzerland F3, Men Doubles | 0 |
| itf-men | 14155 | ITF Switzerland F3, Men Singles | 0 |
| itf-men | 18268 | ITF Switzerland F5, Men Doubles | 0 |
| itf-men | 18266 | ITF Switzerland F5, Men Singles | 0 |
| itf-men | 18538 | ITF Thailand F1, Men Doubles | 0 |
| itf-men | 18536 | ITF Thailand F1, Men Singles | 0 |
| itf-men | 21746 | ITF Thailand F10, Men Doubles | 0 |
| itf-men | 21732 | ITF Thailand F10, Men Singles | 0 |
| itf-men | 22154 | ITF Thailand F11, Men Doubles | 0 |
| itf-men | 22152 | ITF Thailand F11, Men Singles | 0 |
| itf-men | 18766 | ITF Thailand F2, Men Doubles | 0 |
| itf-men | 18764 | ITF Thailand F2, Men Singles | 0 |
| itf-men | 18882 | ITF Thailand F3, Men Doubles | 0 |
| itf-men | 18880 | ITF Thailand F3, Men Singles | 0 |
| itf-men | 16800 | ITF Thailand F4, Men Doubles | 0 |
| itf-men | 16798 | ITF Thailand F4, Men Singles | 0 |
| itf-men | 17002 | ITF Thailand F5, Men Doubles | 0 |
| itf-men | 17000 | ITF Thailand F5, Men Singles | 0 |
| itf-men | 17266 | ITF Thailand F6, Men Doubles | 0 |
| itf-men | 17264 | ITF Thailand F6, Men Singles | 0 |
| itf-men | 20028 | ITF Thailand F7, Men Doubles | 0 |
| itf-men | 20026 | ITF Thailand F7, Men Singles | 0 |
| itf-men | 20256 | ITF Thailand F8, Men Doubles | 0 |
| itf-men | 20254 | ITF Thailand F8, Men Singles | 0 |
| itf-men | 20298 | ITF Thailand F9, Men Doubles | 0 |
| itf-men | 20296 | ITF Thailand F9, Men Singles | 0 |
| itf-men | 15764 | ITF Tunisia F1, Men Doubles | 0 |
| itf-men | 15762 | ITF Tunisia F1, Men Singles | 0 |
| itf-men | 17752 | ITF Tunisia F13, Men Doubles | 0 |
| itf-men | 17750 | ITF Tunisia F13, Men Singles | 0 |
| itf-men | 17888 | ITF Tunisia F15, Men Doubles | 0 |
| itf-men | 17886 | ITF Tunisia F15, Men Singles | 0 |
| itf-men | 17696 | ITF Tunisia F16, Men Doubles | 0 |
| itf-men | 17698 | ITF Tunisia F16, Men Singles | 0 |
| itf-men | 17956 | ITF Tunisia F17, Men Doubles | 0 |
| itf-men | 17954 | ITF Tunisia F17, Men Singles | 0 |
| itf-men | 18120 | ITF Tunisia F19, Men Doubles | 0 |
| itf-men | 18118 | ITF Tunisia F19, Men Singles | 0 |
| itf-men | 15792 | ITF Tunisia F2, Men Doubles | 0 |
| itf-men | 15790 | ITF Tunisia F2, Men Singles | 0 |
| itf-men | 18394 | ITF Tunisia F20, Men Doubles | 0 |
| itf-men | 18392 | ITF Tunisia F20, Men Singles | 0 |
| itf-men | 18456 | ITF Tunisia F21, Men Doubles | 0 |
| itf-men | 18454 | ITF Tunisia F21, Men Singles | 0 |
| itf-men | 18544 | ITF Tunisia F22, Men Doubles | 0 |
| itf-men | 18542 | ITF Tunisia F22, Men Singles | 0 |
| itf-men | 18772 | ITF Tunisia F23, Men Doubles | 0 |
| itf-men | 18770 | ITF Tunisia F23, Men Singles | 0 |
| itf-men | 18888 | ITF Tunisia F24, Men Doubles | 0 |
| itf-men | 18886 | ITF Tunisia F24, Men Singles | 0 |
| itf-men | 18664 | ITF Tunisia F25, Men Doubles | 0 |
| itf-men | 18662 | ITF Tunisia F25, Men Singles | 0 |
| itf-men | 19378 | ITF Tunisia F26, Men Doubles | 0 |
| itf-men | 19376 | ITF Tunisia F26, Men Singles | 0 |
| itf-men | 19620 | ITF Tunisia F27, Men Doubles | 0 |
| itf-men | 19618 | ITF Tunisia F27, Men Singles | 0 |
| itf-men | 19868 | ITF Tunisia F28, Men Doubles | 0 |
| itf-men | 19866 | ITF Tunisia F28, Men Singles | 0 |
| itf-men | 20034 | ITF Tunisia F29, Men Doubles | 0 |
| itf-men | 20032 | ITF Tunisia F29, Men Singles | 0 |
| itf-men | 15844 | ITF Tunisia F3, Men Doubles | 0 |
| itf-men | 15842 | ITF Tunisia F3, Men Singles | 0 |
| itf-men | 20270 | ITF Tunisia F30, Men Doubles | 0 |
| itf-men | 20266 | ITF Tunisia F30, Men Singles | 0 |
| itf-men | 20432 | ITF Tunisia F31, Men Doubles | 0 |
| itf-men | 20430 | ITF Tunisia F31, Men Singles | 0 |
| itf-men | 20636 | ITF Tunisia F32, Men Doubles | 0 |
| itf-men | 20634 | ITF Tunisia F32, Men Singles | 0 |
| itf-men | 20806 | ITF Tunisia F33, Men Doubles | 0 |
| itf-men | 20804 | ITF Tunisia F33, Men Singles | 0 |
| itf-men | 21060 | ITF Tunisia F34, Men Doubles | 0 |
| itf-men | 21058 | ITF Tunisia F34, Men Singles | 0 |
| itf-men | 21346 | ITF Tunisia F35, Men Doubles | 0 |
| itf-men | 21344 | ITF Tunisia F35, Men Singles | 0 |
| itf-men | 21676 | ITF Tunisia F36, Men Doubles | 0 |
| itf-men | 21674 | ITF Tunisia F36, Men Singles | 0 |
| itf-men | 21744 | ITF Tunisia F37, Men Doubles | 0 |
| itf-men | 21742 | ITF Tunisia F37, Men Singles | 0 |
| itf-men | 22148 | ITF Tunisia F38, Men Doubles | 0 |
| itf-men | 22146 | ITF Tunisia F38, Men Singles | 0 |
| itf-men | 22675 | ITF Tunisia F39, Men Doubles | 0 |
| itf-men | 22673 | ITF Tunisia F39, Men Singles | 0 |
| itf-men | 16262 | ITF Tunisia F4, Men Doubles | 0 |
| itf-men | 16260 | ITF Tunisia F4, Men Singles | 0 |
| itf-men | 23193 | ITF Tunisia F40, Men Doubles | 0 |
| itf-men | 23191 | ITF Tunisia F40, Men Singles | 0 |
| itf-men | 24486 | ITF Tunisia F41, Men Doubles | 0 |
| itf-men | 24484 | ITF Tunisia F41, Men Singles | 0 |
| itf-men | 25409 | ITF Tunisia F42, Men Doubles | 0 |
| itf-men | 25407 | ITF Tunisia F42, Men Singles | 0 |
| itf-men | 24111 | ITF Tunisia F43, Men Doubles | 0 |
| itf-men | 24109 | ITF Tunisia F43, Men Singles | 0 |
| itf-men | 24758 | ITF Tunisia F44, Men Doubles | 0 |
| itf-men | 24756 | ITF Tunisia F44, Men Singles | 0 |
| itf-men | 25415 | ITF Tunisia F45, Men Doubles | 0 |
| itf-men | 25413 | ITF Tunisia F45, Men Singles | 0 |
| itf-men | 30770 | ITF Tunisia F46, Men Doubles | 0 |
| itf-men | 30772 | ITF Tunisia F46, Men Singles | 0 |
| itf-men | 30933 | ITF Tunisia F47, Men Doubles | 0 |
| itf-men | 30935 | ITF Tunisia F47, Men Singles | 0 |
| itf-men | 31075 | ITF Tunisia F48, Men Doubles | 0 |
| itf-men | 31077 | ITF Tunisia F48, Men Singles | 0 |
| itf-men | 31145 | ITF Tunisia F49, Men Doubles | 0 |
| itf-men | 31143 | ITF Tunisia F49, Men Singles | 0 |
| itf-men | 16854 | ITF Tunisia F5, Men Doubles | 0 |
| itf-men | 16004 | ITF Tunisia F5, Men Singles | 0 |
| itf-men | 31343 | ITF Tunisia F50, Men Doubles | 0 |
| itf-men | 31341 | ITF Tunisia F50, Men Singles | 0 |
| itf-men | 31425 | ITF Tunisia F51, Men Doubles | 0 |
| itf-men | 31427 | ITF Tunisia F51, Men Singles | 0 |
| itf-men | 31521 | ITF Tunisia F52, Men Doubles | 0 |
| itf-men | 31523 | ITF Tunisia F52, Men Singles | 0 |
| itf-men | 31563 | ITF Tunisia F53, Men Doubles | 0 |
| itf-men | 31561 | ITF Tunisia F53, Men Singles | 0 |
| itf-men | 38323 | ITF Tunisia F54, Men Doubles | 0 |
| itf-men | 38327 | ITF Tunisia F54, Men Singles | 0 |
| itf-men | 38399 | ITF Tunisia F55, Men Doubles | 0 |
| itf-men | 38401 | ITF Tunisia F55, Men Singles | 0 |
| itf-men | 38475 | ITF Tunisia F56, Men Doubles | 0 |
| itf-men | 38477 | ITF Tunisia F56, Men Singles | 0 |
| itf-men | 38481 | ITF Tunisia F57, Men Doubles | 0 |
| itf-men | 38483 | ITF Tunisia F57, Men Singles | 0 |
| itf-men | 38625 | ITF Tunisia F58 Men Singles | 0 |
| itf-men | 38623 | ITF Tunisia F58, Men Doubles | 0 |
| itf-men | 38629 | ITF Tunisia F59 Men Doubles | 0 |
| itf-men | 38631 | ITF Tunisia F59 Men Singles | 0 |
| itf-men | 16880 | ITF Tunisia F6, Men Doubles | 0 |
| itf-men | 16878 | ITF Tunisia F6, Men Singles | 0 |
| itf-men | 38713 | ITF Tunisia F60 Men Doubles | 0 |
| itf-men | 38715 | ITF Tunisia F60, Men Singles | 0 |
| itf-men | 38753 | ITF Tunisia F61 Men Doubles | 0 |
| itf-men | 38755 | ITF Tunisia F61 Men Singles | 0 |
| itf-men | 38817 | ITF Tunisia F62, Men Doubles | 0 |
| itf-men | 38819 | ITF Tunisia F62, Men Singles | 0 |
| itf-men | 38853 | ITF Tunisia F63, Men Doubles | 0 |
| itf-men | 38855 | ITF Tunisia F63, Men Singles | 0 |
| itf-men | 45099 | ITF Tunisia F64, Men Doubles | 0 |
| itf-men | 45097 | ITF Tunisia F64, Men Singles | 0 |
| itf-men | 17088 | ITF Tunisia F7, Men Doubles | 0 |
| itf-men | 17086 | ITF Tunisia F7, Men Singles | 0 |
| itf-men | 17128 | ITF Tunisia F8, Men Doubles | 0 |
| itf-men | 16126 | ITF Tunisia F8, Men Singles | 0 |
| itf-men | 17634 | ITF Tunisia F9, Men Doubles | 0 |
| itf-men | 17632 | ITF Tunisia F9, Men Singles | 0 |
| itf-men | 15768 | ITF Turkey F1, Men Doubles | 0 |
| itf-men | 15766 | ITF Turkey F1, Men Singles | 0 |
| itf-men | 17606 | ITF Turkey F10, Men Doubles | 0 |
| itf-men | 17604 | ITF Turkey F10, Men Singles | 0 |
| itf-men | 17436 | ITF Turkey F11, Men Doubles | 0 |
| itf-men | 17434 | ITF Turkey F11, Men Singles | 0 |
| itf-men | 17392 | ITF Turkey F12 Men Doubles | 0 |
| itf-men | 17390 | ITF Turkey F12 Men Singles | 0 |
| itf-men | 17764 | ITF Turkey F13, Men Doubles | 0 |
| itf-men | 17762 | ITF Turkey F13, Men Singles | 0 |
| itf-men | 17844 | ITF Turkey F14, Men Doubles | 0 |
| itf-men | 17842 | ITF Turkey F14, Men Singles | 0 |
| itf-men | 17894 | ITF Turkey F15, Men Doubles | 0 |
| itf-men | 17892 | ITF Turkey F15, Men Singles | 0 |
| itf-men | 17690 | ITF Turkey F16, Men Doubles | 0 |
| itf-men | 17688 | ITF Turkey F16, Men Singles | 0 |
| itf-men | 17962 | ITF Turkey F17, Men Doubles | 0 |
| itf-men | 17960 | ITF Turkey F17, Men Singles | 0 |
| itf-men | 18022 | ITF Turkey F18, Men Doubles | 0 |
| itf-men | 18020 | ITF Turkey F18, Men Singles | 0 |
| itf-men | 18138 | ITF Turkey F19, Men Doubles | 0 |
| itf-men | 18136 | ITF Turkey F19, Men Singles | 0 |
| itf-men | 15796 | ITF Turkey F2, Men Doubles | 0 |
| itf-men | 15794 | ITF Turkey F2, Men Singles | 0 |
| itf-men | 15848 | ITF Turkey F3, Men Doubles | 0 |
| itf-men | 15846 | ITF Turkey F3, Men Singles | 0 |
| itf-men | 16640 | ITF Turkey F4, Men Doubles | 0 |
| itf-men | 15990 | ITF Turkey F4, Men Singles | 0 |
| itf-men | 16856 | ITF Turkey F5, Men Doubles | 0 |
| itf-men | 16006 | ITF Turkey F5, Men Singles | 0 |
| itf-men | 17076 | ITF Turkey F6, Men Doubles | 0 |
| itf-men | 17074 | ITF Turkey F6, Men Singles | 0 |
| itf-men | 17096 | ITF Turkey F7, Men Doubles | 0 |
| itf-men | 17094 | ITF Turkey F7, Men Singles | 0 |
| itf-men | 17130 | ITF Turkey F8, Men Doubles | 0 |
| itf-men | 16128 | ITF Turkey F8, Men Singles | 0 |
| itf-men | 17646 | ITF Turkey F9, Men Doubles | 0 |
| itf-men | 17644 | ITF Turkey F9, Men Singles | 0 |
| itf-men | 18568 | ITF Turkiye F23, Men Doubles | 0 |
| itf-men | 18566 | ITF Turkiye F23, Men Singles | 0 |
| itf-men | 18894 | ITF Turkiye F24, Men Doubles | 0 |
| itf-men | 18892 | ITF Turkiye F24, Men Singles | 0 |
| itf-men | 13839 | ITF Turkiye F25, Men Doubles | 0 |
| itf-men | 13837 | ITF Turkiye F25, Men Singles | 0 |
| itf-men | 16528 | ITF Turkiye F27, Men Doubles | 0 |
| itf-men | 16526 | ITF Turkiye F27, Men Singles | 0 |
| itf-men | 16752 | ITF Turkiye F28, Men Doubles | 0 |
| itf-men | 16750 | ITF Turkiye F28, Men Singles | 0 |
| itf-men | 17008 | ITF Turkiye F29, Men Doubles | 0 |
| itf-men | 17006 | ITF Turkiye F29, Men Singles | 0 |
| itf-men | 44881 | ITF Turkiye F30, Men Doubles | 0 |
| itf-men | 44879 | ITF Turkiye F30, Men Singles | 0 |
| itf-men | 45041 | ITF Turkiye F31, Men Doubles | 0 |
| itf-men | 45039 | ITF Turkiye F31, Men Singles | 0 |
| itf-men | 45093 | ITF Turkiye F32, Men Doubles | 0 |
| itf-men | 45091 | ITF Turkiye F32, Men Singles | 0 |
| itf-men | 18590 | ITF Turkiye F33, Men Doubles | 0 |
| itf-men | 18588 | ITF Turkiye F33, Men Singles | 0 |
| itf-men | 19210 | ITF Turkiye F34, Men Doubles | 0 |
| itf-men | 19208 | ITF Turkiye F34, Men Singles | 0 |
| itf-men | 19530 | ITF Turkiye F35, Men Doubles | 0 |
| itf-men | 19528 | ITF Turkiye F35, Men Singles | 0 |
| itf-men | 19760 | ITF Turkiye F36, Men Doubles | 0 |
| itf-men | 19758 | ITF Turkiye F36, Men Singles | 0 |
| itf-men | 19954 | ITF Turkiye F37, Men Doubles | 0 |
| itf-men | 19952 | ITF Turkiye F37, Men Singles | 0 |
| itf-men | 44579 | ITF Turkiye F38, Men Doubles | 0 |
| itf-men | 44577 | ITF Turkiye F38, Men Singles | 0 |
| itf-men | 20292 | ITF Turkiye F39, Men Doubles | 0 |
| itf-men | 20290 | ITF Turkiye F39, Men Singles | 0 |
| itf-men | 24576 | ITF Uganda F1, Men Doubles | 0 |
| itf-men | 24574 | ITF Uganda F1, Men Singles | 0 |
| itf-men | 24504 | ITF Uganda F2, Men Doubles | 0 |
| itf-men | 24502 | ITF Uganda F2, Men Singles | 0 |
| itf-men | 31349 | ITF Uruguay F1, Men Doubles | 0 |
| itf-men | 31347 | ITF Uruguay F1, Men Singles | 0 |
| itf-men | 42201 | ITF Uruguay F2, Men Doubles | 0 |
| itf-men | 42199 | ITF Uruguay F2, Men Singles | 0 |
| itf-men | 42347 | ITF Uruguay F3, Men Doubles | 0 |
| itf-men | 42349 | ITF Uruguay F3, Men Singles | 0 |
| itf-men | 42395 | ITF Uruguay F4, Men Doubles | 0 |
| itf-men | 42393 | ITF Uruguay F4, Men Singles | 0 |
| itf-men | 15744 | ITF USA F1, Men Doubles | 0 |
| itf-men | 15742 | ITF USA F1, Men Singles | 0 |
| itf-men | 17654 | ITF USA F10, Men Doubles | 0 |
| itf-men | 17652 | ITF USA F10, Men Singles | 0 |
| itf-men | 17594 | ITF USA F11, Men Doubles | 0 |
| itf-men | 17592 | ITF USA F11, Men Singles | 0 |
| itf-men | 13577 | ITF USA F12, Men Doubles | 0 |
| itf-men | 13575 | ITF USA F12, Men Singles | 0 |
| itf-men | 17778 | ITF USA F13, Men Doubles | 0 |
| itf-men | 17776 | ITF USA F13, Men Singles | 0 |
| itf-men | 17900 | ITF USA F14, Men Doubles | 0 |
| itf-men | 17898 | ITF USA F14, Men Singles | 0 |
| itf-men | 17670 | ITF USA F15, Men Doubles | 0 |
| itf-men | 17664 | ITF USA F15, Men Singles | 0 |
| itf-men | 17968 | ITF USA F16, Men Doubles | 0 |
| itf-men | 17966 | ITF USA F16, Men Singles | 0 |
| itf-men | 18574 | ITF USA F17, Men Doubles | 0 |
| itf-men | 18572 | ITF USA F17, Men Singles | 0 |
| itf-men | 18778 | ITF USA F18, Men Doubles | 0 |
| itf-men | 18776 | ITF USA F18, Men Singles | 0 |
| itf-men | 18806 | ITF USA F19, Men Doubles | 0 |
| itf-men | 18804 | ITF USA F19, Men Singles | 0 |
| itf-men | 15752 | ITF USA F2, Men Doubles | 0 |
| itf-men | 15750 | ITF USA F2, Men Singles | 0 |
| itf-men | 18900 | ITF USA F20, Men Doubles | 0 |
| itf-men | 18898 | ITF USA F20, Men Singles | 0 |
| itf-men | 18944 | ITF USA F21, Men Doubles | 0 |
| itf-men | 18942 | ITF USA F21, Men Singles | 0 |
| itf-men | 19000 | ITF USA F22, Men Doubles | 0 |
| itf-men | 18998 | ITF USA F22, Men Singles | 0 |
| itf-men | 19036 | ITF USA F23, Men Doubles | 0 |
| itf-men | 19034 | ITF USA F23, Men Singles | 0 |
| itf-men | 16476 | ITF USA F25, Men Doubles | 0 |
| itf-men | 16474 | ITF USA F25, Men Singles | 0 |
| itf-men | 16754 | ITF USA F26, Men Doubles | 0 |
| itf-men | 16756 | ITF USA F26, Men Singles | 0 |
| itf-men | 25553 | ITF USA F28B, Men Doubles | 0 |
| itf-men | 25551 | ITF USA F28B, Men Singles | 0 |
| itf-men | 25879 | ITF USA F29, Men Doubles | 0 |
| itf-men | 25877 | ITF USA F29, Men Singles | 0 |
| itf-men | 15772 | ITF USA F3, Men Doubles | 0 |
| itf-men | 15770 | ITF USA F3, Men Singles | 0 |
| itf-men | 14371 | ITF USA F30, Men Doubles | 0 |
| itf-men | 14369 | ITF USA F30, Men Singles | 0 |
| itf-men | 19628 | ITF USA F31, Men Doubles | 0 |
| itf-men | 19626 | ITF USA F31, Men Singles | 0 |
| itf-men | 19754 | ITF USA F32, Men Doubles | 0 |
| itf-men | 19752 | ITF USA F32, Men Singles | 0 |
| itf-men | 20176 | ITF USA F33, Men Doubles | 0 |
| itf-men | 20174 | ITF USA F33, Men Singles | 0 |
| itf-men | 20814 | ITF USA F35, Men Doubles | 0 |
| itf-men | 20812 | ITF USA F35, Men Singles | 0 |
| itf-men | 21072 | ITF USA F36, Men Doubles | 0 |
| itf-men | 21070 | ITF USA F36, Men Singles | 0 |
| itf-men | 21352 | ITF USA F37, Men Doubles | 0 |
| itf-men | 21350 | ITF USA F37, Men Singles | 0 |
| itf-men | 21554 | ITF USA F38, Men Doubles | 0 |
| itf-men | 21552 | ITF USA F38, Men Singles | 0 |
| itf-men | 21770 | ITF USA F39, Men Doubles | 0 |
| itf-men | 21768 | ITF USA F39, Men Singles | 0 |
| itf-men | 15800 | ITF USA F4, Men Doubles | 0 |
| itf-men | 15798 | ITF USA F4, Men Singles | 0 |
| itf-men | 22270 | ITF USA F40, Men Doubles | 0 |
| itf-men | 22268 | ITF USA F40, Men Singles | 0 |
| itf-men | 27164 | ITF USA F41, Men Doubles | 0 |
| itf-men | 27162 | ITF USA F41, Men Singles | 0 |
| itf-men | 30716 | ITF USA F42, Men Doubles | 0 |
| itf-men | 30714 | ITF USA F42, Men Singles | 0 |
| itf-men | 30923 | ITF USA F43, Men Doubles | 0 |
| itf-men | 30921 | ITF USA F43, Men Singles | 0 |
| itf-men | 38393 | ITF USA F44, Men Doubles | 0 |
| itf-men | 38395 | ITF USA F44, Men Singles | 0 |
| itf-men | 38319 | ITF USA F45, Men Doubles | 0 |
| itf-men | 38317 | ITF USA F45, Men Singles | 0 |
| itf-men | 41508 | ITF USA F46, Men Doubles | 0 |
| itf-men | 41506 | ITF USA F46, Men Singles | 0 |
| itf-men | 15866 | ITF USA F5, Men Doubles | 0 |
| itf-men | 15864 | ITF USA F5, Men Singles | 0 |
| itf-men | 17168 | ITF USA F6, Men Doubles | 0 |
| itf-men | 15992 | ITF USA F6, Men Singles | 0 |
| itf-men | 17080 | ITF USA F7, Men Doubles | 0 |
| itf-men | 17078 | ITF USA F7, Men Singles | 0 |
| itf-men | 17100 | ITF USA F8, Men Doubles | 0 |
| itf-men | 17098 | ITF USA F8, Men Singles | 0 |
| itf-men | 14915 | ITF USA F9, Men Doubles | 0 |
| itf-men | 14913 | ITF USA F9, Men Singles | 0 |
| itf-men | 17856 | ITF Uzbekistan F1, Men Doubles | 0 |
| itf-men | 17854 | ITF Uzbekistan F1, Men Singles | 0 |
| itf-men | 17772 | ITF Uzbekistan F2, Men Doubles | 0 |
| itf-men | 17770 | ITF Uzbekistan F2, Men Singles | 0 |
| itf-men | 903684 | Ithaca | 0 |
| itf-men | 903457 | Jablonec Nad Nisou | 0 |
| itf-men | 903862 | Jakarta | 0 |
| itf-men | 903539 | Jerusalem | 0 |
| itf-men | 903662 | Johannesburg | 0 |
| itf-men | 903672 | Jonkoping | 0 |
| itf-men | 904197 | Kachreti | 0 |
| itf-men | 904144 | Kalaburagi | 0 |
| itf-men | 903780 | Kalmar | 0 |
| itf-men | 903813 | Kamen | 0 |
| itf-men | 904245 | Kampala | 0 |
| itf-men | 904012 | Karuizawa | 0 |
| itf-men | 903895 | Kashiwa | 0 |
| itf-men | 903829 | Kassel | 0 |
| itf-men | 904242 | Kayseri | 0 |
| itf-men | 903513 | Kazan | 0 |
| itf-men | 903857 | Kfar Saba | 0 |
| itf-men | 904093 | Kigali | 0 |
| itf-men | 903546 | kiseljak | 0 |
| itf-men | 903958 | Kish Island | 0 |
| itf-men | 904311 | Klagenfurt | 0 |
| itf-men | 903453 | Klosters | 0 |
| itf-men | 903633 | koksijde | 0 |
| itf-men | 904094 | Koszalin | 0 |
| itf-men | 904301 | Kotka | 0 |
| itf-men | 903597 | Kottingbrunn | 0 |
| itf-men | 903548 | Kouvola | 0 |
| itf-men | 904062 | Kramsach | 0 |
| itf-men | 903997 | Krsko | 0 |
| itf-men | 903847 | Kuala Lumpur | 0 |
| itf-men | 903856 | Kuching | 0 |
| itf-men | 903978 | Kursumlijska Banja | 0 |
| itf-men | 41688 | Kuwait F4 Men Doubles | 0 |
| itf-men | 41690 | Kuwait F4 Men Singles | 0 |
| itf-men | 41786 | Kuwait F5 Men Doubles | 0 |
| itf-men | 41788 | Kuwait F5 Men Singles | 0 |
| itf-men | 903586 | L'Aquila | 0 |
| itf-men | 903512 | La Nucia | 0 |
| itf-men | 904534 | La Paz | 0 |
| itf-men | 903925 | Lajeado | 0 |
| itf-men | 903832 | Lakewood | 0 |
| itf-men | 903729 | Lambare | 0 |
| itf-men | 903878 | Lambermont | 0 |
| itf-men | 904161 | Lannion | 0 |
| itf-men | 903532 | Las Palmas | 0 |
| itf-men | 904119 | Las Vegas | 0 |
| itf-men | 904279 | Launceston | 0 |
| itf-men | 904347 | Lausanne | 0 |
| itf-men | 904052 | Laval | 0 |
| itf-men | 904166 | Les Franqueses del Valles | 0 |
| itf-men | 903643 | Lesa | 0 |
| itf-men | 904439 | Lexington | 0 |
| itf-men | 903682 | Lima | 1 |
| itf-men | 904141 | Limassol | 0 |
| itf-men | 903830 | Litija | 0 |
| itf-men | 904312 | Ljubljana | 0 |
| itf-men | 903636 | Lodz | 0 |
| itf-men | 904227 | Londrina | 0 |
| itf-men | 903971 | Lons-Le-Saunier | 0 |
| itf-men | 903822 | Los Angeles | 0 |
| itf-men | 903739 | Loughborough | 0 |
| itf-men | 904244 | Louisville | 0 |
| itf-men | 903687 | Loule | 0 |
| itf-men | 904198 | Luan | 0 |
| itf-men | 904507 | Luanda | 0 |
| itf-men | 903677 | Lubbock | 0 |
| itf-men | 903506 | Lucknow | 0 |
| itf-men | 903926 | Lujan | 0 |
| itf-men | 904237 | Luque | 0 |
| itf-men | 904019 | Luzhou | 0 |
| itf-men | 904280 | Maanshan | 0 |
| itf-men | 904168 | Maceio | 0 |
| itf-men | 903489 | Madrid | 1 |
| itf-men | 903536 | Majadahonda | 0 |
| itf-men | 903938 | Malibu | 0 |
| itf-men | 903874 | Malmo | 0 |
| itf-men | 904483 | Malta | 0 |
| itf-men | 903494 | Manacor | 0 |
| itf-men | 904487 | Manama | 0 |
| itf-men | 904154 | Mandya | 0 |
| itf-men | 903902 | Manizales | 0 |
| itf-men | 904511 | Manzanillo | 0 |
| itf-men | 903904 | Maputo | 0 |
| itf-men | 904346 | Mar Del Plata | 0 |
| itf-men | 903547 | Marbella | 0 |
| itf-men | 903578 | Marburg | 0 |
| itf-men | 903883 | Maribor | 0 |
| itf-men | 903764 | Marrakech | 0 |
| itf-men | 903803 | Martos | 0 |
| itf-men | 903785 | Mataro | 0 |
| itf-men | 903665 | Medellin | 0 |
| itf-men | 903529 | Meerbusch | 0 |
| itf-men | 903701 | Meitar | 0 |
| itf-men | 903459 | Melilla | 0 |
| itf-men | 903870 | Memphis | 0 |
| itf-men | 904108 | Mendoza | 0 |
| itf-men | 904319 | Messina | 0 |
| itf-men | 903840 | Metzingen | 0 |
| itf-men | 904163 | Mildura | 0 |
| itf-men | 903977 | Mogi Das Cruzes | 0 |
| itf-men | 903455 | Monastir | 1 |
| itf-men | 904317 | Monastir 2 | 0 |
| itf-men | 903563 | Montabaun | 0 |
| itf-men | 904224 | Montesilvano | 0 |
| itf-men | 903957 | Montreal | 0 |
| itf-men | 904118 | Morelia | 0 |
| itf-men | 903966 | Mosquera | 0 |
| itf-men | 903549 | Most | 0 |
| itf-men | 904121 | Mulhouse | 0 |
| itf-men | 903921 | Mumbai | 0 |
| itf-men | 903811 | Mungia | 0 |
| itf-men | 904204 | Mungia-Laukariz | 0 |
| itf-men | 903632 | Muttenz | 0 |
| itf-men | 903961 | Mysuru | 0 |
| itf-men | 904324 | Nakhon Pathom | 0 |
| itf-men | 904013 | Nakhon SI Thammarat | 0 |
| itf-men | 903504 | Naples | 0 |
| itf-men | 903786 | Netanya | 0 |
| itf-men | 903680 | Nevers | 0 |
| itf-men | 903522 | New Delhi | 0 |
| itf-men | 904173 | Nishi-Tokyo | 0 |
| itf-men | 904286 | Nonthaburi | 0 |
| itf-men | 903912 | Norman | 0 |
| itf-men | 904251 | Norwich | 0 |
| itf-men | 903769 | Nottingham | 0 |
| itf-men | 904327 | Nova Gorica | 0 |
| itf-men | 903605 | Novi Sad | 0 |
| itf-men | 903445 | Novomoskovsk | 0 |
| itf-men | 903715 | Nules | 0 |
| itf-men | 903501 | Nur-Sultan | 0 |
| itf-men | 903942 | Nussloch | 0 |
| itf-men | 904021 | Nyiregyhaza | 0 |
| itf-men | 903750 | Oberhaching | 0 |
| itf-men | 904292 | Oegstgeest | 0 |
| itf-men | 904454 | Offenbach | 0 |
| itf-men | 904090 | Olavarria | 0 |
| itf-men | 903637 | Oldenzaal | 0 |
| itf-men | 903519 | Opatija | 0 |
| itf-men | 903713 | Opava | 0 |
| itf-men | 904210 | Oradea | 0 |
| itf-men | 903782 | Oran | 0 |
| itf-men | 903771 | Orange Park | 0 |
| itf-men | 904297 | Orlando | 0 |
| itf-men | 904290 | Osaka | 0 |
| itf-men | 903784 | Osijek | 0 |
| itf-men | 904270 | Oslo | 0 |
| itf-men | 903723 | Ostrava | 0 |
| itf-men | 904411 | Otopeni | 0 |
| itf-men | 903652 | Oviedo | 0 |
| itf-men | 903859 | Padova | 0 |
| itf-men | 903948 | Palm Coast | 0 |
| itf-men | 903762 | Palmanova | 0 |
| itf-men | 904150 | Papamoa | 0 |
| itf-men | 903461 | Pardubice | 0 |
| itf-men | 903480 | Parnu | 0 |
| itf-men | 903996 | Pazardzhik | 0 |
| itf-men | 903542 | Pensacola | 0 |
| itf-men | 904421 | Perth | 0 |
| itf-men | 903599 | Perugia | 0 |
| itf-men | 903635 | Pescara | 0 |
| itf-men | 904531 | Phan Thiet | 0 |
| itf-men | 903671 | Pirot | 0 |
| itf-men | 903613 | Pitesti | 0 |
| itf-men | 903831 | Pittsburgh | 0 |
| itf-men | 903452 | Plaisir | 0 |
| itf-men | 903685 | Platja D’Aro | 0 |
| itf-men | 903516 | Poitiers | 0 |
| itf-men | 904437 | Pontevedra | 0 |
| itf-men | 903584 | Poprad | 0 |
| itf-men | 903509 | Porec | 0 |
| itf-men | 903700 | Portimao | 0 |
| itf-men | 903462 | Porto | 0 |
| itf-men | 903606 | Portoviejo | 0 |
| itf-men | 903441 | Poznan Final | 0 |
| itf-men | 903439 | Poznan QF | 0 |
| itf-men | 903437 | Poznan R1 | 0 |
| itf-men | 903438 | Poznan R16 | 0 |
| itf-men | 903440 | Poznan SF | 0 |
| itf-men | 904099 | Pozzuoli | 0 |
| itf-men | 903456 | Prague | 0 |
| itf-men | 903678 | Pretoria | 0 |
| itf-men | 903538 | Prijedor | 0 |
| itf-men | 903630 | Prostejov | 0 |
| itf-men | 903517 | Pune | 0 |
| itf-men | 903747 | Punta Cana | 0 |
| itf-men | 904105 | Punta del Este | 0 |
| itf-men | 904250 | Qian Daohu | 0 |
| itf-men | 903479 | Quinta Do Lago | 0 |
| itf-men | 903787 | Quito | 0 |
| itf-men | 903808 | Raanana | 0 |
| itf-men | 904017 | Rabat | 0 |
| itf-men | 903839 | Radomlje | 0 |
| itf-men | 903535 | Ramat Hasharon | 0 |
| itf-men | 903795 | Rancho Santa Fe | 0 |
| itf-men | 903668 | Recife | 0 |
| itf-men | 903995 | Reggio Emilia | 0 |
| itf-men | 903528 | Reus | 0 |
| itf-men | 904535 | Ribeirao Preto | 0 |
| itf-men | 903467 | Ricany | 0 |
| itf-men | 903727 | Rio Cuarto | 0 |
| itf-men | 903910 | Rio de Janeiro | 0 |
| itf-men | 903691 | Rio Do Sol | 0 |
| itf-men | 904015 | Risskov/Aarhus | 0 |
| itf-men | 904055 | Rochester | 0 |
| itf-men | 904051 | Roda De Bara | 0 |
| itf-men | 903466 | Rodez | 0 |
| itf-men | 903834 | Roehampton | 0 |
| itf-men | 904011 | Rome | 0 |
| itf-men | 903766 | Rosario, Santa Fe | 0 |
| itf-men | 903515 | Rovinj | 0 |
| itf-men | 40835 | Rwanda F1 Men Doubles | 0 |
| itf-men | 40833 | Rwanda F1 Men Singles | 0 |
| itf-men | 904023 | Saarlouis | 0 |
| itf-men | 903896 | Sabadell | 0 |
| itf-men | 903915 | Saint Augustin | 0 |
| itf-men | 903702 | Saint Dizier | 0 |
| itf-men | 903888 | Salerno | 0 |
| itf-men | 903906 | Salta | 0 |
| itf-men | 904424 | Salvador | 0 |
| itf-men | 903800 | San Diego | 0 |
| itf-men | 904145 | San Gregorio di Catania | 0 |
| itf-men | 904322 | San Salvador De Jujuy | 0 |
| itf-men | 903908 | Santa Cruz | 0 |
| itf-men | 904490 | Santa Cruz Do Sul | 0 |
| itf-men | 903768 | Santa Margherita di Pula | 0 |
| itf-men | 904326 | Santa Tecla | 0 |
| itf-men | 903644 | Santander | 0 |
| itf-men | 904262 | Santiago | 0 |
| itf-men | 903488 | Santo Domingo | 0 |
| itf-men | 903975 | Sanxenxo | 0 |
| itf-men | 904083 | Sao Paulo | 0 |
| itf-men | 903881 | Sapporo | 0 |
| itf-men | 903553 | Sarajevo | 0 |
| itf-men | 903473 | Sarreguemines | 0 |
| itf-men | 904100 | Satu Mare | 0 |
| itf-men | 903699 | Selva Gardena | 0 |
| itf-men | 903845 | Seremban | 0 |
| itf-men | 903464 | Setubal | 0 |
| itf-men | 904050 | Shanghai | 0 |
| itf-men | 903463 | Sharm El Sheikh | 1 |
| itf-men | 903900 | Sheffield | 0 |
| itf-men | 904288 | Shenzhen | 0 |
| itf-men | 903745 | Shrewsbury | 0 |
| itf-men | 903526 | Shymkent | 0 |
| itf-men | 903530 | Sibenik | 0 |
| itf-men | 903655 | Sierre | 0 |
| itf-men | 903972 | Singapore | 0 |
| itf-men | 903448 | Sintra | 0 |
| itf-men | 904084 | Sion | 0 |
| itf-men | 903552 | Skopje | 0 |
| itf-men | 904328 | Slobozia | 0 |
| itf-men | 904407 | Slovenj Gradec | 0 |
| itf-men | 903582 | Sofia | 0 |
| itf-men | 903812 | South Bend | 0 |
| itf-men | 904077 | Southaven | 0 |
| itf-men | 903664 | Sozopol | 0 |
| itf-men | 903772 | Split | 0 |
| itf-men | 903500 | St. Petersburg | 0 |
| itf-men | 904266 | Stellenbosch | 0 |
| itf-men | 904025 | Store | 0 |
| itf-men | 903898 | Sunderland | 0 |
| itf-men | 903770 | Sunrise | 0 |
| itf-men | 903949 | Swan Hill | 0 |
| itf-men | 903882 | Szabolcsveresmart | 0 |
| itf-men | 904087 | Szczawno | 0 |
| itf-men | 904342 | Szczawno-zdroj | 0 |
| itf-men | 904303 | Szentendre | 0 |
| itf-men | 903999 | Tabasco | 0 |
| itf-men | 903976 | Tacarigua | 0 |
| itf-men | 904067 | Tainan | 0 |
| itf-men | 904218 | Taipei | 0 |
| itf-men | 904104 | Takasaki | 0 |
| itf-men | 903698 | Tallahassee | 0 |
| itf-men | 904355 | Tamworth | 0 |
| itf-men | 904469 | Tanagura | 0 |
| itf-men | 904020 | Tanger | 0 |
| itf-men | 904071 | Targu Jiu | 0 |
| itf-men | 904310 | Targu Mures | 0 |
| itf-men | 904175 | Tarragona | 0 |
| itf-men | 904231 | Tashkent | 0 |
| itf-men | 903937 | Tauranga | 0 |
| itf-men | 904413 | Tauste | 0 |
| itf-men | 904110 | Tavira | 0 |
| itf-men | 903796 | Tay Ninh | 0 |
| itf-men | 903543 | Tbilisi | 0 |
| itf-men | 904016 | Tehran | 0 |
| itf-men | 903607 | Telavi | 0 |
| itf-men | 903979 | Telde | 0 |
| itf-men | 903587 | Telfs | 0 |
| itf-men | 903572 | The Hague | 0 |
| itf-men | 904018 | Tianjin | 0 |
| itf-men | 904274 | Timaru | 0 |
| itf-men | 904217 | Tokyo | 0 |
| itf-men | 903491 | Torello | 0 |
| itf-men | 903692 | Toulouse | 0 |
| itf-men | 903922 | Traralgon | 0 |
| itf-men | 904192 | Trelew | 0 |
| itf-men | 903753 | Trento | 0 |
| itf-men | 903642 | Trier | 0 |
| itf-men | 903511 | Trimbach | 0 |
| itf-men | 903916 | Trnava | 0 |
| itf-men | 904480 | Trois-Rivieres | 0 |
| itf-men | 903537 | Troisdorf | 0 |
| itf-men | 904070 | Trujillo | 0 |
| itf-men | 904243 | Tsaghkadzor | 0 |
| itf-men | 903962 | Tsukuba | 0 |
| itf-men | 903950 | Tucuman | 0 |
| itf-men | 903559 | Tulsa | 0 |
| itf-men | 6409 | Turkey F35, Men Doubles | 0 |
| itf-men | 6407 | Turkey F35, Men Singles | 0 |
| itf-men | 5999 | Turkiye F26 Men Doubles | 0 |
| itf-men | 5997 | Turkiye F26 Men Singles | 0 |
| itf-men | 903629 | Ueberlingen | 0 |
| itf-men | 903651 | Ulcinj | 0 |
| itf-men | 903589 | Uriage | 0 |
| itf-men | 5885 | USA F24 Men Doubles | 0 |
| itf-men | 5883 | USA F24 Men Singles | 0 |
| itf-men | 904058 | Uslar | 0 |
| itf-men | 903855 | Ust-Kamenogorsk | 0 |
| itf-men | 903794 | Vaasa | 0 |
| itf-men | 903917 | Vacaria | 0 |
| itf-men | 903474 | Vale Do Lobo | 0 |
| itf-men | 904133 | Valencia | 0 |
| itf-men | 903482 | Valldoreix | 0 |
| itf-men | 904486 | Valledupar | 0 |
| itf-men | 903987 | Varnamo | 0 |
| itf-men | 903939 | Veigy-Foncenex | 0 |
| itf-men | 903603 | Vejle | 0 |
| itf-men | 903579 | Velenje | 0 |
| itf-men | 903693 | Vero Beach | 0 |
| itf-men | 903544 | Vic | 0 |
| itf-men | 904088 | Vienna | 0 |
| itf-men | 904111 | Vigo | 0 |
| itf-men | 903947 | Vila Real De Santo Antonio | 0 |
| itf-men | 903725 | Villa Allende | 0 |
| itf-men | 903903 | Villa Carlos Paz | 0 |
| itf-men | 903521 | Villa Maria | 0 |
| itf-men | 904193 | Villahermosa | 0 |
| itf-men | 904323 | Villavicencio | 0 |
| itf-men | 903484 | Villena | 0 |
| itf-men | 904208 | Villeneuve-Loubet | 0 |
| itf-men | 903707 | Villers Les Nancy | 0 |
| itf-men | 903738 | Vilnius | 0 |
| itf-men | 903669 | Vyshkovo | 0 |
| itf-men | 903827 | Waco | 0 |
| itf-men | 903634 | Warmbad-Villach | 0 |
| itf-men | 903935 | Wellington | 0 |
| itf-men | 903944 | Wesley Chapel | 0 |
| itf-men | 903573 | Weston | 0 |
| itf-men | 903612 | Wetzlar | 0 |
| itf-men | 903557 | Wichita | 0 |
| itf-men | 903920 | Winston-Salem | 0 |
| itf-men | 903576 | Wroclaw | 0 |
| itf-men | 903994 | Xalapa | 0 |
| itf-men | 903619 | Xativa | 0 |
| itf-men | 904151 | Yanagawa | 0 |
| itf-men | 904281 | Yerba Buena | 0 |
| itf-men | 904069 | Yinchuan | 0 |
| itf-men | 903860 | Ystad | 0 |
| itf-men | 904309 | Zagreb | 0 |
| itf-men | 904109 | Zapopan | 0 |
| itf-men | 903901 | Zaragoza | 0 |
| itf-men | 903650 | Zilina | 0 |
| itf-men | 903666 | Zlatibor | 0 |
| itf-women | 903492 |  | 0 |
| itf-women | 903851 | Agadir | 0 |
| itf-women | 903751 | Ahmedabad | 0 |
| itf-women | 903648 | Aix en Provence | 0 |
| itf-women | 903387 | Akko | 0 |
| itf-women | 904284 | Alaminos | 0 |
| itf-women | 903986 | Alaminos-Larnaca | 0 |
| itf-women | 904136 | Alcala de Henares | 0 |
| itf-women | 903866 | Aldershot | 0 |
| itf-women | 903431 | Alkmaar Final | 0 |
| itf-women | 903429 | Alkmaar QF | 0 |
| itf-women | 903427 | Alkmaar R1 | 0 |
| itf-women | 903428 | Alkmaar R16 | 0 |
| itf-women | 903430 | Alkmaar SF | 0 |
| itf-women | 903590 | Almada | 0 |
| itf-women | 903326 | Almaty | 0 |
| itf-women | 903289 | Altenkirchen | 0 |
| itf-women | 903592 | Amarante | 0 |
| itf-women | 903421 | Amiens | 0 |
| itf-women | 903577 | Amstelveen | 0 |
| itf-women | 904226 | Amstetten | 0 |
| itf-women | 903761 | Anapoima | 0 |
| itf-women | 904305 | Andong | 0 |
| itf-women | 903788 | Annenheim | 0 |
| itf-women | 903287 | Antalya | 0 |
| itf-women | 903704 | Aparecida de Goiania | 0 |
| itf-women | 903755 | Arcadia | 0 |
| itf-women | 904081 | Arequipa | 0 |
| itf-women | 903241 | Aschaffenburg | 0 |
| itf-women | 903246 | Astana | 0 |
| itf-women | 903695 | Austin | 0 |
| itf-women | 904047 | Bacau | 0 |
| itf-women | 903641 | Bad Waltersdorf | 0 |
| itf-women | 904247 | Bakersfield | 0 |
| itf-women | 904074 | Baku | 0 |
| itf-women | 903550 | Banja Luka | 0 |
| itf-women | 903327 | Barcelona | 0 |
| itf-women | 903914 | Barranquilla | 0 |
| itf-women | 903336 | Bastad | 0 |
| itf-women | 903286 | Bath | 0 |
| itf-women | 903905 | Baza | 0 |
| itf-women | 903525 | Bellinzona | 0 |
| itf-women | 903285 | Bendigo | 0 |
| itf-women | 903724 | Bengaluru | 0 |
| itf-women | 903364 | Berkeley | 0 |
| itf-women | 903340 | Bethany Beach | 0 |
| itf-women | 903414 | Bhopal | 0 |
| itf-women | 903240 | Biarritz | 0 |
| itf-women | 903743 | Birmingham | 0 |
| itf-women | 904216 | Bissy-Chambery | 0 |
| itf-women | 904082 | Bistrita | 0 |
| itf-women | 904315 | Blois | 0 |
| itf-women | 903734 | Blumenau-Gaspar | 0 |
| itf-women | 903505 | Boca Raton | 0 |
| itf-women | 904000 | Bodrum | 0 |
| itf-women | 904471 | Bol | 0 |
| itf-women | 904189 | Bol -Final | 0 |
| itf-women | 904187 | Bol -QF | 0 |
| itf-women | 904185 | Bol -R1 | 0 |
| itf-women | 904186 | Bol -R16 | 0 |
| itf-women | 904188 | Bol -SF | 0 |
| itf-women | 904316 | Bolszewo | 0 |
| itf-women | 903383 | Bonita Springs | 0 |
| itf-women | 904060 | Bragado | 0 |
| itf-women | 903719 | Brasilia | 0 |
| itf-women | 903790 | Brasov | 0 |
| itf-women | 903514 | Bratislava | 0 |
| itf-women | 903316 | Braunschweig | 0 |
| itf-women | 903304 | Brisbane | 0 |
| itf-women | 903865 | Bronx | 0 |
| itf-women | 904162 | Brossard | 0 |
| itf-women | 903382 | Bucaramanga | 0 |
| itf-women | 903815 | Bucharest | 0 |
| itf-women | 903422 | Buenos Aires | 0 |
| itf-women | 903969 | Bujumbura | 0 |
| itf-women | 904096 | Buzau | 0 |
| itf-women | 903610 | Bydgoszcz | 0 |
| itf-women | 903394 | Bytom | 0 |
| itf-women | 903303 | Cairns | 0 |
| itf-women | 903309 | Cairo | 0 |
| itf-women | 903408 | Caldas da Rainha | 0 |
| itf-women | 903918 | Calgary | 0 |
| itf-women | 903838 | Caloundra | 0 |
| itf-women | 903381 | Calvi | 0 |
| itf-women | 904409 | Campulung | 0 |
| itf-women | 903306 | Canberra | 0 |
| itf-women | 903416 | Cancun | 0 |
| itf-women | 903809 | Cantanhede | 0 |
| itf-women | 904410 | Cap d'Agde | 0 |
| itf-women | 904259 | Carrara | 0 |
| itf-women | 904225 | Cary | 0 |
| itf-women | 903824 | Casablanca | 0 |
| itf-women | 903295 | Caserta | 0 |
| itf-women | 903477 | Castellon | 0 |
| itf-women | 903791 | Catez Ob Savi | 0 |
| itf-women | 903806 | Ceska Lipa | 0 |
| itf-women | 903891 | Ceuta | 0 |
| itf-women | 904223 | Chacabuco | 0 |
| itf-women | 903919 | Champaign | 0 |
| itf-women | 903296 | Changwon | 0 |
| itf-women | 903333 | Charleston | 0 |
| itf-women | 904291 | Charlotte | 0 |
| itf-women | 903348 | Cherboug-en-Cotentin | 0 |
| itf-women | 904453 | Cherbourg-en-Cotentin | 0 |
| itf-women | 903733 | Chiang Rai | 0 |
| itf-women | 904253 | Chihuahua | 0 |
| itf-women | 903639 | Chronomorsk | 0 |
| itf-women | 904512 | Clemson | 0 |
| itf-women | 904228 | Cluj Napoca | 0 |
| itf-women | 903647 | Collonge Bellerive | 0 |
| itf-women | 903814 | Colorado Springs | 0 |
| itf-women | 903817 | Columbus | 0 |
| itf-women | 903236 | Contrexeville | 0 |
| itf-women | 903399 | Cordenons | 0 |
| itf-women | 903524 | Cordoba | 0 |
| itf-women | 903390 | Corroios-Seixal | 0 |
| itf-women | 904504 | Criciuma | 0 |
| itf-women | 904344 | Cuiaba | 0 |
| itf-women | 903717 | Cundinamarca | 0 |
| itf-women | 903290 | Curitiba | 0 |
| itf-women | 903359 | Daegu | 0 |
| itf-women | 903411 | Dallas | 0 |
| itf-women | 903863 | Danderyd | 0 |
| itf-women | 903244 | Darmstadt | 0 |
| itf-women | 903373 | Darwin | 0 |
| itf-women | 904547 | Daytona Beach | 1 |
| itf-women | 904320 | Decatur | 0 |
| itf-women | 903391 | Den Haag | 0 |
| itf-women | 903238 | Denain | 0 |
| itf-women | 904345 | Denia | 0 |
| itf-women | 903667 | Dijon | 0 |
| itf-women | 904339 | Dinard | 0 |
| itf-women | 904211 | Doksy | 0 |
| itf-women | 903593 | Don Benito | 0 |
| itf-women | 904544 | Dubai | 1 |
| itf-women | 903867 | Duffel | 0 |
| itf-women | 904246 | Edmond | 0 |
| itf-women | 904126 | Edmonton | 0 |
| itf-women | 903868 | Eindhoven | 0 |
| itf-women | 903344 | El Espinar | 0 |
| itf-women | 904059 | El Espinar/Segovia | 0 |
| itf-women | 903894 | Eldorado | 0 |
| itf-women | 903628 | Erwitte | 0 |
| itf-women | 904153 | Esch-Alzette | 0 |
| itf-women | 904452 | Essen | 0 |
| itf-women | 904307 | Estepona | 0 |
| itf-women | 903853 | Eupen | 0 |
| itf-women | 903395 | Evansville | 0 |
| itf-women | 904356 | Evora | 0 |
| itf-women | 904115 | Faro | 0 |
| itf-women | 904063 | Feira De Santana | 0 |
| itf-women | 904001 | Feld Am See | 0 |
| itf-women | 904097 | Fiano Romano | 0 |
| itf-women | 903339 | Figueira Da Foz | 0 |
| itf-women | 903277 | Florence | 0 |
| itf-women | 903737 | Florianopolis | 0 |
| itf-women | 904314 | Focsani | 0 |
| itf-women | 903319 | Fort Worth | 0 |
| itf-women | 903941 | Fort-de-France | 0 |
| itf-women | 903823 | Fountain Valley | 0 |
| itf-women | 903852 | Foxhills | 0 |
| itf-women | 903423 | Fredericton | 0 |
| itf-women | 903611 | Frederiksberg | 0 |
| itf-women | 903406 | Frydek Mistek | 0 |
| itf-women | 903496 | Fujairah | 0 |
| itf-women | 903983 | Fukui | 0 |
| itf-women | 903465 | Funchal | 0 |
| itf-women | 904235 | Fuzhou | 0 |
| itf-women | 904191 | Galati | 0 |
| itf-women | 904042 | Gdansk | 0 |
| itf-women | 903343 | Getxo | 0 |
| itf-women | 903730 | Giza | 0 |
| itf-women | 903288 | Glasgow | 0 |
| itf-women | 904129 | Gold Coast | 0 |
| itf-women | 903424 | Gonesse | 0 |
| itf-women | 903276 | Goyang | 0 |
| itf-women | 903243 | Granby | 0 |
| itf-women | 903398 | Grodzisk Mazowiecki | 0 |
| itf-women | 904135 | Guadalajara | 0 |
| itf-women | 903720 | Guatemala | 0 |
| itf-women | 903400 | Guayaquil | 0 |
| itf-women | 903836 | Guimaraes | 0 |
| itf-women | 903325 | Guiyang | 0 |
| itf-women | 903748 | Gurugram | 0 |
| itf-women | 903353 | Gwalior | 0 |
| itf-women | 903483 | Haabneeme | 0 |
| itf-women | 903282 | Hamamatsu | 0 |
| itf-women | 903495 | Hamburg | 0 |
| itf-women | 904159 | Hammamet | 0 |
| itf-women | 903886 | Haren | 0 |
| itf-women | 903248 | Hechingen | 0 |
| itf-women | 903705 | Helsingborg | 0 |
| itf-women | 903927 | Helsinki | 0 |
| itf-women | 903415 | Heraklion | 0 |
| itf-women | 904277 | Herrenschwanden | 0 |
| itf-women | 904203 | Hillcrest | 0 |
| itf-women | 903409 | Hilton Head Island | 0 |
| itf-women | 903963 | Hinode | 0 |
| itf-women | 903317 | Horb | 0 |
| itf-women | 903329 | Hua Hin | 0 |
| itf-women | 904240 | Huamantla | 0 |
| itf-women | 904004 | Huntsville | 0 |
| itf-women | 904348 | Hurghada | 0 |
| itf-women | 904249 | Huzhou | 0 |
| itf-women | 903658 | Ibague | 0 |
| itf-women | 903299 | Ilkley | 0 |
| itf-women | 904406 | Incheon | 0 |
| itf-women | 904295 | Indian Harbour Beach | 0 |
| itf-women | 904158 | Indore | 0 |
| itf-women | 903953 | Ipoh | 0 |
| itf-women | 904477 | Irapuato | 0 |
| itf-women | 904026 | Irvine | 0 |
| itf-women | 904257 | Ismaning | 0 |
| itf-women | 904478 | Istanbul | 0 |
| itf-women | 15363 | ITF Argentina 01A, Women Doubles | 0 |
| itf-women | 15361 | ITF Argentina 01A, Women Singles | 0 |
| itf-women | 22757 | ITF Argentina 02A, Women Doubles | 0 |
| itf-women | 22755 | ITF Argentina 02A, Women Singles | 0 |
| itf-women | 19394 | ITF Argentina 03A, Women Doubles | 0 |
| itf-women | 19392 | ITF Argentina 03A, Women Singles | 0 |
| itf-women | 20052 | ITF Argentina 04A, Women Doubles | 0 |
| itf-women | 20050 | ITF Argentina 04A, Women Singles | 0 |
| itf-women | 20232 | ITF Argentina 05A, Women Doubles | 0 |
| itf-women | 20230 | ITF Argentina 05A, Women Singles | 0 |
| itf-women | 37963 | ITF Argentina 06A, Women Doubles | 0 |
| itf-women | 37961 | ITF Argentina 06A, Women Singles | 0 |
| itf-women | 38013 | ITF Argentina 07A, Women Doubles | 0 |
| itf-women | 38015 | ITF Argentina 07A, Women Singles | 0 |
| itf-women | 38085 | ITF Argentina 08A, Women Doubles | 0 |
| itf-women | 38087 | ITF Argentina 08A, Women Singles | 0 |
| itf-women | 38519 | ITF Argentina 09A, Women Doubles | 0 |
| itf-women | 38521 | ITF Argentina 09A, Women Singles | 0 |
| itf-women | 38659 | ITF Argentina 10A, Women Doubles | 0 |
| itf-women | 38661 | ITF Argentina 10A, Women Singles | 0 |
| itf-women | 41526 | ITF Argentina 11A, Women Doubles | 0 |
| itf-women | 41524 | ITF Argentina 11A, Women Singles | 0 |
| itf-women | 41598 | ITF Argentina 12A, Women Doubles | 0 |
| itf-women | 41600 | ITF Argentina 12A, Women Singles | 0 |
| itf-women | 44899 | ITF Argentina 13A, Women Doubles | 0 |
| itf-women | 44897 | ITF Argentina 13A, Women Singles | 0 |
| itf-women | 45025 | ITF Argentina 14A, Women Doubles | 0 |
| itf-women | 45023 | ITF Argentina 14A, Women Singles | 0 |
| itf-women | 44365 | ITF Armenia 01A, Women Doubles | 0 |
| itf-women | 44363 | ITF Armenia 01A, Women Singles | 0 |
| itf-women | 44497 | ITF Armenia F2, Women Doubles | 0 |
| itf-women | 44495 | ITF Armenia F2, Women Singles | 0 |
| itf-women | 21272 | ITF Australia 01A, Women Doubles | 0 |
| itf-women | 21270 | ITF Australia 01A, Women Singles | 0 |
| itf-women | 21452 | ITF Australia 02A, Women Doubles | 0 |
| itf-women | 21450 | ITF Australia 02A, Women Singles | 0 |
| itf-women | 21130 | ITF Australia 03A, Women Doubles | 0 |
| itf-women | 21128 | ITF Australia 03A, Women Singles | 0 |
| itf-women | 21906 | ITF Australia 04A, Women Doubles | 0 |
| itf-women | 21904 | ITF Australia 04A, Women Singles | 0 |
| itf-women | 22070 | ITF Australia 05A, Women Doubles | 0 |
| itf-women | 22068 | ITF Australia 05A, Women Singles | 0 |
| itf-women | 22034 | ITF Australia 06A, Women Doubles | 0 |
| itf-women | 22032 | ITF Australia 06A, Women Singles | 0 |
| itf-women | 20988 | ITF Australia 08A, Women Doubles | 0 |
| itf-women | 20986 | ITF Australia 08A, Women Singles | 0 |
| itf-women | 19536 | ITF Australia 09A, Women Doubles | 0 |
| itf-women | 19534 | ITF Australia 09A, Women Singles | 0 |
| itf-women | 19876 | ITF Australia 10A, Women Doubles | 0 |
| itf-women | 19874 | ITF Australia 10A, Women Singles | 0 |
| itf-women | 20040 | ITF Australia 11A, Women Doubles | 0 |
| itf-women | 20038 | ITF Australia 11A, Women Singles | 0 |
| itf-women | 20286 | ITF Australia 12A, Women Doubles | 0 |
| itf-women | 20284 | ITF Australia 12A, Women Singles | 0 |
| itf-women | 23597 | ITF Australia 13A, Women Doubles | 0 |
| itf-women | 23595 | ITF Australia 13A, Women Singles | 0 |
| itf-women | 26652 | ITF Australia 14A, Women Doubles | 0 |
| itf-women | 26650 | ITF Australia 14A, Women Singles | 0 |
| itf-women | 38167 | ITF Australia 15A, Women Doubles | 0 |
| itf-women | 38169 | ITF Australia 15A, Women Singles | 0 |
| itf-women | 38285 | ITF Australia 16A, Women Doubles | 0 |
| itf-women | 38283 | ITF Australia 16A, Women Singles | 0 |
| itf-women | 38423 | ITF Australia 17A, Women Doubles | 0 |
| itf-women | 38425 | ITF Australia 17A, Women Singles | 0 |
| itf-women | 17262 | ITF Austria 02A, Women Doubles | 0 |
| itf-women | 17260 | ITF Austria 02A, Women Singles | 0 |
| itf-women | 36689 | ITF Austria 03A, Women Doubles | 0 |
| itf-women | 36691 | ITF Austria 03A, Women Singles | 0 |
| itf-women | 36975 | ITF Austria 04A, Women Doubles | 0 |
| itf-women | 36977 | ITF Austria 04A, Women Singles | 0 |
| itf-women | 34962 | ITF Austria 05A, Women Doubles | 0 |
| itf-women | 34964 | ITF Austria 05A, Women Singles | 0 |
| itf-women | 36867 | ITF Austria 06A, Women Doubles | 0 |
| itf-women | 36869 | ITF Austria 06A, Women Singles | 0 |
| itf-women | 37733 | ITF Austria 08A, Women Doubles | 0 |
| itf-women | 37731 | ITF Austria 08A, Women Singles | 0 |
| itf-women | 37371 | ITF Austria 09A, Women Doubles | 0 |
| itf-women | 37369 | ITF Austria 09A, Women Singles | 0 |
| itf-women | 16316 | ITF Belgium 01A, Women Doubles | 0 |
| itf-women | 16314 | ITF Belgium 01A, Women Singles | 0 |
| itf-women | 23359 | ITF Belgium 02A, Women Doubles | 0 |
| itf-women | 23357 | ITF Belgium 02A, Women Singles | 0 |
| itf-women | 15598 | ITF Belgium 03A, Women Doubles | 0 |
| itf-women | 15596 | ITF Belgium 03A, Women Singles | 0 |
| itf-women | 22997 | ITF Bosnia & Herzegovina 01A, Women Doubles | 0 |
| itf-women | 22995 | ITF Bosnia & Herzegovina 01A, Women Singles | 0 |
| itf-women | 21912 | ITF Brazil 02A, Women Doubles | 0 |
| itf-women | 21910 | ITF Brazil 02A, Women Singles | 0 |
| itf-women | 22004 | ITF Brazil 03A, Women Doubles | 0 |
| itf-women | 22002 | ITF Brazil 03A, Women Singles | 0 |
| itf-women | 24123 | ITF Brazil 04A, Women Doubles | 0 |
| itf-women | 24121 | ITF Brazil 04A, Women Singles | 0 |
| itf-women | 35653 | ITF Brazil 05A, Women Doubles | 0 |
| itf-women | 35655 | ITF Brazil 05A, Women Singles | 0 |
| itf-women | 36577 | ITF Brazil 06A, Women Doubles | 0 |
| itf-women | 36579 | ITF Brazil 06A, Women Singles | 0 |
| itf-women | 16588 | ITF Brazil 07A, Women Doubles | 0 |
| itf-women | 16586 | ITF Brazil 07A, Women Singles | 0 |
| itf-women | 23365 | ITF Brazil 08A, Women Doubles | 0 |
| itf-women | 23363 | ITF Brazil 08A, Women Singles | 0 |
| itf-women | 44007 | ITF Brazil 10A, Women Doubles | 0 |
| itf-women | 44005 | ITF Brazil 10A, Women Singles | 0 |
| itf-women | 43895 | ITF Brazil 11A, Women Doubles | 0 |
| itf-women | 43893 | ITF Brazil 11A, Women Singles | 0 |
| itf-women | 44227 | ITF Brazil 12A, Women Doubles | 0 |
| itf-women | 44225 | ITF Brazil 12A, Women Singles | 0 |
| itf-women | 45141 | ITF Brazil 13A, Women Doubles | 0 |
| itf-women | 45139 | ITF Brazil 13A, Women Singles | 0 |
| itf-women | 45217 | ITF Brazil 14A, Women Doubles | 0 |
| itf-women | 45219 | ITF Brazil 14A, Women Singles | 0 |
| itf-women | 45297 | ITF Brazil 15A, Women Doubles | 0 |
| itf-women | 45295 | ITF Brazil 15A, Women Singles | 0 |
| itf-women | 18674 | ITF Bulgaria 01A, Women Doubles | 0 |
| itf-women | 18672 | ITF Bulgaria 01A, Women Singles | 0 |
| itf-women | 35204 | ITF Bulgaria 02A, Women Doubles | 0 |
| itf-women | 35202 | ITF Bulgaria 02A, Women Singles | 0 |
| itf-women | 39497 | ITF Burundi 01A, Women Doubles | 0 |
| itf-women | 39499 | ITF Burundi 01A, Women Singles | 0 |
| itf-women | 39557 | ITF Burundi 02A, Women Doubles | 0 |
| itf-women | 39551 | ITF Burundi 02A, Women Singles | 0 |
| itf-women | 17236 | ITF Canada 01A, Women Doubles | 0 |
| itf-women | 17234 | ITF Canada 01A, Women Singles | 0 |
| itf-women | 22871 | ITF Canada 02A, Women Doubles | 0 |
| itf-women | 22869 | ITF Canada 02A, Women Singles | 0 |
| itf-women | 20826 | ITF Canada 04A, Women Doubles | 0 |
| itf-women | 20824 | ITF Canada 04A, Women Singles | 0 |
| itf-women | 16292 | ITF Canada 05A, Women Doubles | 0 |
| itf-women | 16290 | ITF Canada 05A, Women Singles | 0 |
| itf-women | 16572 | ITF Canada 06A, Women Doubles | 0 |
| itf-women | 16570 | ITF Canada 06A, Women Singles | 0 |
| itf-women | 20552 | ITF Canada 07A, Women Doubles | 0 |
| itf-women | 20550 | ITF Canada 07A, Women Singles | 0 |
| itf-women | 41252 | ITF Canada 08A, Women Doubles | 0 |
| itf-women | 41250 | ITF Canada 08A, Women Singles | 0 |
| itf-women | 44597 | ITF Canada 09A, Women Doubles | 0 |
| itf-women | 44595 | ITF Canada 09A, Women Singles | 0 |
| itf-women | 21296 | ITF China 01A, Women Doubles | 0 |
| itf-women | 21294 | ITF China 01A, Women Singles | 0 |
| itf-women | 21482 | ITF China 02A, Women Doubles | 0 |
| itf-women | 21480 | ITF China 02A, Women Singles | 0 |
| itf-women | 21148 | ITF China 03A, Women Doubles | 0 |
| itf-women | 21146 | ITF China 03A, Women Singles | 0 |
| itf-women | 24181 | ITF China 04A, Women Doubles | 0 |
| itf-women | 24179 | ITF China 04A, Women Singles | 0 |
| itf-women | 22464 | ITF China 05A, Women Doubles | 0 |
| itf-women | 22462 | ITF China 05A, Women Singles | 0 |
| itf-women | 22380 | ITF China 06A, Women Doubles | 0 |
| itf-women | 22378 | ITF China 06A, Women Singles | 0 |
| itf-women | 22556 | ITF China 07A, Women Doubles | 0 |
| itf-women | 22554 | ITF China 07A, Women Singles | 0 |
| itf-women | 22637 | ITF China 08A, Women Doubles | 0 |
| itf-women | 22635 | ITF China 08A, Women Singles | 0 |
| itf-women | 22709 | ITF China 09A, Women Doubles | 0 |
| itf-women | 22707 | ITF China 09A, Women Singles | 0 |
| itf-women | 15369 | ITF China 10A, Women Doubles | 0 |
| itf-women | 15367 | ITF China 10A, Women Singles | 0 |
| itf-women | 22865 | ITF China 11A, Women Doubles | 0 |
| itf-women | 22863 | ITF China 11A, Women Singles | 0 |
| itf-women | 23065 | ITF China 12A, Women Doubles | 0 |
| itf-women | 23063 | ITF China 12A, Women Singles | 0 |
| itf-women | 23133 | ITF China 13A, Women Doubles | 0 |
| itf-women | 23131 | ITF China 13A, Women Singles | 0 |
| itf-women | 16298 | ITF China 14A, Women Doubles | 0 |
| itf-women | 16296 | ITF China 14A, Women Singles | 0 |
| itf-women | 13961 | ITF China 15A, Women Doubles | 0 |
| itf-women | 13959 | ITF China 15A, Women Singles | 0 |
| itf-women | 20330 | ITF China 16A, Women Doubles | 0 |
| itf-women | 20328 | ITF China 16A, Women Singles | 0 |
| itf-women | 20558 | ITF China 17A, Women Doubles | 0 |
| itf-women | 20556 | ITF China 17A, Women Singles | 0 |
| itf-women | 25697 | ITF China 18A, Women Doubles | 0 |
| itf-women | 25695 | ITF China 18A, Women Singles | 0 |
| itf-women | 19340 | ITF China 19A, Women Doubles | 0 |
| itf-women | 19342 | ITF China 19A, Women Singles | 0 |
| itf-women | 22859 | ITF Chinese Taipei 01A, Women Doubles | 0 |
| itf-women | 22857 | ITF Chinese Taipei 01A, Women Singles | 0 |
| itf-women | 40099 | ITF Chinese Taipei 02A, Women Doubles | 0 |
| itf-women | 40097 | ITF Chinese Taipei 02A, Women Singles | 0 |
| itf-women | 20844 | ITF Colombia 01A, Women Doubles | 0 |
| itf-women | 20842 | ITF Colombia 01A, Women Singles | 0 |
| itf-women | 21030 | ITF Colombia 02A, Women Doubles | 0 |
| itf-women | 21028 | ITF Colombia 02A, Women Singles | 0 |
| itf-women | 25929 | ITF Colombia 03A, Women Doubles | 0 |
| itf-women | 25927 | ITF Colombia 03A, Women Singles | 0 |
| itf-women | 22288 | ITF Croatia 01A, Women Doubles | 0 |
| itf-women | 22286 | ITF Croatia 01A, Women Singles | 0 |
| itf-women | 25281 | ITF Croatia 02A, Women Doubles | 0 |
| itf-women | 25279 | ITF Croatia 02A, Women Singles | 0 |
| itf-women | 38007 | ITF Croatia 04A, Women Doubles | 0 |
| itf-women | 38009 | ITF Croatia 04A, Women Singles | 0 |
| itf-women | 41242 | ITF Croatia 05A, Women Doubles | 0 |
| itf-women | 41244 | ITF Croatia 05A, Women Singles | 0 |
| itf-women | 42867 | ITF Croatia 06A, Women Doubles | 0 |
| itf-women | 42865 | ITF Croatia 06A, Women Singles | 0 |
| itf-women | 43455 | ITF Croatia 07A, Women Doubles | 0 |
| itf-women | 43453 | ITF Croatia 07A, Women Singles | 0 |
| itf-women | 44233 | ITF Croatia 08A, Women Doubles | 0 |
| itf-women | 44231 | ITF Croatia 08A, Women Singles | 0 |
| itf-women | 44491 | ITF Croatia 09A, Women Doubles | 0 |
| itf-women | 44489 | ITF Croatia 09A, Women Singles | 0 |
| itf-women | 44603 | ITF Croatia 10A, Women Doubles | 0 |
| itf-women | 44601 | ITF Croatia 10A, Women Singles | 0 |
| itf-women | 39683 | ITF Cyprus 01A, Women Doubles | 0 |
| itf-women | 39681 | ITF Cyprus 01A, Women Singles | 0 |
| itf-women | 41592 | ITF Cyprus 02A, Women Doubles | 0 |
| itf-women | 41594 | ITF Cyprus 02A, Women Singles | 0 |
| itf-women | 41708 | ITF Cyprus 03A, Women Doubles | 0 |
| itf-women | 41710 | ITF Cyprus 03A, Women Singles | 0 |
| itf-women | 16274 | ITF Czech Republic 03A, Women Doubles | 0 |
| itf-women | 16272 | ITF Czech Republic 03A, Women Singles | 0 |
| itf-women | 15460 | ITF Czechia 01A, Women Doubles | 0 |
| itf-women | 15458 | ITF Czechia 01A, Women Singles | 0 |
| itf-women | 22955 | ITF Czechia 02A, Women Doubles | 0 |
| itf-women | 22953 | ITF Czechia 02A, Women Singles | 0 |
| itf-women | 16568 | ITF Czechia 04A, Women Doubles | 0 |
| itf-women | 16566 | ITF Czechia 04A, Women Singles | 0 |
| itf-women | 18310 | ITF Czechia 05A, Women Doubles | 0 |
| itf-women | 18308 | ITF Czechia 05A, Women Singles | 0 |
| itf-women | 18682 | ITF Czechia 06A, Women Doubles | 0 |
| itf-women | 18680 | ITF Czechia 06A, Women Singles | 0 |
| itf-women | 34820 | ITF Denmark 01A, Women Doubles | 0 |
| itf-women | 34818 | ITF Denmark 01A, Women Singles | 0 |
| itf-women | 34400 | ITF Dominican Republic 01A, Women Doubles | 0 |
| itf-women | 34404 | ITF Dominican Republic 01A, Women Singles | 0 |
| itf-women | 34442 | ITF Dominican Republic 02A, Women Doubles | 0 |
| itf-women | 34444 | ITF Dominican Republic 02A, Women Singles | 0 |
| itf-women | 35787 | ITF Dominican Republic 03A, Women Doubles | 0 |
| itf-women | 35785 | ITF Dominican Republic 03A, Women Singles | 0 |
| itf-women | 35885 | ITF Dominican Republic 04A, Women Doubles | 0 |
| itf-women | 35883 | ITF Dominican Republic 04A, Women Singles | 0 |
| itf-women | 38535 | ITF Dominican Republic 05A, Women Doubles | 0 |
| itf-women | 38537 | ITF Dominican Republic 05A, Women Singles | 0 |
| itf-women | 38647 | ITF Dominican Republic 06A, Women Doubles | 0 |
| itf-women | 38649 | ITF Dominican Republic 06A, Women Singles | 0 |
| itf-women | 41442 | ITF Dominican Republic 07A, Women Doubles | 0 |
| itf-women | 41440 | ITF Dominican Republic 07A, Women Singles | 0 |
| itf-women | 41520 | ITF Dominican Republic 08A, Women Doubles | 0 |
| itf-women | 41518 | ITF Dominican Republic 08A, Women Singles | 0 |
| itf-women | 43901 | ITF Dominican Republic 09A, Women Doubles | 0 |
| itf-women | 43899 | ITF Dominican Republic 09A, Women Singles | 0 |
| itf-women | 43999 | ITF Dominican Republic 10A, Women Doubles | 0 |
| itf-women | 43997 | ITF Dominican Republic 10A, Women Singles | 0 |
| itf-women | 45011 | ITF Dominican Republic 11A, Women Doubles | 0 |
| itf-women | 45009 | ITF Dominican Republic 11A, Women Singles | 0 |
| itf-women | 45129 | ITF Dominican Republic 12A, Women Doubles | 0 |
| itf-women | 45127 | ITF Dominican Republic 12A, Women Singles | 0 |
| itf-women | 20668 | ITF Egypt 01A, Women Doubles | 0 |
| itf-women | 20666 | ITF Egypt 01A, Women Singles | 0 |
| itf-women | 20716 | ITF Egypt 02A, Women Doubles | 0 |
| itf-women | 20714 | ITF Egypt 02A, Women Singles | 0 |
| itf-women | 21192 | ITF Egypt 03A, Women Doubles | 0 |
| itf-women | 21190 | ITF Egypt 03A, Women Singles | 0 |
| itf-women | 21234 | ITF Egypt 04A, Women Doubles | 0 |
| itf-women | 21232 | ITF Egypt 04A, Women Singles | 0 |
| itf-women | 21434 | ITF Egypt 05A, Women Doubles | 0 |
| itf-women | 21432 | ITF Egypt 05A, Women Singles | 0 |
| itf-women | 21488 | ITF Egypt 06A, Women Doubles | 0 |
| itf-women | 21486 | ITF Egypt 06A, Women Singles | 0 |
| itf-women | 21866 | ITF Egypt 07A, Women Doubles | 0 |
| itf-women | 21864 | ITF Egypt 07A, Women Singles | 0 |
| itf-women | 21924 | ITF Egypt 08A, Women Doubles | 0 |
| itf-women | 21922 | ITF Egypt 08A, Women Singles | 0 |
| itf-women | 21998 | ITF Egypt 09A, Women Doubles | 0 |
| itf-women | 21996 | ITF Egypt 09A, Women Singles | 0 |
| itf-women | 22094 | ITF Egypt 10A, Women Doubles | 0 |
| itf-women | 22092 | ITF Egypt 10A, Women Singles | 0 |
| itf-women | 21986 | ITF Egypt 11A, Women Doubles | 0 |
| itf-women | 21984 | ITF Egypt 11A, Women Singles | 0 |
| itf-women | 22306 | ITF Egypt 12A, Women Doubles | 0 |
| itf-women | 22304 | ITF Egypt 12A, Women Singles | 0 |
| itf-women | 22406 | ITF Egypt 13A, Women Doubles | 0 |
| itf-women | 22404 | ITF Egypt 13A, Women Singles | 0 |
| itf-women | 22440 | ITF Egypt 14A, Women Doubles | 0 |
| itf-women | 22438 | ITF Egypt 14A, Women Singles | 0 |
| itf-women | 22330 | ITF Egypt 15A, Women Doubles | 0 |
| itf-women | 22328 | ITF Egypt 15A, Women Singles | 0 |
| itf-women | 22506 | ITF Egypt 16A, Women Doubles | 0 |
| itf-women | 22504 | ITF Egypt 16A, Women Singles | 0 |
| itf-women | 23681 | ITF Egypt 17A, Women Doubles | 0 |
| itf-women | 23679 | ITF Egypt 17A, Women Singles | 0 |
| itf-women | 23071 | ITF Egypt 18A, Women Doubles | 0 |
| itf-women | 23069 | ITF Egypt 18A, Women Singles | 0 |
| itf-women | 23139 | ITF Egypt 19A, Women Doubles | 0 |
| itf-women | 23137 | ITF Egypt 19A, Women Singles | 0 |
| itf-women | 23371 | ITF Egypt 20A, Women Doubles | 0 |
| itf-women | 23369 | ITF Egypt 20A, Women Singles | 0 |
| itf-women | 16322 | ITF Egypt 21A, Women Doubles | 0 |
| itf-women | 16320 | ITF Egypt 21A, Women Singles | 0 |
| itf-women | 16592 | ITF Egypt 22A, Women Doubles | 0 |
| itf-women | 16590 | ITF Egypt 22A, Women Singles | 0 |
| itf-women | 16824 | ITF Egypt 23A, Women Doubles | 0 |
| itf-women | 16822 | ITF Egypt 23A, Women Singles | 0 |
| itf-women | 18688 | ITF Egypt 24A, Women Doubles | 0 |
| itf-women | 18686 | ITF Egypt 24A, Women Singles | 0 |
| itf-women | 19424 | ITF Egypt 25A, Women Doubles | 0 |
| itf-women | 19422 | ITF Egypt 25A, Women Singles | 0 |
| itf-women | 16600 | ITF Finland 01A, Women Doubles | 0 |
| itf-women | 16598 | ITF Finland 01A, Women Singles | 0 |
| itf-women | 16826 | ITF Finland 02A, Women Doubles | 0 |
| itf-women | 16828 | ITF Finland 02A, Women Singles | 0 |
| itf-women | 20452 | ITF France 01A, Women Doubles | 0 |
| itf-women | 20450 | ITF France 01A, Women Singles | 0 |
| itf-women | 20674 | ITF France 02A, Women Doubles | 0 |
| itf-women | 20672 | ITF France 02A, Women Singles | 0 |
| itf-women | 20722 | ITF France 03A, Women Doubles | 0 |
| itf-women | 20720 | ITF France 03A, Women Singles | 0 |
| itf-women | 21154 | ITF France 04A, Women Doubles | 0 |
| itf-women | 21152 | ITF France 04A, Women Singles | 0 |
| itf-women | 20704 | ITF France 05A, Women Doubles | 0 |
| itf-women | 20702 | ITF France 05A, Women Singles | 0 |
| itf-women | 22040 | ITF France 06A, Women Doubles | 0 |
| itf-women | 22038 | ITF France 06A, Women Singles | 0 |
| itf-women | 22112 | ITF France 07A, Women Doubles | 0 |
| itf-women | 22110 | ITF France 07A, Women Singles | 0 |
| itf-women | 22082 | ITF France 08A, Women Doubles | 0 |
| itf-women | 22080 | ITF France 08A, Women Singles | 0 |
| itf-women | 22324 | ITF France 10A, Women Doubles | 0 |
| itf-women | 22322 | ITF France 10A, Women Singles | 0 |
| itf-women | 22542 | ITF France 11A, Women Doubles | 0 |
| itf-women | 22540 | ITF France 11A, Women Singles | 0 |
| itf-women | 22610 | ITF France 12A, Women Doubles | 0 |
| itf-women | 22608 | ITF France 12A, Women Singles | 0 |
| itf-women | 22823 | ITF France 13A, Women Doubles | 0 |
| itf-women | 22821 | ITF France 13A, Women Singles | 0 |
| itf-women | 23039 | ITF France 15A, Women Doubles | 0 |
| itf-women | 23037 | ITF France 15A, Women Singles | 0 |
| itf-women | 23323 | ITF France 16A, Women Doubles | 0 |
| itf-women | 23321 | ITF France 16A, Women Singles | 0 |
| itf-women | 19302 | ITF France 17A, Women Doubles | 0 |
| itf-women | 19298 | ITF France 17A, Women Singles | 0 |
| itf-women | 19542 | ITF France 18A, Women Doubles | 0 |
| itf-women | 19540 | ITF France 18A, Women Singles | 0 |
| itf-women | 23109 | ITF France 19A, Women Doubles | 0 |
| itf-women | 23107 | ITF France 19A, Women Singles | 0 |
| itf-women | 16604 | ITF France 20A, Women Doubles | 0 |
| itf-women | 16602 | ITF France 20A, Women Singles | 0 |
| itf-women | 20536 | ITF France 21A, Women Doubles | 0 |
| itf-women | 20534 | ITF France 21A, Women Singles | 0 |
| itf-women | 20832 | ITF France 22A, Women Doubles | 0 |
| itf-women | 20830 | ITF France 22A, Women Singles | 0 |
| itf-women | 19766 | ITF France 23A, Women Doubles | 0 |
| itf-women | 19764 | ITF France 23A, Women Singles | 0 |
| itf-women | 20128 | ITF France 24A, Women Doubles | 0 |
| itf-women | 20126 | ITF France 24A, Women Singles | 0 |
| itf-women | 20336 | ITF France 25A, Women Doubles | 0 |
| itf-women | 20334 | ITF France 25A, Women Singles | 0 |
| itf-women | 28729 | ITF France 26A, Women Doubles | 0 |
| itf-women | 28727 | ITF France 26A, Women Singles | 0 |
| itf-women | 44371 | ITF France 27A, Women Doubles | 0 |
| itf-women | 44369 | ITF France 27A, Women Singles | 0 |
| itf-women | 30951 | ITF France 28A, Women Doubles | 0 |
| itf-women | 30953 | ITF France 28A, Women Singles | 0 |
| itf-women | 23377 | ITF Georgia 01A, Women Doubles | 0 |
| itf-women | 23375 | ITF Georgia 01A, Women Singles | 0 |
| itf-women | 13607 | ITF Georgia 02A, Women Doubles | 0 |
| itf-women | 13605 | ITF Georgia 02A, Women Singles | 0 |
| itf-women | 43409 | ITF Georgia 06A, Women Singles | 0 |
| itf-women | 43463 | ITF Georgia 07A, Women Doubles | 0 |
| itf-women | 43461 | ITF Georgia 07A, Women Singles | 0 |
| itf-women | 20686 | ITF Germany 01A, Women Doubles | 0 |
| itf-women | 20684 | ITF Germany 01A, Women Singles | 0 |
| itf-women | 21278 | ITF Germany 02A, Women Doubles | 0 |
| itf-women | 21276 | ITF Germany 02A, Women Singles | 0 |
| itf-women | 22488 | ITF Germany 03A, Women Doubles | 0 |
| itf-women | 22486 | ITF Germany 03A, Women Singles | 0 |
| itf-women | 22925 | ITF Germany 04A, Women Doubles | 0 |
| itf-women | 22923 | ITF Germany 04A, Women Singles | 0 |
| itf-women | 23045 | ITF Germany 05A, Women Doubles | 0 |
| itf-women | 23043 | ITF Germany 05A, Women Singles | 0 |
| itf-women | 13875 | ITF Germany 06A, Women Doubles | 0 |
| itf-women | 13873 | ITF Germany 06A, Women Singles | 0 |
| itf-women | 16936 | ITF Germany 07A, Women Doubles | 0 |
| itf-women | 16934 | ITF Germany 07A, Women Singles | 0 |
| itf-women | 23335 | ITF Germany 08A, Women Doubles | 0 |
| itf-women | 23333 | ITF Germany 08A, Women Singles | 0 |
| itf-women | 23115 | ITF Germany 09A, Women Doubles | 0 |
| itf-women | 23113 | ITF Germany 09A, Women Singles | 0 |
| itf-women | 16304 | ITF Germany 10A, Women Doubles | 0 |
| itf-women | 16302 | ITF Germany 10A, Women Singles | 0 |
| itf-women | 16580 | ITF Germany 11A, Women Doubles | 0 |
| itf-women | 16578 | ITF Germany 11A, Women Singles | 0 |
| itf-women | 16808 | ITF Germany 12A, Women Doubles | 0 |
| itf-women | 16806 | ITF Germany 12A, Women Singles | 0 |
| itf-women | 17244 | ITF Germany 13A, Women Doubles | 0 |
| itf-women | 17242 | ITF Germany 13A, Women Singles | 0 |
| itf-women | 18602 | ITF Germany 15A, Women Doubles | 0 |
| itf-women | 18600 | ITF Germany 15A, Women Singles | 0 |
| itf-women | 23591 | ITF Germany 16A, Women Doubles | 0 |
| itf-women | 23589 | ITF Germany 16A, Women Singles | 0 |
| itf-women | 43411 | ITF Goergia 06A, Women Doubles | 0 |
| itf-women | 21198 | ITF Great Britain 01A, Women Doubles | 0 |
| itf-women | 21196 | ITF Great Britain 01A, Women Singles | 0 |
| itf-women | 23801 | ITF Great Britain 02A, Women Doubles | 0 |
| itf-women | 23799 | ITF Great Britain 02A, Women Singles | 0 |
| itf-women | 25059 | ITF Great Britain 03A, Women Doubles | 0 |
| itf-women | 25057 | ITF Great Britain 03A, Women Singles | 0 |
| itf-women | 23963 | ITF Great Britain 04A, Women Doubles | 0 |
| itf-women | 23961 | ITF Great Britain 04A, Women Singles | 0 |
| itf-women | 24782 | ITF Great Britain 05A, Women Doubles | 0 |
| itf-women | 24780 | ITF Great Britain 05A, Women Singles | 0 |
| itf-women | 21440 | ITF Great Britain 07A, Women Doubles | 0 |
| itf-women | 21438 | ITF Great Britain 07A, Women Singles | 0 |
| itf-women | 22829 | ITF Great Britain 08A, Women Doubles | 0 |
| itf-women | 22827 | ITF Great Britain 08A, Women Singles | 0 |
| itf-women | 23027 | ITF Great Britain 09A, Women Doubles | 0 |
| itf-women | 23025 | ITF Great Britain 09A, Women Singles | 0 |
| itf-women | 15610 | ITF Great Britain 11A, Women Doubles | 0 |
| itf-women | 15608 | ITF Great Britain 11A, Women Singles | 0 |
| itf-women | 16812 | ITF Great Britain 12A, Women Doubles | 0 |
| itf-women | 16810 | ITF Great Britain 12A, Women Singles | 0 |
| itf-women | 17020 | ITF Great Britain 13A, Women Doubles | 0 |
| itf-women | 17018 | ITF Great Britain 13A, Women Singles | 0 |
| itf-women | 20606 | ITF Great Britain 14A, Women Doubles | 0 |
| itf-women | 20604 | ITF Great Britain 14A, Women Singles | 0 |
| itf-women | 20994 | ITF Great Britain 16A, Women Doubles | 0 |
| itf-women | 20992 | ITF Great Britain 16A, Women Singles | 0 |
| itf-women | 38173 | ITF Great Britain 18A, Women Doubles | 0 |
| itf-women | 38175 | ITF Great Britain 18A, Women Singles | 0 |
| itf-women | 38139 | ITF Great Britain 19A, Women Doubles | 0 |
| itf-women | 38141 | ITF Great Britain 19A, Women Singles | 0 |
| itf-women | 21930 | ITF Greece 01A, Women Doubles | 0 |
| itf-women | 21928 | ITF Greece 01A, Women Singles | 0 |
| itf-women | 22046 | ITF Greece 02A, Women Doubles | 0 |
| itf-women | 22044 | ITF Greece 02A, Women Singles | 0 |
| itf-women | 22130 | ITF Greece 03A, Women Doubles | 0 |
| itf-women | 22128 | ITF Greece 03A, Women Singles | 0 |
| itf-women | 21980 | ITF Greece 04A, Women Doubles | 0 |
| itf-women | 21978 | ITF Greece 04A, Women Singles | 0 |
| itf-women | 22342 | ITF Greece 05A, Women Doubles | 0 |
| itf-women | 22340 | ITF Greece 05A, Women Singles | 0 |
| itf-women | 20612 | ITF Greece 06A, Women Doubles | 0 |
| itf-women | 20610 | ITF Greece 06A, Women Singles | 0 |
| itf-women | 20892 | ITF Greece 07A, Women Doubles | 0 |
| itf-women | 20890 | ITF Greece 07A, Women Singles | 0 |
| itf-women | 21054 | ITF Greece 08A, Women Doubles | 0 |
| itf-women | 21052 | ITF Greece 08A, Women Singles | 0 |
| itf-women | 21376 | ITF Greece 09A, Women Doubles | 0 |
| itf-women | 21374 | ITF Greece 09A, Women Singles | 0 |
| itf-women | 21604 | ITF Greece 10A, Women Doubles | 0 |
| itf-women | 21602 | ITF Greece 10A, Women Singles | 0 |
| itf-women | 20440 | ITF Hong Kong 01A, Women Doubles | 0 |
| itf-women | 20438 | ITF Hong Kong 01A, Women Singles | 0 |
| itf-women | 24516 | ITF Hong Kong 02A, Women Doubles | 0 |
| itf-women | 24514 | ITF Hong Kong 02A, Women Singles | 0 |
| itf-women | 22512 | ITF Hungary 01A, Women Doubles | 0 |
| itf-women | 22510 | ITF Hungary 01A, Women Singles | 0 |
| itf-women | 14973 | ITF India 01A, Women Doubles | 0 |
| itf-women | 14975 | ITF India 01A, Women Singles | 0 |
| itf-women | 23009 | ITF India 02A, Women Doubles | 0 |
| itf-women | 23007 | ITF India 02A, Women Singles | 0 |
| itf-women | 21000 | ITF India 03A, Women Doubles | 0 |
| itf-women | 20998 | ITF India 03A, Women Singles | 0 |
| itf-women | 22246 | ITF India 04A, Women Doubles | 0 |
| itf-women | 22244 | ITF India 04A, Women Singles | 0 |
| itf-women | 14662 | ITF India 05A, Women Doubles | 0 |
| itf-women | 14660 | ITF India 05A, Women Singles | 0 |
| itf-women | 23277 | ITF India 06A, Women Doubles | 0 |
| itf-women | 23275 | ITF India 06A, Women Singles | 0 |
| itf-women | 21820 | ITF India 07A, Women Doubles | 0 |
| itf-women | 21818 | ITF India 07A, Women Singles | 0 |
| itf-women | 35781 | ITF India 08A, Women Doubles | 0 |
| itf-women | 35779 | ITF India 08A, Women Singles | 0 |
| itf-women | 38867 | ITF India 09A, Women Doubles | 0 |
| itf-women | 38861 | ITF India 09A, Women Singles | 0 |
| itf-women | 41899 | ITF India 10A, Women Doubles | 0 |
| itf-women | 41901 | ITF India 10A, Women Singles | 0 |
| itf-women | 41949 | ITF India 11A, Women Doubles | 0 |
| itf-women | 41947 | ITF India 11A, Women Singles | 0 |
| itf-women | 16612 | ITF Ireland 01A, Women Doubles | 0 |
| itf-women | 16610 | ITF Ireland 01A, Women Singles | 0 |
| itf-women | 22076 | ITF Italy 01A, Women Doubles | 0 |
| itf-women | 22074 | ITF Italy 01A, Women Singles | 0 |
| itf-women | 22028 | ITF Italy 02A, Women Doubles | 0 |
| itf-women | 22026 | ITF Italy 02A, Women Singles | 0 |
| itf-women | 21936 | ITF Italy 03A, Women Doubles | 0 |
| itf-women | 21934 | ITF Italy 03A, Women Singles | 0 |
| itf-women | 22052 | ITF Italy 04A, Women Doubles | 0 |
| itf-women | 22050 | ITF Italy 04A, Women Singles | 0 |
| itf-women | 22184 | ITF Italy 05A, Women Doubles | 0 |
| itf-women | 22182 | ITF Italy 05A, Women Singles | 0 |
| itf-women | 22386 | ITF Italy 06A, Women Doubles | 0 |
| itf-women | 22384 | ITF Italy 06A, Women Singles | 0 |
| itf-women | 22424 | ITF Italy 07A, Women Doubles | 0 |
| itf-women | 22422 | ITF Italy 07A, Women Singles | 0 |
| itf-women | 22356 | ITF Italy 08A, Women Doubles | 0 |
| itf-women | 22354 | ITF Italy 08A, Women Singles | 0 |
| itf-women | 22524 | ITF Italy 09A, Women Doubles | 0 |
| itf-women | 22522 | ITF Italy 09A, Women Singles | 0 |
| itf-women | 22562 | ITF Italy 10A, Women Doubles | 0 |
| itf-women | 22560 | ITF Italy 10A, Women Singles | 0 |
| itf-women | 22697 | ITF Italy 11A, Women Doubles | 0 |
| itf-women | 22695 | ITF Italy 11A, Women Singles | 0 |
| itf-women | 22739 | ITF Italy 12A, Women Doubles | 0 |
| itf-women | 22737 | ITF Italy 12A, Women Singles | 0 |
| itf-women | 22901 | ITF Italy 13A, Women Doubles | 0 |
| itf-women | 22899 | ITF Italy 13A, Women Singles | 0 |
| itf-women | 22985 | ITF Italy 14A, Women Doubles | 0 |
| itf-women | 22983 | ITF Italy 14A, Women Singles | 0 |
| itf-women | 13827 | ITF Italy 15A, Women Doubles | 0 |
| itf-women | 13825 | ITF Italy 15A, Women Singles | 0 |
| itf-women | 23083 | ITF Italy 16A, Women Doubles | 0 |
| itf-women | 23081 | ITF Italy 16A, Women Singles | 0 |
| itf-women | 23103 | ITF Italy 17A, Women Doubles | 0 |
| itf-women | 23101 | ITF Italy 17A, Women Singles | 0 |
| itf-women | 23347 | ITF Italy 18A, Women Doubles | 0 |
| itf-women | 23345 | ITF Italy 18A, Women Singles | 0 |
| itf-women | 16310 | ITF Italy 19A, Women Doubles | 0 |
| itf-women | 16308 | ITF Italy 19A, Women Singles | 0 |
| itf-women | 16616 | ITF Italy 20A, Women Doubles | 0 |
| itf-women | 16614 | ITF Italy 20A, Women Singles | 0 |
| itf-women | 24558 | ITF Italy 21A, Women Doubles | 0 |
| itf-women | 24556 | ITF Italy 21A, Women Singles | 0 |
| itf-women | 17150 | ITF Italy 22A, Women Doubles | 0 |
| itf-women | 17148 | ITF Italy 22A, Women Singles | 0 |
| itf-women | 17548 | ITF Italy 23A, Women Doubles | 0 |
| itf-women | 17546 | ITF Italy 23A, Women Singles | 0 |
| itf-women | 18290 | ITF Italy 24A, Women Doubles | 0 |
| itf-women | 18288 | ITF Italy 24A, Women Singles | 0 |
| itf-women | 18696 | ITF Italy 25A, Women Doubles | 0 |
| itf-women | 18694 | ITF Italy 25A, Women Singles | 0 |
| itf-women | 19372 | ITF Italy 26A, Women Doubles | 0 |
| itf-women | 19366 | ITF Italy 26A, Women Singles | 0 |
| itf-women | 19646 | ITF Italy 27A, Women Doubles | 0 |
| itf-women | 19644 | ITF Italy 27A, Women Singles | 0 |
| itf-women | 19882 | ITF Italy 28A, Women Doubles | 0 |
| itf-women | 19880 | ITF Italy 28A, Women Singles | 0 |
| itf-women | 20046 | ITF Italy 29A, Women Doubles | 0 |
| itf-women | 20044 | ITF Italy 29A, Women Singles | 0 |
| itf-women | 20280 | ITF Italy 30A, Women Doubles | 0 |
| itf-women | 20278 | ITF Italy 30A, Women Singles | 0 |
| itf-women | 20348 | ITF Italy 31A, Women Doubles | 0 |
| itf-women | 20346 | ITF Italy 31A, Women Singles | 0 |
| itf-women | 20566 | ITF Italy 32A, Women Doubles | 0 |
| itf-women | 20564 | ITF Italy 32A, Women Singles | 0 |
| itf-women | 22118 | ITF Japan 01A, Women Doubles | 0 |
| itf-women | 22116 | ITF Japan 01A, Women Singles | 0 |
| itf-women | 22022 | ITF Japan 02A, Women Doubles | 0 |
| itf-women | 22020 | ITF Japan 02A, Women Singles | 0 |
| itf-women | 22208 | ITF Japan 03A, Women Doubles | 0 |
| itf-women | 22206 | ITF Japan 03A, Women Singles | 0 |
| itf-women | 22476 | ITF Japan 04A, Women Doubles | 0 |
| itf-women | 22474 | ITF Japan 04A, Women Singles | 0 |
| itf-women | 22550 | ITF Japan 05A, Women Doubles | 0 |
| itf-women | 22548 | ITF Japan 05A, Women Singles | 0 |
| itf-women | 22616 | ITF Japan 06A, Women Doubles | 0 |
| itf-women | 22614 | ITF Japan 06A, Women Singles | 0 |
| itf-women | 22703 | ITF Japan 07A, Women Doubles | 0 |
| itf-women | 22701 | ITF Japan 07A, Women Singles | 0 |
| itf-women | 18702 | ITF Japan 10A, Women Doubles | 0 |
| itf-women | 18700 | ITF Japan 10A, Women Singles | 0 |
| itf-women | 20274 | ITF Japan 11A, Women Doubles | 0 |
| itf-women | 20272 | ITF Japan 11A, Women Singles | 0 |
| itf-women | 21326 | ITF Japan 13A, Women Doubles | 0 |
| itf-women | 21324 | ITF Japan 13A, Women Singles | 0 |
| itf-women | 20976 | ITF Japan 14A, Women Doubles | 0 |
| itf-women | 20974 | ITF Japan 14A, Women Singles | 0 |
| itf-women | 26354 | ITF Japan 15A, Women Doubles | 0 |
| itf-women | 26352 | ITF Japan 15A, Women Singles | 0 |
| itf-women | 40853 | ITF Japan 19A, Women Doubles | 0 |
| itf-women | 40851 | ITF Japan 19A, Women Singles | 0 |
| itf-women | 41003 | ITF Japan 20A, Women Doubles | 0 |
| itf-women | 41005 | ITF Japan 20A, Women Singles | 0 |
| itf-women | 41075 | ITF Japan 21A, Women Doubles | 0 |
| itf-women | 41073 | ITF Japan 21A, Women Singles | 0 |
| itf-women | 41142 | ITF Japan 22A, Women Doubles | 0 |
| itf-women | 41144 | ITF Japan 22A, Women Singles | 0 |
| itf-women | 41196 | ITF Japan 23A, Women Doubles | 0 |
| itf-women | 41198 | ITF Japan 23A, Women Singles | 0 |
| itf-women | 41702 | ITF Japan 24A, Women Doubles | 0 |
| itf-women | 41704 | ITF Japan 24A, Women Singles | 0 |
| itf-women | 44695 | ITF Japan 25A, Women Doubles | 0 |
| itf-women | 44697 | ITF Japan 25A, Women Singles | 0 |
| itf-women | 43351 | ITF Japan 26A, Women Doubles | 0 |
| itf-women | 43349 | ITF Japan 26A, Women Singles | 0 |
| itf-women | 42937 | ITF Japan 27A, Women Doubles | 0 |
| itf-women | 42939 | ITF Japan 27A, Women Singles | 0 |
| itf-women | 42989 | ITF Japan 28A, Women Doubles | 0 |
| itf-women | 42991 | ITF Japan 28A, Women Singles | 0 |
| itf-women | 44999 | ITF Japan 29A, Women Doubles | 0 |
| itf-women | 44997 | ITF Japan 29A, Women Singles | 0 |
| itf-women | 43393 | ITF Japan 30A, Women Doubles | 0 |
| itf-women | 43391 | ITF Japan 30A, Women Singles | 0 |
| itf-women | 45123 | ITF Japan 31A, Women Doubles | 0 |
| itf-women | 45121 | ITF Japan 31A, Women Singles | 0 |
| itf-women | 44787 | ITF Japan 34A, Women Doubles | 0 |
| itf-women | 44785 | ITF Japan 34A, Women Singles | 0 |
| itf-women | 20728 | ITF Kazakhstan 01A, Women Doubles | 0 |
| itf-women | 20726 | ITF Kazakhstan 01A, Women Singles | 0 |
| itf-women | 21204 | ITF Kazakhstan 02A, Women Doubles | 0 |
| itf-women | 21202 | ITF Kazakhstan 02A, Women Singles | 0 |
| itf-women | 22446 | ITF Kazakhstan 03A, Women Doubles | 0 |
| itf-women | 22444 | ITF Kazakhstan 03A, Women Singles | 0 |
| itf-women | 25275 | ITF Kazakhstan 04A, Women Doubles | 0 |
| itf-women | 25273 | ITF Kazakhstan 04A, Women Singles | 0 |
| itf-women | 16268 | ITF Kazakhstan 05A, Women Doubles | 0 |
| itf-women | 16266 | ITF Kazakhstan 05A, Women Singles | 0 |
| itf-women | 18298 | ITF Kazakhstan 06A, Women Doubles | 0 |
| itf-women | 18296 | ITF Kazakhstan 06A, Women Singles | 0 |
| itf-women | 19676 | ITF Kazakhstan 07A, Women Doubles | 0 |
| itf-women | 19674 | ITF Kazakhstan 07A, Women Singles | 0 |
| itf-women | 38417 | ITF Kenya 01A, Women Doubles | 0 |
| itf-women | 38419 | ITF Kenya 01A, Women Singles | 0 |
| itf-women | 38529 | ITF Kenya 02A, Women Doubles | 0 |
| itf-women | 38531 | ITF Kenya 02A, Women Singles | 0 |
| itf-women | 20856 | ITF Luxembourg 01A, Women Doubles | 0 |
| itf-women | 20854 | ITF Luxembourg 01A, Women Singles | 0 |
| itf-women | 38513 | ITF Luxembourg 02A, Women Doubles | 0 |
| itf-women | 38515 | ITF Luxembourg 02A, Women Singles | 0 |
| itf-women | 44781 | ITF Luxembourg 03A, Women Doubles | 0 |
| itf-women | 44779 | ITF Luxembourg 03A, Women Singles | 0 |
| itf-women | 39125 | ITF Malaysia 01A, Women Doubles | 0 |
| itf-women | 39127 | ITF Malaysia 01A, Women Singles | 0 |
| itf-women | 39167 | ITF Malaysia 02A, Women Doubles | 0 |
| itf-women | 39169 | ITF Malaysia 02A, Women Singles | 0 |
| itf-women | 22392 | ITF Mexico 01A, Women Doubles | 0 |
| itf-women | 22390 | ITF Mexico 01A, Women Singles | 0 |
| itf-women | 19634 | ITF Mexico 02A, Women Doubles | 0 |
| itf-women | 19632 | ITF Mexico 02A, Women Singles | 0 |
| itf-women | 23603 | ITF Mexico 03A, Women Doubles | 0 |
| itf-women | 23601 | ITF Mexico 03A, Women Singles | 0 |
| itf-women | 23609 | ITF Mexico 04A, Women Doubles | 0 |
| itf-women | 23607 | ITF Mexico 04A, Women Singles | 0 |
| itf-women | 28285 | ITF Mexico 05A, Women Doubles | 0 |
| itf-women | 28283 | ITF Mexico 05A, Women Singles | 0 |
| itf-women | 23615 | ITF Mexico 06A, Women Doubles | 0 |
| itf-women | 23613 | ITF Mexico 06A, Women Singles | 0 |
| itf-women | 23621 | ITF Mexico 07A, Women Doubles | 0 |
| itf-women | 23619 | ITF Mexico 07A, Women Singles | 0 |
| itf-women | 28223 | ITF Mexico 09A, Women Doubles | 0 |
| itf-women | 28215 | ITF Mexico 09A, Women Singles | 0 |
| itf-women | 20862 | ITF Morocco 01A, Women Doubles | 0 |
| itf-women | 20860 | ITF Morocco 01A, Women Singles | 0 |
| itf-women | 21178 | ITF Morocco 03A, Women Doubles | 0 |
| itf-women | 21176 | ITF Morocco 03A, Women Singles | 0 |
| itf-women | 37139 | ITF Morocco 04A, Women Doubles | 0 |
| itf-women | 37141 | ITF Morocco 04A, Women Singles | 0 |
| itf-women | 22853 | ITF Netherlands 01A, Women Doubles | 0 |
| itf-women | 22851 | ITF Netherlands 01A, Women Singles | 0 |
| itf-women | 23383 | ITF Netherlands 03A, Women Doubles | 0 |
| itf-women | 23381 | ITF Netherlands 03A, Women Singles | 0 |
| itf-women | 17284 | ITF Netherlands 04A, Women Doubles | 0 |
| itf-women | 17282 | ITF Netherlands 04A, Women Singles | 0 |
| itf-women | 17554 | ITF Netherlands 05A, Women Doubles | 0 |
| itf-women | 17552 | ITF Netherlands 05A, Women Singles | 0 |
| itf-women | 18324 | ITF Netherlands 06A, Women Doubles | 0 |
| itf-women | 18322 | ITF Netherlands 06A, Women Singles | 0 |
| itf-women | 31887 | ITF New Zealand 01A, Women Doubles | 0 |
| itf-women | 31885 | ITF New Zealand 01A, Women Singles | 0 |
| itf-women | 38823 | ITF New Zealand 02A, Women Doubles | 0 |
| itf-women | 38825 | ITF New Zealand 02A, Women Singles | 0 |
| itf-women | 40943 | ITF North Macedonia 01B, Women Doubles | 0 |
| itf-women | 40941 | ITF North Macedonia 01B, Women Singles | 0 |
| itf-women | 20868 | ITF Paraguay 01A, Women Doubles | 0 |
| itf-women | 20866 | ITF Paraguay 01A, Women Singles | 0 |
| itf-women | 20950 | ITF Paraguay 02A, Women Doubles | 0 |
| itf-women | 20948 | ITF Paraguay 02A, Women Singles | 0 |
| itf-women | 29392 | ITF Peru 01A, Women Doubles | 0 |
| itf-women | 29394 | ITF Peru 01A, Women Singles | 0 |
| itf-women | 29262 | ITF Peru 02A, Women Doubles | 0 |
| itf-women | 29260 | ITF Peru 02A, Women Singles | 0 |
| itf-women | 22907 | ITF Poland 01A, Women Doubles | 0 |
| itf-women | 22905 | ITF Poland 01A, Women Singles | 0 |
| itf-women | 23051 | ITF Poland 02A, Women Doubles | 0 |
| itf-women | 23049 | ITF Poland 02A, Women Singles | 0 |
| itf-women | 16902 | ITF Poland 03A, Women Doubles | 0 |
| itf-women | 16900 | ITF Poland 03A, Women Singles | 0 |
| itf-women | 17156 | ITF Poland 04A, Women Doubles | 0 |
| itf-women | 17154 | ITF Poland 04A, Women Singles | 0 |
| itf-women | 17384 | ITF Poland 05A, Women Doubles | 0 |
| itf-women | 17382 | ITF Poland 05A, Women Singles | 0 |
| itf-women | 18144 | ITF Poland 06A, Women Doubles | 0 |
| itf-women | 18142 | ITF Poland 06A, Women Singles | 0 |
| itf-women | 15117 | ITF Portugal 01A, Women Doubles | 0 |
| itf-women | 15115 | ITF Portugal 01A, Women Singles | 0 |
| itf-women | 21968 | ITF Portugal 02A, Women Doubles | 0 |
| itf-women | 21966 | ITF Portugal 02A, Women Singles | 0 |
| itf-women | 13833 | ITF Portugal 03A, Women Doubles | 0 |
| itf-women | 13831 | ITF Portugal 03A, Women Singles | 0 |
| itf-women | 15375 | ITF Portugal 04A, Women Doubles | 0 |
| itf-women | 15373 | ITF Portugal 04A, Women Singles | 0 |
| itf-women | 15437 | ITF Portugal 05A, Women Doubles | 0 |
| itf-women | 15435 | ITF Portugal 05A, Women Singles | 0 |
| itf-women | 15454 | ITF Portugal 06A, Women Doubles | 0 |
| itf-women | 15452 | ITF Portugal 06A, Women Singles | 0 |
| itf-women | 14431 | ITF Portugal 07A, Women Doubles | 0 |
| itf-women | 16896 | ITF Portugal 07A, Women Singles | 0 |
| itf-women | 23145 | ITF Portugal 08A, Women Doubles | 0 |
| itf-women | 23143 | ITF Portugal 08A, Women Singles | 0 |
| itf-women | 16886 | ITF Portugal 09A, Women Doubles | 0 |
| itf-women | 16888 | ITF Portugal 09A, Women Singles | 0 |
| itf-women | 14435 | ITF Portugal 11A, Women Doubles | 0 |
| itf-women | 14433 | ITF Portugal 11A, Women Singles | 0 |
| itf-women | 20250 | ITF Portugal 12A, Women Doubles | 0 |
| itf-women | 20248 | ITF Portugal 12A, Women Singles | 0 |
| itf-women | 20358 | ITF Portugal 13A, Women Doubles | 0 |
| itf-women | 20360 | ITF Portugal 13A, Women Singles | 0 |
| itf-women | 20572 | ITF Portugal 14A, Women Doubles | 0 |
| itf-women | 20570 | ITF Portugal 14A, Women Singles | 0 |
| itf-women | 20070 | ITF Portugal 15A, Women Doubles | 0 |
| itf-women | 20068 | ITF Portugal 15A, Women Singles | 0 |
| itf-women | 24788 | ITF Portugal 16A, Women Doubles | 0 |
| itf-women | 24786 | ITF Portugal 16A, Women Singles | 0 |
| itf-women | 25571 | ITF Portugal 17A, Women Doubles | 0 |
| itf-women | 25569 | ITF Portugal 17A, Women Singles | 0 |
| itf-women | 26628 | ITF Portugal 18A, Women Doubles | 0 |
| itf-women | 26626 | ITF Portugal 18A, Women Singles | 0 |
| itf-women | 13931 | ITF Portugal 19A, Women Doubles | 0 |
| itf-women | 13929 | ITF Portugal 19A, Women Singles | 0 |
| itf-women | 25703 | ITF Portugal 20A, Women Doubles | 0 |
| itf-women | 25701 | ITF Portugal 20A, Women Singles | 0 |
| itf-women | 26420 | ITF Portugal 21A, Women Doubles | 0 |
| itf-women | 26418 | ITF Portugal 21A, Women Singles | 0 |
| itf-women | 24534 | ITF Portugal 22A, Women Doubles | 0 |
| itf-women | 24532 | ITF Portugal 22A, Women Singles | 0 |
| itf-women | 15484 | ITF Romania 01A, Women Doubles | 0 |
| itf-women | 15482 | ITF Romania 01A, Women Singles | 0 |
| itf-women | 23091 | ITF Romania 02A, Women Doubles | 0 |
| itf-women | 23087 | ITF Romania 02A, Women Singles | 0 |
| itf-women | 23151 | ITF Romania 03A, Women Doubles | 0 |
| itf-women | 23149 | ITF Romania 03A, Women Singles | 0 |
| itf-women | 16328 | ITF Romania 05A, Women Doubles | 0 |
| itf-women | 16326 | ITF Romania 05A, Women Singles | 0 |
| itf-women | 16620 | ITF Romania 06A, Women Doubles | 0 |
| itf-women | 16618 | ITF Romania 06A, Women Singles | 0 |
| itf-women | 16832 | ITF Romania 07A, Women Doubles | 0 |
| itf-women | 16830 | ITF Romania 07A, Women Singles | 0 |
| itf-women | 17562 | ITF Romania 09A, Women Doubles | 0 |
| itf-women | 17560 | ITF Romania 09A, Women Singles | 0 |
| itf-women | 18304 | ITF Romania 10A, Women Doubles | 0 |
| itf-women | 18302 | ITF Romania 10A, Women Singles | 0 |
| itf-women | 43399 | ITF Romania 11A, Women Doubles | 0 |
| itf-women | 43397 | ITF Romania 11A, Women Singles | 0 |
| itf-women | 43729 | ITF Romania 12A, Women Doubles | 0 |
| itf-women | 43727 | ITF Romania 12A, Women Singles | 0 |
| itf-women | 43471 | ITF Romania 13A, Women Doubles | 0 |
| itf-women | 43467 | ITF Romania 13A, Women Singles | 0 |
| itf-women | 43575 | ITF Romania 14A, Women Doubles | 0 |
| itf-women | 43577 | ITF Romania 14A, Women Singles | 0 |
| itf-women | 43639 | ITF Romania 15A, Women Doubles | 0 |
| itf-women | 43637 | ITF Romania 15A, Women Singles | 0 |
| itf-women | 43889 | ITF Romania 16A, Women Doubles | 0 |
| itf-women | 43887 | ITF Romania 16A, Women Singles | 0 |
| itf-women | 22805 | ITF Serbia 01A, Women Doubles | 0 |
| itf-women | 22803 | ITF Serbia 01A, Women Singles | 0 |
| itf-women | 23271 | ITF Serbia 02A, Women Doubles | 0 |
| itf-women | 23269 | ITF Serbia 02A, Women Singles | 0 |
| itf-women | 23389 | ITF Serbia 03A, Women Doubles | 0 |
| itf-women | 23387 | ITF Serbia 03A, Women Singles | 0 |
| itf-women | 17568 | ITF Serbia 04A, Women Doubles | 0 |
| itf-women | 17566 | ITF Serbia 04A, Women Singles | 0 |
| itf-women | 39857 | ITF Serbia 06A, Women Doubles | 0 |
| itf-women | 39859 | ITF Serbia 06A, Women Singles | 0 |
| itf-women | 39921 | ITF Serbia 07A, Women Doubles | 0 |
| itf-women | 39919 | ITF Serbia 07A, Women Singles | 0 |
| itf-women | 40031 | ITF Serbia 09A, Women Doubles | 0 |
| itf-women | 40029 | ITF Serbia 09A, Women Singles | 0 |
| itf-women | 40105 | ITF Serbia 10A, Women Doubles | 0 |
| itf-women | 40103 | ITF Serbia 10A, Women Singles | 0 |
| itf-women | 40157 | ITF Serbia 11A, Women Doubles | 0 |
| itf-women | 40159 | ITF Serbia 11A, Women Singles | 0 |
| itf-women | 40619 | ITF Serbia 12A, Women Doubles | 0 |
| itf-women | 40617 | ITF Serbia 12A, Women Singles | 0 |
| itf-women | 40789 | ITF Serbia 13A, Women Doubles | 0 |
| itf-women | 40787 | ITF Serbia 13A, Women Singles | 0 |
| itf-women | 40871 | ITF Serbia 14A, Women Doubles | 0 |
| itf-women | 40869 | ITF Serbia 14A, Women Singles | 0 |
| itf-women | 40949 | ITF Serbia 15A, Women Doubles | 0 |
| itf-women | 40947 | ITF Serbia 15A, Women Singles | 0 |
| itf-women | 41009 | ITF Serbia 16A, Women Doubles | 0 |
| itf-women | 41011 | ITF Serbia 16A, Women Singles | 0 |
| itf-women | 41069 | ITF Serbia 17A, Women Doubles | 0 |
| itf-women | 41067 | ITF Serbia 17A, Women Singles | 0 |
| itf-women | 43417 | ITF Serbia 18A, Women Doubles | 0 |
| itf-women | 43415 | ITF Serbia 18A, Women Singles | 0 |
| itf-women | 43493 | ITF Serbia 19A, Women Doubles | 0 |
| itf-women | 43491 | ITF Serbia 19A, Women Singles | 0 |
| itf-women | 43569 | ITF Serbia 20A, Women Doubles | 0 |
| itf-women | 43571 | ITF Serbia 20A, Women Singles | 0 |
| itf-women | 43649 | ITF Serbia 21A, Women Doubles | 0 |
| itf-women | 43647 | ITF Serbia 21A, Women Singles | 0 |
| itf-women | 43735 | ITF Serbia 22A, Women Doubles | 0 |
| itf-women | 43733 | ITF Serbia 22A, Women Singles | 0 |
| itf-women | 43907 | ITF Serbia 23A, Women Doubles | 0 |
| itf-women | 43905 | ITF Serbia 23A, Women Singles | 0 |
| itf-women | 44019 | ITF Serbia 24A, Women Doubles | 0 |
| itf-women | 44017 | ITF Serbia 24A, Women Singles | 0 |
| itf-women | 44069 | ITF Serbia 25A, Women Doubles | 0 |
| itf-women | 44067 | ITF Serbia 25A, Women Singles | 0 |
| itf-women | 44147 | ITF Serbia 26A, Women Doubles | 0 |
| itf-women | 44145 | ITF Serbia 26A, Women Singles | 0 |
| itf-women | 25009 | ITF Singapore 01A, Women Doubles | 0 |
| itf-women | 25007 | ITF Singapore 01A, Women Singles | 0 |
| itf-women | 21246 | ITF Slovakia 01A, Women Doubles | 0 |
| itf-women | 21244 | ITF Slovakia 01A, Women Singles | 0 |
| itf-women | 22604 | ITF Slovakia 02A, Women Doubles | 0 |
| itf-women | 22602 | ITF Slovakia 02A, Women Singles | 0 |
| itf-women | 28414 | ITF Slovakia 03A, Women Doubles | 0 |
| itf-women | 28412 | ITF Slovakia 03A, Women Singles | 0 |
| itf-women | 34944 | ITF Slovakia 04A, Women Doubles | 0 |
| itf-women | 34942 | ITF Slovakia 04A, Women Singles | 0 |
| itf-women | 38273 | ITF Slovakia 05A, Women Doubles | 0 |
| itf-women | 38271 | ITF Slovakia 05A, Women Singles | 0 |
| itf-women | 44239 | ITF Slovakia 06, Women Doubles | 0 |
| itf-women | 44237 | ITF Slovakia 06, Women Singles | 0 |
| itf-women | 45005 | ITF Slovakia 07A, Women Doubles | 0 |
| itf-women | 45003 | ITF Slovakia 07A, Women Singles | 0 |
| itf-women | 45117 | ITF Slovakia 08A, Women Doubles | 0 |
| itf-women | 45115 | ITF Slovakia 08A, Women Singles | 0 |
| itf-women | 22943 | ITF Slovenia 01A, Women Doubles | 0 |
| itf-women | 22941 | ITF Slovenia 01A, Women Singles | 0 |
| itf-women | 34394 | ITF Slovenia 02A, Women Doubles | 0 |
| itf-women | 34398 | ITF Slovenia 02A, Women Singles | 0 |
| itf-women | 36873 | ITF Slovenia 03A, Women Doubles | 0 |
| itf-women | 36875 | ITF Slovenia 03A, Women Singles | 0 |
| itf-women | 37869 | ITF Slovenia 04A, Women Doubles | 0 |
| itf-women | 37867 | ITF Slovenia 04A, Women Singles | 0 |
| itf-women | 37951 | ITF Slovenia 05A, Women Doubles | 0 |
| itf-women | 37949 | ITF Slovenia 05A, Women Singles | 0 |
| itf-women | 39851 | ITF Slovenia 06A, Women Doubles | 0 |
| itf-women | 39853 | ITF Slovenia 06A, Women Singles | 0 |
| itf-women | 39915 | ITF Slovenia 07A, Women Doubles | 0 |
| itf-women | 39913 | ITF Slovenia 07A, Women Singles | 0 |
| itf-women | 40025 | ITF Slovenia 10A, Women Doubles | 0 |
| itf-women | 40023 | ITF Slovenia 10A, Women Singles | 0 |
| itf-women | 39959 | ITF Slovenia 11A, Women Doubles | 0 |
| itf-women | 39961 | ITF Slovenia 11A, Women Singles | 0 |
| itf-women | 43405 | ITF Slovenia 12A, Women Doubles | 0 |
| itf-women | 43403 | ITF Slovenia 12A, Women Singles | 0 |
| itf-women | 43487 | ITF Slovenia 13A, Women Doubles | 0 |
| itf-women | 43481 | ITF Slovenia 13A, Women Singles | 0 |
| itf-women | 21610 | ITF South Africa 01A, Women Doubles | 0 |
| itf-women | 21608 | ITF South Africa 01A, Women Singles | 0 |
| itf-women | 21826 | ITF South Africa 02A, Women Doubles | 0 |
| itf-women | 21824 | ITF South Africa 02A, Women Singles | 0 |
| itf-women | 35879 | ITF South Africa 06A, Women Doubles | 0 |
| itf-women | 35877 | ITF South Africa 06A, Women Singles | 0 |
| itf-women | 43085 | ITF South Africa 07A, Women Doubles | 0 |
| itf-women | 43083 | ITF South Africa 07A, Women Singles | 0 |
| itf-women | 43153 | ITF South Africa 08A, Women Doubles | 0 |
| itf-women | 43151 | ITF South Africa 08A, Women Singles | 0 |
| itf-women | 45223 | ITF South Africa 09A, Women Doubles | 0 |
| itf-women | 45225 | ITF South Africa 09A, Women Singles | 0 |
| itf-women | 45303 | ITF South Africa 10A, Women Doubles | 0 |
| itf-women | 45301 | ITF South Africa 10A, Women Singles | 0 |
| itf-women | 22568 | ITF South Korea 01A, Women Doubles | 0 |
| itf-women | 22566 | ITF South Korea 01A, Women Singles | 0 |
| itf-women | 24582 | ITF South Korea 02A, Women Doubles | 0 |
| itf-women | 24580 | ITF South Korea 02A, Women Singles | 0 |
| itf-women | 22715 | ITF South Korea 03A, Women Doubles | 0 |
| itf-women | 22713 | ITF South Korea 03A, Women Singles | 0 |
| itf-women | 22775 | ITF South Korea 04A, Women Doubles | 0 |
| itf-women | 22773 | ITF South Korea 04A, Women Singles | 0 |
| itf-women | 23015 | ITF South Korea 05A, Women Doubles | 0 |
| itf-women | 23013 | ITF South Korea 05A, Women Singles | 0 |
| itf-women | 22949 | ITF South Korea 06A, Women Doubles | 0 |
| itf-women | 22947 | ITF South Korea 06A, Women Singles | 0 |
| itf-women | 21254 | ITF Spain 01A, Women Doubles | 0 |
| itf-women | 21252 | ITF Spain 01A, Women Singles | 0 |
| itf-women | 40859 | ITF Spain 01B, Women Doubles | 0 |
| itf-women | 40857 | ITF Spain 01B, Women Singles | 0 |
| itf-women | 14890 | ITF Spain 02A, Women Doubles | 0 |
| itf-women | 14888 | ITF Spain 02A, Women Singles | 0 |
| itf-women | 21494 | ITF Spain 03A, Women Doubles | 0 |
| itf-women | 21492 | ITF Spain 03A, Women Singles | 0 |
| itf-women | 21882 | ITF Spain 04A, Women Doubles | 0 |
| itf-women | 21880 | ITF Spain 04A, Women Singles | 0 |
| itf-women | 13623 | ITF Spain 05A, Women Doubles | 0 |
| itf-women | 13625 | ITF Spain 05A, Women Singles | 0 |
| itf-women | 22574 | ITF Spain 06A, Women Doubles | 0 |
| itf-women | 22572 | ITF Spain 06A, Women Singles | 0 |
| itf-women | 13705 | ITF Spain 07A, Women Doubles | 0 |
| itf-women | 13703 | ITF Spain 07A, Women Singles | 0 |
| itf-women | 23033 | ITF Spain 08A, Women Doubles | 0 |
| itf-women | 23031 | ITF Spain 08A, Women Singles | 0 |
| itf-women | 13993 | ITF Spain 09A, Women Doubles | 0 |
| itf-women | 13991 | ITF Spain 09A, Women Singles | 0 |
| itf-women | 23127 | ITF Spain 10A, Women Doubles | 0 |
| itf-women | 23125 | ITF Spain 10A, Women Singles | 0 |
| itf-women | 16334 | ITF Spain 11A, Women Doubles | 0 |
| itf-women | 16332 | ITF Spain 11A, Women Singles | 0 |
| itf-women | 17300 | ITF Spain 13A, Women Doubles | 0 |
| itf-women | 17298 | ITF Spain 13A, Women Singles | 0 |
| itf-women | 19918 | ITF Spain 16A, Women Doubles | 0 |
| itf-women | 19916 | ITF Spain 16A, Women Singles | 0 |
| itf-women | 20244 | ITF Spain 18A, Women Doubles | 0 |
| itf-women | 20242 | ITF Spain 18A, Women Singles | 0 |
| itf-women | 21084 | ITF Spain 20A, Women Doubles | 0 |
| itf-women | 21082 | ITF Spain 20A, Women Singles | 0 |
| itf-women | 21390 | ITF Spain 21A, Women Doubles | 0 |
| itf-women | 21388 | ITF Spain 21A, Women Singles | 0 |
| itf-women | 21832 | ITF Spain 22A, Women Doubles | 0 |
| itf-women | 21830 | ITF Spain 22A, Women Singles | 0 |
| itf-women | 22196 | ITF Spain 23A, Women Doubles | 0 |
| itf-women | 22194 | ITF Spain 23A, Women Singles | 0 |
| itf-women | 21586 | ITF Spain 24A, Women Doubles | 0 |
| itf-women | 21584 | ITF Spain 24A, Women Singles | 0 |
| itf-women | 26342 | ITF Spain 25A, Women Doubles | 0 |
| itf-women | 26340 | ITF Spain 25A, Women Singles | 0 |
| itf-women | 26844 | ITF Spain 26A, Women Doubles | 0 |
| itf-women | 26842 | ITF Spain 26A, Women Singles | 0 |
| itf-women | 35611 | ITF Spain 27A, Women Doubles | 0 |
| itf-women | 35609 | ITF Spain 27A, Women Singles | 0 |
| itf-women | 38145 | ITF Spain 28A, Women Doubles | 0 |
| itf-women | 38147 | ITF Spain 28A, Women Singles | 0 |
| itf-women | 37945 | ITF Spain 30A, Women Doubles | 0 |
| itf-women | 37943 | ITF Spain 30A, Women Singles | 0 |
| itf-women | 38497 | ITF Spain 31A, Women Doubles | 0 |
| itf-women | 38501 | ITF Spain 31A, Women Singles | 0 |
| itf-women | 38267 | ITF Spain 32A, Women Doubles | 0 |
| itf-women | 38265 | ITF Spain 32A, Women Singles | 0 |
| itf-women | 38435 | ITF Spain 33A, Women Doubles | 0 |
| itf-women | 38437 | ITF Spain 33A, Women Singles | 0 |
| itf-women | 38721 | ITF Spain 34A, Women Doubles | 0 |
| itf-women | 38719 | ITF Spain 34A, Women Singles | 0 |
| itf-women | 38653 | ITF Spain 35A, Women Doubles | 0 |
| itf-women | 38655 | ITF Spain 35A, Women Singles | 0 |
| itf-women | 41855 | ITF Spain 36A, Women Doubles | 0 |
| itf-women | 41853 | ITF Spain 36A, Women Singles | 0 |
| itf-women | 41532 | ITF Spain 37A, Women Doubles | 0 |
| itf-women | 41530 | ITF Spain 37A, Women Singles | 0 |
| itf-women | 41798 | ITF Spain 38A, Women Doubles | 0 |
| itf-women | 41800 | ITF Spain 38A, Women Singles | 0 |
| itf-women | 41448 | ITF Spain 39A, Women Doubles | 0 |
| itf-women | 41446 | ITF Spain 39A, Women Singles | 0 |
| itf-women | 41584 | ITF Spain 40A, Women Doubles | 0 |
| itf-women | 41586 | ITF Spain 40A, Women Singles | 0 |
| itf-women | 41714 | ITF Spain 41A, Women Doubles | 0 |
| itf-women | 41716 | ITF Spain 41A, Women Singles | 0 |
| itf-women | 41604 | ITF Spain 42A, Women Doubles | 0 |
| itf-women | 41606 | ITF Spain 42A, Women Singles | 0 |
| itf-women | 44503 | ITF Spain 43A, Women Doubles | 0 |
| itf-women | 44501 | ITF Spain 43A, Women Singles | 0 |
| itf-women | 43993 | ITF Spain 44A, Women Doubles | 0 |
| itf-women | 43991 | ITF Spain 44A, Women Singles | 0 |
| itf-women | 44799 | ITF Spain 45A, Women Doubles | 0 |
| itf-women | 44797 | ITF Spain 45A, Women Singles | 0 |
| itf-women | 45019 | ITF Spain 46A, Women Doubles | 0 |
| itf-women | 45017 | ITF Spain 46A, Women Singles | 0 |
| itf-women | 22643 | ITF Sweden 01A, Women Doubles | 0 |
| itf-women | 22641 | ITF Sweden 01A, Women Singles | 0 |
| itf-women | 22895 | ITF Sweden 02A, Women Doubles | 0 |
| itf-women | 22893 | ITF Sweden 02A, Women Singles | 0 |
| itf-women | 15604 | ITF Sweden 03A, Women Doubles | 0 |
| itf-women | 15602 | ITF Sweden 03A, Women Singles | 0 |
| itf-women | 20624 | ITF Sweden 04A, Women Doubles | 0 |
| itf-women | 20622 | ITF Sweden 04A, Women Singles | 0 |
| itf-women | 20874 | ITF Sweden 05A, Women Doubles | 0 |
| itf-women | 20872 | ITF Sweden 05A, Women Singles | 0 |
| itf-women | 22434 | ITF Switzerland 01A, Women Doubles | 0 |
| itf-women | 22432 | ITF Switzerland 01A, Women Singles | 0 |
| itf-women | 22889 | ITF Switzerland 02A, Women Doubles | 0 |
| itf-women | 22887 | ITF Switzerland 02A, Women Singles | 0 |
| itf-women | 17250 | ITF Switzerland 03A, Women Doubles | 0 |
| itf-women | 17248 | ITF Switzerland 03A, Women Singles | 0 |
| itf-women | 17574 | ITF Switzerland 04A, Women Doubles | 0 |
| itf-women | 17572 | ITF Switzerland 04A, Women Singles | 0 |
| itf-women | 18332 | ITF Switzerland 05A, Women Doubles | 0 |
| itf-women | 18330 | ITF Switzerland 05A, Women Singles | 0 |
| itf-women | 37739 | ITF Switzerland 06A, Women Doubles | 0 |
| itf-women | 37737 | ITF Switzerland 06A, Women Singles | 0 |
| itf-women | 22178 | ITF Thailand 01A, Women Doubles | 0 |
| itf-women | 22176 | ITF Thailand 01A, Women Singles | 0 |
| itf-women | 22530 | ITF Thailand 02A, Women Doubles | 0 |
| itf-women | 22528 | ITF Thailand 02A, Women Singles | 0 |
| itf-women | 22580 | ITF Thailand 03A, Women Doubles | 0 |
| itf-women | 22578 | ITF Thailand 03A, Women Singles | 0 |
| itf-women | 23395 | ITF Thailand 04A, Women Doubles | 0 |
| itf-women | 23393 | ITF Thailand 04A, Women Singles | 0 |
| itf-women | 16340 | ITF Thailand 05A, Women Doubles | 0 |
| itf-women | 16338 | ITF Thailand 05A, Women Singles | 0 |
| itf-women | 16584 | ITF Thailand 06A, Women Doubles | 0 |
| itf-women | 16582 | ITF Thailand 06A, Women Singles | 0 |
| itf-women | 19418 | ITF Thailand 07A, Women Doubles | 0 |
| itf-women | 19416 | ITF Thailand 07A, Women Singles | 0 |
| itf-women | 19690 | ITF Thailand 08A, Women Doubles | 0 |
| itf-women | 19688 | ITF Thailand 08A, Women Singles | 0 |
| itf-women | 16836 | ITF Thailand 10A, Women Doubles | 0 |
| itf-women | 16834 | ITF Thailand 10A, Women Singles | 0 |
| itf-women | 17060 | ITF Thailand 11A, Women Doubles | 0 |
| itf-women | 17062 | ITF Thailand 11A, Women Singles | 0 |
| itf-women | 17256 | ITF Thailand 12A, Women Doubles | 0 |
| itf-women | 17254 | ITF Thailand 12A, Women Singles | 0 |
| itf-women | 20076 | ITF Thailand 13A, Women Doubles | 0 |
| itf-women | 20074 | ITF Thailand 13A, Women Singles | 0 |
| itf-women | 20494 | ITF Tunisia 01A, Women Doubles | 0 |
| itf-women | 20492 | ITF Tunisia 01A, Women Singles | 0 |
| itf-women | 20692 | ITF Tunisia 02A, Women Doubles | 0 |
| itf-women | 20690 | ITF Tunisia 02A, Women Singles | 0 |
| itf-women | 20958 | ITF Tunisia 03A, Women Doubles | 0 |
| itf-women | 20956 | ITF Tunisia 03A, Women Singles | 0 |
| itf-women | 21216 | ITF Tunisia 04A, Women Doubles | 0 |
| itf-women | 21214 | ITF Tunisia 04A, Women Singles | 0 |
| itf-women | 21260 | ITF Tunisia 05A, Women Doubles | 0 |
| itf-women | 21258 | ITF Tunisia 05A, Women Singles | 0 |
| itf-women | 21446 | ITF Tunisia 06A, Women Doubles | 0 |
| itf-women | 21444 | ITF Tunisia 06A, Women Singles | 0 |
| itf-women | 21500 | ITF Tunisia 07A, Women Doubles | 0 |
| itf-women | 21498 | ITF Tunisia 07A, Women Singles | 0 |
| itf-women | 21888 | ITF Tunisia 08A, Women Doubles | 0 |
| itf-women | 21886 | ITF Tunisia 08A, Women Singles | 0 |
| itf-women | 21942 | ITF Tunisia 09A, Women Doubles | 0 |
| itf-women | 21940 | ITF Tunisia 09A, Women Singles | 0 |
| itf-women | 22470 | ITF Tunisia 10A, Women Doubles | 0 |
| itf-women | 22468 | ITF Tunisia 10A, Women Singles | 0 |
| itf-women | 22058 | ITF Tunisia 11A, Women Doubles | 0 |
| itf-women | 22056 | ITF Tunisia 11A, Women Singles | 0 |
| itf-women | 21960 | ITF Tunisia 13A, Women Doubles | 0 |
| itf-women | 21958 | ITF Tunisia 13A, Women Singles | 0 |
| itf-women | 22348 | ITF Tunisia 14A, Women Doubles | 0 |
| itf-women | 22346 | ITF Tunisia 14A, Women Singles | 0 |
| itf-women | 22418 | ITF Tunisia 15A, Women Doubles | 0 |
| itf-women | 22416 | ITF Tunisia 15A, Women Singles | 0 |
| itf-women | 22452 | ITF Tunisia 16A, Women Doubles | 0 |
| itf-women | 22450 | ITF Tunisia 16A, Women Singles | 0 |
| itf-women | 22500 | ITF Tunisia 18A, Women Doubles | 0 |
| itf-women | 22498 | ITF Tunisia 18A, Women Singles | 0 |
| itf-women | 22655 | ITF Tunisia 19A, Women Doubles | 0 |
| itf-women | 22653 | ITF Tunisia 19A, Women Singles | 0 |
| itf-women | 22725 | ITF Tunisia 20A, Women Doubles | 0 |
| itf-women | 22723 | ITF Tunisia 20A, Women Singles | 0 |
| itf-women | 22811 | ITF Tunisia 21A, Women Doubles | 0 |
| itf-women | 22809 | ITF Tunisia 21A, Women Singles | 0 |
| itf-women | 23021 | ITF Tunisia 22A, Women Doubles | 0 |
| itf-women | 23019 | ITF Tunisia 22A, Women Singles | 0 |
| itf-women | 22931 | ITF Tunisia 23A, Women Doubles | 0 |
| itf-women | 22929 | ITF Tunisia 23A, Women Singles | 0 |
| itf-women | 22847 | ITF Tunisia 24A, Women Doubles | 0 |
| itf-women | 22845 | ITF Tunisia 24A, Women Singles | 0 |
| itf-women | 18714 | ITF Tunisia 25A, Women Doubles | 0 |
| itf-women | 18712 | ITF Tunisia 25A, Women Singles | 0 |
| itf-women | 19412 | ITF Tunisia 26A, Women Doubles | 0 |
| itf-women | 19410 | ITF Tunisia 26A, Women Singles | 0 |
| itf-women | 19696 | ITF Tunisia 27A, Women Doubles | 0 |
| itf-women | 19694 | ITF Tunisia 27A, Women Singles | 0 |
| itf-women | 19924 | ITF Tunisia 28A, Women Doubles | 0 |
| itf-women | 19922 | ITF Tunisia 28A, Women Singles | 0 |
| itf-women | 20082 | ITF Tunisia 29A, Women Doubles | 0 |
| itf-women | 20080 | ITF Tunisia 29A, Women Singles | 0 |
| itf-women | 20212 | ITF Tunisia 30A, Women Doubles | 0 |
| itf-women | 20210 | ITF Tunisia 30A, Women Singles | 0 |
| itf-women | 20378 | ITF Tunisia 31A, Women Doubles | 0 |
| itf-women | 20376 | ITF Tunisia 31A, Women Singles | 0 |
| itf-women | 20630 | ITF Tunisia 32A, Women Doubles | 0 |
| itf-women | 20628 | ITF Tunisia 32A, Women Singles | 0 |
| itf-women | 20898 | ITF Tunisia 33A, Women Doubles | 0 |
| itf-women | 20896 | ITF Tunisia 33A, Women Singles | 0 |
| itf-women | 21090 | ITF Tunisia 34A, Women Doubles | 0 |
| itf-women | 21088 | ITF Tunisia 34A, Women Singles | 0 |
| itf-women | 21396 | ITF Tunisia 35A, Women Doubles | 0 |
| itf-women | 21394 | ITF Tunisia 35A, Women Singles | 0 |
| itf-women | 21616 | ITF Tunisia 36A, Women Doubles | 0 |
| itf-women | 21614 | ITF Tunisia 36A, Women Singles | 0 |
| itf-women | 21838 | ITF Tunisia 37A, Women Doubles | 0 |
| itf-women | 21836 | ITF Tunisia 37A, Women Singles | 0 |
| itf-women | 22258 | ITF Tunisia 38A, Women Doubles | 0 |
| itf-women | 22256 | ITF Tunisia 38A, Women Singles | 0 |
| itf-women | 22763 | ITF Tunisia 39A, Women Doubles | 0 |
| itf-women | 22761 | ITF Tunisia 39A, Women Singles | 0 |
| itf-women | 23283 | ITF Tunisia 40A, Women Doubles | 0 |
| itf-women | 23281 | ITF Tunisia 40A, Women Singles | 0 |
| itf-women | 26634 | ITF Tunisia 41A, Women Doubles | 0 |
| itf-women | 26632 | ITF Tunisia 41A, Women Singles | 0 |
| itf-women | 27504 | ITF Tunisia 42A, Women Doubles | 0 |
| itf-women | 27502 | ITF Tunisia 42A, Women Singles | 0 |
| itf-women | 23935 | ITF Tunisia 43A, Women Doubles | 0 |
| itf-women | 23933 | ITF Tunisia 43A, Women Singles | 0 |
| itf-women | 25891 | ITF Tunisia 44A, Women Doubles | 0 |
| itf-women | 25889 | ITF Tunisia 44A, Women Singles | 0 |
| itf-women | 30981 | ITF Tunisia 45A, Women Doubles | 0 |
| itf-women | 30983 | ITF Tunisia 45A, Women Singles | 0 |
| itf-women | 31099 | ITF Tunisia 46A, Women Doubles | 0 |
| itf-women | 31101 | ITF Tunisia 46A, Women Singles | 0 |
| itf-women | 31179 | ITF Tunisia 47A, Women Doubles | 0 |
| itf-women | 31183 | ITF Tunisia 47A, Women Singles | 0 |
| itf-women | 29578 | ITF Tunisia 48A, Women Doubles | 0 |
| itf-women | 29576 | ITF Tunisia 48A, Women Singles | 0 |
| itf-women | 31443 | ITF Tunisia 49A, Women Doubles | 0 |
| itf-women | 31445 | ITF Tunisia 49A, Women Singles | 0 |
| itf-women | 31533 | ITF Tunisia 50A, Women Doubles | 0 |
| itf-women | 31535 | ITF Tunisia 50A, Women Singles | 0 |
| itf-women | 30899 | ITF Tunisia 51A, Women Doubles | 0 |
| itf-women | 30897 | ITF Tunisia 51A, Women Singles | 0 |
| itf-women | 35971 | ITF Tunisia 52A, Women Doubles | 0 |
| itf-women | 35969 | ITF Tunisia 52A, Women Singles | 0 |
| itf-women | 38857 | ITF Tunisia 53A, Women Doubles | 0 |
| itf-women | 38859 | ITF Tunisia 53A, Women Singles | 0 |
| itf-women | 41955 | ITF Tunisia 54A, Women Doubles | 0 |
| itf-women | 41953 | ITF Tunisia 54A, Women Singles | 0 |
| itf-women | 44701 | ITF Tunisia 55A, Women Doubles | 0 |
| itf-women | 44703 | ITF Tunisia 55A, Women Singles | 0 |
| itf-women | 44793 | ITF Tunisia 56A, Women Doubles | 0 |
| itf-women | 44791 | ITF Tunisia 56A, Women Singles | 0 |
| itf-women | 44893 | ITF Tunisia 57A, Women Doubles | 0 |
| itf-women | 44891 | ITF Tunisia 57A, Women Singles | 0 |
| itf-women | 45031 | ITF Tunisia 58A, Women Doubles | 0 |
| itf-women | 45029 | ITF Tunisia 58A, Women Singles | 0 |
| itf-women | 45135 | ITF Tunisia 59A, Women Doubles | 0 |
| itf-women | 45133 | ITF Tunisia 59A, Women Singles | 0 |
| itf-women | 20656 | ITF Turkey 01A, Women Doubles | 0 |
| itf-women | 20654 | ITF Turkey 01A, Women Singles | 0 |
| itf-women | 20698 | ITF Turkey 02A, Women Doubles | 0 |
| itf-women | 20696 | ITF Turkey 02A, Women Singles | 0 |
| itf-women | 20964 | ITF Turkey 03A, Women Doubles | 0 |
| itf-women | 20962 | ITF Turkey 03A, Women Singles | 0 |
| itf-women | 21222 | ITF Turkey 04A, Women Doubles | 0 |
| itf-women | 21220 | ITF Turkey 04A, Women Singles | 0 |
| itf-women | 21266 | ITF Turkey 05A, Women Doubles | 0 |
| itf-women | 21264 | ITF Turkey 05A, Women Singles | 0 |
| itf-women | 21516 | ITF Turkey 06A, Women Doubles | 0 |
| itf-women | 21514 | ITF Turkey 06A, Women Singles | 0 |
| itf-women | 21522 | ITF Turkey 07A, Women Doubles | 0 |
| itf-women | 21520 | ITF Turkey 07A, Women Singles | 0 |
| itf-women | 21894 | ITF Turkey 08A, Women Doubles | 0 |
| itf-women | 21892 | ITF Turkey 08A, Women Singles | 0 |
| itf-women | 21954 | ITF Turkey 09A, Women Doubles | 0 |
| itf-women | 21946 | ITF Turkey 09A, Women Singles | 0 |
| itf-women | 22064 | ITF Turkey 10A, Women Doubles | 0 |
| itf-women | 22062 | ITF Turkey 10A, Women Singles | 0 |
| itf-women | 22100 | ITF Turkey 11A, Women Doubles | 0 |
| itf-women | 22098 | ITF Turkey 11A, Women Singles | 0 |
| itf-women | 21952 | ITF Turkey 12A, Women Doubles | 0 |
| itf-women | 21950 | ITF Turkey 12A, Women Singles | 0 |
| itf-women | 22220 | ITF Turkey 13A, Women Doubles | 0 |
| itf-women | 22218 | ITF Turkey 13A, Women Singles | 0 |
| itf-women | 22374 | ITF Turkey 14A, Women Doubles | 0 |
| itf-women | 22372 | ITF Turkey 14A, Women Singles | 0 |
| itf-women | 22458 | ITF Turkey 15A, Women Doubles | 0 |
| itf-women | 22456 | ITF Turkey 15A, Women Singles | 0 |
| itf-women | 22124 | ITF Turkey 16A, Women Doubles | 0 |
| itf-women | 22122 | ITF Turkey 16A, Women Singles | 0 |
| itf-women | 22536 | ITF Turkey 17A, Women Doubles | 0 |
| itf-women | 22534 | ITF Turkey 17A, Women Singles | 0 |
| itf-women | 22598 | ITF Turkey 18A, Women Doubles | 0 |
| itf-women | 22596 | ITF Turkey 18A, Women Singles | 0 |
| itf-women | 22691 | ITF Turkey 19A, Women Doubles | 0 |
| itf-women | 22689 | ITF Turkey 19A, Women Singles | 0 |
| itf-women | 22919 | ITF Turkiye 22A, Women Doubles | 0 |
| itf-women | 22917 | ITF Turkiye 22A, Women Singles | 0 |
| itf-women | 30554 | ITF Turkiye 24A, Women Doubles | 0 |
| itf-women | 30556 | ITF Turkiye 24A, Women Singles | 0 |
| itf-women | 28273 | ITF Turkiye 25A, Women Doubles | 0 |
| itf-women | 28271 | ITF Turkiye 25A, Women Singles | 0 |
| itf-women | 23329 | ITF Turkiye 26A, Women Doubles | 0 |
| itf-women | 23327 | ITF Turkiye 26A, Women Singles | 0 |
| itf-women | 16838 | ITF Turkiye 27A, Women Doubles | 0 |
| itf-women | 16840 | ITF Turkiye 27A, Women Singles | 0 |
| itf-women | 41792 | ITF Turkiye 28A, Women Doubles | 0 |
| itf-women | 41794 | ITF Turkiye 28A, Women Singles | 0 |
| itf-women | 18338 | ITF Turkiye 29A, Women Doubles | 0 |
| itf-women | 18336 | ITF Turkiye 29A, Women Singles | 0 |
| itf-women | 17380 | ITF Turkiye 30A, Women Doubles | 0 |
| itf-women | 17378 | ITF Turkiye 30A, Women Singles | 0 |
| itf-women | 19400 | ITF Turkiye 31A, Women Doubles | 0 |
| itf-women | 19398 | ITF Turkiye 31A, Women Singles | 0 |
| itf-women | 19702 | ITF Turkiye 32A, Women Doubles | 0 |
| itf-women | 19700 | ITF Turkiye 32A, Women Singles | 0 |
| itf-women | 19930 | ITF Turkiye 33A, Women Doubles | 0 |
| itf-women | 19928 | ITF Turkiye 33A, Women Singles | 0 |
| itf-women | 20088 | ITF Turkiye 34A, Women Doubles | 0 |
| itf-women | 20086 | ITF Turkiye 34A, Women Singles | 0 |
| itf-women | 20206 | ITF Turkiye 35A, Women Doubles | 0 |
| itf-women | 20204 | ITF Turkiye 35A, Women Singles | 0 |
| itf-women | 20384 | ITF Turkiye 36A, Women Doubles | 0 |
| itf-women | 20382 | ITF Turkiye 36A, Women Singles | 0 |
| itf-women | 20594 | ITF Turkiye 37A, Women Doubles | 0 |
| itf-women | 20592 | ITF Turkiye 37A, Women Singles | 0 |
| itf-women | 20904 | ITF Turkiye 38A, Women Doubles | 0 |
| itf-women | 20902 | ITF Turkiye 38A, Women Singles | 0 |
| itf-women | 22781 | ITF United Arab Emirates 01A, Women Doubles | 0 |
| itf-women | 22779 | ITF United Arab Emirates 01A, Women Singles | 0 |
| itf-women | 20446 | ITF USA 01A, Women Doubles | 0 |
| itf-women | 20444 | ITF USA 01A, Women Singles | 0 |
| itf-women | 20662 | ITF USA 02A, Women Doubles | 0 |
| itf-women | 20660 | ITF USA 02A, Women Singles | 0 |
| itf-women | 13439 | ITF USA 04A, Women Doubles | 0 |
| itf-women | 13437 | ITF USA 04A, Women Singles | 0 |
| itf-women | 21284 | ITF USA 05A, Women Doubles | 0 |
| itf-women | 21282 | ITF USA 05A, Women Singles | 0 |
| itf-women | 21476 | ITF USA 06A, Women Doubles | 0 |
| itf-women | 21474 | ITF USA 06A, Women Singles | 0 |
| itf-women | 21974 | ITF USA 07A, Women Doubles | 0 |
| itf-women | 21972 | ITF USA 07A, Women Singles | 0 |
| itf-women | 15079 | ITF USA 08A, Women Doubles | 0 |
| itf-women | 15077 | ITF USA 08A, Women Singles | 0 |
| itf-women | 22230 | ITF USA 09A, Women Doubles | 0 |
| itf-women | 22228 | ITF USA 09A, Women Singles | 0 |
| itf-women | 22398 | ITF USA 11A, Women Doubles | 0 |
| itf-women | 22396 | ITF USA 11A, Women Singles | 0 |
| itf-women | 22428 | ITF USA 12A, Women Doubles | 0 |
| itf-women | 22426 | ITF USA 12A, Women Singles | 0 |
| itf-women | 22368 | ITF USA 13A, Women Doubles | 0 |
| itf-women | 22366 | ITF USA 13A, Women Singles | 0 |
| itf-women | 22482 | ITF USA 14A, Women Doubles | 0 |
| itf-women | 22480 | ITF USA 14A, Women Singles | 0 |
| itf-women | 22586 | ITF USA 15A, Women Doubles | 0 |
| itf-women | 22584 | ITF USA 15A, Women Singles | 0 |
| itf-women | 22649 | ITF USA 16A, Women Doubles | 0 |
| itf-women | 22647 | ITF USA 16A, Women Singles | 0 |
| itf-women | 22967 | ITF USA 17A, Women Doubles | 0 |
| itf-women | 22959 | ITF USA 17A, Women Singles | 0 |
| itf-women | 25577 | ITF USA 21A, Women Doubles | 0 |
| itf-women | 25575 | ITF USA 21A, Women Singles | 0 |
| itf-women | 16286 | ITF USA 22A, Women Doubles | 0 |
| itf-women | 16284 | ITF USA 22A, Women Singles | 0 |
| itf-women | 16804 | ITF USA 23A, Women Doubles | 0 |
| itf-women | 16802 | ITF USA 23A, Women Singles | 0 |
| itf-women | 16820 | ITF USA 24A, Women Doubles | 0 |
| itf-women | 16818 | ITF USA 24A, Women Singles | 0 |
| itf-women | 16576 | ITF USA 26A, Women Doubles | 0 |
| itf-women | 16574 | ITF USA 26A, Women Singles | 0 |
| itf-women | 16624 | ITF USA 27A, Women Doubles | 0 |
| itf-women | 16622 | ITF USA 27A, Women Singles | 0 |
| itf-women | 19388 | ITF USA 28A, Women Doubles | 0 |
| itf-women | 19384 | ITF USA 28A, Women Singles | 0 |
| itf-women | 19318 | ITF USA 29A, Women Doubles | 0 |
| itf-women | 19316 | ITF USA 29A, Women Singles | 0 |
| itf-women | 19640 | ITF USA 30A, Women Doubles | 0 |
| itf-women | 19638 | ITF USA 30A, Women Singles | 0 |
| itf-women | 19658 | ITF USA 31A, Women Doubles | 0 |
| itf-women | 19656 | ITF USA 31A, Women Singles | 0 |
| itf-women | 19788 | ITF USA 32A, Women Doubles | 0 |
| itf-women | 19786 | ITF USA 32A, Women Singles | 0 |
| itf-women | 19894 | ITF USA 33A, Women Doubles | 0 |
| itf-women | 19892 | ITF USA 33A, Women Singles | 0 |
| itf-women | 19936 | ITF USA 34A, Women Doubles | 0 |
| itf-women | 19934 | ITF USA 34A, Women Singles | 0 |
| itf-women | 20094 | ITF USA 35A, Women Doubles | 0 |
| itf-women | 20092 | ITF USA 35A, Women Singles | 0 |
| itf-women | 20238 | ITF USA 36A, Women Doubles | 0 |
| itf-women | 20236 | ITF USA 36A, Women Singles | 0 |
| itf-women | 20366 | ITF USA 37A, Women Doubles | 0 |
| itf-women | 20364 | ITF USA 37A, Women Singles | 0 |
| itf-women | 20544 | ITF USA 38A, Women Doubles | 0 |
| itf-women | 20542 | ITF USA 38A, Women Singles | 0 |
| itf-women | 20778 | ITF USA 39A, Women Doubles | 0 |
| itf-women | 20776 | ITF USA 39A, Women Singles | 0 |
| itf-women | 20982 | ITF USA 40A, Women Doubles | 0 |
| itf-women | 20980 | ITF USA 40A, Women Singles | 0 |
| itf-women | 21184 | ITF USA 41A, Women Doubles | 0 |
| itf-women | 21182 | ITF USA 41A, Women Singles | 0 |
| itf-women | 30782 | ITF USA 42A, Women Doubles | 0 |
| itf-women | 30784 | ITF USA 42A, Women Singles | 0 |
| itf-women | 30945 | ITF USA 43A, Women Doubles | 0 |
| itf-women | 30947 | ITF USA 43A, Women Singles | 0 |
| itf-women | 30548 | ITF USA 44A, Women Doubles | 0 |
| itf-women | 30550 | ITF USA 44A, Women Singles | 0 |
| itf-women | 38079 | ITF USA 45A, Women Doubles | 0 |
| itf-women | 38081 | ITF USA 45A, Women Singles | 0 |
| itf-women | 31163 | ITF USA 46A, Women Doubles | 0 |
| itf-women | 31165 | ITF USA 46A, Women Singles | 0 |
| itf-women | 30566 | ITF USA 47A, Women Doubles | 0 |
| itf-women | 30568 | ITF USA 47A, Women Singles | 0 |
| itf-women | 25111 | ITF USA 48A, Women Doubles | 0 |
| itf-women | 25103 | ITF USA 48A, Women Singles | 0 |
| itf-women | 29416 | ITF USA 49A, Women Doubles | 0 |
| itf-women | 29414 | ITF USA 49A, Women Singles | 0 |
| itf-women | 30732 | ITF USA 50A, Women Doubles | 0 |
| itf-women | 30734 | ITF USA 50A, Women Singles | 0 |
| itf-women | 30957 | ITF USA 51A, Women Doubles | 0 |
| itf-women | 30959 | ITF USA 51A, Women Singles | 0 |
| itf-women | 31449 | ITF USA 52A, Women Doubles | 0 |
| itf-women | 31451 | ITF USA 52A, Women Singles | 0 |
| itf-women | 38333 | ITF USA 53A, Women Doubles | 0 |
| itf-women | 38335 | ITF USA 53A, Women Singles | 0 |
| itf-women | 41436 | ITF USA 54A, Women Doubles | 0 |
| itf-women | 41434 | ITF USA 54A, Women Singles | 0 |
| itf-women | 41456 | ITF USA 55A, Women Doubles | 0 |
| itf-women | 41454 | ITF USA 55A, Women Singles | 0 |
| itf-women | 41514 | ITF USA 56A, Women Doubles | 0 |
| itf-women | 41512 | ITF USA 56A, Women Singles | 0 |
| itf-women | 903371 | Jablonec nad Nisou | 0 |
| itf-women | 903388 | Jakarta | 0 |
| itf-women | 903384 | Jerusalem | 0 |
| itf-women | 903744 | Jhajjar | 0 |
| itf-women | 903366 | Jinan | 0 |
| itf-women | 903661 | Johannesburg | 0 |
| itf-women | 904265 | Joinville | 0 |
| itf-women | 903561 | Jonkoping | 0 |
| itf-women | 903270 | Joue-Les-Tours – Final | 0 |
| itf-women | 903268 | Joue-Les-Tours – QF | 0 |
| itf-women | 903266 | Joue-Les-Tours – R1 | 0 |
| itf-women | 903267 | Joue-Les-Tours – R16 | 0 |
| itf-women | 903269 | Joue-Les-Tours – SF | 0 |
| itf-women | 904065 | Junin | 0 |
| itf-women | 903988 | Kachreti | 0 |
| itf-women | 904296 | Kalmar | 0 |
| itf-women | 904212 | Kamen | 0 |
| itf-women | 903689 | Karaganda | 0 |
| itf-women | 903297 | Kashiwa | 0 |
| itf-women | 904030 | Kawaguchi | 0 |
| itf-women | 904238 | Kayseri | 0 |
| itf-women | 903379 | Kazan | 0 |
| itf-women | 903696 | Kiryat Motzkin | 0 |
| itf-women | 904184 | Klagenfurt | 0 |
| itf-women | 903360 | Klosters | 0 |
| itf-women | 903600 | Knokke | 0 |
| itf-women | 904014 | Kocevje | 0 |
| itf-women | 903314 | Kofu | 0 |
| itf-women | 904064 | Koge | 0 |
| itf-women | 903247 | Koksijde | 0 |
| itf-women | 903773 | Koper | 0 |
| itf-women | 904302 | Kotka | 0 |
| itf-women | 903846 | Kottingbrunn | 0 |
| itf-women | 904031 | Kranjska Gora | 0 |
| itf-women | 903789 | Krsko | 0 |
| itf-women | 903952 | Kuala Lumpur | 0 |
| itf-women | 903956 | Kuching | 0 |
| itf-women | 904229 | Kunshan | 0 |
| itf-women | 903982 | Kursumlijska Banja | 0 |
| itf-women | 903594 | Kyiv | 0 |
| itf-women | 903380 | Kyoto | 0 |
| itf-women | 903565 | L’Aquila | 0 |
| itf-women | 903335 | La Bisbal | 0 |
| itf-women | 904007 | La Marsa | 0 |
| itf-women | 903310 | Lagos | 0 |
| itf-women | 903835 | Lakewood | 0 |
| itf-women | 903728 | Lambare | 0 |
| itf-women | 903249 | Landisville | 0 |
| itf-women | 903264 | Las Vegas – Final | 0 |
| itf-women | 903262 | Las Vegas – QF | 0 |
| itf-women | 903260 | Las Vegas – R1 | 0 |
| itf-women | 903261 | Las Vegas – R16 | 0 |
| itf-women | 903263 | Las Vegas – SF | 0 |
| itf-women | 904156 | Le Gosier | 0 |
| itf-women | 903518 | Le Havre | 0 |
| itf-women | 904269 | Le Lamentin | 0 |
| itf-women | 904354 | Le Neubourg | 0 |
| itf-women | 903321 | Leipzig | 0 |
| itf-women | 903324 | Leipzig – Final | 0 |
| itf-women | 903322 | Leipzig – QF | 0 |
| itf-women | 903323 | Leipzig – SF | 0 |
| itf-women | 903657 | Leiria | 0 |
| itf-women | 904234 | Leme | 0 |
| itf-women | 903591 | Les Contamines Montjoie | 0 |
| itf-women | 903356 | Les Franqueses del Valles | 0 |
| itf-women | 904276 | Leszno | 0 |
| itf-women | 903849 | Lexington | 0 |
| itf-women | 904488 | Liberec | 0 |
| itf-women | 904049 | Liepaja | 0 |
| itf-women | 903417 | Liepaya | 0 |
| itf-women | 903679 | Lima | 1 |
| itf-women | 904131 | Limassol | 0 |
| itf-women | 904491 | Lincoln | 0 |
| itf-women | 903372 | Lisbon | 0 |
| itf-women | 904181 | Lopota | 0 |
| itf-women | 903818 | Los Angeles | 0 |
| itf-women | 903740 | Loughborough | 0 |
| itf-women | 903681 | Loule | 0 |
| itf-women | 903472 | Lousada | 0 |
| itf-women | 903337 | Luan | 0 |
| itf-women | 903328 | Lubbock | 0 |
| itf-women | 904098 | Lujan | 0 |
| itf-women | 903357 | Luzhou | 0 |
| itf-women | 904278 | Maanshan | 0 |
| itf-women | 903280 | Macon | 0 |
| itf-women | 903361 | Madrid | 0 |
| itf-women | 904479 | Makinohara | 0 |
| itf-women | 903275 | Makinohara – Final | 0 |
| itf-women | 903273 | Makinohara – QF | 0 |
| itf-women | 903271 | Makinohara – R1 | 0 |
| itf-women | 903272 | Makinohara – R16 | 0 |
| itf-women | 903274 | Makinohara – SF | 0 |
| itf-women | 904002 | Malaga | 0 |
| itf-women | 903413 | Malibu | 0 |
| itf-women | 904073 | Malmo | 0 |
| itf-women | 904482 | Malta | 0 |
| itf-women | 903418 | Manacor | 0 |
| itf-women | 903341 | Manchester | 0 |
| itf-women | 903931 | Mar Del Plata | 0 |
| itf-women | 903404 | Marbella | 0 |
| itf-women | 903760 | Marrakech | 0 |
| itf-women | 904079 | Maspalomas Gran Canaria | 0 |
| itf-women | 904230 | Meerbusch | 0 |
| itf-women | 903405 | Meitar | 0 |
| itf-women | 903451 | Melilla | 1 |
| itf-women | 904107 | Mendoza | 0 |
| itf-women | 904308 | Merzig | 0 |
| itf-women | 903945 | Mexico City | 0 |
| itf-women | 904258 | Miami | 0 |
| itf-women | 903312 | Mildura | 0 |
| itf-women | 903370 | Milovice | 0 |
| itf-women | 904147 | Mogi Das Cruzes | 0 |
| itf-women | 903869 | Mogyorod | 0 |
| itf-women | 904220 | Mohammedia | 0 |
| itf-women | 903369 | Monastir | 1 |
| itf-women | 903442 | Montemor-O-Novo | 0 |
| itf-women | 903231 | Montpellier | 0 |
| itf-women | 904170 | Montreal | 0 |
| itf-women | 903345 | Montreux | 0 |
| itf-women | 903334 | Monzon | 0 |
| itf-women | 904160 | Morelia | 0 |
| itf-women | 903964 | Mosquera | 0 |
| itf-women | 903967 | Murska Sobota | 0 |
| itf-women | 903754 | Nagpur | 0 |
| itf-women | 903320 | Naiman | 0 |
| itf-women | 903928 | Nairobi | 0 |
| itf-women | 904325 | Nakhon Pathom | 0 |
| itf-women | 904008 | Nakhon Si Thammarat | 0 |
| itf-women | 903346 | Nanao | 0 |
| itf-women | 904080 | Nanchang | 0 |
| itf-women | 903284 | Nantes | 0 |
| itf-women | 903313 | Naples | 0 |
| itf-women | 904127 | Nasbypark | 0 |
| itf-women | 903690 | Netanya | 0 |
| itf-women | 903673 | Neubourg | 0 |
| itf-women | 904484 | Neuquen | 0 |
| itf-women | 904273 | New Delhi | 0 |
| itf-women | 903508 | Newport Beach | 0 |
| itf-women | 904382 | Nogent-Sur-Marne | 0 |
| itf-women | 903318 | Nonthaburi | 0 |
| itf-women | 903799 | Norges-La-Ville | 0 |
| itf-women | 903350 | Norman | 0 |
| itf-women | 903876 | Norrkoping | 0 |
| itf-women | 903562 | Nottingham | 0 |
| itf-women | 903351 | Nules | 0 |
| itf-women | 903393 | Nur-Sultan | 0 |
| itf-women | 903933 | Oberpullendorf | 0 |
| itf-women | 904293 | Oegstgeest | 0 |
| itf-women | 903426 | Oeiras | 0 |
| itf-women | 903625 | Oldenzaal | 0 |
| itf-women | 903242 | Olomouc | 0 |
| itf-women | 903781 | Oran | 0 |
| itf-women | 903331 | Orlando | 0 |
| itf-women | 903377 | Ortisei | 0 |
| itf-women | 903354 | Osaka | 0 |
| itf-women | 903779 | Osijek | 0 |
| itf-women | 903374 | Oslo | 0 |
| itf-women | 903443 | Otocec | 0 |
| itf-women | 903624 | Ourense | 0 |
| itf-women | 904272 | Palm Coast | 0 |
| itf-women | 903291 | Palm Harbor | 0 |
| itf-women | 903568 | Palma Del Rio | 0 |
| itf-women | 903419 | Palmanova | 0 |
| itf-women | 904152 | Papamoa | 0 |
| itf-women | 903608 | Parnu | 0 |
| itf-women | 903471 | Pazardzhik | 0 |
| itf-women | 903545 | Pelham | 0 |
| itf-women | 903234 | Perigueux | 0 |
| itf-women | 903281 | Perth | 0 |
| itf-women | 903837 | Perugia | 0 |
| itf-women | 903609 | Pescara | 0 |
| itf-women | 903375 | Petange | 0 |
| itf-women | 903378 | Petit-Bourg | 0 |
| itf-women | 904506 | Phan Thiet | 0 |
| itf-women | 904219 | Pilar | 0 |
| itf-women | 903686 | Piracicaba | 0 |
| itf-women | 903470 | Platja D’Aro | 0 |
| itf-women | 903352 | Playford | 0 |
| itf-women | 903797 | Poertschach | 0 |
| itf-women | 903278 | Poitiers | 0 |
| itf-women | 903365 | Porto | 0 |
| itf-women | 904300 | Portoroz | 0 |
| itf-women | 903420 | Potchefstroom | 0 |
| itf-women | 903228 | Prague | 0 |
| itf-women | 903386 | Prerov | 0 |
| itf-women | 903674 | Pretoria | 0 |
| itf-women | 903569 | Prokuplje | 0 |
| itf-women | 904044 | Punta Cana | 0 |
| itf-women | 904113 | Qian Daohu | 0 |
| itf-women | 904455 | Quebec City | 0 |
| itf-women | 903909 | Quinta Do Lago | 0 |
| itf-women | 903807 | Raanana | 0 |
| itf-women | 903621 | Radom | 0 |
| itf-women | 903533 | Ramat Hasharon | 0 |
| itf-women | 904423 | Rancho Santa Fe | 0 |
| itf-women | 904003 | Recife | 0 |
| itf-women | 904438 | Redding | 0 |
| itf-women | 903256 | Redding – Final | 0 |
| itf-women | 903254 | Redding – QF | 0 |
| itf-women | 903252 | Redding – R1 | 0 |
| itf-women | 903253 | Redding – R16 | 0 |
| itf-women | 903255 | Redding – SF | 0 |
| itf-women | 903469 | Reims | 0 |
| itf-women | 904233 | Reus | 0 |
| itf-women | 904260 | Ribeirao Preto | 0 |
| itf-women | 903960 | Ricany | 0 |
| itf-women | 904190 | Rio Claro | 0 |
| itf-women | 903850 | Rio de Janeiro | 0 |
| itf-women | 903688 | Rio Do Sul | 0 |
| itf-women | 903407 | Roehampton | 0 |
| itf-women | 903302 | Roma | 0 |
| itf-women | 903498 | Rome, USA | 0 |
| itf-women | 904027 | Rosario-Santa Fe | 0 |
| itf-women | 904172 | Sabadell | 0 |
| itf-women | 903279 | Saguenay | 0 |
| itf-women | 903447 | Saint Palais Sur Mer | 0 |
| itf-women | 903534 | Salinas | 0 |
| itf-women | 903620 | San Bartolome De Tirajana | 0 |
| itf-women | 903798 | San Diego | 0 |
| itf-women | 904236 | San Rafael | 0 |
| itf-women | 903893 | San Sebastian | 0 |
| itf-women | 903385 | Santa Margarita de Montbui | 0 |
| itf-women | 903294 | Santa Margherita di Pula | 0 |
| itf-women | 904425 | Santa Tecla | 0 |
| itf-women | 903450 | Santarem | 0 |
| itf-women | 903222 | Santiago | 0 |
| itf-women | 903551 | Santo Domingo | 0 |
| itf-women | 903756 | Santo Domingo R2 | 0 |
| itf-women | 904171 | Sao Joao Da Boa Vista | 0 |
| itf-women | 904353 | Sao Luis | 0 |
| itf-women | 904422 | Sao Paulo | 0 |
| itf-women | 904061 | Sapporo | 0 |
| itf-women | 903778 | Sarasota | 0 |
| itf-women | 903392 | Saskatoon | 0 |
| itf-women | 903601 | Savitaipale | 0 |
| itf-women | 903493 | Selva Gardena | 0 |
| itf-women | 903363 | Setubal | 0 |
| itf-women | 903292 | Seville | 0 |
| itf-women | 904267 | Sharm El Sheikh | 0 |
| itf-women | 904549 | Sharm Elsheikh | 1 |
| itf-women | 904379 | Shenyang | 0 |
| itf-women | 903293 | Shenzhen | 0 |
| itf-women | 903258 | Shrewsbury | 0 |
| itf-women | 903499 | Shymkent | 0 |
| itf-women | 903540 | Sibenik | 0 |
| itf-women | 903358 | Singapore | 0 |
| itf-women | 904095 | Skopje | 0 |
| itf-women | 904102 | Slobozia | 0 |
| itf-women | 903376 | Solapur | 0 |
| itf-women | 903368 | Solarino | 0 |
| itf-women | 903968 | Sopo | 0 |
| itf-women | 903663 | Sozopol | 0 |
| itf-women | 903774 | Split | 0 |
| itf-women | 903955 | Spring | 0 |
| itf-women | 903412 | St. Etienne | 0 |
| itf-women | 903338 | Stare Splavy | 0 |
| itf-women | 904263 | Stellenbosch | 0 |
| itf-women | 903235 | Stuttgart-Vaihingen | 0 |
| itf-women | 903300 | Sumter | 0 |
| itf-women | 903298 | Surbiton | 0 |
| itf-women | 903951 | Swan Hill | 0 |
| itf-women | 903913 | Sydney | 0 |
| itf-women | 904489 | Szabolcsveresmart | 0 |
| itf-women | 903410 | Szekesfehervar | 0 |
| itf-women | 904481 | Taby | 0 |
| itf-women | 904029 | Tainan | 0 |
| itf-women | 903397 | Taipei | 0 |
| itf-women | 904207 | Taizhou | 0 |
| itf-women | 904134 | Takasaki | 0 |
| itf-women | 903940 | Tallinn | 0 |
| itf-women | 904264 | Tampa | 0 |
| itf-women | 904283 | Targu Mures | 0 |
| itf-women | 903389 | Tarvisio | 0 |
| itf-women | 904313 | Tashkent | 0 |
| itf-women | 903936 | Tauranga | 0 |
| itf-women | 904202 | Tauste | 0 |
| itf-women | 904041 | Tauste-Zaragoza | 0 |
| itf-women | 903355 | Tbilisi | 0 |
| itf-women | 903257 | Telavi | 0 |
| itf-women | 903970 | Telde | 0 |
| itf-women | 903347 | Templeton | 0 |
| itf-women | 904174 | Terrassa | 0 |
| itf-women | 903567 | The Hague | 0 |
| itf-women | 904275 | Timaru | 0 |
| itf-women | 903308 | Tokyo | 0 |
| itf-women | 904532 | Torello | 0 |
| itf-women | 903301 | Torino | 0 |
| itf-women | 903283 | Toronto | 0 |
| itf-women | 903775 | Tossa de Mar | 0 |
| itf-women | 904199 | Toyama | 0 |
| itf-women | 903732 | Traralgon | 0 |
| itf-women | 904239 | Trelew | 0 |
| itf-women | 903403 | Trieste | 0 |
| itf-women | 904524 | Trnava | 0 |
| itf-women | 904005 | Troisdorf | 0 |
| itf-women | 904248 | Tsaghkadzor | 0 |
| itf-women | 903741 | Tucuman | 0 |
| itf-women | 903349 | Tyler | 0 |
| itf-women | 903864 | Ust-Kamenogorsk | 0 |
| itf-women | 904149 | Vacaria | 0 |
| itf-women | 903330 | Valencia | 0 |
| itf-women | 904091 | Valladolid | 0 |
| itf-women | 903777 | Varberg | 0 |
| itf-women | 903446 | Varna | 0 |
| itf-women | 903602 | Vejle | 0 |
| itf-women | 904130 | Veracruz | 0 |
| itf-women | 903401 | Verbier | 0 |
| itf-women | 903237 | Versmold | 0 |
| itf-women | 903402 | Vienna | 0 |
| itf-women | 903989 | Vierumaki | 0 |
| itf-women | 903638 | Vigo | 0 |
| itf-women | 903520 | Villa Maria | 0 |
| itf-women | 904196 | Villach | 0 |
| itf-women | 903502 | Villena | 0 |
| itf-women | 904256 | Villeneuve D'Ascq | 0 |
| itf-women | 903555 | Vilnius | 0 |
| itf-women | 904352 | Viserba | 0 |
| itf-women | 903396 | Vitoria-Gasteiz | 0 |
| itf-women | 903626 | Vrnjacka Banja | 0 |
| itf-women | 903307 | Waco | 0 |
| itf-women | 904357 | Wagga Wagga | 0 |
| itf-women | 903640 | Wanfercee-Baulet | 0 |
| itf-women | 903627 | Warmbad-Villach | 0 |
| itf-women | 903934 | Wellington | 0 |
| itf-women | 903311 | Wesley Chapel | 0 |
| itf-women | 903816 | Wichita | 0 |
| itf-women | 904470 | Wrexham | 0 |
| itf-women | 903570 | Wroclaw | 0 |
| itf-women | 904180 | Wuning | 0 |
| itf-women | 904006 | Yecla | 0 |
| itf-women | 903887 | Yeongwol | 0 |
| itf-women | 903332 | Yokohama | 0 |
| itf-women | 903232 | Ystad | 0 |
| itf-women | 903367 | Zagreb | 0 |
| itf-women | 903980 | Zaragoza | 0 |
| itf-women | 903981 | Zephyrhills | 0 |
| juniors | 14816 | Juniors AO, Melbourne, Australia Men Doubles | 0 |
| juniors | 14814 | Juniors AO, Melbourne, Australia Men Singles | 0 |
| juniors | 14820 | Juniors AO, Melbourne, Australia Women Doubles | 0 |
| juniors | 14818 | Juniors AO, Melbourne, Australia Women Singles | 0 |
| juniors | 15401 | Juniors French Open, Paris, France Men Doubles | 0 |
| juniors | 15399 | Juniors French Open, Paris, France Men Singles | 0 |
| juniors | 15405 | Juniors French Open, Paris, France Women Doubles | 0 |
| juniors | 15403 | Juniors French Open, Paris, France Women Singles | 0 |
| juniors | 18034 | Juniors US Open, New York, USA Men Doubles | 0 |
| juniors | 18032 | Juniors US Open, New York, USA Men Singles | 0 |
| juniors | 18038 | Juniors US Open, New York, USA Women Doubles | 0 |
| juniors | 18036 | Juniors US Open, New York, USA Women Singles | 0 |
| juniors | 15680 | Juniors Wimbledon, London, GB Men Doubles | 0 |
| juniors | 15678 | Juniors Wimbledon, London, GB Men Singles | 0 |
| juniors | 15682 | Juniors Wimbledon, London, GB Women Doubles | 0 |
| juniors | 15660 | Juniors Wimbledon, London, GB Women Singles | 0 |
| legends | 14834 | Legends AO, Melbourne, Australia Men Doubles | 0 |
| legends | 14854 | Legends AO, Melbourne, Australia Women Doubles | 0 |
| legends | 36137 | Legends Australian Open, Melbourne, Australia, Mixed Doubles | 0 |
| legends | 15419 | Legends French Open, Paris, France Men Doubles | 0 |
| legends | 40069 | Legends French Open, Paris, France Mixed Doubles | 0 |
| legends | 15421 | Legends French Open, Paris, France Women Doubles | 0 |
| legends | 18058 | Legends US Open, New York, USA Men Doubles | 0 |
| legends | 18060 | Legends US Open, New York, USA Women Doubles | 0 |
| legends | 15664 | Legends Wimbledon, London, GB Men Doubles | 0 |
| legends | 15666 | Legends Wimbledon, London, GB Women Doubles | 0 |
| legends | 37319 | Legends Wimbledon, London, Great Britain Mixed Doubles | 0 |
| simulated-reality | 45339 | SRL Fall Invitational Aksaray, TUR | 0 |
| simulated-reality | 44851 | SRL Fall Invitational Albury, AUS | 0 |
| simulated-reality | 41378 | SRL Fall Invitational Bathurst, AUS | 0 |
| simulated-reality | 48907 | SRL Fall Invitational Bismarck, ND, USA | 0 |
| simulated-reality | 41420 | SRL Fall Invitational Bundaberg, AUS | 0 |
| simulated-reality | 41891 | SRL Fall Invitational Burlington (VT), USA | 0 |
| simulated-reality | 44753 | SRL Fall Invitational Camden, AUS | 0 |
| simulated-reality | 44979 | SRL Fall Invitational Chengdu, CHN | 0 |
| simulated-reality | 41568 | SRL Fall Invitational Dalian, CHN | 0 |
| simulated-reality | 49128 | SRL Fall Invitational Dubbo, AUS | 0 |
| simulated-reality | 41720 | SRL Fall Invitational Dunedin, NZL | 0 |
| simulated-reality | 49572 | SRL Fall Invitational Emerald, AUS | 0 |
| simulated-reality | 45195 | SRL Fall Invitational Fukushima, JPN | 0 |
| simulated-reality | 41498 | SRL Fall Invitational Gosford, AUS | 0 |
| simulated-reality | 48999 | SRL Fall Invitational Grand Forks, ND, USA | 0 |
| simulated-reality | 38743 | SRL Fall Invitational Griffith, Australia | 0 |
| simulated-reality | 45393 | SRL Fall Invitational Hannover, GER | 0 |
| simulated-reality | 45197 | SRL Fall Invitational Ho Chi Minh City, VIE, Women | 0 |
| simulated-reality | 45261 | SRL Fall Invitational Kayseri, TUR | 0 |
| simulated-reality | 49666 | SRL Fall Invitational Mersin, TUR | 0 |
| simulated-reality | 44201 | SRL Fall Invitational Muskogee (OK), USA | 0 |
| simulated-reality | 41376 | SRL Fall Invitational Napier, NZL | 0 |
| simulated-reality | 41823 | SRL Fall Invitational Nelson, NZL | 0 |
| simulated-reality | 49055 | SRL Fall Invitational Orange, AUS | 0 |
| simulated-reality | 49420 | SRL Fall Invitational Port Douglas, AUS | 0 |
| simulated-reality | 44343 | SRL Fall Invitational Reno, (NV) USA | 0 |
| simulated-reality | 49516 | SRL Fall Invitational Rockhampton, AUS | 0 |
| simulated-reality | 44853 | SRL Fall Invitational Shepparton, AUS | 0 |
| simulated-reality | 49858 | SRL Fall Invitational Side, TUR | 31 |
| simulated-reality | 44755 | SRL Fall Invitational Silverdale, AUS | 0 |
| simulated-reality | 44435 | SRL Fall Invitational Stillwater (OK), USA | 0 |
| simulated-reality | 41825 | SRL Fall Invitational Syracuse (NY), USA | 0 |
| simulated-reality | 49246 | SRL Fall Invitational Tweed Heads, AUS | 0 |
| simulated-reality | 44655 | SRL Invitational Penrith, AUS | 0 |
| simulated-reality | 47353 | SRL Spring Invitational Apollo Bay, AUS | 0 |
| simulated-reality | 46778 | SRL Spring Invitational Bairnsdale, AUS | 0 |
| simulated-reality | 46817 | SRL Spring Invitational Ballarat, AUS | 0 |
| simulated-reality | 42729 | SRL Spring Invitational Christchurch, NZL | 0 |
| simulated-reality | 43057 | SRL Spring Invitational Cromwell, NZL | 0 |
| simulated-reality | 39617 | SRL Spring Invitational Dunedin, NZL | 0 |
| simulated-reality | 47155 | SRL Spring Invitational Frankston, AUS | 0 |
| simulated-reality | 46867 | SRL Spring Invitational Geelong, AUS | 0 |
| simulated-reality | 42783 | SRL Spring Invitational Gisborne, NZL | 0 |
| simulated-reality | 47063 | SRL Spring Invitational Gore, NZL | 0 |
| simulated-reality | 42633 | SRL Spring Invitational Hamilton, NZL | 0 |
| simulated-reality | 42973 | SRL Spring Invitational Invercargill, NZL | 0 |
| simulated-reality | 42587 | SRL Spring Invitational Katoomba, AUS | 0 |
| simulated-reality | 46973 | SRL Spring Invitational Lorne, AUS | 0 |
| simulated-reality | 46669 | SRL Spring Invitational Merimbula, AUS | 0 |
| simulated-reality | 47185 | SRL Spring Invitational Morwell, AUS | 0 |
| simulated-reality | 42911 | SRL Spring Invitational New Plymouth, NZL | 0 |
| simulated-reality | 46397 | SRL Spring Invitational Oskemen, KAZ | 0 |
| simulated-reality | 42589 | SRL Spring Invitational San Jose, CA, USA | 0 |
| simulated-reality | 46299 | SRL Spring Invitational Semey, KAZ | 0 |
| simulated-reality | 46667 | SRL Spring Invitational Shepparton, AUS | 0 |
| simulated-reality | 46722 | SRL Spring Invitational Sunbury, AUS | 0 |
| simulated-reality | 43029 | SRL Spring Invitational Taupo, NZL | 0 |
| simulated-reality | 42843 | SRL Spring Invitational Tauranga 2, NZL | 0 |
| simulated-reality | 42689 | SRL Spring Invitational Tauranga, NZL | 0 |
| simulated-reality | 42655 | SRL Spring Invitational Timaru, NZL | 0 |
| simulated-reality | 47273 | SRL Spring Invitational Upper Hutt, NZL | 0 |
| simulated-reality | 41041 | SRL Summer Invitational Albany (NY), USA | 0 |
| simulated-reality | 41238 | SRL Summer Invitational Baltimore (MD), USA | 0 |
| simulated-reality | 48193 | SRL Summer Invitational Batumi, GEO | 0 |
| simulated-reality | 43275 | SRL Summer Invitational Blenheim, NZL | 0 |
| simulated-reality | 43607 | SRL Summer Invitational Bukhara, UZB | 0 |
| simulated-reality | 47538 | SRL Summer Invitational Castlemaine, AUS | 0 |
| simulated-reality | 40991 | SRL Summer Invitational Christchurch, NZL | 0 |
| simulated-reality | 48757 | SRL Summer Invitational Detroit, MI, USA | 0 |
| simulated-reality | 43851 | SRL Summer Invitational Fergana, UZB | 0 |
| simulated-reality | 47636 | SRL Summer Invitational Gore, NZL | 0 |
| simulated-reality | 48547 | SRL Summer Invitational Gyumri, ARM | 0 |
| simulated-reality | 48635 | SRL Summer Invitational Hrazdan, ARM | 0 |
| simulated-reality | 40579 | SRL Summer Invitational Jizzakh, UZB | 0 |
| simulated-reality | 40911 | SRL Summer Invitational Kostanay, KAZ | 0 |
| simulated-reality | 44085 | SRL Summer Invitational Kunming, CHN | 0 |
| simulated-reality | 48002 | SRL Summer Invitational Lankaran, AZE | 0 |
| simulated-reality | 43435 | SRL Summer Invitational Mackay, AUS | 0 |
| simulated-reality | 48637 | SRL Summer Invitational Mannheim, GER | 0 |
| simulated-reality | 43949 | SRL Summer Invitational Margilan, UZB | 0 |
| simulated-reality | 43301 | SRL Summer Invitational Napier, NZL | 0 |
| simulated-reality | 43531 | SRL Summer Invitational Nukus, UZB | 0 |
| simulated-reality | 41122 | SRL Summer Invitational Philadelphia (PA), USA | 0 |
| simulated-reality | 41039 | SRL Summer Invitational Providence (RI), USA | 0 |
| simulated-reality | 40989 | SRL Summer Invitational Queenstown, NZL | 0 |
| simulated-reality | 43195 | SRL Summer Invitational Rockhampton, AUS | 0 |
| simulated-reality | 48315 | SRL Summer Invitational Rustavi, GEO | 0 |
| simulated-reality | 43383 | SRL Summer Invitational Sittwe, MMR | 0 |
| simulated-reality | 48070 | SRL Summer Invitational Sumgait, AZE | 0 |
| simulated-reality | 47391 | SRL Summer Invitational Sunbury, AUS | 0 |
| simulated-reality | 43131 | SRL Summer Invitational Townsville, AUS | 0 |
| simulated-reality | 41174 | SRL Summer Invitational Trenton (NJ), USA | 0 |
| simulated-reality | 44151 | SRL Summer Invitational Tulsa (OK), USA | 0 |
| simulated-reality | 48485 | SRL Summer Invitational Vanadzor, ARM | 0 |
| simulated-reality | 47433 | SRL Summer Invitational Werribee, AUS | 0 |
| simulated-reality | 47886 | SRL Summer Invitational Xirdalan, AZE | 0 |
| simulated-reality | 46237 | SRL Winter Invitational Aydin, TUR | 0 |
| simulated-reality | 42109 | SRL Winter Invitational Belem, BRA | 0 |
| simulated-reality | 45405 | SRL Winter Invitational Belo Horizonte, BRA | 0 |
| simulated-reality | 42405 | SRL Winter Invitational Bukhara, UZB | 0 |
| simulated-reality | 45609 | SRL Winter Invitational Campo Grande, BRA | 0 |
| simulated-reality | 46185 | SRL Winter Invitational Denizli, TUR | 0 |
| simulated-reality | 46189 | SRL Winter Invitational Denizli, TUR, Women | 0 |
| simulated-reality | 42385 | SRL Winter Invitational Erzincan, TUR | 0 |
| simulated-reality | 42337 | SRL Winter Invitational Erzurum, TUR | 0 |
| simulated-reality | 42001 | SRL Winter Invitational Fortaleza, BRA | 0 |
| simulated-reality | 42483 | SRL Winter Invitational Karachi, PKT | 0 |
| simulated-reality | 45735 | SRL Winter Invitational Londrina, BRA | 0 |
| simulated-reality | 45433 | SRL Winter Invitational Montes Claros, BRA | 0 |
| simulated-reality | 42135 | SRL Winter Invitational Nagoya, JPN | 0 |
| simulated-reality | 41981 | SRL Winter Invitational Natal, BRA | 0 |
| simulated-reality | 41937 | SRL Winter Invitational Oxford, GBR | 0 |
| simulated-reality | 45833 | SRL Winter Invitational Port Augusta, AUS | 0 |
| simulated-reality | 42055 | SRL Winter Invitational Sao Luis, BRA | 0 |
| simulated-reality | 42485 | SRL Winter Invitational Sukkur, PKT | 0 |
| simulated-reality | 42019 | SRL Winter Invitational Teresina, BRA | 0 |
| simulated-reality | 45487 | SRL Winter Invitational Uberlandia, BRA | 0 |
| simulated-reality | 45831 | SRL Winter Invitational Whyalla, AUS | 0 |
| simulated-reality-women | 45341 | SRL Fall Invitational Batemans Bay, AUS, Women | 0 |
| simulated-reality-women | 41722 | SRL Fall Invitational Blenheim, NZL, Women | 0 |
| simulated-reality-women | 49574 | SRL Fall Invitational Bodrum, TUR, Women | 0 |
| simulated-reality-women | 44565 | SRL Fall Invitational Broken Arrow, USA, Women | 0 |
| simulated-reality-women | 49422 | SRL Fall Invitational Bursa, TUR, Women | 0 |
| simulated-reality-women | 49668 | SRL Fall Invitational Coffs Harbour, AUS, Women | 0 |
| simulated-reality-women | 41286 | SRL Fall Invitational Dunedin, NZL, Women | 0 |
| simulated-reality-women | 48821 | SRL Fall Invitational Fargo, ND, USA, Women | 0 |
| simulated-reality-women | 48909 | SRL Fall Invitational Flint, MI, USA, Women | 0 |
| simulated-reality-women | 49344 | SRL Fall Invitational Geraldton, AUS, Women | 0 |
| simulated-reality-women | 41500 | SRL Fall Invitational Gosford, AUS, Women | 0 |
| simulated-reality-women | 45263 | SRL Fall Invitational Goulburn, AUS, Women | 0 |
| simulated-reality-women | 48819 | SRL Fall Invitational Grand Rapids, MI, USA, Women | 0 |
| simulated-reality-women | 45395 | SRL Fall Invitational Hannover, GER, Women | 0 |
| simulated-reality-women | 49346 | SRL Fall Invitational Hervey Bay, AUS, Women | 0 |
| simulated-reality-women | 49248 | SRL Fall Invitational Hillsboro, OR, USA, Women | 0 |
| simulated-reality-women | 45265 | SRL Fall Invitational Ho Chi Minh City, VIE, Women | 0 |
| simulated-reality-women | 45079 | SRL Fall Invitational Jaipur, IND, Women | 0 |
| simulated-reality-women | 41570 | SRL Fall Invitational Kathmandu, NP, Women | 0 |
| simulated-reality-women | 49518 | SRL Fall Invitational Kocaeli, TUR, Women | 0 |
| simulated-reality-women | 41422 | SRL Fall Invitational Manado, INA, Women | 0 |
| simulated-reality-women | 49057 | SRL Fall Invitational Minot, ND, USA, Women | 0 |
| simulated-reality-women | 44203 | SRL Fall Invitational Muskogee (OK), USA, Women | 0 |
| simulated-reality-women | 41893 | SRL Fall Invitational Napier, NZL, Women | 0 |
| simulated-reality-women | 41770 | SRL Fall Invitational Okayama, JPN, Women | 0 |
| simulated-reality-women | 41288 | SRL Fall Invitational Queenstown, NZL, Women | 0 |
| simulated-reality-women | 49130 | SRL Fall Invitational Rapid City, SD, USA, Women | 0 |
| simulated-reality-women | 44345 | SRL Fall Invitational Reno, (NV) USA, Women | 0 |
| simulated-reality-women | 44563 | SRL Fall Invitational Sand Springs, USA, Women | 0 |
| simulated-reality-women | 44437 | SRL Fall Invitational Stillwater (OK), USA, Women | 0 |
| simulated-reality-women | 49860 | SRL Fall Invitational Tweed Heads, AUS, Women | 28 |
| simulated-reality-women | 44981 | SRL Fall Invitational Wangaratta, AUS, Women | 0 |
| simulated-reality-women | 49001 | SRL Fall Invitational Warren, MI, USA, Women | 0 |
| simulated-reality-women | 44657 | SRL Fall Invitational, Wagoner (OK), USA | 0 |
| simulated-reality-women | 47355 | SRL Spring Invitational Apollo Bay, AUS, Women | 0 |
| simulated-reality-women | 46724 | SRL Spring Invitational Bairnsdale, AUS, Women | 0 |
| simulated-reality-women | 46819 | SRL Spring Invitational Ballarat, AUS, Women | 0 |
| simulated-reality-women | 42635 | SRL Spring Invitational Castle Hill, AUS, Women | 0 |
| simulated-reality-women | 42731 | SRL Spring Invitational Christchurch, NZL, Women | 0 |
| simulated-reality-women | 43059 | SRL Spring Invitational Cromwell, NZL, Women | 0 |
| simulated-reality-women | 47157 | SRL Spring Invitational Frankston, AUS, Women | 0 |
| simulated-reality-women | 46869 | SRL Spring Invitational Geelong, AUS, Women | 0 |
| simulated-reality-women | 42785 | SRL Spring Invitational Gisborne, NZL, Women | 0 |
| simulated-reality-women | 45999 | SRL Spring Invitational Gisborne, NZL, Women | 0 |
| simulated-reality-women | 47065 | SRL Spring Invitational Gore, NZL, Women | 0 |
| simulated-reality-women | 46563 | SRL Spring Invitational Hyderabad, PAK, Women | 0 |
| simulated-reality-women | 42975 | SRL Spring Invitational Invercargill, NZL, Women | 0 |
| simulated-reality-women | 46565 | SRL Spring Invitational Islamabad, PAK, Women | 0 |
| simulated-reality-women | 46975 | SRL Spring Invitational Lorne, AUS, Women | 0 |
| simulated-reality-women | 42537 | SRL Spring Invitational Mandalay, MMR, Women | 0 |
| simulated-reality-women | 47187 | SRL Spring Invitational Morwell, AUS, Women | 0 |
| simulated-reality-women | 42909 | SRL Spring Invitational New Plymouth, NZL, Women | 0 |
| simulated-reality-women | 46399 | SRL Spring Invitational Oskemen, KAZ, Women | 0 |
| simulated-reality-women | 42539 | SRL Spring Invitational Rangun, MMR, Women | 0 |
| simulated-reality-women | 46301 | SRL Spring Invitational Semey, KAZ, Women | 0 |
| simulated-reality-women | 46780 | SRL Spring Invitational Sunbury, AUS, Women | 0 |
| simulated-reality-women | 43031 | SRL Spring Invitational Taupo, NZL, Women | 0 |
| simulated-reality-women | 42845 | SRL Spring Invitational Tauranga 2, NZL, Women | 0 |
| simulated-reality-women | 42691 | SRL Spring Invitational Tauranga, NZL, Women | 0 |
| simulated-reality-women | 42657 | SRL Spring Invitational Timaru, NZL, Women | 0 |
| simulated-reality-women | 47275 | SRL Spring Invitational Upper Hutt, NZL, Women | 0 |
| simulated-reality-women | 44087 | SRL Summer Invitational Ashgabat, TKM, Women | 0 |
| simulated-reality-women | 41240 | SRL Summer Invitational Baltimore (MD), USA, Women | 0 |
| simulated-reality-women | 48195 | SRL Summer Invitational Batumi, GEO, Women | 0 |
| simulated-reality-women | 43277 | SRL Summer Invitational Blenheim, NZL, Women | 0 |
| simulated-reality-women | 43609 | SRL Summer Invitational Bukhara, UZB, Women | 0 |
| simulated-reality-women | 43303 | SRL Summer Invitational Bundaberg, AUS, Women | 0 |
| simulated-reality-women | 47540 | SRL Summer Invitational Castlemaine, AUS, Women | 0 |
| simulated-reality-women | 48759 | SRL Summer Invitational Detroit, MI, USA, Women | 0 |
| simulated-reality-women | 43853 | SRL Summer Invitational Fergana, UZB, Women | 0 |
| simulated-reality-women | 47638 | SRL Summer Invitational Gisborne, NZL, Women | 0 |
| simulated-reality-women | 48549 | SRL Summer Invitational Gyumri, ARM, Women | 0 |
| simulated-reality-women | 40581 | SRL Summer Invitational Jizzakh, UZB, Women | 0 |
| simulated-reality-women | 40913 | SRL Summer Invitational Kostanay, KAZ, Women | 0 |
| simulated-reality-women | 48004 | SRL Summer Invitational Lankaran, AZE, Women | 0 |
| simulated-reality-women | 43437 | SRL Summer Invitational Mackay, AUS, Women | 0 |
| simulated-reality-women | 43951 | SRL Summer Invitational Margilan, UZB, Women | 0 |
| simulated-reality-women | 43385 | SRL Summer Invitational Napier, NZL, Women | 0 |
| simulated-reality-women | 43537 | SRL Summer Invitational Nukus, UZB, Women | 0 |
| simulated-reality-women | 41124 | SRL Summer Invitational Philadelphia (PA), USA, Women | 0 |
| simulated-reality-women | 43197 | SRL Summer Invitational Rockhampton, AUS, Women | 0 |
| simulated-reality-women | 48317 | SRL Summer Invitational Rustavi, GEO, Women | 0 |
| simulated-reality-women | 48072 | SRL Summer Invitational Sumgait, AZE, Women | 0 |
| simulated-reality-women | 47393 | SRL Summer Invitational Sunbury, AUS, Women | 0 |
| simulated-reality-women | 43133 | SRL Summer Invitational Townsville, AUS, Women | 0 |
| simulated-reality-women | 41176 | SRL Summer Invitational Trenton (NJ), USA, Women | 0 |
| simulated-reality-women | 44153 | SRL Summer Invitational Tulsa (OK), USA, Women | 0 |
| simulated-reality-women | 48487 | SRL Summer Invitational Vanadzor, ARM, Women | 0 |
| simulated-reality-women | 47435 | SRL Summer Invitational Werribee, AUS, Women | 0 |
| simulated-reality-women | 47890 | SRL Summer Invitational Xirdalan, AZE, Women | 0 |
| simulated-reality-women | 46085 | SRL Winter Invitational Adana, TUR, Women | 0 |
| simulated-reality-women | 45945 | SRL Winter Invitational Akita, JPN, Women | 0 |
| simulated-reality-women | 42253 | SRL Winter Invitational Alice Springs, AUS, Women | 0 |
| simulated-reality-women | 45947 | SRL Winter Invitational Aomori, JPN, Women | 0 |
| simulated-reality-women | 45885 | SRL Winter Invitational Auckland, NZL, Women | 0 |
| simulated-reality-women | 46239 | SRL Winter Invitational Aydin, TUR, Women | 0 |
| simulated-reality-women | 42111 | SRL Winter Invitational Belem, BRA, Women | 0 |
| simulated-reality-women | 45407 | SRL Winter Invitational Belo Horizonte, BRA, Women | 0 |
| simulated-reality-women | 42189 | SRL Winter Invitational Blenheim NZL, Women | 0 |
| simulated-reality-women | 42407 | SRL Winter Invitational Bukhara, UZB, Women | 0 |
| simulated-reality-women | 45611 | SRL Winter Invitational Campo Grande, BRA, Women | 0 |
| simulated-reality-women | 45887 | SRL Winter Invitational Christchurch, NZL, Women | 0 |
| simulated-reality-women | 42315 | SRL Winter Invitational Diyarbakir, TUR, Women | 0 |
| simulated-reality-women | 42339 | SRL Winter Invitational Erzurum, TUR,  Women | 0 |
| simulated-reality-women | 42003 | SRL Winter Invitational Fortaleza, BRA, Women | 0 |
| simulated-reality-women | 42289 | SRL Winter Invitational Invercargill, NZL, Women | 0 |
| simulated-reality-women | 45737 | SRL Winter Invitational Londrina, BRA, Women | 0 |
| simulated-reality-women | 42313 | SRL Winter Invitational Mardin, TUR, Women | 0 |
| simulated-reality-women | 46087 | SRL Winter Invitational Mersin, TUR, Women | 0 |
| simulated-reality-women | 45435 | SRL Winter Invitational Montes Claros, BRA, Women | 0 |
| simulated-reality-women | 42191 | SRL Winter Invitational Napier NZL, Women | 0 |
| simulated-reality-women | 42287 | SRL Winter Invitational Nelson, NZL, Women | 0 |
| simulated-reality-women | 46001 | SRL Winter Invitational New Plymouth, NZL, Women | 0 |
| simulated-reality-women | 41983 | SRL Winter Invitational Nova Cruz, BRA, Women | 0 |
| simulated-reality-women | 41939 | SRL Winter Invitational Oxford, GBR, Women | 0 |
| simulated-reality-women | 42387 | SRL Winter Invitational Qarshi UZB, Women | 0 |
| simulated-reality-women | 42251 | SRL Winter Invitational Queenstown, NZL, Women | 0 |
| simulated-reality-women | 42057 | SRL Winter Invitational Sao Luis, BRA, Women | 0 |
| simulated-reality-women | 42021 | SRL Winter Invitational Teresina, BRA, Women | 0 |
| simulated-reality-women | 45489 | SRL Winter Invitational Uberlandia, BRA, Women | 0 |
| simulated-reality-women | 42137 | SRL Winter Invitational Upper Hutt, NZL, Women | 0 |
| united-cup | 38341 | United Cup | 36 |
| utr-men | 45391 | UT Olomouc M01 | 0 |
| utr-men | 47137 | UTR Ahaus M01 | 0 |
| utr-men | 45637 | UTR Alvor M01 | 0 |
| utr-men | 45755 | UTR Alvor M02 | 0 |
| utr-men | 46415 | UTR Alvor M03 | 0 |
| utr-men | 45427 | UTR Baton Rouge M01 | 0 |
| utr-men | 46413 | UTR Belgrade M01 | 0 |
| utr-men | 46591 | UTR Belgrade M02 | 0 |
| utr-men | 45843 | UTR Berkeley M01 | 0 |
| utr-men | 45497 | UTR Blagoevgrad M01 | 0 |
| utr-men | 45839 | UTR Blagoevgrad M02 | 0 |
| utr-men | 46125 | UTR Blagoevgrad M03 | 0 |
| utr-men | 45643 | UTR Bloomington M01 | 0 |
| utr-men | 45493 | UTR Boca Raton M01 | 0 |
| utr-men | 45639 | UTR Boca Raton M02 | 0 |
| utr-men | 46021 | UTR Boca Raton M03 | 0 |
| utr-men | 46319 | UTR Boca Raton M04 | 0 |
| utr-men | 46829 | UTR Boca Raton M05 | 0 |
| utr-men | 46983 | UTR Boca Raton M06 | 0 |
| utr-men | 45961 | UTR Bucharest M01 | 0 |
| utr-men | 46791 | UTR Bucharest M02 | 0 |
| utr-men | 46989 | UTR Budapest M01 | 0 |
| utr-men | 46017 | UTR Cardiff M01 | 0 |
| utr-men | 46593 | UTR Carvoeiro M01 | 0 |
| utr-men | 46827 | UTR Carvoeiro M02 | 0 |
| utr-men | 46891 | UTR Carvoeiro M03 | 0 |
| utr-men | 46730 | UTR College Station M01 | 0 |
| utr-men | 46417 | UTR Cordoba M01 | 0 |
| utr-men | 46597 | UTR Cordoba M02 | 0 |
| utr-men | 45361 | UTR Cornella de Llobregat M01 | 0 |
| utr-men | 45473 | UTR Cornella de Llobregat M02 | 0 |
| utr-men | 45841 | UTR Cornella de Llobregat M03 | 0 |
| utr-men | 47075 | UTR Denver M01 | 0 |
| utr-men | 45837 | UTR Dubai M01 | 0 |
| utr-men | 45889 | UTR Dubai M02 | 0 |
| utr-men | 46199 | UTR Dubai M03 | 0 |
| utr-men | 46241 | UTR Dubai M04 | 0 |
| utr-men | 47135 | UTR Glifada M01 | 0 |
| utr-men | 45753 | UTR Gyor M01 | 0 |
| utr-men | 46201 | UTR Gyor M02 | 0 |
| utr-men | 46679 | UTR Gyor M03 | 0 |
| utr-men | 45437 | UTR Japan M01 | 0 |
| utr-men | 45959 | UTR Kawaguchi M01 | 0 |
| utr-men | 46726 | UTR Kawaguchi M02 | 0 |
| utr-men | 46789 | UTR Kawaguchi M03 | 0 |
| utr-men | 45043 | UTR Kawaguchi W06 | 0 |
| utr-men | 47067 | UTR Knoxville M01 | 0 |
| utr-men | 46127 | UTR Lawrenceville M01 | 0 |
| utr-men | 46245 | UTR Lawrenceville M02 | 0 |
| utr-men | 46677 | UTR Lawrenceville M03 | 0 |
| utr-men | 46025 | UTR Lincoln M01 | 0 |
| utr-men | 45359 | UTR Los Angeles M01 | 0 |
| utr-men | 47069 | UTR Los Angeles M02 | 0 |
| utr-men | 47131 | UTR Los Angeles M03 | 0 |
| utr-men | 46681 | UTR Loughborough M01 | 0 |
| utr-men | 47071 | UTR Lovedale M01 | 0 |
| utr-men | 47133 | UTR Lovedale M02 | 0 |
| utr-men | 47139 | UTR Manchester M01 | 0 |
| utr-men | 46247 | UTR Manzanillo M01 | 0 |
| utr-men | 46321 | UTR Manzanillo M02 | 0 |
| utr-men | 46728 | UTR Manzanillo M03 | 0 |
| utr-men | 46797 | UTR Manzanillo M04 | 0 |
| utr-men | 46793 | UTR Maria Lanzendorf M01 | 0 |
| utr-men | 46411 | UTR Melbourne M01 | 0 |
| utr-men | 46589 | UTR Melbourne M02 | 0 |
| utr-men | 46823 | UTR Melbourne M03 | 0 |
| utr-men | 46889 | UTR Melbourne M04 | 0 |
| utr-men | 45499 | UTR Newport Beach M01 | 0 |
| utr-men | 45757 | UTR Newport Beach M02 | 0 |
| utr-men | 46023 | UTR Newport Beach M03 | 0 |
| utr-men | 46203 | UTR Newport Beach M04 | 0 |
| utr-men | 46595 | UTR Newport Beach M05 | 0 |
| utr-men | 46795 | UTR Newport Beach M06 | 0 |
| utr-men | 46901 | UTR Newport Beach M07 | 0 |
| utr-men | 45495 | UTR Noda M02 | 0 |
| utr-men | 45357 | UTR Norman M01 | 0 |
| utr-men | 45635 | UTR Olomouc M02 | 0 |
| utr-men | 45891 | UTR Olomouc M03 | 0 |
| utr-men | 46243 | UTR Olomouc M04 | 0 |
| utr-men | 46987 | UTR Pazardzhik M01 | 0 |
| utr-men | 48018 | UTR PTT Athens Men 01 | 0 |
| utr-men | 48207 | UTR PTT Athens Men 02 | 0 |
| utr-men | 47215 | UTR PTT Atlanta Men 01 | 0 |
| utr-men | 47698 | UTR PTT Bali Men +H 01 | 0 |
| utr-men | 48321 | UTR PTT Bali Men +H 02 | 0 |
| utr-men | 49063 | UTR PTT Baton Rouge Men 02 | 0 |
| utr-men | 48078 | UTR PTT Belgrade Men 03 | 0 |
| utr-men | 48843 | UTR PTT Belgrade Men 04 | 0 |
| utr-men | 48915 | UTR PTT Belgrade Men 05 | 0 |
| utr-men | 49580 | UTR PTT Belgrade Men 06 | 0 |
| utr-men | 49366 | UTR PTT Bengaluru Men 01 | 0 |
| utr-men | 47902 | UTR PTT Blacksburg Men 01 | 0 |
| utr-men | 47287 | UTR PTT Boca Raton Men 07 | 0 |
| utr-men | 48727 | UTR PTT Boca Raton Men 08 | 0 |
| utr-men | 49254 | UTR PTT Boca Raton Men 09 | 0 |
| utr-men | 49874 | UTR PTT Boca Raton Men 10 | 0 |
| utr-men | 48020 | UTR PTT Boise Men 01 | 0 |
| utr-men | 48325 | UTR PTT Boise Men 02 | 0 |
| utr-men | 47441 | UTR PTT Boondall Men 01 | 0 |
| utr-men | 47552 | UTR PTT Brisbane Men 02 | 0 |
| utr-men | 47207 | UTR PTT Bucharest Men 03 | 0 |
| utr-men | 49502 | UTR PTT Bucharest Men 04 | 0 |
| utr-men | 47692 | UTR PTT Budapest Men 02 | 0 |
| utr-men | 47892 | UTR PTT Budapest Men 03 | 0 |
| utr-men | 48239 | UTR PTT Budapest Men 04 | 0 |
| utr-men | 49506 | UTR PTT Buenos Aires Men 01 | 0 |
| utr-men | 49584 | UTR PTT Buenos Aires Men 02 | 0 |
| utr-men | 47211 | UTR PTT Calgary Men 01 | 0 |
| utr-men | 47297 | UTR PTT Calgary Men 02 | 0 |
| utr-men | 49582 | UTR PTT Cardiff Men 02 | 0 |
| utr-men | 49260 | UTR PTT Carvoeiro Men +H 06 | 0 |
| utr-men | 49684 | UTR PTT Carvoeiro Men +H 07 | 40 |
| utr-men | 49880 | UTR PTT Carvoeiro Men +H 08 | 0 |
| utr-men | 47209 | UTR PTT Carvoeiro Men 04 | 0 |
| utr-men | 47293 | UTR PTT Carvoeiro Men 05 | 0 |
| utr-men | 48084 | UTR PTT Charlotte Men 01 | 0 |
| utr-men | 48917 | UTR PTT Clemson Men 01 | 0 |
| utr-men | 49136 | UTR PTT Clemson Men 02 | 0 |
| utr-men | 47898 | UTR PTT College Station Men 02 | 0 |
| utr-men | 49132 | UTR PTT College Station Men 03 | 0 |
| utr-men | 49017 | UTR PTT Cologne Men 01 | 0 |
| utr-men | 49059 | UTR PTT Cologne Men 02 | 0 |
| utr-men | 48016 | UTR PTT Cordoba Men +H 03 | 0 |
| utr-men | 48082 | UTR PTT Cordoba Men +H 04 | 0 |
| utr-men | 48733 | UTR PTT Cordoba Men +H 05 | 0 |
| utr-men | 48845 | UTR PTT Cordoba Men +H 06 | 0 |
| utr-men | 48561 | UTR PTT Covilha Men +H 01 | 0 |
| utr-men | 48495 | UTR PTT Denver Men 02 | 0 |
| utr-men | 49368 | UTR PTT Dubai Men +H 05 | 0 |
| utr-men | 49426 | UTR PTT Dubai Men +H 06 | 0 |
| utr-men | 47554 | UTR PTT Dusseldorf Men 01 | 0 |
| utr-men | 48639 | UTR PTT Essen Men 01 | 0 |
| utr-men | 48725 | UTR PTT Essen Men 02 | 0 |
| utr-men | 49262 | UTR PTT Fayetteville Men 01 | 0 |
| utr-men | 47289 | UTR PTT Fukui Men 01 | 0 |
| utr-men | 48237 | UTR PTT Gold Coast Men 01 | 0 |
| utr-men | 48319 | UTR PTT Gold Coast Men 02 | 0 |
| utr-men | 48489 | UTR PTT Hamburg Men 01 | 0 |
| utr-men | 49674 | UTR PTT Honolulu Men +H 01 | 26 |
| utr-men | 49870 | UTR PTT Honolulu Men +H 02 | 0 |
| utr-men | 49256 | UTR PTT Hyogo Men 01 | 0 |
| utr-men | 49500 | UTR PTT Hyogo Men 02 | 0 |
| utr-men | 48563 | UTR PTT Ithaca Men 01 | 0 |
| utr-men | 49430 | UTR PTT Ithaca Men 02 | 0 |
| utr-men | 47365 | UTR PTT Jacksonville Men 01 | 0 |
| utr-men | 49061 | UTR PTT Kaohsiung City Men +H 02 | 0 |
| utr-men | 47299 | UTR PTT Knoxville Men 02 | 0 |
| utr-men | 48327 | UTR PTT Knoxville Men 03 | 0 |
| utr-men | 49065 | UTR PTT Knoxville Men 04 | 0 |
| utr-men | 49678 | UTR PTT Knoxville Men 05 | 36 |
| utr-men | 47556 | UTR PTT Krakow Men 01 | 0 |
| utr-men | 48491 | UTR PTT Krakow Men 02 | 0 |
| utr-men | 49126 | UTR PTT Krakow Men 03 | 0 |
| utr-men | 49682 | UTR PTT Krakow Men 04 | 40 |
| utr-men | 47700 | UTR PTT Lincoln Men 02 | 0 |
| utr-men | 48651 | UTR PTT Lincoln Men 03 | 0 |
| utr-men | 47900 | UTR PTT Los Angeles Men 04 | 0 |
| utr-men | 47896 | UTR PTT Lovedale Men 03 | 0 |
| utr-men | 49424 | UTR PTT Lovedale Men 04 | 0 |
| utr-men | 49498 | UTR PTT Lovedale Men 05 | 0 |
| utr-men | 49374 | UTR PTT Malibu Men 01 | 0 |
| utr-men | 47213 | UTR PTT Manchester Men 02 | 0 |
| utr-men | 49676 | UTR PTT Melbourne Men 01 | 26 |
| utr-men | 49872 | UTR PTT Melbourne Men 02 | 0 |
| utr-men | 47894 | UTR PTT Monchengladbach Men 01 | 0 |
| utr-men | 47445 | UTR PTT Monterol Men 01 | 0 |
| utr-men | 49504 | UTR PTT Montpellier Men 01 | 0 |
| utr-men | 49023 | UTR PTT Nashville Men 01 | 0 |
| utr-men | 47295 | UTR PTT Newport Beach Men 08 | 0 |
| utr-men | 47449 | UTR PTT Newport Beach Men 09 | 0 |
| utr-men | 47696 | UTR PTT Newport Beach Men 10 | 0 |
| utr-men | 48205 | UTR PTT Newport Beach Men 11 | 0 |
| utr-men | 48649 | UTR PTT Newport Beach Men 12 | 0 |
| utr-men | 48849 | UTR PTT Newport Beach Men 13 | 0 |
| utr-men | 49025 | UTR PTT Newport Beach Men 14 | 0 |
| utr-men | 49134 | UTR PTT Newport Beach Men 15 | 0 |
| utr-men | 49434 | UTR PTT Newport Beach Men 16 | 0 |
| utr-men | 49588 | UTR PTT Newport Beach Men 17 | 0 |
| utr-men | 49882 | UTR PTT Newport Beach Men 18 | 0 |
| utr-men | 47359 | UTR PTT Norman Men 02 | 0 |
| utr-men | 48080 | UTR PTT Norman Men 03 | 0 |
| utr-men | 48847 | UTR PTT Norman Men 04 | 0 |
| utr-men | 47397 | UTR PTT Olomouc Men 05 | 0 |
| utr-men | 48323 | UTR PTT Olomouc Men 06 | 0 |
| utr-men | 49428 | UTR PTT Olomouc Men 07 | 0 |
| utr-men | 49878 | UTR PTT Olomouc Men 08 | 0 |
| utr-men | 49578 | UTR PTT Oxford Men 01 | 0 |
| utr-men | 47443 | UTR PTT Pazardzhik Men 02 | 0 |
| utr-men | 49680 | UTR PTT Phan Thiet Men +H 01 | 37 |
| utr-men | 48731 | UTR PTT Saitama Men 01 | 0 |
| utr-men | 48841 | UTR PTT Saitama Men 02 | 0 |
| utr-men | 49019 | UTR PTT Saitama Men 03 | 0 |
| utr-men | 49876 | UTR PTT Saitama Men 04 | 0 |
| utr-men | 48086 | UTR PTT San Diego Men 01 | 0 |
| utr-men | 48331 | UTR PTT San Diego Men 02 | 0 |
| utr-men | 47395 | UTR PTT Sanmin District Men +H 03 | 0 |
| utr-men | 47205 | UTR PTT Sanmin District Men 02 | 0 |
| utr-men | 48559 | UTR PTT Skopje Men +H 04 | 0 |
| utr-men | 49021 | UTR PTT Skopje Men +H 05 | 0 |
| utr-men | 47291 | UTR PTT Skopje Men 02 | 0 |
| utr-men | 47361 | UTR PTT Skopje Men 03 | 0 |
| utr-men | 49372 | UTR PTT Stillwater Men 01 | 0 |
| utr-men | 48565 | UTR PTT Tallahassee Men 01 | 0 |
| utr-men | 49586 | UTR PTT Tallahassee Men 02 | 0 |
| utr-men | 48643 | UTR PTT Thessaloniki Men 01 | 0 |
| utr-men | 49258 | UTR PTT Trnava Men 02 | 0 |
| utr-men | 49370 | UTR PTT Trnava Men 03 | 0 |
| utr-men | 49264 | UTR PTT Tucson Men 02 | 0 |
| utr-men | 47363 | UTR PTT Tuscaloosa Men 02 | 0 |
| utr-men | 49376 | UTR PTT Tuscaloosa Men 03 | 0 |
| utr-men | 48493 | UTR PTT Urbana Men 02 | 0 |
| utr-men | 48919 | UTR PTT Urbana Men 03 | 0 |
| utr-men | 47399 | UTR PTT Waco Men 01 | 0 |
| utr-men | 47694 | UTR PTT Waco Men 02 | 0 |
| utr-men | 48209 | UTR PTT Waco Men 03 | 0 |
| utr-men | 48497 | UTR PTT Waco Men 04 | 0 |
| utr-men | 49432 | UTR PTT Waco Men 05 | 0 |
| utr-men | 47447 | UTR PTT Walpole Men 01 | 0 |
| utr-men | 48076 | UTR PTT Yokohama Men 05 | 0 |
| utr-men | 48203 | UTR PTT Yokohama Men 06 | 0 |
| utr-men | 48729 | UTR PTT Zadar Men 03 | 0 |
| utr-men | 46315 | UTR Sanmin District M01 | 0 |
| utr-men | 46825 | UTR Skopje M01 | 0 |
| utr-men | 45895 | UTR Spring M01 | 0 |
| utr-men | 46599 | UTR Spring M02 | 0 |
| utr-men | 45897 | UTR Stockton M01 | 0 |
| utr-men | 46831 | UTR Stockton M02 | 0 |
| utr-men | 45893 | UTR Tigre M01 | 0 |
| utr-men | 45963 | UTR Tigre M02 | 0 |
| utr-men | 47073 | UTR Trnava M01 | 0 |
| utr-men | 45431 | UTR Tucson M01 | 0 |
| utr-men | 46993 | UTR Tuscaloosa M01 | 0 |
| utr-men | 46985 | UTR Urayasu M01 | 0 |
| utr-men | 46991 | UTR Urbana M01 | 0 |
| utr-men | 47141 | UTR Winston-Salem M02 | 0 |
| utr-men | 45747 | UTR Yokohama M01 | 0 |
| utr-men | 45835 | UTR Yokohama M02 | 0 |
| utr-men | 46123 | UTR Yokohama M03 | 0 |
| utr-men | 46197 | UTR Yokohama M04 | 0 |
| utr-men | 46019 | UTR Zadar M01 | 0 |
| utr-men | 46317 | UTR Zadar M02 | 0 |
| utr-men | 45471 | Winston-Salem M01 | 0 |
| utr-women | 47149 | UTR Ahaus W01 | 0 |
| utr-women | 46423 | UTR Alvor W01 | 0 |
| utr-women | 45475 | UTR Baton Rogue W01 | 0 |
| utr-women | 46421 | UTR Belgrade W01 | 0 |
| utr-women | 46609 | UTR Belgrade W02 | 0 |
| utr-women | 45657 | UTR Blagoevgrad W01 | 0 |
| utr-women | 45363 | UTR Boca Raton W01 | 0 |
| utr-women | 45659 | UTR Boca Raton W02 | 0 |
| utr-women | 45971 | UTR Boca Raton W03 | 0 |
| utr-women | 46213 | UTR Boca Raton W04 | 0 |
| utr-women | 45345 | UTR Boca Raton W05 | 0 |
| utr-women | 46427 | UTR Boca Raton W06 | 0 |
| utr-women | 46903 | UTR Boca Raton W07 | 0 |
| utr-women | 45505 | UTR Bonita Springs W01 | 0 |
| utr-women | 46801 | UTR Bucharest W03 | 0 |
| utr-women | 45913 | UTR Bucuresti W01 | 0 |
| utr-women | 46734 | UTR Bucuresti W02 | 0 |
| utr-women | 46997 | UTR Budapest W01 | 0 |
| utr-women | 46027 | UTR Cardiff W01 | 0 |
| utr-women | 46611 | UTR Carvoeiro W01 | 0 |
| utr-women | 46839 | UTR Carvoeiro W02 | 0 |
| utr-women | 46907 | UTR Carvoeiro W03 | 0 |
| utr-women | 46425 | UTR Cordoba W01 | 0 |
| utr-women | 45483 | UTR Cornella de Llobregat W01 | 0 |
| utr-women | 45501 | UTR Cornella de Llobregat W02 | 0 |
| utr-women | 45847 | UTR Cornella de Llobregat W03 | 0 |
| utr-women | 46135 | UTR Cornella de Llobregat W04 | 0 |
| utr-women | 47085 | UTR Denver W01 | 0 |
| utr-women | 45651 | UTR Dubai W01 | 0 |
| utr-women | 45763 | UTR Dubai W02 | 0 |
| utr-women | 46031 | UTR Dubai W03 | 0 |
| utr-women | 46131 | UTR Dubai W04 | 0 |
| utr-women | 47147 | UTR Glifada W01 | 0 |
| utr-women | 46249 | UTR Gyor W01 | 0 |
| utr-women | 46697 | UTR Gyor W02 | 0 |
| utr-women | 45965 | UTR Kawaguchi W01 | 0 |
| utr-women | 46732 | UTR Kawaguchi W02 | 0 |
| utr-women | 46799 | UTR Kawaguchi W03 | 0 |
| utr-women | 47083 | UTR Knoxville W01 | 0 |
| utr-women | 46029 | UTR Lawrenceville W01 | 0 |
| utr-women | 46693 | UTR Lawrenceville W02 | 0 |
| utr-women | 47077 | UTR Los Angeles W01 | 0 |
| utr-women | 47143 | UTR Los Angeles W02 | 0 |
| utr-women | 46699 | UTR Loughborough W01 | 0 |
| utr-women | 47079 | UTR Lovedale W01 | 0 |
| utr-women | 47145 | UTR Lovedale W02 | 0 |
| utr-women | 47151 | UTR Manchester W01 | 0 |
| utr-women | 46253 | UTR Manzanillo W01 | 0 |
| utr-women | 46329 | UTR Manzanillo W02 | 0 |
| utr-women | 46837 | UTR Maria Lanzendorf W01 | 0 |
| utr-women | 46419 | UTR Melbourne W01 | 0 |
| utr-women | 46603 | UTR Melbourne W02 | 0 |
| utr-women | 46835 | UTR Melbourne W03 | 0 |
| utr-women | 46905 | UTR Melbourne W04 | 0 |
| utr-women | 45367 | UTR Newport Beach W01 | 0 |
| utr-women | 45481 | UTR Newport Beach W02 | 0 |
| utr-women | 45347 | UTR Newport Beach W03 | 0 |
| utr-women | 45661 | UTR Newport Beach W04 | 0 |
| utr-women | 45973 | UTR Newport Beach W05 | 0 |
| utr-women | 46139 | UTR Newport Beach W06 | 0 |
| utr-women | 46251 | UTR Newport Beach W07 | 0 |
| utr-women | 46429 | UTR Newport Beach W08 | 0 |
| utr-women | 46701 | UTR Newport Beach W09 | 0 |
| utr-women | 45477 | UTR Noda W01 | 0 |
| utr-women | 45595 | UTR Noda W02 | 0 |
| utr-women | 45365 | UTR Norman W01 | 0 |
| utr-women | 45349 | UTR Olomouc W01 | 0 |
| utr-women | 45967 | UTR Olomouc W02 | 0 |
| utr-women | 46209 | UTR Olomouc W03 | 0 |
| utr-women | 45849 | UTR Pancevo W01 | 0 |
| utr-women | 46995 | UTR Pazardzhik W01 | 0 |
| utr-women | 48026 | UTR PTT Athens Women 01 | 0 |
| utr-women | 48229 | UTR PTT Athens Women 02 | 0 |
| utr-women | 47225 | UTR PTT Atlanta Women 01 | 0 |
| utr-women | 48090 | UTR PTT Belgrade Women 03 | 0 |
| utr-women | 48837 | UTR PTT Belgrade Women 04 | 0 |
| utr-women | 48921 | UTR PTT Belgrade Women 05 | 0 |
| utr-women | 49888 | UTR PTT Belgrade Women 06 | 0 |
| utr-women | 49514 | UTR PTT Bengaluru Women 01 | 0 |
| utr-women | 47948 | UTR PTT Blacksburg Women 01 | 0 |
| utr-women | 49033 | UTR PTT Boca Raton Women 08 | 0 |
| utr-women | 49380 | UTR PTT Boca Raton Women 09 | 0 |
| utr-women | 49688 | UTR PTT Boca Raton Women 10 | 32 |
| utr-women | 48028 | UTR PTT Boise Women 01 | 0 |
| utr-women | 48367 | UTR PTT Boise Women 02 | 0 |
| utr-women | 47451 | UTR PTT Boondall Women 01 | 0 |
| utr-women | 47564 | UTR PTT Boston Women 01 | 0 |
| utr-women | 47558 | UTR PTT Brisbane Women 02 | 0 |
| utr-women | 47217 | UTR PTT Bucharest Women 04 | 0 |
| utr-women | 49436 | UTR PTT Bucharest Women 05 | 0 |
| utr-women | 47702 | UTR PTT Budapest Women 02 | 0 |
| utr-women | 47906 | UTR PTT Budapest Women 03 | 0 |
| utr-women | 48225 | UTR PTT Budapest Women 04 | 0 |
| utr-women | 49512 | UTR PTT Buenos Aires Women 01 | 0 |
| utr-women | 49598 | UTR PTT Buenos Aires Women 02 | 0 |
| utr-women | 49270 | UTR PTT Carvoeiro Women +H 06 | 0 |
| utr-women | 49692 | UTR PTT Carvoeiro Women +H 07 | 40 |
| utr-women | 49890 | UTR PTT Carvoeiro Women +H 08 | 0 |
| utr-women | 47219 | UTR PTT Carvoeiro Women 04 | 0 |
| utr-women | 47303 | UTR PTT Carvoeiro Women 05 | 0 |
| utr-women | 48096 | UTR PTT Charlotte Women 01 | 0 |
| utr-women | 47944 | UTR PTT College Station Women 01 | 0 |
| utr-women | 49142 | UTR PTT College Station Women 02 | 0 |
| utr-women | 49027 | UTR PTT Cologne Women 01 | 0 |
| utr-women | 49067 | UTR PTT Cologne Women 02 | 0 |
| utr-women | 48835 | UTR PTT Cordoba Women +H 01 | 0 |
| utr-women | 48030 | UTR PTT Dallas Women 01 | 0 |
| utr-women | 49592 | UTR PTT Dallas Women 02 | 0 |
| utr-women | 48505 | UTR PTT Denver Women 02 | 0 |
| utr-women | 49510 | UTR PTT Dubai Women +H 05 | 0 |
| utr-women | 49594 | UTR PTT Dubai Women +H 06 | 0 |
| utr-women | 47560 | UTR PTT Dusseldorf Women 01 | 0 |
| utr-women | 48653 | UTR PTT Essen Women 01 | 0 |
| utr-women | 48735 | UTR PTT Essen Women 02 | 0 |
| utr-women | 49272 | UTR PTT Fayetteville Women 01 | 0 |
| utr-women | 48223 | UTR PTT Gold Coast Women 01 | 0 |
| utr-women | 48363 | UTR PTT Gold Coast Women 02 | 0 |
| utr-women | 48567 | UTR PTT Gunma Women 01 | 0 |
| utr-women | 48499 | UTR PTT Hamburg Women 01 | 0 |
| utr-women | 49266 | UTR PTT Hyogo Women 01 | 0 |
| utr-women | 49508 | UTR PTT Hyogo Women 02 | 0 |
| utr-women | 47373 | UTR PTT Jacksonville Women 01 | 0 |
| utr-women | 49069 | UTR PTT Kaohsiung City Women +H 02 | 0 |
| utr-women | 47704 | UTR PTT Kawaguchi Women 04 | 0 |
| utr-women | 47305 | UTR PTT Knoxville Women 02 | 0 |
| utr-women | 48369 | UTR PTT Knoxville Women 03 | 0 |
| utr-women | 49075 | UTR PTT Knoxville Women 04 | 0 |
| utr-women | 49694 | UTR PTT Knoxville Women 05 | 40 |
| utr-women | 47562 | UTR PTT Krakow Women 01 | 0 |
| utr-women | 49071 | UTR PTT Krakow Women 02 | 0 |
| utr-women | 49596 | UTR PTT Krakow Women 03 | 0 |
| utr-women | 47708 | UTR PTT Lincoln Women 01 | 0 |
| utr-women | 48655 | UTR PTT Lincoln Women 02 | 0 |
| utr-women | 47946 | UTR PTT Los Angeles Women 03 | 0 |
| utr-women | 47910 | UTR PTT Lovedale Women 03 | 0 |
| utr-women | 49382 | UTR PTT Malibu Women 01 | 0 |
| utr-women | 47221 | UTR PTT Manchester Women 02 | 0 |
| utr-women | 49686 | UTR PTT Melbourne Women 01 | 26 |
| utr-women | 49884 | UTR PTT Melbourne Women 02 | 0 |
| utr-women | 47908 | UTR PTT Monchengladbach Women 01 | 0 |
| utr-women | 49438 | UTR PTT Montpellier Women 01 | 0 |
| utr-women | 47371 | UTR PTT Newport Beach Women 10 | 0 |
| utr-women | 47566 | UTR PTT Newport Beach Women 11 | 0 |
| utr-women | 48024 | UTR PTT Newport Beach Women 12 | 0 |
| utr-women | 48739 | UTR PTT Newport Beach Women 13 | 0 |
| utr-women | 48923 | UTR PTT Newport Beach Women 14 | 0 |
| utr-women | 49073 | UTR PTT Newport Beach Women 15 | 0 |
| utr-women | 49274 | UTR PTT Newport Beach Women 15 | 0 |
| utr-women | 49696 | UTR PTT Newport Beach Women 17 | 40 |
| utr-women | 49892 | UTR PTT Newport Beach Women 18 | 0 |
| utr-women | 47367 | UTR PTT Norman Women 02 | 0 |
| utr-women | 48092 | UTR PTT Norman Women 03 | 0 |
| utr-women | 48839 | UTR PTT Norman Women 04 | 0 |
| utr-women | 47403 | UTR PTT Olomouc Women 04 | 0 |
| utr-women | 48365 | UTR PTT Olomouc Women 05 | 0 |
| utr-women | 48569 | UTR PTT Olomouc Women 06 | 0 |
| utr-women | 49378 | UTR PTT Olomouc Women 07 | 0 |
| utr-women | 49690 | UTR PTT Olomouc Women 08 | 40 |
| utr-women | 49590 | UTR PTT Oxford Women 01 | 0 |
| utr-women | 47453 | UTR PTT Pazardzhik Women 02 | 0 |
| utr-women | 49029 | UTR PTT Saitama Women 01 | 0 |
| utr-women | 49886 | UTR PTT Saitama Women 02 | 0 |
| utr-women | 48094 | UTR PTT San Diego Women 01 | 0 |
| utr-women | 48371 | UTR PTT San Diego Women 02 | 0 |
| utr-women | 47401 | UTR PTT Sanmin District Women +H 03 | 0 |
| utr-women | 47223 | UTR PTT Sanmin District Women 02 | 0 |
| utr-women | 48501 | UTR PTT Skopje Women +H 03 | 0 |
| utr-women | 49031 | UTR PTT Skopje Women +H 04 | 0 |
| utr-women | 47301 | UTR PTT Skopje Women 01 | 0 |
| utr-women | 47369 | UTR PTT Skopje Women 02 | 0 |
| utr-women | 47455 | UTR PTT Stillwater Women 01 | 0 |
| utr-women | 49138 | UTR PTT Trnava Women 02 | 0 |
| utr-women | 49268 | UTR PTT Trnava Women 03 | 0 |
| utr-women | 48503 | UTR PTT Urbana Women 02 | 0 |
| utr-women | 48925 | UTR PTT Urbana Women 03 | 0 |
| utr-women | 47405 | UTR PTT Waco Women 01 | 0 |
| utr-women | 47706 | UTR PTT Waco Women 02 | 0 |
| utr-women | 49440 | UTR PTT Waco Women 03 | 0 |
| utr-women | 48088 | UTR PTT Yokohama Women 05 | 0 |
| utr-women | 48227 | UTR PTT Yokohama Women 06 | 0 |
| utr-women | 48737 | UTR PTT Zadar Women 04 | 0 |
| utr-women | 46323 | UTR Roseto degli Abruzzi W01 | 0 |
| utr-women | 45915 | UTR Rungsted Kyst W01 | 0 |
| utr-women | 46325 | UTR Sanmin District W01 | 0 |
| utr-women | 45899 | UTR Spring W01 | 0 |
| utr-women | 46841 | UTR Stockton W01 | 0 |
| utr-women | 45917 | UTR Tigre W01 | 0 |
| utr-women | 45969 | UTR Tigre W02 | 0 |
| utr-women | 47081 | UTR Trnava W01 | 0 |
| utr-women | 46999 | UTR Urbana W01 | 0 |
| utr-women | 47153 | UTR Winston-Salem W02 | 0 |
| utr-women | 45761 | UTR Yokohama W01 | 0 |
| utr-women | 45845 | UTR Yokohama W02 | 0 |
| utr-women | 46129 | UTR Yokohama W03 | 0 |
| utr-women | 46205 | UTR Yokohama W04 | 0 |
| utr-women | 46033 | UTR Zadar W01 | 0 |
| utr-women | 46137 | UTR Zadar W02 | 0 |
| utr-women | 46327 | UTR Zadar W03 | 0 |
| utr-women | 45479 | Winston-Salem W01 | 0 |
| virtual-tennis-in-play | 42619 | Sim-Play ATP Legends 1990s | 0 |
| virtual-tennis-in-play | 42621 | Sim-Play ATP Legends 2000s | 0 |
| virtual-tennis-in-play | 42623 | Sim-Play ATP Legends 2010s | 0 |
| virtual-tennis-in-play | 42625 | Sim-Play ATP Legends 2020s | 0 |
| virtual-tennis-in-play | 34580 | Virtual Tennis In-Play Sportna Loterija | 0 |
| wheelchairs | 14826 | Wheelchairs AO, Melbourne, Australia Men Doubles | 0 |
| wheelchairs | 14824 | Wheelchairs AO, Melbourne, Australia Men Singles | 0 |
| wheelchairs | 14830 | Wheelchairs AO, Melbourne, Australia Women Doubles | 0 |
| wheelchairs | 14828 | Wheelchairs AO, Melbourne, Australia Women Singles | 0 |
| wheelchairs | 15411 | Wheelchairs French Open, Paris, France Men Doubles | 0 |
| wheelchairs | 15409 | Wheelchairs French Open, Paris, France Men Singles | 0 |
| wheelchairs | 15415 | Wheelchairs French Open, Paris, France Women Doubles | 0 |
| wheelchairs | 15413 | Wheelchairs French Open, Paris, France Women Singles | 0 |
| wheelchairs | 18050 | Wheelchairs US Open, New York, USA Men Doubles | 0 |
| wheelchairs | 18048 | Wheelchairs US Open, New York, USA Men Singles | 0 |
| wheelchairs | 18054 | Wheelchairs US Open, New York, USA Women Doubles | 0 |
| wheelchairs | 18052 | Wheelchairs US Open, New York, USA Women Singles | 0 |
| wheelchairs | 15672 | Wheelchairs Wimbledon, London, GB Men Doubles | 0 |
| wheelchairs | 15670 | Wheelchairs Wimbledon, London, GB Men Singles | 0 |
| wheelchairs | 15676 | Wheelchairs Wimbledon, London, GB Women Doubles | 0 |
| wheelchairs | 15674 | Wheelchairs Wimbledon, London, GB Women Singles | 0 |
| wheelchairs-juniors | 42773 | Wheelchairs Juniors French Open, Paris, France Boys Doubles | 0 |
| wheelchairs-juniors | 42771 | Wheelchairs Juniors French Open, Paris, France Boys Singles | 0 |
| wheelchairs-juniors | 42777 | Wheelchairs Juniors French Open, Paris, France Girls Doubles | 0 |
| wheelchairs-juniors | 42775 | Wheelchairs Juniors French Open, Paris, France Girls Singles | 0 |
| wheelchairs-juniors | 48645 | Wheelchairs Juniors US Open, New York, USA Boys Doubles | 0 |
| wheelchairs-juniors | 48647 | Wheelchairs Juniors US Open, New York, USA Girls Doubles | 0 |
| wheelchairs-juniors | 37201 | Wheelchairs Juniors US Open, New York, USA Men Singles | 0 |
| wheelchairs-juniors | 37203 | Wheelchairs Juniors US Open, New York, USA Women Singles | 0 |
| wta | 2573 | Australian Open Women Doubles | 0 |
| wta | 2571 | Australian Open Women Singles | 0 |
| wta | 2795 | Berlin, Germany Women Doubles | 0 |
| wta | 2793 | Berlin, Germany Women Singles | 0 |
| wta | 2585 | French Open Women Doubles | 0 |
| wta | 2583 | French Open Women Singles | 0 |
| wta | 8189 | Olympic Tournament Women Doubles | 0 |
| wta | 8187 | Olympic Tournament Women Singles | 0 |
| wta | 3165 | San Diego, USA Women Doubles | 0 |
| wta | 3163 | San Diego, USA Women Singles | 0 |
| wta | 2597 | US Open Women Doubles | 0 |
| wta | 2595 | US Open Women Singles | 0 |
| wta | 2561 | Wimbledon Women Doubles | 0 |
| wta | 2559 | Wimbledon Women Singles | 0 |
| wta | 33478 | WTA Abu Dhabi, UAE Women Doubles | 0 |
| wta | 33480 | WTA Abu Dhabi, UAE Women Singles | 0 |
| wta | 31295 | WTA Adelaide 1, Australia Women Doubles | 0 |
| wta | 31293 | WTA Adelaide 1, Australia Women Singles | 0 |
| wta | 6499 | WTA Auckland, New Zealand Women Doubles | 0 |
| wta | 6497 | WTA Auckland, New Zealand Women Singles | 0 |
| wta | 38205 | WTA Austin, USA Women Doubles | 0 |
| wta | 38203 | WTA Austin, USA Women Singles | 0 |
| wta | 31307 | WTA Bad Homburg Women Doubles | 0 |
| wta | 31305 | WTA Bad Homburg Women Singles | 0 |
| wta | 8845 | WTA Beijing, China Women Doubles | 0 |
| wta | 8843 | WTA Beijing, China Women Singles | 0 |
| wta | 2855 | WTA Birmingham, Great Britain Women Doubles | 0 |
| wta | 2853 | WTA Birmingham, Great Britain Women Singles | 0 |
| wta | 2705 | WTA Bogota, Colombia Women Doubles | 0 |
| wta | 2703 | WTA Bogota, Colombia Women Singles | 0 |
| wta | 6493 | WTA Brisbane, Australia Women Doubles | 0 |
| wta | 6491 | WTA Brisbane, Australia Women Singles | 0 |
| wta | 2897 | WTA Budapest, Hungary Women Doubles | 0 |
| wta | 2895 | WTA Budapest, Hungary Women Singles | 0 |
| wta | 2765 | WTA Charleston, USA Women Doubles | 0 |
| wta | 2763 | WTA Charleston, USA Women Singles | 0 |
| wta | 37305 | WTA Chennai, India, Women Doubles | 0 |
| wta | 37307 | WTA Chennai, India, Women Singles | 0 |
| wta | 8365 | WTA Cincinnati, USA Women Doubles | 0 |
| wta | 8363 | WTA Cincinnati, USA Women Singles | 0 |
| wta | 34210 | WTA Cleveland, USA Women Doubles | 0 |
| wta | 34208 | WTA Cleveland, USA Women Singles | 0 |
| wta | 34322 | WTA Cluj Napoca, Romania Women Doubles | 0 |
| wta | 34320 | WTA Cluj Napoca, Romania Women Singles | 0 |
| wta | 4223 | WTA Doha, Qatar Women Doubles | 0 |
| wta | 4221 | WTA Doha, Qatar Women Singles | 0 |
| wta | 4491 | WTA Dubai, UAE Women Doubles | 0 |
| wta | 4489 | WTA Dubai, UAE Women Singles | 0 |
| wta | 2879 | WTA Eastbourne, Great Britain Women Doubles | 0 |
| wta | 2877 | WTA Eastbourne, Great Britain Women Singles | 0 |
| wta | 21704 | WTA Elite Trophy Women Doubles | 0 |
| wta | 21702 | WTA Elite Trophy Women Singles | 0 |
| wta | 21424 | WTA Finals Women Doubles | 0 |
| wta | 21422 | WTA Finals Women Singles | 0 |
| wta | 33588 | WTA Guadalajara, Mexico Women Doubles | 0 |
| wta | 33586 | WTA Guadalajara, Mexico Women Singles | 0 |
| wta | 3015 | WTA Guangzhou, China Women Doubles | 0 |
| wta | 3013 | WTA Guangzhou, China Women Singles | 0 |
| wta | 34274 | WTA Hamburg, Germany Women Doubles | 0 |
| wta | 34272 | WTA Hamburg, Germany Women Singles | 0 |
| wta | 2807 | WTA Hobart, Australia Women Doubles | 0 |
| wta | 2805 | WTA Hobart, Australia Women Singles | 0 |
| wta | 11113 | WTA Hong Kong, Hong Kong Women Doubles | 0 |
| wta | 11111 | WTA Hong Kong, Hong Kong Women Singles | 0 |
| wta | 43945 | WTA Hua Hin 2, Thailand Women Doubles | 0 |
| wta | 43947 | WTA Hua Hin 2, Thailand Women Singles | 0 |
| wta | 27566 | WTA Hua Hin, Thailand Women Doubles | 0 |
| wta | 27564 | WTA Hua Hin, Thailand Women Singles | 0 |
| wta | 43369 | WTA Iasi, Romania Women Doubles | 0 |
| wta | 43367 | WTA Iasi, Romania Women Singles | 0 |
| wta | 4591 | WTA Indian Wells, USA Women Doubles | 0 |
| wta | 4589 | WTA Indian Wells, USA Women Singles | 0 |
| wta | 43119 | WTA Jiujiang, China Women Doubles | 0 |
| wta | 43117 | WTA Jiujiang, China Women Singles | 0 |
| wta | 3057 | WTA Linz, Austria Women Doubles | 0 |
| wta | 3055 | WTA Linz, Austria Women Singles | 0 |
| wta | 44325 | WTA London, Great Britain Women Doubles | 0 |
| wta | 44323 | WTA London, Great Britain Women Singles | 0 |
| wta | 4927 | WTA Madrid, Spain Women Doubles | 0 |
| wta | 4925 | WTA Madrid, Spain Women Singles | 0 |
| wta | 38685 | WTA Merida, Mexico Women Doubles | 0 |
| wta | 38683 | WTA Merida, Mexico Women Singles | 0 |
| wta | 4693 | WTA Miami, USA Women Doubles | 0 |
| wta | 4691 | WTA Miami, USA Women Singles | 0 |
| wta | 36847 | WTA Monastir, Tunisia Women Doubles | 0 |
| wta | 36849 | WTA Monastir, Tunisia Women Singles | 0 |
| wta | 2717 | WTA Monterrey, Mexico Women Doubles | 0 |
| wta | 2715 | WTA Monterrey, Mexico Women Singles | 0 |
| wta | 2979 | WTA Montreal, Canada Women Doubles | 0 |
| wta | 2977 | WTA Montreal, Canada Women Singles | 0 |
| wta | 13379 | WTA Nanchang, China Women Doubles | 0 |
| wta | 13377 | WTA Nanchang, China Women Singles | 0 |
| wta | 40067 | WTA Ningbo, China Women Doubles | 0 |
| wta | 40065 | WTA Ningbo, China Women Singles | 0 |
| wta | 12335 | WTA Nottingham, Great Britain Women Doubles | 0 |
| wta | 12333 | WTA Nottingham, Great Britain Women Singles | 0 |
| wta | 3063 | WTA Osaka, Japan Women Doubles | 0 |
| wta | 3061 | WTA Osaka, Japan Women Singles | 0 |
| wta | 2903 | WTA Palermo, Italy Women Doubles | 0 |
| wta | 2901 | WTA Palermo, Italy Women Singles | 0 |
| wta | 2909 | WTA Prague, Czech Republic Women Doubles | 0 |
| wta | 2907 | WTA Prague, Czech Republic Women Singles | 0 |
| wta | 13367 | WTA Rabat, Morocco Women Doubles | 0 |
| wta | 13365 | WTA Rabat, Morocco Women Singles | 0 |
| wta | 4777 | WTA Rome, Italy Women Doubles | 0 |
| wta | 4775 | WTA Rome, Italy Women Singles | 0 |
| wta | 41967 | WTA Rouen, France Women Doubles | 0 |
| wta | 41965 | WTA Rouen, France Women Singles | 0 |
| wta | 7627 | WTA S-Hertogenbosch, Netherlands Women Doubles | 0 |
| wta | 7625 | WTA S-Hertogenbosch, Netherlands Women Singles | 0 |
| wta | 46955 | WTA Sao Paulo, Brazil Women, Doubles | 0 |
| wta | 46953 | WTA Sao Paulo, Brazil Women, Singles | 0 |
| wta | 3045 | WTA Seoul, Korea Republic Women Doubles | 0 |
| wta | 3043 | WTA Seoul, Korea Republic Women Singles | 0 |
| wta | 44319 | WTA Singapore, Singapore Women Doubles | 0 |
| wta | 44317 | WTA Singapore, Singapore Women Singles | 0 |
| wta | 2825 | WTA Strasbourg, France Women Doubles | 0 |
| wta | 2823 | WTA Strasbourg, France Women Singles | 0 |
| wta | 4849 | WTA Stuttgart, Germany Women Doubles | 0 |
| wta | 4847 | WTA Stuttgart, Germany Women Singles | 0 |
| wta | 6505 | WTA Sydney, Australia Women Doubles | 0 |
| wta | 6503 | WTA Sydney, Australia Women Singles | 0 |
| wta | 5945 | WTA Tokyo, Japan Women Doubles | 0 |
| wta | 5943 | WTA Tokyo, Japan Women Singles | 0 |
| wta | 8281 | WTA Toronto, Canada Women Doubles | 0 |
| wta | 8279 | WTA Toronto, Canada Women Singles | 0 |
| wta | 8179 | WTA Washington, USA Women Doubles | 0 |
| wta | 8177 | WTA Washington, USA Women Singles | 0 |
| wta | 11119 | WTA Wuhan, China Women Doubles | 0 |
| wta | 11117 | WTA Wuhan, China Women Singles | 0 |
| wta | 28611 | WTA Zhengzhou, China Women Doubles | 0 |
| wta | 28609 | WTA Zhengzhou, China Women Singles | 0 |
| wta-125k | 41973 | WTA 125 Antalya, Turkiye Doubles | 0 |
| wta-125k | 41971 | WTA 125 Antalya, Turkiye Singles | 0 |
| wta-125k | 35026 | WTA 125 Buenos Aires, Argentina Women Doubles | 0 |
| wta-125k | 35028 | WTA 125 Buenos Aires, Argentina Women Singles | 0 |
| wta-125k | 35020 | WTA 125 Midland, USA Women Doubles | 0 |
| wta-125k | 35022 | WTA 125 Midland, USA Women Singles | 0 |
| wta-125k | 39409 | WTA 125 San Luis Potosi, Mexico Doubles | 0 |
| wta-125k | 39411 | WTA 125 San Luis Potosi, Mexico Singles | 0 |
| wta-125k | 38183 | WTA 125K Andorra, Andorra Women Doubles | 0 |
| wta-125k | 38181 | WTA 125K Andorra, Andorra Women Singles | 0 |
| wta-125k | 35328 | WTA 125K Angers, France Women Doubles | 0 |
| wta-125k | 35326 | WTA 125K Angers, France Women Singles | 0 |
| wta-125k | 45601 | WTA 125K Antalya 2, Turkiye Women Doubles | 0 |
| wta-125k | 45599 | WTA 125K Antalya 2, Turkiye Women Singles | 0 |
| wta-125k | 45797 | WTA 125K Antalya 3, Turkiye Women Doubles | 0 |
| wta-125k | 45795 | WTA 125K Antalya 3, Turkiye Women Singles | 0 |
| wta-125k | 47526 | WTA 125K Austin, USA Women Doubles | 0 |
| wta-125k | 47524 | WTA 125K Austin, USA Women Singles | 0 |
| wta-125k | 37553 | WTA 125K Bari, Italy Women Doubles | 0 |
| wta-125k | 37551 | WTA 125K Bari, Italy Women Singles | 0 |
| wta-125k | 40441 | WTA 125K Barranquilla, Colombia Women Doubles | 0 |
| wta-125k | 40439 | WTA 125K Barranquilla, Colombia Women Singles | 0 |
| wta-125k | 28229 | WTA 125K Bastad, Sweden Women Doubles | 0 |
| wta-125k | 28227 | WTA 125K Bastad, Sweden Women Singles | 0 |
| wta-125k | 46271 | WTA 125K Birmingham, Great Britain Women Doubles | 0 |
| wta-125k | 46269 | WTA 125K Birmingham, Great Britain Women Singles | 0 |
| wta-125k | 47055 | WTA 125K Caldas da Rainha, Portugal Women Doubles | 0 |
| wta-125k | 47053 | WTA 125K Caldas da Rainha, Portugal Women Singles | 0 |
| wta-125k | 9421 | WTA 125K Cali, Colombia Women Doubles | 0 |
| wta-125k | 9419 | WTA 125K Cali, Colombia Women Singles | 0 |
| wta-125k | 41646 | WTA 125K Canberra, Australia Women Doubles | 0 |
| wta-125k | 41644 | WTA 125K Canberra, Australia Women Singles | 0 |
| wta-125k | 45381 | WTA 125K Cancun, Mexico Women Doubles | 0 |
| wta-125k | 45383 | WTA 125K Cancun, Mexico Women Singles | 0 |
| wta-125k | 47496 | WTA 125K Changsha, China Women Doubles | 0 |
| wta-125k | 47494 | WTA 125K Changsha, China Women Singles | 0 |
| wta-125k | 45153 | WTA 125K Charleston 2, USA Women Doubles | 0 |
| wta-125k | 45151 | WTA 125K Charleston 2, USA Women Singles | 0 |
| wta-125k | 34204 | WTA 125K Charleston, USA Women Doubles | 0 |
| wta-125k | 34202 | WTA 125K Charleston, USA Women Singles | 0 |
| wta-125k | 37565 | WTA 125K Colina, Chile Women Doubles | 0 |
| wta-125k | 37563 | WTA 125K Colina, Chile Women Singles | 0 |
| wta-125k | 36399 | WTA 125K Contrexeville, France Women Doubles | 0 |
| wta-125k | 36401 | WTA 125K Contrexeville, France Women Singles | 0 |
| wta-125k | 47514 | WTA 125K Cosenza, Italy Women Doubles | 0 |
| wta-125k | 47512 | WTA 125K Cosenza, Italy Women Singles | 0 |
| wta-125k | 40721 | WTA 125K Florianapolis, Brazil Women Singles | 0 |
| wta-125k | 40723 | WTA 125K Florianopolis, Brazil Women Doubles | 0 |
| wta-125k | 36393 | WTA 125K Gaiba, Italy Women Doubles | 0 |
| wta-125k | 36395 | WTA 125K Gaiba, Italy Women Singles | 0 |
| wta-125k | 46365 | WTA 125K Grado, Italy Women Doubles | 0 |
| wta-125k | 46363 | WTA 125K Grado, Italy Women Singles | 0 |
| wta-125k | 27558 | WTA 125K Guadalajara, Mexico Women Doubles | 0 |
| wta-125k | 27556 | WTA 125K Guadalajara, Mexico Women Singles | 0 |
| wta-125k | 43377 | WTA 125K Hamburg, Germany Women Singles | 0 |
| wta-125k | 43379 | WTA 125K Hamburg, Germany, Doubles | 0 |
| wta-125k | 43113 | WTA 125k Hong Kong, China Women Doubles | 0 |
| wta-125k | 43111 | WTA 125k Hong Kong, China Women Singles | 0 |
| wta-125k | 47490 | WTA 125K Huzhou, China Women Doubles | 0 |
| wta-125k | 47488 | WTA 125K Huzhou, China Women Singles | 0 |
| wta-125k | 46277 | WTA 125K Ilkley, Great Britain Women Doubles | 0 |
| wta-125k | 46275 | WTA 125K Ilkley, Great Britain Women Singles | 0 |
| wta-125k | 47520 | WTA 125K Jinan, China Wpmen Doubles | 0 |
| wta-125k | 47518 | WTA 125K Jinan, China Wpmen Singles | 0 |
| wta-125k | 47502 | WTA 125K Jingshan, China Women Doubles | 0 |
| wta-125k | 47500 | WTA 125K Jingshan, China Women Singles | 0 |
| wta-125k | 39437 | WTA 125k La Bisbal D Emporda, Spain Women Doubles | 0 |
| wta-125k | 39435 | WTA 125k La Bisbal D Emporda, Spain Women Singles | 0 |
| wta-125k | 12065 | WTA 125K Limoges, France Women Doubles | 7 |
| wta-125k | 12063 | WTA 125K Limoges, France Women Singles | 31 |
| wta-125k | 40661 | WTA 125k Ljubljana, Slovenia Women Doubles | 0 |
| wta-125k | 40659 | WTA 125k Ljubljana, Slovenia Women Singles | 0 |
| wta-125k | 42169 | WTA 125K Lleida, Spain Women Doubles | 0 |
| wta-125k | 42171 | WTA 125K Lleida, Spain Women Singles | 0 |
| wta-125k | 36617 | WTA 125K Makarska, Croatia Women Doubles | 0 |
| wta-125k | 36615 | WTA 125K Makarska, Croatia Women Singles | 0 |
| wta-125k | 46283 | WTA 125K Mallorca, Spain Women Doubles | 0 |
| wta-125k | 46281 | WTA 125K Mallorca, Spain Women Singles | 0 |
| wta-125k | 43669 | WTA 125K Mazatlan, Mexico Women Doubles | 0 |
| wta-125k | 43671 | WTA 125K Mazatlan, Mexico Women Singles | 0 |
| wta-125k | 35256 | WTA 125K Montevideo, Uruguay Women Doubles | 0 |
| wta-125k | 35254 | WTA 125K Montevideo, Uruguay Women Singles | 0 |
| wta-125k | 43107 | WTA 125K Montreux, Switzerland Women Doubles | 0 |
| wta-125k | 43105 | WTA 125K Montreux, Switzerland Women Singles | 0 |
| wta-125k | 21210 | WTA 125K Mumbai, India Women Doubles | 0 |
| wta-125k | 21208 | WTA 125K Mumbai, India Women Singles | 0 |
| wta-125k | 46617 | WTA 125K Newport, USA Women Doubles | 0 |
| wta-125k | 46619 | WTA 125K Newport, USA Women Singles | 0 |
| wta-125k | 42157 | WTA 125K Oeiras, Portugal Women Doubles | 0 |
| wta-125k | 42159 | WTA 125K Oeiras, Portugal Women Singles | 0 |
| wta-125k | 46389 | WTA 125K Olbia, Italy Women Doubles | 0 |
| wta-125k | 46387 | WTA 125K Olbia, Italy Women Singles | 0 |
| wta-125k | 48168 | WTA 125K Osijek, Croatia Women Doubles | 0 |
| wta-125k | 48166 | WTA 125K Osijek, Croatia Women Singles | 0 |
| wta-125k | 46377 | WTA 125K Palermo, Italy Women Doubles | 0 |
| wta-125k | 46375 | WTA 125K Palermo, Italy Women Singles | 0 |
| wta-125k | 36355 | WTA 125K Paris, France Women Doubles | 0 |
| wta-125k | 42175 | WTA 125K Paris, France Women Doubles | 0 |
| wta-125k | 36353 | WTA 125K Paris, France Women Singles | 0 |
| wta-125k | 42177 | WTA 125K Paris, France Women Singles | 0 |
| wta-125k | 37559 | WTA 125K Parma, Italy Women Doubles | 0 |
| wta-125k | 37557 | WTA 125K Parma, Italy Women Singles | 0 |
| wta-125k | 46961 | WTA 125K Porto, Portugal Women Doubles | 0 |
| wta-125k | 46959 | WTA 125K Porto, Portugal Women Singles | 0 |
| wta-125k | 36541 | WTA 125K Puerto Vallarta, Mexico Women Doubles | 0 |
| wta-125k | 36543 | WTA 125K Puerto Vallarta, Mexico Women Singles | 0 |
| wta-125k | 48156 | WTA 125K Queretaro, Mexico Women Doubles | 0 |
| wta-125k | 48154 | WTA 125K Queretaro, Mexico Women Singles | 0 |
| wta-125k | 48283 | WTA 125k Quito, Ecuador Women Doubles | 0 |
| wta-125k | 48281 | WTA 125k Quito, Ecuador Women Singles | 0 |
| wta-125k | 48277 | WTA 125K Rio de Janeiro, Brazil Women Doubles | 0 |
| wta-125k | 48275 | WTA 125K Rio de Janeiro, Brazil Women Singles | 0 |
| wta-125k | 46371 | WTA 125K Rome, Italy Women Doubles | 0 |
| wta-125k | 46369 | WTA 125K Rome, Italy Women Singles | 0 |
| wta-125k | 36547 | WTA 125K Rouen, France Women Doubles | 0 |
| wta-125k | 36549 | WTA 125K Rouen, France Women Singles | 0 |
| wta-125k | 47111 | WTA 125K Rovereto, Italy Women Doubles | 0 |
| wta-125k | 47113 | WTA 125K Rovereto, Italy Women Singles | 0 |
| wta-125k | 34078 | WTA 125K Saint-Malo, France, Women Doubles | 0 |
| wta-125k | 34076 | WTA 125K Saint-Malo, France, Women Singles | 0 |
| wta-125k | 48271 | WTA 125K Samsun, Turkiye Women Doubles | 0 |
| wta-125k | 48269 | WTA 125K Samsun, Turkiye Women Singles | 0 |
| wta-125k | 47047 | WTA 125K San Sebastian, Spain Women Doubles | 0 |
| wta-125k | 47045 | WTA 125K San Sebastian, Spain Women Singles | 0 |
| wta-125k | 43691 | WTA 125K Santa Cruz, Bolivia Women Doubles | 0 |
| wta-125k | 43693 | WTA 125K Santa Cruz, Bolivia Women Singles | 0 |
| wta-125k | 43685 | WTA 125K Sao Paulo, Brazil Women Doubles | 0 |
| wta-125k | 43687 | WTA 125K Sao Paulo, Brazil Women Singles | 0 |
| wta-125k | 47508 | WTA 125K Suzhou, China Women Doubles | 0 |
| wta-125k | 47506 | WTA 125K Suzhou, China Women Singles | 0 |
| wta-125k | 36489 | WTA 125K Tampico, Mexico Women Doubles | 0 |
| wta-125k | 36491 | WTA 125K Tampico, Mexico Women Singles | 0 |
| wta-125k | 46383 | WTA 125K Tolentino, Italy Women Doubles | 0 |
| wta-125k | 46381 | WTA 125K Tolentino, Italy Women Singles | 0 |
| wta-125k | 48709 | WTA 125K Tucuman, Argentina Women Doubles | 0 |
| wta-125k | 48707 | WTA 125K Tucuman, Argentina Women Singles | 0 |
| wta-125k | 36387 | WTA 125K Valencia, Spain Women Doubles | 0 |
| wta-125k | 36389 | WTA 125K Valencia, Spain Women Singles | 0 |
| wta-125k | 45829 | WTA 125K Vic, Spain Women Doubles | 0 |
| wta-125k | 45823 | WTA 125K Vic, Spain Women Singles | 0 |
| wta-125k | 31927 | WTA 125K Warsaw, Poland Women Doubles | 0 |
| wta-125k | 31925 | WTA 125K Warsaw, Poland Women Singles | 0 |
| wta-125k | 11807 | WTA Bucharest, Romania Women Doubles | 0 |
| wta-125k | 11805 | WTA Bucharest, Romania Women Singles | 0 |
