#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi');

  console.log('🔍 Test des événements actuellement disponibles sur Pinnacle...\n');

  const client = getTheOddsApiClient();

  // Récupérer les événements actuels de la Champions League
  console.log('📡 Récupération des événements Champions League...\n');

  try {
    const eventsResponse = await client.getEvents('soccer_uefa_champs_league');
    const events = eventsResponse.data;

    console.log(`✅ ${events.length} événements trouvés\n`);

    if (events.length === 0) {
      console.log('⚠️  Aucun événement à venir pour Champions League');
      return;
    }

    // Prendre les 3 premiers événements
    const testEvents = events.slice(0, 3);

    for (const event of testEvents) {
      console.log(`\n🏆 ${event.home_team} vs ${event.away_team}`);
      console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);

      // Tester avec Pinnacle
      try {
        const oddsResponse = await client.getEventOdds(
          'soccer_uefa_champs_league',
          event.id,
          {
            bookmakers: 'pinnacle',
            markets: 'h2h,alternate_spreads,alternate_totals,h2h_h1,alternate_spreads_h1,alternate_totals_h1,team_totals',
          }
        );

        const bookmakers = oddsResponse.data.bookmakers || [];
        const pinnacle = bookmakers.find(b => b.key === 'pinnacle');

        if (!pinnacle) {
          console.log('   ❌ Pinnacle ne couvre PAS ce match');
          continue;
        }

        console.log('   ✅ Pinnacle COUVRE ce match!');

        const markets = pinnacle.markets || [];
        console.log(`   📊 Marchés disponibles: ${markets.length}`);

        for (const market of markets) {
          console.log(`      • ${market.key}: ${market.outcomes?.length || 0} outcomes`);
        }

      } catch (err: any) {
        if (err.message.includes('404')) {
          console.log('   ❌ Événement expiré');
        } else {
          console.log('   ❌ Erreur:', err.message);
        }
      }

      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n\n💡 Conclusion:');
    console.log('   - Si Pinnacle couvre des matchs, notre script fonctionne');
    console.log('   - Si Pinnacle ne couvre pas, c\'est normal d\'avoir des cellules vides\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

run();
