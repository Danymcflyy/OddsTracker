import { supabaseAdmin } from '../lib/supabase/admin';

async function main() {
  console.log('\n🔄 Réinitialisation d\'un événement pour test\n');

  // Find one event with captured markets
  const { data: events } = await supabaseAdmin
    .from('events')
    .select(`
      id,
      home_team,
      away_team,
      market_states!inner(
        id,
        market_key,
        status
      )
    `)
    .eq('market_states.status', 'captured')
    .limit(1);

  if (!events || events.length === 0) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  const event = events[0] as any;
  console.log(`📅 Événement: ${event.home_team} vs ${event.away_team}`);
  console.log(`   Event ID: ${event.id}`);
  console.log(`   Market states: ${event.market_states.length}\n`);

  // Reset market_states to pending
  for (const ms of event.market_states) {
    await supabaseAdmin
      .from('market_states')
      .update({
        status: 'pending',
        opening_odds: null,
        opening_odds_variations: null,
        opening_captured_at: null,
        opening_bookmaker_update: null,
        attempts: 0,
        last_attempt_at: null,
      } as any)
      .eq('id', ms.id);
  }

  console.log('✅ Market states réinitialisés en "pending"');
  console.log(`   Vous pouvez maintenant tester le scan:\n`);
  console.log(`   npx tsx scripts/test-full-scan.ts`);
}

main();
