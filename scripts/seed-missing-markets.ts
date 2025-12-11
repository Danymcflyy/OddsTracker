import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🌱 Seeding missing markets...\n');

  // Get sport ID for football
  const { data: sport, error: sportError } = await supabaseAdmin
    .from('sports_v2')
    .select('id')
    .eq('slug', 'football')
    .single();

  if (sportError || !sport) {
    console.error('❌ Football sport not found');
    process.exit(1);
  }

  const sportId = sport.id;
  console.log(`✅ Found football sport: ${sportId}\n`);

  // Markets that need to be created based on what's in opening_closing_observed
  const marketsToCreate = [
    // Bookings
    { oddsapi_key: 'bookings_spread', market_type: 'bookings_spread', period: 'fulltime' },
    { oddsapi_key: 'bookings_totals', market_type: 'bookings_totals', period: 'fulltime' },

    // Corners
    { oddsapi_key: 'corners_spread', market_type: 'corners_spread', period: 'fulltime' },
    { oddsapi_key: 'corners_totals', market_type: 'corners_totals', period: 'fulltime' },
    { oddsapi_key: 'corners_spread_h1', market_type: 'corners_spread', period: 'p1' },
    { oddsapi_key: 'corners_totals_h1', market_type: 'corners_totals', period: 'p1' },

    // Team Totals (already mapped correctly)
    { oddsapi_key: 'team_totals_home', market_type: 'team_totals', period: 'fulltime' },
    { oddsapi_key: 'team_totals_away', market_type: 'team_totals', period: 'fulltime' },
  ];

  console.log(`📝 Creating ${marketsToCreate.length} markets...\n`);

  for (const market of marketsToCreate) {
    const { error } = await supabaseAdmin
      .from('markets_v2')
      .insert([{
        sport_id: sportId,
        oddsapi_key: market.oddsapi_key,
        market_type: market.market_type,
        period: market.period,
        active: true,
      }])
      .select('id')
      .single();

    if (error) {
      if (error.message.includes('duplicate')) {
        console.log(`⏭️  ${market.oddsapi_key} already exists`);
      } else {
        console.log(`❌ Error creating ${market.oddsapi_key}: ${error.message}`);
      }
    } else {
      console.log(`✅ Created ${market.oddsapi_key}`);
    }
  }

  console.log('\n✅ Markets seeding complete!\n');
}

main().catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});
