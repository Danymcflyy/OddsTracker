import { supabaseAdmin } from '../lib/supabase/admin';

async function main() {
  console.log('\n🔍 DEBUG: Analyse des Cotes Stockées\n');

  // Get one event with captured market_states
  const { data: marketStates } = await supabaseAdmin
    .from('market_states')
    .select(`
      event_id,
      market_key,
      opening_odds,
      opening_odds_variations,
      events(
        id,
        home_team,
        away_team
      )
    `)
    .eq('status', 'captured')
    .not('opening_odds_variations', 'is', null)
    .order('opening_captured_at', { ascending: false })
    .limit(6);

  if (!marketStates || marketStates.length === 0) {
    console.log('❌ Aucun marché capturé trouvé');
    return;
  }

  const firstMarket = marketStates[0] as any;
  const eventData = firstMarket.events;

  // Group by event
  const byEvent = new Map<string, any[]>();
  for (const ms of marketStates as any[]) {
    if (!byEvent.has(ms.event_id)) {
      byEvent.set(ms.event_id, []);
    }
    byEvent.get(ms.event_id)!.push(ms);
  }

  const [[eventId, markets]] = Array.from(byEvent.entries()).slice(0, 1);
  const event = (markets[0] as any).events;

  const { data: events, error } = { data: [{ ...event, market_states: markets }], error: null };

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  if (!events || events.length === 0) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  const eventToDisplay = events[0] as any;
  console.log(`📅 Événement: ${eventToDisplay.home_team} vs ${eventToDisplay.away_team}\n`);

  console.log('=' .repeat(80));
  console.log('DONNÉES BRUTES EN BASE DE DONNÉES');
  console.log('='.repeat(80));

  eventToDisplay.market_states.forEach((ms: any) => {
    console.log(`\n📊 Marché: ${ms.market_key}`);
    console.log('─'.repeat(80));

    // opening_odds (single value - backward compatibility)
    if (ms.opening_odds) {
      console.log('opening_odds (champ unique):');
      console.log(JSON.stringify(ms.opening_odds, null, 2));
    }

    // opening_odds_variations (array)
    if (ms.opening_odds_variations && ms.opening_odds_variations.length > 0) {
      console.log(`\nopening_odds_variations (${ms.opening_odds_variations.length} variation(s)):`);
      ms.opening_odds_variations.forEach((variation: any, index: number) => {
        console.log(`\n  Variation ${index + 1}:`);
        console.log('  ' + JSON.stringify(variation, null, 2).split('\n').join('\n  '));
      });
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('ANALYSE');
  console.log('='.repeat(80) + '\n');

  // Count variations by market
  const variationCounts: any = {};
  const allPoints: any = {};

  eventToDisplay.market_states.forEach((ms: any) => {
    if (ms.opening_odds_variations && ms.opening_odds_variations.length > 0) {
      variationCounts[ms.market_key] = ms.opening_odds_variations.length;

      // Extract all unique point values
      const points = ms.opening_odds_variations
        .map((v: any) => v.point)
        .filter((p: any) => p !== undefined && p !== null);

      if (points.length > 0) {
        allPoints[ms.market_key] = [...new Set(points)];
      }
    }
  });

  console.log('Nombre de variations par marché:');
  Object.entries(variationCounts).forEach(([market, count]) => {
    console.log(`  - ${market}: ${count} variation(s)`);
  });

  console.log('\nValeurs de points uniques par marché:');
  Object.entries(allPoints).forEach(([market, points]) => {
    console.log(`  - ${market}: ${(points as any[]).join(', ')}`);
  });

  console.log('\n' + '='.repeat(80));
}

main();
