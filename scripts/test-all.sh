#!/bin/bash
# Script maître pour tester toutes les GitHub Actions manuellement

set -e

echo "=========================================="
echo "🧪 TEST COMPLET - Toutes les GitHub Actions"
echo "=========================================="
echo ""

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
  echo "❌ Erreur: .env.local non trouvé"
  echo "   Créez ce fichier avec vos variables d'environnement"
  exit 1
fi

# Compteurs
TOTAL_TESTS=4
PASSED_TESTS=0
FAILED_TESTS=0

# Test 1: Sync Events (Discovery)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1/$TOTAL_TESTS: Sync Sports & Events"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash scripts/test-sync-events.sh; then
  echo "✅ Test 1 réussi"
  ((PASSED_TESTS++))
else
  echo "❌ Test 1 échoué"
  ((FAILED_TESTS++))
fi

# Test 2: Scan Opening Odds
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2/$TOTAL_TESTS: Scan Opening Odds"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash scripts/test-opening-odds.sh; then
  echo "✅ Test 2 réussi"
  ((PASSED_TESTS++))
else
  echo "❌ Test 2 échoué"
  ((FAILED_TESTS++))
fi

# Test 3: Sync Odds V2 Parallel
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3/$TOTAL_TESTS: Sync Odds V2 Parallel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash scripts/test-sync-odds.sh; then
  echo "✅ Test 3 réussi"
  ((PASSED_TESTS++))
else
  echo "❌ Test 3 échoué"
  ((FAILED_TESTS++))
fi

# Test 4: Sync Scores & Closing Odds
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4/$TOTAL_TESTS: Sync Scores & Closing Odds"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if bash scripts/test-closing-odds.sh; then
  echo "✅ Test 4 réussi"
  ((PASSED_TESTS++))
else
  echo "❌ Test 4 échoué"
  ((FAILED_TESTS++))
fi

# Résumé final
echo ""
echo "=========================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=========================================="
echo "Tests réussis: $PASSED_TESTS/$TOTAL_TESTS"
echo "Tests échoués: $FAILED_TESTS/$TOTAL_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo "✅ Tous les tests ont réussi!"
  echo "=========================================="
  exit 0
else
  echo "❌ $FAILED_TESTS test(s) ont échoué"
  echo "=========================================="
  exit 1
fi
