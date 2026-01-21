import { SOCCER_MARKETS, MARKET_NAMES, MARKET_GROUPS } from '../lib/api/theoddsapi/constants';

console.log('\n🎯 TEST: Vérification de l\'Affichage des Marchés\n');

console.log('=' .repeat(80));
console.log('GROUPES DE MARCHÉS DISPONIBLES');
console.log('='.repeat(80) + '\n');

Object.entries(MARKET_GROUPS).forEach(([groupKey, group]) => {
  console.log(`\n📊 ${group.name}`);
  console.log(`   Coût: ${group.cost}`);

  if ('availability' in group && group.availability) {
    console.log(`   ⚠️  Disponibilité: ${group.availability}`);
  }

  console.log(`   Marchés (${group.markets.length}):`);
  group.markets.forEach((marketKey) => {
    console.log(`      • ${marketKey} - "${MARKET_NAMES[marketKey as keyof typeof MARKET_NAMES]}"`);
  });
});

console.log('\n\n' + '='.repeat(80));
console.log('STATISTIQUES');
console.log('='.repeat(80) + '\n');

const totalMarkets = Object.keys(SOCCER_MARKETS).length;
const groupedMarkets = Object.values(MARKET_GROUPS).reduce((sum, group) => sum + group.markets.length, 0);

console.log(`✅ Total marchés définis: ${totalMarkets}`);
console.log(`✅ Total marchés groupés: ${groupedMarkets}`);
console.log(`✅ Nombre de groupes: ${Object.keys(MARKET_GROUPS).length}`);

console.log('\n\n' + '='.repeat(80));
console.log('COÛT ESTIMÉ PAR ÉVÉNEMENT (SELON SÉLECTION)');
console.log('='.repeat(80) + '\n');

const scenarios = [
  {
    name: 'MVP (Actuel)',
    markets: ['h2h', 'spreads', 'totals', 'h2h_h1', 'spreads_h1', 'totals_h1'],
  },
  {
    name: 'Essentiels',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  {
    name: 'Complet (sans alternates)',
    markets: ['h2h', 'spreads', 'totals', 'btts', 'draw_no_bet', 'team_totals', 'h2h_h1', 'spreads_h1', 'totals_h1'],
  },
  {
    name: 'Maximum (tous)',
    markets: Object.values(SOCCER_MARKETS).filter(m =>
      !m.includes('player_') &&
      !m.includes('alternate_')
    ),
  },
];

scenarios.forEach(scenario => {
  // Note: spreads et totals sont convertis en alternate dans le code
  const alternateCount = scenario.markets.filter(m => m === 'spreads' || m === 'totals' || m.includes('_h1')).length;
  const regularCount = scenario.markets.length - alternateCount;

  const cost = (alternateCount * 3) + regularCount;

  console.log(`${scenario.name}:`);
  console.log(`  Marchés: ${scenario.markets.length}`);
  console.log(`  Coût par événement: ~${cost} crédits`);
  console.log(`  Coût pour 100 événements: ~${cost * 100} crédits\n`);
});

console.log('✅ Test terminé - Interface prête à être utilisée\n');
console.log('🌐 Accédez à: http://localhost:3000/settings/data-collection');
