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

  console.log('🔍 Vérification directe des market_states...\n');

  // Compter les market_states par statut
  const { data: statusCounts } = await supabase
    .from('market_states')
    .select('status')
    .limit(1000);

  const captured = statusCounts?.filter(s => s.status === 'captured').length || 0;
  const pending = statusCounts?.filter(s => s.status === 'pending').length || 0;
  const notOffered = statusCounts?.filter(s => s.status === 'not_offered').length || 0;

  console.log('📊 Statuts:');
  console.log(`  - Captured: ${captured}`);
  console.log(`  - Pending: ${pending}`);
  console.log(`  - Not Offered: ${notOffered}\n`);

  // Prendre quelques market_states capturés
  const { data: markets } = await supabase
    .from('market_states')
    .select('market_key, status, opening_odds_variations')
    .eq('status', 'captured')
    .not('opening_odds_variations', 'is', null)
    .limit(5);

  if (!markets || markets.length === 0) {
    console.log('⚠️  Aucun market_state capturé trouvé\n');
    return;
  }

  console.log('✅ Échantillon de market_states capturés:\n');
  for (const market of markets) {
    const variations = market.opening_odds_variations || [];
    console.log(`${market.market_key}: ${variations.length} variation(s)`);
    if (variations.length > 0) {
      console.log(`  Exemple:`, JSON.stringify(variations[0], null, 2));
    }
  }
}

run();
