import { getTheOddsApiClient } from '../lib/api/theoddsapi';

async function main() {
  const client = getTheOddsApiClient();

  console.log('\n🔍 TEST: Réponse Brute de The Odds API\n');

  // Get one soccer event
  const { data: events } = await client.getEvents('soccer_uefa_europa_league');

  if (events.length === 0) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  const event = events[0];
  console.log(`📅 Événement: ${event.home_team} vs ${event.away_team}`);
  console.log(`   Event ID: ${event.id}\n`);

  // Get odds for this event
  const { data: oddsData } = await client.getEventOdds('soccer_uefa_europa_league', event.id, {
    regions: 'eu',
    markets: 'h2h,spreads,totals',
    bookmakers: 'pinnacle',
    oddsFormat: 'decimal',
  });

  console.log('=' .repeat(80));
  console.log('RÉPONSE BRUTE DE L\'API');
  console.log('='.repeat(80));

  console.log(JSON.stringify(oddsData, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log('ANALYSE DES MARKETS');
  console.log('='.repeat(80) + '\n');

  if (oddsData.bookmakers && oddsData.bookmakers.length > 0) {
    const bookmaker = oddsData.bookmakers[0];
    console.log(`Bookmaker: ${bookmaker.key}\n`);

    bookmaker.markets.forEach((market: any) => {
      console.log(`📊 Market: ${market.key}`);
      console.log(`   Outcomes:`);
      market.outcomes.forEach((outcome: any) => {
        console.log(`     - name: "${outcome.name}"`);
        console.log(`       price: ${outcome.price}`);
        if (outcome.point !== undefined) {
          console.log(`       point: ${outcome.point}`);
        }
      });
      console.log('');
    });
  } else {
    console.log('❌ Aucun bookmaker trouvé dans la réponse');
  }
}

main();
