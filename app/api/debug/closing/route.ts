import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const homeTeam = searchParams.get('team') || 'Everton';

  const { data, error } = await (supabaseAdmin as any)
    .from('events')
    .select(`
      id,
      home_team,
      away_team,
      status,
      commence_time,
      closing_odds(
        markets,
        markets_variations,
        captured_at
      )
    `)
    .ilike('home_team', `%${homeTeam}%`)
    .eq('status', 'completed')
    .order('commence_time', { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    query: `homeTeam contains "${homeTeam}"`,
    count: data?.length || 0,
    events: data?.map((e: any) => ({
      home_team: e.home_team,
      away_team: e.away_team,
      status: e.status,
      has_closing_odds: !!e.closing_odds,
      closing_odds_type: e.closing_odds ? (Array.isArray(e.closing_odds) ? 'array' : 'object') : 'null',
      closing_markets: e.closing_odds?.markets ? Object.keys(e.closing_odds.markets) : [],
      h2h_closing: e.closing_odds?.markets?.h2h || null,
      has_markets_variations: !!e.closing_odds?.markets_variations,
      h2h_variations: e.closing_odds?.markets_variations?.h2h || null,
    })),
  });
}
