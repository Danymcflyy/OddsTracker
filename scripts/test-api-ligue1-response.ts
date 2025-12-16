/**
 * Test API Ligue 1 Response
 *
 * Appelle directement l'API endpoint /api/fixtures/football
 * pour voir ce qui est retourné pour Ligue 1
 */

import './load-env';

async function main() {
  console.log('\n🧪 Testing API /api/fixtures/football Response\n');

  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3000');
    console.log('✅ Next.js server is running\n');
  } catch (error) {
    console.error('❌ Next.js server NOT running!');
    console.error('   Start it with: npm run dev');
    process.exit(1);
  }

  try {
    // Call API endpoint
    console.log('📡 Calling GET /api/fixtures/football...\n');
    const response = await fetch('http://localhost:3000/api/fixtures/football?pageSize=100');

    if (!response.ok) {
      console.error(`❌ API returned ${response.status}: ${response.statusText}`);
      process.exit(1);
    }

    const data = await response.json();

    console.log(`✅ API Response received`);
    console.log(`   Total fixtures: ${data.pagination?.total || 0}\n`);

    if (!data.data || data.data.length === 0) {
      console.log('❌ No fixtures returned by API');
      process.exit(1);
    }

    // Find Ligue 1 fixtures
    const ligue1Fixtures = data.data.filter((f: any) =>
      f.league?.name?.toLowerCase().includes('ligue') ||
      f.league?.name?.toLowerCase().includes('france')
    );

    console.log(`📊 Ligue 1 fixtures found: ${ligue1Fixtures.length}\n`);

    if (ligue1Fixtures.length === 0) {
      console.log('❌ NO LIGUE 1 FIXTURES IN API RESPONSE!');
      console.log('   This is the problem - API is not returning Ligue 1 data');

      // Show what leagues ARE returned
      const leagues = new Set(data.data.map((f: any) => f.league?.name).filter(Boolean));
      console.log(`\n   Leagues in API response: ${Array.from(leagues).join(', ')}`);
      process.exit(1);
    }

    // Examine first Ligue 1 fixture
    const fixture = ligue1Fixtures[0];
    console.log('✅ First Ligue 1 fixture:');
    console.log(`   ID: ${fixture.id}`);
    console.log(`   League: ${fixture.league?.name}`);
    console.log(`   Match: ${fixture.home_team?.name} vs ${fixture.away_team?.name}`);
    console.log(`   Date: ${fixture.start_time}`);
    console.log(`   Odds count: ${fixture.odds?.length || 0}\n`);

    if (!fixture.odds || fixture.odds.length === 0) {
      console.log('❌ NO ODDS ENRICHED FOR LIGUE 1 FIXTURE!');
      console.log('   The API endpoint is NOT enriching Ligue 1 fixtures with odds');
      console.log('   Check app/api/fixtures/[sport]/route.ts line 336-417');
    } else {
      console.log('✅ Odds are enriched!');
      console.log(`   First 5 odds:\n`);
      fixture.odds.slice(0, 5).forEach((odd: any, idx: number) => {
        console.log(`   ${idx + 1}. Market: ${odd.market?.name || 'unknown'}`);
        console.log(`      Outcome: ${odd.outcome?.name || 'unknown'}`);
        console.log(`      Line: ${odd.line !== undefined ? odd.line : 'null'}`);
        console.log(`      Opening: ${odd.opening_price || 'null'}`);
        console.log('');
      });

      // Show market distribution
      const marketCounts = new Map();
      fixture.odds.forEach((odd: any) => {
        const key = odd.market?.name || 'unknown';
        marketCounts.set(key, (marketCounts.get(key) || 0) + 1);
      });

      console.log(`   Market distribution:`);
      marketCounts.forEach((count, market) => {
        console.log(`      ${market}: ${count} odds`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
