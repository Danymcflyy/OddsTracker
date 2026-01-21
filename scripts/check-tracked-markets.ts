import { getSetting } from '../lib/db/helpers';

async function main() {
  const trackedMarkets = await getSetting('tracked_markets') || [];

  console.log('\n📊 MARCHÉS ACTUELLEMENT SUIVIS:\n');
  (trackedMarkets as string[]).forEach((m: string) => console.log(`  - ${m}`));

  console.log('\n\n📋 MARCHÉS DISPONIBLES VIA THE ODDS API:\n');

  const availableMarkets = [
    // Standard markets
    { key: 'h2h', desc: 'Head to Head (1X2)' },
    { key: 'spreads', desc: 'Point Spread / Handicap' },
    { key: 'totals', desc: 'Over/Under Goals' },

    // Alternate markets (multiple variations)
    { key: 'alternate_spreads', desc: 'Handicap avec multiples variations' },
    { key: 'alternate_totals', desc: 'Over/Under avec multiples variations' },

    // Half time markets
    { key: 'h2h_h1', desc: '1ère Mi-Temps - 1X2' },
    { key: 'spreads_h1', desc: '1ère Mi-Temps - Handicap' },
    { key: 'totals_h1', desc: '1ère Mi-Temps - Over/Under' },
    { key: 'alternate_spreads_h1', desc: '1ère Mi-Temps - Handicap (alt)' },
    { key: 'alternate_totals_h1', desc: '1ère Mi-Temps - Over/Under (alt)' },

    // Team totals
    { key: 'team_totals', desc: 'Total buts par équipe' },
    { key: 'alternate_team_totals', desc: 'Total buts par équipe (alt)' },

    // Other markets
    { key: 'btts', desc: 'Both Teams To Score' },
    { key: 'draw_no_bet', desc: 'Draw No Bet' },
    { key: 'double_chance', desc: 'Double Chance' },
  ];

  console.log('Marchés Standards:');
  availableMarkets.slice(0, 3).forEach(m => console.log(`  - ${m.key.padEnd(25)} ${m.desc}`));

  console.log('\nMarchés Alternates (multiples variations):');
  availableMarkets.slice(3, 5).forEach(m => console.log(`  - ${m.key.padEnd(25)} ${m.desc}`));

  console.log('\nMarchés 1ère Mi-Temps:');
  availableMarkets.slice(5, 10).forEach(m => console.log(`  - ${m.key.padEnd(25)} ${m.desc}`));

  console.log('\nMarchés Totaux par Équipe:');
  availableMarkets.slice(10, 12).forEach(m => console.log(`  - ${m.key.padEnd(25)} ${m.desc}`));

  console.log('\nAutres Marchés:');
  availableMarkets.slice(12).forEach(m => console.log(`  - ${m.key.padEnd(25)} ${m.desc}`));

  console.log('\n\n❌ MARCHÉS NON SUIVIS ACTUELLEMENT:\n');

  const notTracked = availableMarkets.filter(m => !(trackedMarkets as string[]).includes(m.key));
  notTracked.forEach(m => console.log(`  - ${m.key.padEnd(25)} ${m.desc}`));

  console.log('\n\n💡 COÛT DES CRÉDITS API:\n');
  console.log('  - Standard markets (h2h, spreads, totals): 1 crédit par événement');
  console.log('  - Alternate markets (alternate_spreads, alternate_totals): 3 crédits par événement');
  console.log('  - Team totals: 1 crédit additionnel');
  console.log('  - BTTS, Draw No Bet, Double Chance: 1 crédit additionnel chacun');
}

main();
