
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Investigation des matchs avec cotes manquantes...\n');

  // 1. Dunkerque vs Annecy (Ligue 2)
  console.log('--- Cas 1: USL Dunkerque vs Annecy FC (Manque Closing) ---');
  const { data: events1, error: err1 } = await supabase
    .from('events')
    .select('id, home_team, away_team, commence_time, status, closing_odds(*)')
    .ilike('home_team', '%Dunkerque%');

  if (err1) console.error('Erreur:', err1.message);
  else if (events1 && events1.length > 0) {
      for (const event1 of events1) {
        console.log(`\nMatch: ${event1.home_team} vs ${event1.away_team}`);
        console.log(`ID: ${event1.id}`);
        console.log(`Status: ${event1.status}`);
        console.log(`Commence: ${event1.commence_time}`);
        console.log(`Closing Odds:`, event1.closing_odds && event1.closing_odds.length > 0 ? '✅ Présent' : '❌ MANQUANT');
        
        // Check Snapshots history
        const { data: snaps } = await supabase
            .from('closing_odds_snapshots')
            .select('captured_at, minutes_before_kickoff')
            .eq('event_id', event1.id)
            .order('captured_at', { ascending: true });
            
        console.log(`Snapshots (${snaps?.length || 0}):`);
        snaps?.forEach(s => console.log(`   - M${s.minutes_before_kickoff} (${s.captured_at})`));
      }
  } else {
      console.log('Match non trouvé en DB.');
  }

  console.log('\n------------------------------------------------\n');

  // 3. Bayern vs Hoffenheim (REMPLACE KOLN)
  console.log('--- Cas 3: Bayern Munich vs TSG Hoffenheim (Manque Opening) ---');
  const { data: event3 } = await supabase
    .from('events')
    .select('id, api_event_id, sport_key, home_team, away_team, commence_time')
    .ilike('home_team', '%Bayern%')
    .ilike('away_team', '%Hoffenheim%')
    .single();

  if (event3) {
      console.log(`Match: ${event3.home_team} vs ${event3.away_team}`);
      console.log(`ID: ${event3.id}`);
      
      // Check Market States
      const { data: markets } = await supabase
        .from('market_states')
        .select('market_key, status, attempts, last_attempt_at')
        .eq('event_id', event3.id);
        
      console.log(`Market States (${markets?.length || 0}):`);
      markets?.forEach(m => {
          let icon = '❓';
          if (m.status === 'captured') icon = '✅';
          if (m.status === 'pending') icon = '⏳';
          if (m.status === 'not_offered') icon = '❌';
          console.log(`   ${icon} ${m.market_key}: ${m.status} (Attempts: ${m.attempts}, Last: ${m.last_attempt_at})`);
      });

      // Simuler le scan
      console.log('\n🔍 TEST DE SCAN MANUEL SUR CE MATCH :');
      try {
        const { scanEventOpeningOdds } = await import('../lib/services/theoddsapi/opening-odds');
        const { data: pendingMarkets } = await supabase
            .from('market_states')
            .select('*')
            .eq('event_id', event3.id)
            .eq('status', 'pending');
            
        if (pendingMarkets && pendingMarkets.length > 0) {
            console.log(`Tentative de scan sur ${pendingMarkets.length} marchés...`);
            const result = await scanEventOpeningOdds(
                event3.api_event_id,
                event3.id,
                event3.sport_key,
                pendingMarkets
            );
            console.log(`✅ Scan terminé. Capturés: ${result.captured}, Crédits: ${result.creditsUsed}`);
        } else {
            console.log('Aucun marché pending à scanner.');
        }
      } catch (e: any) {
          console.log(`❌ Erreur durant le scan: ${e.message}`);
      }

  } else {
      console.log('Match Bayern non trouvé en DB.');
  }
}

run();
