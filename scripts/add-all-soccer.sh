#!/bin/bash
# Ajouter TOUS les championnats de football dans la base de données

set -e

echo "=========================================="
echo "⚽ TOUS les Championnats de Football"
echo "=========================================="
echo ""

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
  echo "❌ Erreur: .env.local non trouvé"
  exit 1
fi

echo "📁 Chargement des variables d'environnement..."
export $(cat .env.local | grep -v '^#' | xargs)
echo ""

npx tsx scripts/add-all-soccer-leagues.ts

echo ""
echo "=========================================="
echo "✅ Terminé"
echo "=========================================="
