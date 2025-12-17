import { config } from 'dotenv';
import { resolve } from 'path';

// IMPORTANT: Charger .env.local AVANT tout import
config({ path: resolve(process.cwd(), '.env.local') });

// Forcer le rechargement des variables d'environnement
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Les variables d\'environnement ne sont pas chargées. Vérifiez .env.local');
}

import { fetchActiveMarkets } from '../../lib/db/queries/v3/markets';

async function debugMarkets() {
  console.log('🔍 Chargement des marchés actifs...\n');

  const markets = await fetchActiveMarkets('football');

  console.log(`📊 Total marchés actifs : ${markets.length}\n`);

  markets.forEach((market) => {
    console.log(`\n📋 Marché: ${market.custom_name || market.name}`);
    console.log(`   - oddsapi_key: ${market.oddsapi_key}`);
    console.log(`   - market_type: ${market.market_type}`);
    console.log(`   - period: ${market.period}`);
    console.log(`   - outcomes: [${market.outcomes.join(', ')}]`);
    console.log(`   - lines: [${market.lines?.join(', ') || 'aucune'}]`);
  });

  console.log('\n\n✅ Debug terminé');
}

debugMarkets().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
