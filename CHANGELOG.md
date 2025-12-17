# Changelog

## [2.0.0] - 2025-12-17

### Migration Localhost + GitHub Actions

**Architecture refondée**
- Migration complète vers localhost (plus de déploiement Vercel requis)
- Automatisation via GitHub Actions (timeout de 6 heures vs 60 secondes)
- Indépendance totale de la machine locale pour la synchronisation

**Optimisations majeures**
- Implémentation du batching API (10 événements par requête)
- Batch database operations (réduction de 2900 → 3 requêtes par match)
- Déduplication automatique des cotes
- Support de ligues multiples sans limite de timeout

**Fonctionnalités**
- Synchronisation automatique toutes les 10 minutes via GitHub Actions
- Gestion dynamique des ligues trackées via UI
- Système de filtres avancés (pays, ligue, équipe, plage de cotes)
- Visibilité des colonnes personnalisable
- Export CSV/XLSX respectant les filtres actifs

## [1.0.0] - 2025-12-08

### Version initiale

**Fonctionnalités principales**
- Interface de visualisation des matchs et cotes
- Suivi de 4 sports (Football, Hockey, Tennis, Volleyball)
- Intégration Supabase (PostgreSQL)
- Intégration Odds-API.io (source Pinnacle)
- Tableaux interactifs avec TanStack Table
- Export des données en CSV/XLSX

**Architecture V3**
- Schéma de base de données optimisé
- API routes Next.js 14
- Composants React modulaires
- Configuration dynamique des marchés

**Sécurité**
- Remplacement de xlsx par exceljs (correction de 2 vulnérabilités)
- Authentification par session cookie HTTP-only
- Protection des routes API et pages dashboard
