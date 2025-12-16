/**
 * Test API Fixtures Comparison
 *
 * Teste l'endpoint /api/fixtures/[sport] pour comparer
 * les résultats entre Premier League et Ligue 1
 */

import './load-env';

async function testApiEndpoint(sport: string, leagueName: string) {
  console.log(`\n📊 Testing ${leagueName}...`);
  console.log('-'.repeat(80));

  try {
    const response = await fetch(
      `http://localhost:3000/api/fixtures/${sport}?pageSize=100`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ API returned ${response.status}: ${response.statusText}`);
      return;
    }

    const data = await response.json();

    console.log(`✅ API Response received`);
    console.log(`   Total fixtures: ${data.pagination?.total || 0}`);

    if (!data.data || data.data.length === 0) {
      console.log(`   ⚠️  No fixtures returned`);
      return;
    }

    // Filter by league if needed
    let fixtures = data.data;
    if (leagueName === 'Ligue 1') {
      fixtures = fixtures.filter((f: any) =>
        f.league?.name?.includes('Ligue 1') ||
        f.league?.name?.includes('ligue') ||
        (f.league?.country?.name?.includes('France'))
      );
    } else if (leagueName === 'Premier League') {
      fixtures = fixtures.filter((f: any) =>
        f.league?.name?.includes('Premier League') ||
        f.league?.name?.includes('premier') ||
        (f.league?.country?.name?.includes('England') || f.league?.country?.name?.includes('england'))
      );
    }

    console.log(`   Fixtures for ${leagueName}: ${fixtures.length}`);

    if (fixtures.length === 0) {
      console.log(`   ⚠️  No fixtures found for ${leagueName}`);
      return;
    }

    // Examine first fixture
    const fixture = fixtures[0];
    console.log(`\n   📋 First fixture:`);
    console.log(`      ID: ${fixture.id}`);
    console.log(`      API ID: ${fixture.oddspapi_id}`);
    console.log(`      League: ${fixture.league?.name}`);
    console.log(`      Match: ${fixture.home_team?.name} vs ${fixture.away_team?.name}`);
    console.log(`      Date: ${fixture.start_time}`);
    console.log(`      Odds count: ${fixture.odds?.length || 0}`);

    if (!fixture.odds || fixture.odds.length === 0) {
      console.log(`\n      ❌ NO ODDS ENRICHED FOR THIS FIXTURE!`);
      console.log(`\n      This is the problem!`);
    } else {
      console.log(`\n      ✅ Odds enriched successfully`);
      console.log(`      First 5 odds:`);
      fixture.odds.slice(0, 5).forEach((odd: any, idx: number) => {
        console.log(`        ${idx + 1}. Market: ${odd.market?.name || 'unknown'} | Outcome: ${odd.outcome?.name || 'unknown'} | Opening: ${odd.opening_price}`);
      });
    }

    // Show market distribution
    if (fixture.odds && fixture.odds.length > 0) {
      const marketCounts = new Map();
      fixture.odds.forEach((odd: any) => {
        const marketName = odd.market?.name || 'unknown';
        marketCounts.set(marketName, (marketCounts.get(marketName) || 0) + 1);
      });

      console.log(`\n      Market distribution:`);
      marketCounts.forEach((count, market) => {
        console.log(`        ${market}: ${count} odds`);
      });
    }

  } catch (error) {
    console.error(`❌ Error:`, error instanceof Error ? error.message : error);
  }
}

async function main() {
  console.log('\n🧪 Testing API Fixtures Comparison');
  console.log('=====================================\n');

  // Check if localhost is running
  try {
    const healthCheck = await fetch('http://localhost:3000');
    if (!healthCheck.ok) throw new Error('Not ready');
  } catch (error) {
    console.error(
      '❌ Next.js server is not running on localhost:3000',
      '\n   Start it with: npm run dev'
    );
    process.exit(1);
  }

  // Test both leagues
  await testApiEndpoint('football', 'Premier League');
  await testApiEndpoint('football', 'Ligue 1');

  console.log('\n');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
