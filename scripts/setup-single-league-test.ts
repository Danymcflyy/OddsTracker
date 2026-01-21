#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🧪 Configuration pour test avec une seule ligue...\n');

  // Une seule ligue pour le test
  const testLeague = ['soccer_uefa_champs_league'];

  // Marchés recommandés (on garde tous pour le test)
  const testMarkets = [
    'h2h',
    'spreads',
    'totals',
    'h2h_h1',
    'spreads_h1',
    'totals_h1',
    'team_totals',
  ];

  console.log('📊 Configuration de test:');
  console.log(`  - Ligue: ${testLeague[0]} (UEFA Champions League)`);
  console.log(`  - Marchés: ${testMarkets.length} marchés`);
  testMarkets.forEach(m => console.log(`    • ${m}`));

  // Mettre à jour tracked_sports
  const { error: sportsError } = await supabase
    .from('settings')
    .update({ value: testLeague })
    .eq('key', 'tracked_sports');

  if (sportsError) {
    console.error('\n❌ Erreur tracked_sports:', sportsError);
    process.exit(1);
  }

  // Mettre à jour tracked_markets
  const { error: marketsError } = await supabase
    .from('settings')
    .update({ value: testMarkets })
    .eq('key', 'tracked_markets');

  if (marketsError) {
    console.error('\n❌ Erreur tracked_markets:', marketsError);
    process.exit(1);
  }

  console.log('\n✅ Configuration mise à jour avec succès!\n');
  console.log('📝 Prochaines étapes:');
  console.log('  1. npx tsx scripts/test-discover-v2.ts  (découvrir les matchs)');
  console.log('  2. npx tsx scripts/test-opening-v2.ts   (scanner les cotes)\n');
  console.log('💰 Estimation des crédits:');
  console.log('  - Champions League: ~36 matchs');
  console.log('  - 7 marchés × ~10 crédits = ~70 crédits par match');
  console.log('  - Total estimé: ~250-300 crédits\n');
}

run();
