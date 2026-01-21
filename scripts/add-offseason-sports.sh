#!/bin/bash
# Ajouter les championnats hors saison dans la base de données

set -e

echo "=========================================="
echo "🏆 Ajout des Championnats Hors Saison"
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

npx tsx scripts/add-offseason-sports.ts

echo ""
echo "=========================================="
echo "✅ Terminé"
echo "=========================================="
