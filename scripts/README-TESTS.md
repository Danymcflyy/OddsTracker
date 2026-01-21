# Scripts de Test pour GitHub Actions

Ce dossier contient des scripts de test permettant d'exécuter manuellement les GitHub Actions depuis votre terminal local.

## Prérequis

1. **Fichier `.env.local`** à la racine du projet avec les variables suivantes :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
   ODDS_API_KEY=votre_cle_theodds_api
   ODDS_API_IO_KEY=votre_cle_oddsapi_io
   ```

2. **Node.js 20+** installé
3. **Dépendances npm** installées : `npm install`

## Scripts Disponibles

### 🔍 Test Individuel par Action

#### 1. Test Sync Events (Découverte)
Teste la synchronisation des sports et événements depuis The Odds API.

```bash
./scripts/test-sync-events.sh
```

**Correspond à** : `.github/workflows/sync-events.yml`
**Coût API** : ~0 crédits (endpoints gratuits)
**Durée estimée** : 10-30 secondes

---

#### 2. Test Scan Opening Odds
Teste le scan des cotes d'ouverture pour les événements à venir.

```bash
./scripts/test-opening-odds.sh
```

**Correspond à** : `.github/workflows/scan-opening-odds.yml`
**Coût API** : ~6 crédits par événement avec marchés en attente
**Durée estimée** : 1-5 minutes

---

#### 3. Test Sync Odds V2 Parallel
Teste la synchronisation parallèle des cotes pour toutes les ligues actives.

```bash
./scripts/test-sync-odds.sh
```

**Correspond à** : `.github/workflows/sync-odds-direct-v2-parallel.yml`
**Coût API** : Variable selon le nombre de ligues
**Durée estimée** : 2-10 minutes

---

#### 4. Test Sync Scores & Closing Odds
Teste la synchronisation des scores et capture des cotes de clôture.

```bash
./scripts/test-closing-odds.sh
```

**Correspond à** : `.github/workflows/sync-scores-closing.yml`
**Coût API** : ~2 crédits pour scores + ~6 crédits par événement terminé
**Durée estimée** : 1-5 minutes

---

### 🧪 Test Complet (Tous les scripts)

Exécute tous les tests dans l'ordre optimal :

```bash
./scripts/test-all.sh
```

**Ordre d'exécution** :
1. Sync Events (découverte des événements)
2. Scan Opening Odds (capture des cotes d'ouverture)
3. Sync Odds V2 Parallel (mise à jour des cotes)
4. Sync Scores & Closing Odds (scores + cotes de clôture)

**Durée totale estimée** : 5-20 minutes
**Coût API total** : Variable selon le nombre d'événements

---

## Gestion des Erreurs

Tous les scripts :
- ✅ Vérifient la présence de `.env.local`
- ✅ Valident les variables d'environnement requises
- ✅ Affichent des messages d'erreur détaillés
- ✅ Retournent des codes de sortie appropriés (0 = succès, 1 = erreur)

## Exemples de Sortie

### Succès
```
==========================================
🔍 TEST: Scan Opening Odds
==========================================

📁 Chargement des variables d'environnement depuis .env.local
✅ Variables d'environnement chargées

🚀 Démarrage du scan des cotes d'ouverture...

📊 Résultats du Scan:
  - Événements scannés: 15
  - Marchés vérifiés: 45
  - Marchés capturés: 42
  - Crédits utilisés: 90
  - Erreurs: 0

✅ Scan terminé avec succès

==========================================
✅ Test terminé
==========================================
```

### Erreur
```
❌ Erreur: .env.local non trouvé
   Créez ce fichier avec vos variables d'environnement
```

## Utilisation en CI/CD

Ces scripts sont conçus pour :
- ✅ Tests locaux avant de pousser du code
- ✅ Validation des modifications sur les services
- ✅ Débogage des problèmes de GitHub Actions
- ✅ Vérification manuelle de l'intégrité des données

## Notes Importantes

1. **Crédits API** : Les tests consomment de vrais crédits API. Utilisez-les avec parcimonie.
2. **Base de données** : Les tests modifient la vraie base de données (selon votre `.env.local`).
3. **Durée** : Certains tests peuvent prendre plusieurs minutes selon le volume de données.
4. **Variables d'environnement** : Assurez-vous que votre `.env.local` pointe vers le bon environnement (dev/prod).

## Dépannage

### "Permission denied"
```bash
chmod +x scripts/test-*.sh
```

### "Module not found"
Assurez-vous que les dépendances sont installées :
```bash
npm install
```

### "ODDS_API_KEY non définie"
Vérifiez que votre `.env.local` contient toutes les clés API requises.

---

**Dernière mise à jour** : 2026-01-20
**Correspond aux GitHub Actions** : v4 (The Odds API)
