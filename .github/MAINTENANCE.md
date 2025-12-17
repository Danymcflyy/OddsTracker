# Guide de Maintenance

## Démarrage rapide

```bash
# Démarrer l'application
npm run dev

# Ou utiliser le script simplifié
./start.sh
```

## Scripts utiles

### Test de synchronisation manuelle
```bash
npx tsx scripts/test-batched-odds.ts
```

### Vérifier GitHub Actions
https://github.com/Danymcflyy/OddsTracker/actions

## Ajouter une ligue

1. Aller sur http://localhost:3000/settings/leagues
2. Activer la ligue souhaitée (toggle "Tracked")
3. GitHub Actions synchronisera automatiquement les nouveaux matchs

## Troubleshooting

### L'application ne démarre pas
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Les données ne se mettent pas à jour
1. Vérifier que GitHub Actions fonctionne: https://github.com/Danymcflyy/OddsTracker/actions
2. Vérifier les secrets GitHub: https://github.com/Danymcflyy/OddsTracker/settings/secrets/actions
3. Rafraîchir la page (Cmd+R ou Ctrl+R)

### Erreur de base de données
Vérifier que votre `.env.local` contient bien toutes les variables requises:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ODDS_API_IO_KEY

## Structure simplifiée

```
OddsTracker/
├── app/                     # Pages et routes API
├── components/              # Composants React
├── lib/                     # Logique métier
│   ├── api/v3/             # Services de sync
│   └── db/migrations/v3/   # Migrations SQL
├── scripts/                 # Scripts utiles
│   ├── github-actions-sync.ts  # Script principal (GitHub Actions)
│   └── test-batched-odds.ts    # Test manuel
├── .env.local              # Variables d'environnement (ne pas commiter!)
├── start.sh                # Script de démarrage
└── README.md               # Documentation principale
```

## Monitoring

### GitHub Actions
- Fréquence: Toutes les 10 minutes
- Timeout: 6 heures maximum
- Logs: https://github.com/Danymcflyy/OddsTracker/actions

### Supabase
- Dashboard: https://supabase.com/dashboard
- Tables principales: matches, odds, leagues, markets

## Mise à jour

```bash
git pull origin main
npm install
npm run dev
```

## Performance

L'application est optimisée pour:
- Premier League: ~30-40 secondes de sync
- 5 ligues simultanées: ~4 minutes de sync
- Pas de limite de timeout (6 heures disponibles)

## Support

Pour toute question, consulter:
- README.md (aperçu général)
- LOCALHOST_SETUP.md (guide détaillé)
- DIRECT_SYNC_SETUP.md (configuration GitHub Actions)
