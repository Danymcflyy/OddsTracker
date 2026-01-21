#!/bin/bash
# Test manual de la sync parallèle des cotes (GitHub Action: sync-odds-direct-v2-parallel.yml)

set -e

echo "=========================================="
echo "🔍 TEST: Sync Odds V2 Parallel"
echo "=========================================="
echo ""

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
  echo "❌ Erreur: .env.local non trouvé"
  echo "   Créez ce fichier avec vos variables d'environnement"
  exit 1
fi

echo "📁 Chargement des variables d'environnement depuis .env.local"
export $(cat .env.local | grep -v '^#' | xargs)
echo ""

# Vérifier les variables requises
if [ -z "$ODDS_API_IO_KEY" ]; then
  echo "❌ Erreur: ODDS_API_IO_KEY non définie dans .env.local"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Erreur: NEXT_PUBLIC_SUPABASE_URL non définie dans .env.local"
  exit 1
fi

echo "✅ Variables d'environnement chargées"
echo ""

# Vérifier que le script existe
if [ ! -f scripts/github-actions-sync-v2-parallel.ts ]; then
  echo "❌ Erreur: scripts/github-actions-sync-v2-parallel.ts non trouvé"
  exit 1
fi

# Exécuter le script
echo "🚀 Démarrage de la sync parallèle des cotes..."
echo ""

npx tsx scripts/github-actions-sync-v2-parallel.ts

EXITCODE=$?

echo ""
if [ $EXITCODE -eq 0 ]; then
  echo "=========================================="
  echo "✅ Test terminé avec succès"
  echo "=========================================="
else
  echo "=========================================="
  echo "❌ Test terminé avec des erreurs (code $EXITCODE)"
  echo "=========================================="
  exit $EXITCODE
fi
