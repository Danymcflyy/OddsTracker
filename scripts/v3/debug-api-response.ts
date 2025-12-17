/**
 * Script pour voir la structure exacte de la réponse API Odds-API.io
 */

import './load-env';
import { getOddsApiClient } from '@/lib/api/oddsapi/client';

async function debugApiResponse() {
  console.log('🔍 Debug réponse API Odds-API.io\n');

  const client = getOddsApiClient();

  // Prendre un seul match pour voir la structure
  const eventId = 61493217; // Un des matchs qu'on a importé

  console.log(`📥 Récupération des cotes pour event ${eventId}...\n`);

  const response = await client.getOdds(eventId, {
    markets: ['h2h', 'totals', 'spreads'],
  });

  console.log('📋 Réponse complète:');
  console.log(JSON.stringify(response, null, 2));

  console.log('\n\n📊 Structure des marchés Pinnacle:');
  const pinnacle = response.bookmakers['Pinnacle'];

  if (pinnacle) {
    for (const market of pinnacle) {
      console.log(`\n🎯 Marché: ${market.name}`);
      console.log(`   Nombre de cotes: ${market.odds.length}`);

      // Afficher les 2 premières cotes en détail
      for (let i = 0; i < Math.min(2, market.odds.length); i++) {
        console.log(`\n   📈 Cote ${i + 1}:`);
        console.log(JSON.stringify(market.odds[i], null, 2));
      }
    }
  }

  console.log('\n\n✅ Debug terminé');
}

debugApiResponse()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
