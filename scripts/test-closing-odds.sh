#!/bin/bash
# Test manual de la sync des scores et cotes de clôture (GitHub Action: sync-scores-closing.yml)

set -e

echo "=========================================="
echo "🔍 TEST: Sync Scores & Closing Odds"
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
if [ -z "$ODDS_API_KEY" ]; then
  echo "❌ Erreur: ODDS_API_KEY non définie dans .env.local"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Erreur: NEXT_PUBLIC_SUPABASE_URL non définie dans .env.local"
  exit 1
fi

echo "✅ Variables d'environnement chargées"
echo ""

# Exécuter la synchronisation
echo "🚀 Démarrage de la sync scores & closing odds..."
echo ""

npx tsx scripts/run-closing-odds.ts

echo ""
echo "=========================================="
echo "✅ Test terminé"
echo "=========================================="
