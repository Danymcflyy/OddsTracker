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

  console.log('🔍 Vérification de la structure spreads...\n');

  // Récupérer un market_state de type spreads
  const { data: ms, error } = await supabase
    .from('market_states')
    .select('*')
    .eq('market_key', 'spreads')
    .eq('status', 'captured')
    .limit(1)
    .single();

  if (error || !ms) {
    console.log('❌ Aucun market_state spreads trouvé');
    return;
  }

  console.log('📊 Market State spreads:');
  console.log(`   event_id: ${ms.event_id}`);
  console.log(`   status: ${ms.status}\n`);

  console.log('📋 opening_odds:');
  console.log(JSON.stringify(ms.opening_odds, null, 2));

  console.log('\n📋 opening_odds_variations:');
  console.log(`   Nombre de variations: ${ms.opening_odds_variations?.length || 0}\n`);

  if (ms.opening_odds_variations && ms.opening_odds_variations.length > 0) {
    console.log('   Détail de TOUTES les variations:\n');

    ms.opening_odds_variations.forEach((variation: any, index: number) => {
      console.log(`   Variation ${index + 1}:`);
      console.log(JSON.stringify(variation, null, 2));
      console.log('');
    });
  }

  console.log('\n💡 Structure attendue par le frontend:');
  console.log('   Pour spreads avec alternate_spreads, on devrait avoir:');
  console.log('   - 1 variation par point distinct');
  console.log('   - Chaque variation contient: { home: X, away: Y, point: Z } OU { home: X, point: Z } OU { away: Y, point: Z }');
  console.log('   - Le frontend va créer UNE entrée par variation\n');
}

run();
