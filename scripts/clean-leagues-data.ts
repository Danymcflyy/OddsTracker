/**
 * Clean Leagues Data
 *
 * Supprime toutes les données (events + odds) pour les deux ligues
 * de test: Premier League et Ligue 1
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🗑️  Cleaning Leagues Data\n');

  try {
    // Get event IDs for both leagues
    const { data: premierLeagueEvents, error: plError } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id')
      .eq('sport_slug', 'football')
      .eq('league_slug', 'england-premier-league');

    const { data: ligue1Events, error: l1Error } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id')
      .eq('sport_slug', 'football')
      .eq('league_slug', 'france-ligue-1');

    if (plError || l1Error) {
      throw new Error(`Error fetching events: ${plError?.message} ${l1Error?.message}`);
    }

    const allEventIds = [
      ...(premierLeagueEvents?.map(e => e.event_id) || []),
      ...(ligue1Events?.map(e => e.event_id) || []),
    ];

    console.log(`Found ${allEventIds.length} events to delete`);
    console.log(`  - Premier League: ${premierLeagueEvents?.length || 0}`);
    console.log(`  - Ligue 1: ${ligue1Events?.length || 0}\n`);

    if (allEventIds.length === 0) {
      console.log('✅ No events to delete\n');
      return;
    }

    // Delete odds first (foreign key constraint)
    console.log('Deleting odds...');
    const { error: deleteOddsError } = await supabaseAdmin
      .from('opening_closing_observed')
      .delete()
      .in('event_id', allEventIds);

    if (deleteOddsError) {
      throw new Error(`Failed to delete odds: ${deleteOddsError.message}`);
    }

    console.log(`✅ Deleted odds\n`);

    // Delete events
    console.log('Deleting events...');
    const { error: deleteEventsError } = await supabaseAdmin
      .from('events_to_track')
      .delete()
      .in('event_id', allEventIds);

    if (deleteEventsError) {
      throw new Error(`Failed to delete events: ${deleteEventsError.message}`);
    }

    console.log(`✅ Deleted events\n`);

    console.log('='.repeat(60));
    console.log(`✅ Cleaned ${allEventIds.length} events and their odds\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
