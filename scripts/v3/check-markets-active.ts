import { config } from 'dotenv';
import { resolve } from 'path';

// Charger .env.local explicitement
config({ path: resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../../lib/db/index';

async function checkMarkets() {
  const { data: sport } = await supabaseAdmin
    .from('sports')
    .select('id')
    .eq('slug', 'football')
    .single();

  if (!sport) {
    console.log('Sport football non trouvé');
    return;
  }

  const { data: markets } = await supabaseAdmin
    .from('markets')
    .select('id, oddsapi_key, market_type, name, period, active')
    .eq('sport_id', sport.id)
    .order('oddsapi_key');

  console.log('\n📊 Marchés dans la DB:\n');
  console.log('Total:', markets?.length || 0);
  console.log('\nDétail:');
  markets?.forEach(m => {
    console.log(`${m.active ? '✅' : '❌'} ${m.oddsapi_key} (${m.market_type}) - ${m.period}`);
  });

  // Activer tous les marchés
  const inactiveMarkets = markets?.filter(m => !m.active) || [];
  if (inactiveMarkets.length > 0) {
    console.log(`\n🔧 ${inactiveMarkets.length} marchés inactifs trouvés. Activation...`);

    for (const market of inactiveMarkets) {
      await supabaseAdmin
        .from('markets')
        .update({ active: true })
        .eq('id', market.id);
    }

    console.log('✅ Tous les marchés sont maintenant actifs');
  } else {
    console.log('\n✅ Tous les marchés sont déjà actifs');
  }
}

checkMarkets().then(() => process.exit(0));
