import { supabaseAdmin } from '../lib/supabase/admin';

async function main() {
  console.log('\n📊 Vérification des Événements et Cotes\n');

  // 1. Count events
  const { data: events, error: eventsError } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('commence_time', { ascending: true });

  if (eventsError) {
    console.error('Erreur:', eventsError);
    return;
  }

  console.log(`✅ Total événements: ${events?.length || 0}`);

  // 2. Count market states
  const { data: marketStates, error: msError } = await supabaseAdmin
    .from('market_states')
    .select('status');

  if (msError) {
    console.error('Erreur market_states:', msError);
    return;
  }

  const statusCounts = marketStates?.reduce((acc: any, ms) => {
    acc[ms.status] = (acc[ms.status] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📋 Market States par statut:');
  console.log('  - Pending:', statusCounts?.pending || 0);
  console.log('  - Captured:', statusCounts?.captured || 0);
  console.log('  - Not Offered:', statusCounts?.not_offered || 0);

  // 3. Show upcoming events with opening odds
  const { data: eventsWithOdds, error: oddsError } = await supabaseAdmin
    .from('events')
    .select(`
      id,
      home_team,
      away_team,
      sport_key,
      commence_time,
      market_states!inner(
        market_key,
        status,
        opening_odds_variations
      )
    `)
    .eq('market_states.status', 'captured')
    .limit(5);

  if (oddsError) {
    console.error('Erreur events with odds:', oddsError);
  } else if (eventsWithOdds && eventsWithOdds.length > 0) {
    console.log('\n🎯 Exemples d\'événements avec cotes capturées:\n');
    eventsWithOdds.forEach((event: any) => {
      const commenceTime = new Date(event.commence_time).toLocaleString('fr-FR');
      console.log(`📅 ${event.home_team} vs ${event.away_team}`);
      console.log(`   ${event.sport_key} - ${commenceTime}`);

      if (event.market_states && event.market_states.length > 0) {
        console.log(`   Marchés capturés: ${event.market_states.length}`);
        event.market_states.slice(0, 3).forEach((ms: any) => {
          const variations = ms.opening_odds_variations?.length || 0;
          console.log(`     - ${ms.market_key} (${variations} variation(s))`);
        });
      }
      console.log('');
    });
  } else {
    console.log('\n⚠️  Aucun événement avec cotes capturées trouvé');
    console.log('   Exécutez: ./scripts/test-opening-odds.sh');
  }

  // 4. Show next events without odds
  const { data: pendingEvents } = await supabaseAdmin
    .from('events')
    .select(`
      home_team,
      away_team,
      sport_key,
      commence_time
    `)
    .gte('commence_time', new Date().toISOString())
    .order('commence_time', { ascending: true })
    .limit(5);

  if (pendingEvents && pendingEvents.length > 0) {
    console.log('\n📅 Prochains événements:\n');
    pendingEvents.forEach((event: any) => {
      const commenceTime = new Date(event.commence_time).toLocaleString('fr-FR');
      console.log(`   ${event.home_team} vs ${event.away_team} - ${commenceTime}`);
    });
  }

  console.log('\n═'.repeat(40));
}

main();
