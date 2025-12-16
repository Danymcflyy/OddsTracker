/**
 * Create Missing Markets
 *
 * Crée automatiquement tous les marchés manquants
 * avec les handicaps/lignes nécessaires
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🔨 Creating Missing Markets\n');

  try {
    // Get football sport
    const { data: footballSport } = await supabaseAdmin
      .from('sports_v2')
      .select('id')
      .eq('slug', 'football')
      .single();

    if (!footballSport) {
      console.error('❌ Football sport not found');
      return;
    }

    const sportId = footballSport.id;

    // Define all market configurations needed
    const marketConfigs = [
      // Spreads - Asian Handicap
      {
        oddsapi_key: 'spreads',
        market_type: 'spreads',
        period: 'fulltime',
        handicaps: [-2.25, -2, -1.5, -1.25, -1, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5]
      },
      // Totals - Over/Under
      {
        oddsapi_key: 'totals',
        market_type: 'totals',
        period: 'fulltime',
        handicaps: [1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4]
      },
      // Halftime Spreads
      {
        oddsapi_key: 'spreads_h1',
        market_type: 'spreads',
        period: 'p1',
        handicaps: [-1.5, -1.25, -1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75]
      },
      // Halftime Totals
      {
        oddsapi_key: 'totals_h1',
        market_type: 'totals',
        period: 'p1',
        handicaps: [0.5, 0.75, 1, 1.25, 1.5, 1.75]
      },
      // Corners Spread
      {
        oddsapi_key: 'corners_spread',
        market_type: 'spreads',
        period: 'fulltime',
        handicaps: [-6.5, -6, -5.5, -5, -4.5, -4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5]
      },
      // Corners Totals
      {
        oddsapi_key: 'corners_totals',
        market_type: 'totals',
        period: 'fulltime',
        handicaps: [8.5, 9, 9.5, 10, 10.5, 11, 11.5]
      },
      // Corners HT Totals
      {
        oddsapi_key: 'corners_totals_h1',
        market_type: 'totals',
        period: 'p1',
        handicaps: [4, 4.5, 5, 5.5]
      },
      // Bookings Spread
      {
        oddsapi_key: 'bookings_spread',
        market_type: 'spreads',
        period: 'fulltime',
        handicaps: [-0.5, 0, 0.5, 1]
      },
      // Bookings Totals
      {
        oddsapi_key: 'bookings_totals',
        market_type: 'totals',
        period: 'fulltime',
        handicaps: [3.5, 4, 4.5, 5.5]
      },
      // Corners HT Spread
      {
        oddsapi_key: 'corners_spread_h1',
        market_type: 'spreads',
        period: 'p1',
        handicaps: [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5]
      },
      // Team Totals Home
      {
        oddsapi_key: 'team_totals_home',
        market_type: 'team_totals',
        period: 'fulltime',
        handicaps: [0.5, 1.5, 2.5]
      },
      // Team Totals Away
      {
        oddsapi_key: 'team_totals_away',
        market_type: 'team_totals',
        period: 'fulltime',
        handicaps: [0.5, 1.5]
      }
    ];

    let marketCount = 0;
    let outcomeCount = 0;

    for (const config of marketConfigs) {
      console.log(`\n📌 Processing "${config.oddsapi_key}"...`);

      for (const handicap of config.handicaps) {
        // Check if market already exists
        const { data: existing } = await supabaseAdmin
          .from('markets_v2')
          .select('id')
          .eq('oddsapi_key', config.oddsapi_key)
          .eq('handicap', handicap)
          .eq('period', config.period)
          .single();

        if (existing) {
          console.log(`   ✓ Market "${config.oddsapi_key}:${handicap}" already exists`);
          continue;
        }

        // Create new market
        const { data: newMarket, error: insertError } = await supabaseAdmin
          .from('markets_v2')
          .insert([{
            sport_id: sportId,
            oddsapi_key: config.oddsapi_key,
            market_type: config.market_type,
            period: config.period,
            handicap: handicap,
            active: true,
          }])
          .select('id')
          .single();

        if (insertError) {
          console.log(`   ❌ Error creating market: ${insertError.message}`);
          continue;
        }

        console.log(`   ✅ Created market "${config.oddsapi_key}:${handicap}"`);
        marketCount++;

        // Create outcomes for this market
        const outcomeConfigs = [
          { name: '1', normalized_name: '1', display_name: 'Home' },
          { name: '2', normalized_name: '2', display_name: 'Away' },
          { name: 'X', normalized_name: 'X', display_name: 'Draw' },
          { name: 'OVER', normalized_name: 'OVER', display_name: 'Over' },
          { name: 'UNDER', normalized_name: 'UNDER', display_name: 'Under' },
        ];

        for (const outcomeConfig of outcomeConfigs) {
          // Only add relevant outcomes for this market type
          if (config.market_type === 'spreads' && !['1', '2'].includes(outcomeConfig.normalized_name)) {
            continue;
          }
          if (config.market_type === 'totals' && !['OVER', 'UNDER'].includes(outcomeConfig.normalized_name)) {
            continue;
          }
          if (config.market_type === 'team_totals' && !['OVER', 'UNDER'].includes(outcomeConfig.normalized_name)) {
            continue;
          }

          const { error: outcomeError } = await supabaseAdmin
            .from('outcomes_v2')
            .insert([{
              market_id: newMarket.id,
              oddsapi_name: outcomeConfig.name,
              normalized_name: outcomeConfig.normalized_name,
              display_name: outcomeConfig.display_name,
            }])
            .select('id')
            .single();

          if (outcomeError && !outcomeError.message.includes('duplicate')) {
            console.log(`   ⚠️  Error creating outcome: ${outcomeError.message}`);
            continue;
          }

          outcomeCount++;
        }
      }
    }

    console.log(`\n\n✅ Complete!`);
    console.log(`   Markets created: ${marketCount}`);
    console.log(`   Outcomes created: ${outcomeCount}`);
    console.log('\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
