# 🧪 Plan de Test Complet - Vérification du Système

## Étape 1️⃣ : Synchroniser les Sports et Événements

```bash
./scripts/test-sync-events.sh
```

**✅ Ce que ça fait :**
- Découvre les matchs à venir pour les ligues sélectionnées
- Crée les événements dans la base de données
- Initialise les market_states en statut "pending"

**📊 Résultat attendu :**
```
✅ Synced X events (Y nouveaux)
```

---

## Étape 2️⃣ : Capturer les Cotes d'Ouverture

```bash
./scripts/test-opening-odds.sh
```

**✅ Ce que ça fait :**
- Capture les cotes d'ouverture pour tous les marchés en attente
- Stocke TOUTES les variations de points (spreads -0.5, -1.0, -1.5, etc.)
- Met à jour opening_odds_variations avec toutes les variations

**📊 Résultat attendu :**
```
✅ Marchés capturés: X
✅ Crédits utilisés: ~6 par événement
```

---

## Étape 3️⃣ : Vérifier les Données en Base

```bash
./scripts/check-events.sh
```

**✅ Ce que ça fait :**
- Compte le nombre total d'événements
- Affiche le statut des market_states (pending/captured/not_offered)
- Montre des exemples d'événements avec cotes capturées
- Liste les prochains événements à venir

**📊 Résultat attendu :**
```
✅ Total événements: X
📋 Market States:
  - Pending: X
  - Captured: X
  - Not Offered: X

🎯 Exemples d'événements avec cotes capturées
```

---

## Étape 4️⃣ : Vérifier l'Interface Utilisateur

**URL :** `http://localhost:3000/football`

**✅ Ce que vous devez voir :**

1. **Liste des matchs** avec colonnes dynamiques pour chaque variation de point
2. **Cellules colorées** :
   - 🟢 Vert = Pari gagnant
   - 🔴 Rouge = Pari perdant
   - 🟡 Jaune = Push (remboursé)
3. **Colonnes par marché** :
   - Chaque variation de point a ses propres colonnes (Ouverture + Clôture)
   - Exemple : "Spreads (-0.5)", "Spreads (-1.0)", etc.

4. **Filtres disponibles** :
   - Par période (date range)
   - Par équipe (recherche)
   - Par marché
   - Par résultat (Home/Away/Draw/Over/Under)
   - Recherche avancée (fourchette de cotes, valeur du point)

5. **Sélecteur de colonnes** :
   - Bouton "Colonnes (X/Y)" pour afficher/masquer les marchés
   - Persistance dans localStorage

---

## Étape 5️⃣ : Synchroniser les Cotes en Continu

```bash
./scripts/test-sync-odds.sh
```

**✅ Ce que ça fait :**
- Met à jour les cotes toutes les 5 minutes (en production)
- Synchronise en parallèle pour toutes les ligues actives

**⚠️ Note :** Ce script utilise oddsapi.io (ODDS_API_IO_KEY)

---

## Étape 6️⃣ : Capturer les Scores et Cotes de Clôture

**⏰ À exécuter après les matchs :**

```bash
./scripts/test-closing-odds.sh
```

**✅ Ce que ça fait :**
- Récupère les scores finaux des matchs terminés
- Capture les cotes de clôture (dernières cotes avant le match)
- Calcule automatiquement les résultats des paris (win/loss/push)
- Affiche les cellules colorées dans l'interface

---

## 🔄 Ordre d'Exécution Recommandé

### Pour la Première Fois (Setup Initial)

1. ✅ Sélectionner les ligues dans Settings
2. ✅ Lancer `./scripts/test-sync-events.sh`
3. ✅ Lancer `./scripts/test-opening-odds.sh`
4. ✅ Vérifier avec `./scripts/check-events.sh`
5. ✅ Ouvrir `http://localhost:3000/football`

### En Production (GitHub Actions)

Les GitHub Actions s'exécutent automatiquement :
- **Découverte** : Toutes les 6 heures
- **Cotes d'ouverture** : Toutes les 10 minutes
- **Mise à jour cotes** : Toutes les 5 minutes
- **Scores + Clôture** : 2 fois par jour (2h et 14h UTC)

---

## 🐛 Dépannage

### Aucun événement trouvé
```bash
# Vérifier les ligues sélectionnées
./scripts/check-db-sports.ts
# Relancer la découverte
./scripts/test-sync-events.sh
```

### Pas de cotes capturées
```bash
# Vérifier les market_states en pending
./scripts/check-events.sh
# Relancer le scan
./scripts/test-opening-odds.sh
```

### Interface vide
```bash
# Hard refresh du navigateur
Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
# Vider localStorage
localStorage.clear()
```

---

## 📊 Commandes Utiles

### Tout tester d'un coup
```bash
./scripts/test-all.sh
```

### Voir les logs en direct
```bash
# Suivre les logs Next.js
npm run dev

# Voir les requêtes API dans la console navigateur
F12 > Network tab
```

### Vérifier les crédits API restants
Les scripts affichent automatiquement :
```
✅ Crédits utilisés: X
✅ Crédits restants: Y
```

---

## ✅ Résultat Final Attendu

Après avoir exécuté toutes les étapes, vous devriez avoir :

1. ✅ **70 championnats** disponibles dans Settings
2. ✅ **Des événements** en base de données pour vos ligues sélectionnées
3. ✅ **Des cotes d'ouverture** capturées avec toutes les variations
4. ✅ **Une interface** affichant les matchs avec colonnes dynamiques
5. ✅ **Des filtres** fonctionnels pour explorer les données
6. ✅ **Des couleurs** (après capture des scores) indiquant win/loss/push

🎉 Votre système de tracking de cotes est opérationnel !
