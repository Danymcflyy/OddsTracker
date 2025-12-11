/**
 * Cleanup script to remove old test data with NULL team IDs
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🧹 Cleaning up old test data...\n');

  try {
    // Delete odds for events without teams
    console.log('1️⃣  Deleting orphaned odds...');
    const { data: orphanedEvents } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id')
      .eq('sport_slug', 'football')
      .is('home_team_id', null);

    if (orphanedEvents && orphanedEvents.length > 0) {
      const eventIds = orphanedEvents.map(e => e.event_id);
      const { error: oddsError } = await supabaseAdmin
        .from('opening_closing_observed')
        .delete()
        .in('event_id', eventIds);

      if (oddsError) {
        console.log(`   ⚠️  Error deleting odds: ${oddsError.message}`);
      } else {
        console.log(`   ✅ Deleted ${orphanedEvents.length * 10} odds (approx)`);
      }
    }

    // Delete events without teams
    console.log('\n2️⃣  Deleting events without team data...');
    const { error: eventsError, count } = await supabaseAdmin
      .from('events_to_track')
      .delete()
      .eq('sport_slug', 'football')
      .is('home_team_id', null);

    if (eventsError) {
      console.log(`   ⚠️  Error deleting events: ${eventsError.message}`);
    } else {
      console.log(`   ✅ Deleted ${count} events\n`);
    }

    console.log('✅ Cleanup complete!\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
