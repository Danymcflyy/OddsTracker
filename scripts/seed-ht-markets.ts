import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('📝 Seeding HT (Half-Time) markets...\n');

  try {
    // Get Football sport ID
    const { data: sports } = await supabaseAdmin
      .from('sports_v2')
      .select('id')
      .eq('slug', 'football')
      .single();

    if (!sports) {
      console.error('❌ Football sport not found');
      process.exit(1);
    }

    const sportId = sports.id;
    console.log(`✓ Football sport ID: ${sportId}\n`);

    // Insert HT markets
    const htMarkets = [
      { oddsapi_key: 'h2h_h1', market_type: '1x2', period: 'p1', handicap: null },
      { oddsapi_key: 'totals_h1', market_type: 'totals', period: 'p1', handicap: null },
      { oddsapi_key: 'spreads_h1', market_type: 'spreads', period: 'p1', handicap: null },
    ];

    for (const market of htMarkets) {
      const { data, error } = await supabaseAdmin
        .from('markets_v2')
        .insert({
          sport_id: sportId,
          oddsapi_key: market.oddsapi_key,
          market_type: market.market_type,
          period: market.period,
          handicap: market.handicap,
          active: true,
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️  ${market.oddsapi_key} already exists`);
        } else {
          console.error(`❌ Error inserting ${market.oddsapi_key}:`, error);
        }
      } else {
        console.log(`✓ Created market: ${market.oddsapi_key} (${market.market_type} - ${market.period})`);
      }
    }

    // Create outcomes for h2h_h1 (1, X, 2)
    console.log('\n📝 Creating outcomes for HT markets...\n');

    const { data: h2hH1 } = await supabaseAdmin
      .from('markets_v2')
      .select('id')
      .eq('oddsapi_key', 'h2h_h1')
      .single();

    if (h2hH1) {
      const h2hOutcomes = [
        { oddsapi_name: 'Home', normalized_name: '1', display_name: 'Home Win' },
        { oddsapi_name: 'Draw', normalized_name: 'X', display_name: 'Draw' },
        { oddsapi_name: 'Away', normalized_name: '2', display_name: 'Away Win' },
      ];

      for (const outcome of h2hOutcomes) {
        const { error } = await supabaseAdmin
          .from('outcomes_v2')
          .insert({
            market_id: h2hH1.id,
            oddsapi_name: outcome.oddsapi_name,
            normalized_name: outcome.normalized_name,
            display_name: outcome.display_name,
          });

        if (error && error.code !== '23505') {
          console.error(`❌ Error inserting outcome ${outcome.normalized_name}:`, error);
        } else {
          console.log(`✓ Created outcome: ${outcome.normalized_name} for h2h_h1`);
        }
      }
    }

    // Create outcomes for totals_h1 (OVER, UNDER)
    const { data: totalsH1 } = await supabaseAdmin
      .from('markets_v2')
      .select('id')
      .eq('oddsapi_key', 'totals_h1')
      .single();

    if (totalsH1) {
      const totalOutcomes = [
        { oddsapi_name: 'Over', normalized_name: 'OVER', display_name: 'Over' },
        { oddsapi_name: 'Under', normalized_name: 'UNDER', display_name: 'Under' },
      ];

      for (const outcome of totalOutcomes) {
        const { error } = await supabaseAdmin
          .from('outcomes_v2')
          .insert({
            market_id: totalsH1.id,
            oddsapi_name: outcome.oddsapi_name,
            normalized_name: outcome.normalized_name,
            display_name: outcome.display_name,
          });

        if (error && error.code !== '23505') {
          console.error(`❌ Error inserting outcome ${outcome.normalized_name}:`, error);
        } else {
          console.log(`✓ Created outcome: ${outcome.normalized_name} for totals_h1`);
        }
      }
    }

    // Create outcomes for spreads_h1 (Home, Away)
    const { data: spreadsH1 } = await supabaseAdmin
      .from('markets_v2')
      .select('id')
      .eq('oddsapi_key', 'spreads_h1')
      .single();

    if (spreadsH1) {
      const spreadOutcomes = [
        { oddsapi_name: 'Home', normalized_name: '1', display_name: 'Home' },
        { oddsapi_name: 'Away', normalized_name: '2', display_name: 'Away' },
      ];

      for (const outcome of spreadOutcomes) {
        const { error } = await supabaseAdmin
          .from('outcomes_v2')
          .insert({
            market_id: spreadsH1.id,
            oddsapi_name: outcome.oddsapi_name,
            normalized_name: outcome.normalized_name,
            display_name: outcome.display_name,
          });

        if (error && error.code !== '23505') {
          console.error(`❌ Error inserting outcome ${outcome.normalized_name}:`, error);
        } else {
          console.log(`✓ Created outcome: ${outcome.normalized_name} for spreads_h1`);
        }
      }
    }

    console.log('\n✅ HT markets seeded successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
