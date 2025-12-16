/**
 * Create Markets from Actual Odds
 *
 * Scanne TOUTES les odds dans opening_closing_observed
 * et crée les markets correspondants avec les VRAIES valeurs de line
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🔨 Creating Markets from Actual Odds Data\n');

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

    // Get ALL unique (market_name, line) combinations from actual odds
    const { data: odds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('market_name, line');

    if (!odds || odds.length === 0) {
      console.log('❌ No odds found');
      return;
    }

    // Group by market_name
    const linesByMarket = new Map();
    odds.forEach((odd: any) => {
      if (!linesByMarket.has(odd.market_name)) {
        linesByMarket.set(odd.market_name, new Set());
      }
      linesByMarket.get(odd.market_name).add(odd.line);
    });

    console.log(`Found ${linesByMarket.size} unique market types\n`);

    // Get existing markets to avoid duplicates
    const { data: existingMarkets } = await supabaseAdmin
      .from('markets_v2')
      .select('oddsapi_key, handicap');

    const existingSet = new Set();
    if (existingMarkets) {
      existingMarkets.forEach((m: any) => {
        const key = `${m.oddsapi_key}:${m.handicap}`;
        existingSet.add(key);
      });
    }

    let marketCount = 0;
    let outcomeCount = 0;

    // Process each market type
    for (const [marketName, lines] of linesByMarket.entries()) {
      console.log(`\n📌 Processing "${marketName}"...`);
      const sortedLines = Array.from(lines).sort((a, b) => {
        const aVal = a === null ? -999 : typeof a === 'number' ? a : parseFloat(a);
        const bVal = b === null ? -999 : typeof b === 'number' ? b : parseFloat(b);
        return aVal - bVal;
      });

      console.log(`   Lines needed: ${sortedLines.map(l => l === null ? 'null' : l).join(', ')}`);

      // Determine market type and period from market name
      let marketType = 'unknown';
      let period = 'fulltime';

      if (marketName.includes('h2h')) {
        marketType = '1x2';
      } else if (marketName.includes('spread')) {
        marketType = 'spreads';
      } else if (marketName.includes('total')) {
        marketType = 'totals';
      } else if (marketName.includes('team_totals')) {
        marketType = 'team_totals';
      } else if (marketName.toLowerCase().includes('corners')) {
        if (marketName.toLowerCase().includes('spread')) {
          marketType = 'spreads';
        } else {
          marketType = 'totals';
        }
      } else if (marketName.toLowerCase().includes('bookings')) {
        if (marketName.toLowerCase().includes('spread')) {
          marketType = 'spreads';
        } else {
          marketType = 'totals';
        }
      }

      if (marketName.includes('_h1') || marketName.toLowerCase().includes(' ht')) {
        period = 'p1';
      }

      for (const line of sortedLines) {
        const checkKey = `${marketName}:${line}`;

        if (existingSet.has(checkKey)) {
          console.log(`   ✓ Market "${marketName}:${line}" already exists`);
          continue;
        }

        // Create market
        const { data: newMarket, error: insertError } = await supabaseAdmin
          .from('markets_v2')
          .insert([{
            sport_id: sportId,
            oddsapi_key: marketName,
            market_type: marketType,
            period: period,
            handicap: line,
            active: true,
          }])
          .select('id')
          .single();

        if (insertError) {
          console.log(`   ❌ Error creating market: ${insertError.message}`);
          continue;
        }

        console.log(`   ✅ Created market "${marketName}:${line}"`);
        marketCount++;

        // Create outcomes
        const outcomeConfigs = [
          { name: '1', normalized_name: '1', display_name: 'Home' },
          { name: '2', normalized_name: '2', display_name: 'Away' },
          { name: 'X', normalized_name: 'X', display_name: 'Draw' },
          { name: 'OVER', normalized_name: 'OVER', display_name: 'Over' },
          { name: 'UNDER', normalized_name: 'UNDER', display_name: 'Under' },
        ];

        for (const outcomeConfig of outcomeConfigs) {
          // Only add relevant outcomes
          if (marketType === 'spreads' && !['1', '2'].includes(outcomeConfig.normalized_name)) {
            continue;
          }
          if (marketType === 'totals' && !['OVER', 'UNDER'].includes(outcomeConfig.normalized_name)) {
            continue;
          }
          if (marketType === 'team_totals' && !['OVER', 'UNDER'].includes(outcomeConfig.normalized_name)) {
            continue;
          }
          if (marketType === '1x2' && !['1', 'X', '2'].includes(outcomeConfig.normalized_name)) {
            continue;
          }

          const { error: outcomeError } = await supabaseAdmin
            .from('outcomes_v2')
            .insert([{
              market_id: newMarket.id,
              oddsapi_name: outcomeConfig.name,
              normalized_name: outcomeConfig.normalized_name,
              display_name: outcomeConfig.display_name,
            }]);

          if (outcomeError && !outcomeError.message.includes('duplicate')) {
            console.log(`   ⚠️  Error creating outcome: ${outcomeError.message}`);
          } else {
            outcomeCount++;
          }
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
