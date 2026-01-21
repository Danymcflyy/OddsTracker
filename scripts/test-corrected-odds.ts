import { getTheOddsApiClient } from '../lib/api/theoddsapi';

async function main() {
  const client = getTheOddsApiClient();

  console.log('\n🔍 TEST: Vérification des Corrections\n');

  // Get one soccer event
  const { data: events } = await client.getEvents('soccer_uefa_europa_league');

  if (events.length === 0) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  const event = events[0];
  console.log(`📅 Événement: ${event.home_team} vs ${event.away_team}`);
  console.log(`   Event ID: ${event.id}\n`);

  // Test with alternate markets
  const { data: oddsData } = await client.getEventOdds('soccer_uefa_europa_league', event.id, {
    regions: 'eu',
    markets: 'h2h,alternate_spreads,alternate_totals',
    bookmakers: 'pinnacle',
    oddsFormat: 'decimal',
  });

  console.log('=' .repeat(80));
  console.log('RÉPONSE AVEC ALTERNATE MARKETS');
  console.log('='.repeat(80) + '\n');

  if (oddsData.bookmakers && oddsData.bookmakers.length > 0) {
    const bookmaker = oddsData.bookmakers[0];
    console.log(`Bookmaker: ${bookmaker.key}\n`);

    const marketGroups: Record<string, any[]> = {};

    bookmaker.markets.forEach((market: any) => {
      if (!marketGroups[market.key]) {
        marketGroups[market.key] = [];
      }
      marketGroups[market.key].push(market);
    });

    Object.entries(marketGroups).forEach(([marketKey, markets]) => {
      console.log(`📊 Market: ${marketKey} (${markets.length} variation(s))`);

      markets.forEach((market, idx) => {
        console.log(`\n   Variation ${idx + 1}:`);
        market.outcomes.forEach((outcome: any) => {
          let line = `     - ${outcome.name}: ${outcome.price}`;
          if (outcome.point !== undefined) {
            line += ` (point: ${outcome.point})`;
          }
          console.log(line);
        });
      });
      console.log('');
    });

    console.log('=' .repeat(80));
    console.log('RÉSUMÉ');
    console.log('='.repeat(80) + '\n');

    console.log('Nombre de variations par marché:');
    Object.entries(marketGroups).forEach(([marketKey, markets]) => {
      console.log(`  - ${marketKey}: ${markets.length} variation(s)`);
    });

    console.log('\n✅ Test terminé');
  } else {
    console.log('❌ Aucun bookmaker trouvé dans la réponse');
  }
}

main();
