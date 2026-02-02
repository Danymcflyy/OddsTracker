# Rapport d'Incident Technique : Blocage de la file d'attente Cron "Scan Opening Odds"

## 1. Contexte du Projet
- **Stack :** Next.js (App Router), Supabase (PostgreSQL), Vercel (Hébergement & Fonctions Serverless).
- **Architecture :**
  - Base de données vidée récemment (Reset complet).
  - Un Cron Job (`/api/cron/scan-opening`) tourne toutes les **2 à 5 minutes** pour récupérer les cotes d'ouverture.
  - Le Cron est déclenché par **Supabase pg_cron** (via `net.http_post` vers Vercel).
  - La logique de scan est :
    1. Récupérer les événements avec marchés `pending` (`getEventsWithPendingMarkets`).
    2. Trier par nombre de tentatives (`attempts` ascendant) pour un traitement Round-Robin.
    3. Interroger l'API (The Odds API).
    4. Mettre à jour la base : soit `status='captured'`, soit incrémenter `attempts`.

## 2. Le Symptôme Critique
La file d'attente des matchs à scanner **stagne** indéfiniment à **443 événements**, sans jamais diminuer ni avancer.

### Observations Factuelles :
1.  **Statut DB figé :** Tous les matchs en attente (ex: *Dortmund vs Mainz*, *Bayern vs Hoffenheim*) restent bloqués avec :
    *   `status: 'pending'`
    *   `attempts: 0` (Jamais incrémenté).
    *   `last_attempt_at: null`.
2.  **Logs Vercel trompeurs :**
    *   Les logs affichent "Success" pour les appels API.
    *   Les logs défilent (le script semble tourner).
    *   **MAIS** aucune erreur d'écriture explicite n'apparaît (avant l'ajout récent de logs d'erreur).
3.  **Comparaison Local vs Vercel :**
    *   Un scan lancé en **LOCAL** (via `npx tsx scripts/run-opening-odds.ts`) fonctionne parfaitement : il met à jour la base, capture les cotes, et incrémente les tentatives.
    *   Le scan lancé par **VERCEL** (Cron) tourne dans le vide.

## 3. Diagnostic : Échec Silencieux des Écritures DB
Tout indique que **l'instance Vercel n'arrive pas à écrire dans la base de données Supabase** (Update/Upsert), bien qu'elle arrive à lire (puisqu'elle trouve les 443 matchs).

### Hypothèses Techniques Principales :

#### A. Variable d'Environnement Manquante (`SUPABASE_SERVICE_ROLE_KEY`)
C'est la cause n°1 suspectée.
- Le client `supabaseAdmin` est utilisé pour les écritures (pour contourner la RLS).
- Si `SUPABASE_SERVICE_ROLE_KEY` est manquante ou vide sur Vercel :
  - Le client s'initialise (pas de crash immédiat).
  - Les requêtes `select()` (lecture) peuvent fonctionner si elles basculent sur le client public (ou si la table est publique).
  - Les requêtes `update()` (écriture) **échouent silencieusement** ou renvoient une erreur 401 que le code ne loggait pas auparavant.

#### B. Problème de Timeout / Concurrence
- Le script Vercel coupe au bout de 5 minutes (Timeout).
- Si les écritures (`await update(...)`) sont trop lentes ou bloquées par un lock, le script meurt avant d'avoir commité quoi que ce soit.
- *Contre-argument :* Même les premiers matchs traités (dans les premières secondes) ne sont pas mis à jour. Donc ce n'est pas (que) un problème de timeout final.

#### C. Problème de Cache Vercel
- Est-ce que Vercel met en cache la réponse de la base de données ? Peu probable sur des requêtes POST/Update.

## 4. Actions Déjà Tentées & Résultats
1.  **Suppression de la limite de scan (500 events) :** Fait. Le script essaie de tout traiter. Résultat : Toujours bloqué.
2.  **Ajout de la stratégie Round Robin (Tri par attempts) :** Fait. Résultat : Inefficace car `attempts` reste bloqué à 0 pour tout le monde.
3.  **Ajout de logs d'erreurs explicites :** Ajouté dans le dernier commit (`5074d7e`). On attend de voir si des erreurs rouges apparaissent dans les logs Vercel (`❌ Failed to update...`).
4.  **Check critique au démarrage :** Ajouté un check qui throw une erreur si `SUPABASE_SERVICE_ROLE_KEY` est absent (`4bb9bff`).

## 5. Pistes de Résolution pour Claude

**Objectif :** Débloquer l'écriture en base depuis Vercel.

**Questions à explorer :**
1.  Vérifier si `SUPABASE_SERVICE_ROLE_KEY` est bien définie dans **Vercel > Settings > Environment Variables**. (Souvent, elle est dans `.env.local` mais oubliée sur la prod).
2.  Vérifier si le client `supabaseAdmin` est correctement instancié dans l'environnement Edge/Serverless de Next.js.
3.  Analyser les logs du dernier déploiement pour voir si le message `❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing` est apparu.
4.  Si la clé est présente, vérifier les **Policies RLS** de la table `market_states`. Est-ce que le Service Role est bien autorisé à faire des UPDATE ? (Normalement oui, c'est le bypass par défaut).

---
*Ce rapport a été généré automatiquement pour faciliter le debugging.*
