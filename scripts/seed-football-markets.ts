/**
 * Seed Football Markets
 *
 * Crée tous les marchés et issues Football dans markets_v2 et outcomes_v2
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

const FOOTBALL_MARKETS = [
  // Moneyline / 1X2
  {
    oddsapi_key: 'h2h',
    market_type: '1x2',
    period: 'fulltime',
    outcomes: [
      { oddsapi_name: 'Home', normalized_name: '1', display_name: 'Home Win' },
      { oddsapi_name: 'Draw', normalized_name: 'X', display_name: 'Draw' },
      { oddsapi_name: 'Away', normalized_name: '2', display_name: 'Away Win' },
    ],
  },
  // Spreads / Asian Handicap
  {
    oddsapi_key: 'spreads',
    market_type: 'spreads',
    period: 'fulltime',
    outcomes: [
      { oddsapi_name: 'Home', normalized_name: '1', display_name: 'Home' },
      { oddsapi_name: 'Away', normalized_name: '2', display_name: 'Away' },
    ],
  },
  // Totals / Over-Under
  {
    oddsapi_key: 'totals',
    market_type: 'totals',
    period: 'fulltime',
    outcomes: [
      { oddsapi_name: 'Over', normalized_name: 'OVER', display_name: 'Over' },
      { oddsapi_name: 'Under', normalized_name: 'UNDER', display_name: 'Under' },
    ],
  },
  // Team Totals Home
  {
    oddsapi_key: 'team_totals_home',
    market_type: 'team_totals',
    period: 'fulltime',
    outcomes: [
      { oddsapi_name: 'Over', normalized_name: 'OVER', display_name: 'Over' },
      { oddsapi_name: 'Under', normalized_name: 'UNDER', display_name: 'Under' },
    ],
  },
  // Team Totals Away
  {
    oddsapi_key: 'team_totals_away',
    market_type: 'team_totals',
    period: 'fulltime',
    outcomes: [
      { oddsapi_name: 'Over', normalized_name: 'OVER', display_name: 'Over' },
      { oddsapi_name: 'Under', normalized_name: 'UNDER', display_name: 'Under' },
    ],
  },
  // Half-Time 1X2
  {
    oddsapi_key: 'h2h_h1',
    market_type: '1x2',
    period: 'p1',
    outcomes: [
      { oddsapi_name: 'Home', normalized_name: '1', display_name: 'Home Win' },
      { oddsapi_name: 'Draw', normalized_name: 'X', display_name: 'Draw' },
      { oddsapi_name: 'Away', normalized_name: '2', display_name: 'Away Win' },
    ],
  },
  // Half-Time Totals
  {
    oddsapi_key: 'totals_h1',
    market_type: 'totals',
    period: 'p1',
    outcomes: [
      { oddsapi_name: 'Over', normalized_name: 'OVER', display_name: 'Over' },
      { oddsapi_name: 'Under', normalized_name: 'UNDER', display_name: 'Under' },
    ],
  },
  // Half-Time Spreads
  {
    oddsapi_key: 'spreads_h1',
    market_type: 'spreads',
    period: 'p1',
    outcomes: [
      { oddsapi_name: 'Home', normalized_name: '1', display_name: 'Home' },
      { oddsapi_name: 'Away', normalized_name: '2', display_name: 'Away' },
    ],
  },
];

async function main() {
  console.log('\n🌱 Seeding Football Markets\n');

  try {
    // Get Football sport ID
    const { data: sport, error: sportError } = await supabaseAdmin
      .from('sports_v2')
      .select('id')
      .eq('slug', 'football')
      .single();

    if (sportError || !sport) {
      throw new Error(`Football sport not found: ${sportError?.message}`);
    }

    console.log(`✅ Found Football sport: ${sport.id}\n`);

    let marketsCreated = 0;
    let outcomesCreated = 0;

    for (const marketDef of FOOTBALL_MARKETS) {
      console.log(`📌 Processing market: ${marketDef.oddsapi_key}`);

      // Check if market already exists
      const { data: existingMarket } = await supabaseAdmin
        .from('markets_v2')
        .select('id')
        .eq('sport_id', sport.id)
        .eq('oddsapi_key', marketDef.oddsapi_key)
        .eq('period', marketDef.period)
        .limit(1);

      let marketId: string;

      if (existingMarket && existingMarket.length > 0) {
        marketId = existingMarket[0].id;
        console.log(`   └─ Market already exists: ${marketId}`);
      } else {
        // Create market
        const { data: newMarket, error: marketError } = await supabaseAdmin
          .from('markets_v2')
          .insert([
            {
              sport_id: sport.id,
              oddsapi_key: marketDef.oddsapi_key,
              market_type: marketDef.market_type,
              period: marketDef.period,
              active: true,
              created_at: new Date().toISOString(),
            },
          ])
          .select('id')
          .single();

        if (marketError || !newMarket) {
          console.log(`   ❌ Failed to create market: ${marketError?.message}`);
          continue;
        }

        marketId = newMarket.id;
        console.log(`   └─ Created market: ${marketId}`);
        marketsCreated++;
      }

      // Create outcomes
      for (const outcomeDef of marketDef.outcomes) {
        // Check if outcome already exists
        const { data: existingOutcome } = await supabaseAdmin
          .from('outcomes_v2')
          .select('id')
          .eq('market_id', marketId)
          .eq('normalized_name', outcomeDef.normalized_name)
          .limit(1);

        if (existingOutcome && existingOutcome.length > 0) {
          console.log(`      └─ Outcome ${outcomeDef.normalized_name} already exists`);
          continue;
        }

        // Create outcome
        const { error: outcomeError } = await supabaseAdmin
          .from('outcomes_v2')
          .insert([
            {
              market_id: marketId,
              oddsapi_name: outcomeDef.oddsapi_name,
              normalized_name: outcomeDef.normalized_name,
              display_name: outcomeDef.display_name,
              created_at: new Date().toISOString(),
            },
          ]);

        if (outcomeError) {
          console.log(`      ❌ Failed to create outcome: ${outcomeError.message}`);
        } else {
          console.log(`      ✅ Created outcome: ${outcomeDef.normalized_name}`);
          outcomesCreated++;
        }
      }

      console.log('');
    }

    console.log('='.repeat(60));
    console.log('📊 Summary');
    console.log('='.repeat(60));
    console.log(`Markets created:  ${marketsCreated}`);
    console.log(`Outcomes created: ${outcomesCreated}`);
    console.log('');
    console.log('✅ Football markets seeded successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
