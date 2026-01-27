import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Same logic as queries-frontend.ts
function getMarketDisplayName(key: string): string {
  const names: Record<string, string> = {
    h2h: '1X2',
    spreads: 'Handicap',
    totals: 'Over/Under',
  };
  return names[key] || key;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const homeTeam = searchParams.get('team') || 'Everton';

  // Same query structure as queries-frontend.ts
  const { data: rawData, error } = await (supabaseAdmin as any)
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
        markets_variations,
        captured_at
      )
    `)
    .ilike('home_team', `%${homeTeam}%`)
    .eq('status', 'completed')
    .order('commence_time', { ascending: false })
    .limit(3);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Same transformation as queries-frontend.ts
  const transformedData = (rawData || []).map((event: any) => {
    const marketStates = event.market_states || [];
    const closingOddsData = Array.isArray(event.closing_odds) ? event.closing_odds[0] : event.closing_odds;

    const closingOdds = closingOddsData ? {
      markets: closingOddsData.markets,
      markets_variations: closingOddsData.markets_variations,
      captured_at: closingOddsData.captured_at
    } : null;

    // Same opening odds unfolding as queries-frontend.ts
    const openingOddsList: any[] = [];
    marketStates.forEach((ms: any) => {
      if (ms.status === 'captured' && ms.opening_odds_variations && ms.opening_odds_variations.length > 0) {
        ms.opening_odds_variations.forEach((variation: any) => {
          openingOddsList.push({
            market_key: ms.market_key,
            market_name: getMarketDisplayName(ms.market_key),
            odds: variation,
            captured_at: ms.opening_captured_at,
          });
        });
      } else if (ms.status === 'captured' && ms.opening_odds) {
        openingOddsList.push({
          market_key: ms.market_key,
          market_name: getMarketDisplayName(ms.market_key),
          odds: ms.opening_odds,
          captured_at: ms.opening_captured_at,
        });
      }
    });

    return {
      id: event.id,
      home_team: event.home_team,
      away_team: event.away_team,
      status: event.status,
      // Debug info
      raw_closing_odds_type: event.closing_odds ? (Array.isArray(event.closing_odds) ? 'array' : 'object') : 'null',
      raw_closing_odds_is_null: event.closing_odds === null,
      closingOddsData_is_null: closingOddsData === null,
      // Transformed data
      opening_odds_count: openingOddsList.length,
      opening_odds_h2h: openingOddsList.find(o => o.market_key === 'h2h'),
      closing_odds: closingOdds,
      closing_h2h_markets: closingOdds?.markets?.h2h || null,
      closing_h2h_variations: closingOdds?.markets_variations?.h2h || null,
    };
  });

  return NextResponse.json({
    query: `Same query as frontend for "${homeTeam}"`,
    count: transformedData.length,
    events: transformedData,
  });
}
