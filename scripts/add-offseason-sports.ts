/**
 * Add off-season sports to the database
 * These are leagues that exist in The Odds API but are currently not returned
 * because they are out of season. We add them manually so users can pre-select them.
 */

import { supabaseAdmin } from '../lib/supabase/admin';

// Known soccer leagues from The Odds API documentation
// that may not be returned during off-season
const OFF_SEASON_LEAGUES = [
  // Nordic leagues (typically March-November)
  {
    api_key: 'soccer_sweden_allsvenskan',
    title: 'Allsvenskan - Sweden',
    description: 'Top division of Swedish football',
    sport_group: 'Soccer',
    active: false, // Not active now, but will be when season starts
    has_outrights: false,
  },
  {
    api_key: 'soccer_sweden_superettan',
    title: 'Superettan - Sweden',
    description: 'Second division of Swedish football',
    sport_group: 'Soccer',
    active: false,
    has_outrights: false,
  },
  {
    api_key: 'soccer_finland_veikkausliiga',
    title: 'Veikkausliiga - Finland',
    description: 'Top division of Finnish football',
    sport_group: 'Soccer',
    active: false,
    has_outrights: false,
  },
  {
    api_key: 'soccer_norway_eliteserien',
    title: 'Eliteserien - Norway',
    description: 'Top division of Norwegian football',
    sport_group: 'Soccer',
    active: false,
    has_outrights: false,
  },

  // Other leagues that might be off-season
  {
    api_key: 'soccer_usa_mls',
    title: 'MLS - USA',
    description: 'Major League Soccer',
    sport_group: 'Soccer',
    active: false,
    has_outrights: false,
  },
  {
    api_key: 'soccer_japan_j_league',
    title: 'J1 League - Japan',
    description: 'Top division of Japanese football',
    sport_group: 'Soccer',
    active: false,
    has_outrights: false,
  },
  {
    api_key: 'soccer_korea_k_league',
    title: 'K League 1 - South Korea',
    description: 'Top division of South Korean football',
    sport_group: 'Soccer',
    active: false,
    has_outrights: false,
  },
  {
    api_key: 'soccer_china_superleague',
    title: 'Chinese Super League',
    description: 'Top division of Chinese football',
    sport_group: 'Soccer',
    active: false,
    has_outrights: false,
  },

  // Additional European leagues
  {
    api_key: 'soccer_poland_ekstraklasa',
    title: 'Ekstraklasa - Poland',
    description: 'Top division of Polish football',
    sport_group: 'Soccer',
    active: false,
    has_outrights: false,
  },
  {
    api_key: 'soccer_russia_premier_league',
    title: 'Premier League - Russia',
    description: 'Top division of Russian football',
    sport_group: 'Soccer',
    active: false,
    has_outrights: false,
  },
];

async function main() {
  console.log('🏆 Ajout des championnats hors saison...\n');

  let added = 0;
  let skipped = 0;

  for (const league of OFF_SEASON_LEAGUES) {
    try {
      // Check if already exists
      const { data: existing } = await supabaseAdmin
        .from('sports')
        .select('id')
        .eq('api_key', league.api_key)
        .single();

      if (existing) {
        console.log(`⏭️  Déjà existant: ${league.title}`);
        skipped++;
        continue;
      }

      // Insert the league
      const { error } = await supabaseAdmin
        .from('sports')
        .insert(league);

      if (error) {
        console.error(`❌ Erreur pour ${league.title}:`, error.message);
      } else {
        console.log(`✅ Ajouté: ${league.title}`);
        added++;
      }
    } catch (err: any) {
      console.error(`❌ Erreur pour ${league.title}:`, err.message);
    }
  }

  console.log('\n═'.repeat(40));
  console.log(`📊 Résumé:`);
  console.log(`   - Ajoutés: ${added}`);
  console.log(`   - Déjà existants: ${skipped}`);
  console.log(`   - Total traités: ${OFF_SEASON_LEAGUES.length}`);
  console.log('═'.repeat(40));
  console.log('\n✅ Terminé! Ces championnats sont maintenant sélectionnables dans l\'interface.');
  console.log('   Quand la saison reprendra, ils seront automatiquement activés par la sync.');
}

main();
