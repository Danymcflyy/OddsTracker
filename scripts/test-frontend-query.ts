import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Simuler la query frontend avec opening_odds_variations
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      market_states!left(
        id,
        market_key,
        status,
        opening_odds,
        opening_odds_variations,
        opening_captured_at
      ),
      closing_odds!left(
        markets,
        captured_at
      )
    `)
    .ilike('home_team', '%Lille%')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const event = events?.[0];
  if (!event) {
    console.log('No event found');
    return;
  }

  console.log(`=== ${event.home_team} vs ${event.away_team} ===\n`);

  // Transformer comme le frontend
  const openingOddsList: any[] = [];
  (event.market_states || []).forEach((ms: any) => {
    if (ms.status === 'captured' && ms.opening_odds_variations?.length > 0) {
      ms.opening_odds_variations.forEach((variation: any) => {
        openingOddsList.push({
          market_key: ms.market_key,
          odds: variation,
        });
      });
    } else if (ms.status === 'captured' && ms.opening_odds) {
      openingOddsList.push({
        market_key: ms.market_key,
        odds: ms.opening_odds,
      });
    }
  });

  console.log(`Total variations d'opening odds: ${openingOddsList.length}\n`);

  // Grouper par market_key pour affichage
  const byMarket: Record<string, any[]> = {};
  openingOddsList.forEach(o => {
    if (!byMarket[o.market_key]) byMarket[o.market_key] = [];
    byMarket[o.market_key].push(o.odds);
  });

  for (const [key, variations] of Object.entries(byMarket)) {
    console.log(`--- ${key}: ${variations.length} variation(s) ---`);
    variations.forEach((v, i) => {
      const point = v.point !== undefined ? ` (point: ${v.point})` : '';
      console.log(`  ${i + 1}. ${JSON.stringify(v)}${point}`);
    });
    console.log('');
  }
}

main().catch(console.error);
