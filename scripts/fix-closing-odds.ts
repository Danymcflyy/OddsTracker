import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function fix() {
  console.log('🔧 Correction des closing odds dans market_states...\n');

  // Récupérer tous les closing_odds finalisés
  const { data: closingOdds, error } = await supabase
    .from('closing_odds')
    .select('event_id, markets, captured_at');

  if (error) {
    console.error('Erreur:', error.message);
    return;
  }

  console.log(`📊 ${closingOdds?.length || 0} événements avec closing odds\n`);

  let updated = 0;
  for (const co of closingOdds || []) {
    const markets = co.markets || {};

    for (const [marketKey, odds] of Object.entries(markets)) {
      const { error: updateError } = await supabase
        .from('market_states')
        .update({
          closing_odds: odds,
          status: 'closed',
        })
        .eq('event_id', co.event_id)
        .eq('market_key', marketKey);

      if (updateError) {
        console.log(`  ⚠️ ${marketKey}: ${updateError.message}`);
      } else {
        updated++;
      }
    }
  }

  console.log(`\n✅ ${updated} market_states mis à jour`);
}

fix();
