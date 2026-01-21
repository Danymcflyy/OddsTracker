/**
 * Add ALL known soccer leagues from The Odds API
 * Based on official documentation: https://the-odds-api.com/sports-odds-data/sports-apis.html
 *
 * This includes both active and off-season leagues so users can pre-select them
 */

import { supabaseAdmin } from '../lib/supabase/admin';

// Complete list of ALL soccer leagues from The Odds API documentation
const ALL_SOCCER_LEAGUES = [
  // Europe - Major Leagues
  { api_key: 'soccer_epl', title: 'EPL - England', description: 'English Premier League', sport_group: 'Soccer', active: true, has_outrights: true },
  { api_key: 'soccer_efl_champ', title: 'Championship - England', description: 'English Football League Championship', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_england_league1', title: 'League 1 - England', description: 'English Football League One', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_england_league2', title: 'League 2 - England', description: 'English Football League Two', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_fa_cup', title: 'FA Cup - England', description: 'Football Association Challenge Cup', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_england_efl_cup', title: 'EFL Cup - England', description: 'English Football League Cup', sport_group: 'Soccer', active: true, has_outrights: false },

  { api_key: 'soccer_spain_la_liga', title: 'La Liga - Spain', description: 'Spanish La Liga', sport_group: 'Soccer', active: true, has_outrights: true },
  { api_key: 'soccer_spain_segunda_division', title: 'La Liga 2 - Spain', description: 'Spanish Segunda Division', sport_group: 'Soccer', active: true, has_outrights: false },

  { api_key: 'soccer_germany_bundesliga', title: 'Bundesliga - Germany', description: 'German Bundesliga', sport_group: 'Soccer', active: true, has_outrights: true },
  { api_key: 'soccer_germany_bundesliga2', title: 'Bundesliga 2 - Germany', description: 'German 2. Bundesliga', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_germany_liga3', title: '3. Liga - Germany', description: 'German 3. Liga', sport_group: 'Soccer', active: true, has_outrights: false },

  { api_key: 'soccer_italy_serie_a', title: 'Serie A - Italy', description: 'Italian Serie A', sport_group: 'Soccer', active: true, has_outrights: true },
  { api_key: 'soccer_italy_serie_b', title: 'Serie B - Italy', description: 'Italian Serie B', sport_group: 'Soccer', active: true, has_outrights: false },

  { api_key: 'soccer_france_ligue_one', title: 'Ligue 1 - France', description: 'French Ligue 1', sport_group: 'Soccer', active: true, has_outrights: true },
  { api_key: 'soccer_france_ligue_two', title: 'Ligue 2 - France', description: 'French Ligue 2', sport_group: 'Soccer', active: true, has_outrights: false },

  // Europe - Other Countries
  { api_key: 'soccer_portugal_primeira_liga', title: 'Primeira Liga - Portugal', description: 'Portuguese Primeira Liga', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_netherlands_eredivisie', title: 'Eredivisie - Netherlands', description: 'Dutch Eredivisie', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_belgium_first_div', title: 'First Division A - Belgium', description: 'Belgian First Division A', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_turkey_super_league', title: 'Super Lig - Turkey', description: 'Turkish Super Lig', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_greece_super_league', title: 'Super League - Greece', description: 'Greek Super League', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_switzerland_superleague', title: 'Super League - Switzerland', description: 'Swiss Super League', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_austria_bundesliga', title: 'Bundesliga - Austria', description: 'Austrian Bundesliga', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_denmark_superliga', title: 'Superliga - Denmark', description: 'Danish Superliga', sport_group: 'Soccer', active: true, has_outrights: false },

  { api_key: 'soccer_spl', title: 'Premiership - Scotland', description: 'Scottish Premiership', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_league_of_ireland', title: 'League of Ireland', description: 'League of Ireland Premier Division', sport_group: 'Soccer', active: true, has_outrights: false },

  // Nordic Countries (often off-season)
  { api_key: 'soccer_sweden_allsvenskan', title: 'Allsvenskan - Sweden', description: 'Swedish Allsvenskan', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_sweden_superettan', title: 'Superettan - Sweden', description: 'Swedish Superettan (Division 2)', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_norway_eliteserien', title: 'Eliteserien - Norway', description: 'Norwegian Eliteserien', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_finland_veikkausliiga', title: 'Veikkausliiga - Finland', description: 'Finnish Veikkausliiga', sport_group: 'Soccer', active: false, has_outrights: false },

  // Eastern Europe
  { api_key: 'soccer_poland_ekstraklasa', title: 'Ekstraklasa - Poland', description: 'Polish Ekstraklasa', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_russia_premier_league', title: 'Premier League - Russia', description: 'Russian Premier League', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_czech_republic_synot_liga', title: 'Czech First League', description: 'Czech First League', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_romania_liga_1', title: 'Liga 1 - Romania', description: 'Romanian Liga 1', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_croatia_hnl', title: 'HNL - Croatia', description: 'Croatian First Football League', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_ukraine_premier_league', title: 'Premier League - Ukraine', description: 'Ukrainian Premier League', sport_group: 'Soccer', active: false, has_outrights: false },

  // International Competitions
  { api_key: 'soccer_uefa_champs_league', title: 'UEFA Champions League', description: 'UEFA Champions League', sport_group: 'Soccer', active: true, has_outrights: true },
  { api_key: 'soccer_uefa_europa_league', title: 'UEFA Europa League', description: 'UEFA Europa League', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_uefa_europa_conference_league', title: 'UEFA Conference League', description: 'UEFA Europa Conference League', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_uefa_nations_league', title: 'UEFA Nations League', description: 'UEFA Nations League', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_uefa_champs_league_women', title: 'UEFA Champions League Women', description: 'UEFA Women\'s Champions League', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_uefa_european_championship', title: 'UEFA European Championship', description: 'UEFA Euro', sport_group: 'Soccer', active: false, has_outrights: true },
  { api_key: 'soccer_uefa_european_championship_women', title: 'UEFA Euro Women', description: 'UEFA Women\'s European Championship', sport_group: 'Soccer', active: false, has_outrights: false },

  { api_key: 'soccer_fifa_world_cup', title: 'FIFA World Cup', description: 'FIFA World Cup', sport_group: 'Soccer', active: false, has_outrights: true },
  { api_key: 'soccer_fifa_world_cup_winner', title: 'FIFA World Cup Winner', description: 'FIFA World Cup Winner Outrights', sport_group: 'Soccer', active: false, has_outrights: true },
  { api_key: 'soccer_fifa_world_cup_women', title: 'FIFA World Cup Women', description: 'FIFA Women\'s World Cup', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_fifa_world_cup_qualifiers_europe', title: 'FIFA World Cup Qualifiers - Europe', description: 'FIFA World Cup European Qualifiers', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_fifa_world_cup_qualifiers_conmebol', title: 'FIFA World Cup Qualifiers - CONMEBOL', description: 'FIFA World Cup South American Qualifiers', sport_group: 'Soccer', active: false, has_outrights: false },

  // South America
  { api_key: 'soccer_brazil_campeonato', title: 'Brasileirão Série A', description: 'Brazilian Serie A', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_brazil_serie_b', title: 'Brasileirão Série B', description: 'Brazilian Serie B', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_argentina_primera_division', title: 'Primera División - Argentina', description: 'Argentine Primera Division', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_chile_campeonato', title: 'Primera División - Chile', description: 'Chilean Primera Division', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_colombia_primera_a', title: 'Primera A - Colombia', description: 'Colombian Primera A', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_uruguay_primera_division', title: 'Primera División - Uruguay', description: 'Uruguayan Primera Division', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_ecuador_primera_a', title: 'Serie A - Ecuador', description: 'Ecuadorian Serie A', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_conmebol_copa_libertadores', title: 'Copa Libertadores', description: 'CONMEBOL Copa Libertadores', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_conmebol_copa_sudamericana', title: 'Copa Sudamericana', description: 'CONMEBOL Copa Sudamericana', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_copa_america', title: 'Copa América', description: 'Copa América', sport_group: 'Soccer', active: false, has_outrights: false },

  // North & Central America
  { api_key: 'soccer_usa_mls', title: 'MLS - USA', description: 'Major League Soccer', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_mexico_ligamx', title: 'Liga MX - Mexico', description: 'Mexican Liga MX', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_conmebol_copa_america', title: 'CONCACAF Gold Cup', description: 'CONCACAF Gold Cup', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_concacaf_champions_league', title: 'CONCACAF Champions League', description: 'CONCACAF Champions League', sport_group: 'Soccer', active: false, has_outrights: false },

  // Asia & Oceania
  { api_key: 'soccer_australia_aleague', title: 'A-League - Australia', description: 'Australian A-League', sport_group: 'Soccer', active: true, has_outrights: false },
  { api_key: 'soccer_japan_j_league', title: 'J1 League - Japan', description: 'Japanese J1 League', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_japan_j_league_2', title: 'J2 League - Japan', description: 'Japanese J2 League', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_korea_k_league', title: 'K League 1 - South Korea', description: 'South Korean K League 1', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_china_superleague', title: 'Chinese Super League', description: 'Chinese Super League', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_saudi_arabia_pro_league', title: 'Saudi Pro League', description: 'Saudi Professional League', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_afc_asian_cup', title: 'AFC Asian Cup', description: 'AFC Asian Cup', sport_group: 'Soccer', active: false, has_outrights: false },

  // Africa
  { api_key: 'soccer_africa_cup_of_nations', title: 'Africa Cup of Nations', description: 'Africa Cup of Nations', sport_group: 'Soccer', active: false, has_outrights: false },
  { api_key: 'soccer_south_africa_premiership', title: 'Premiership - South Africa', description: 'South African Premier Division', sport_group: 'Soccer', active: false, has_outrights: false },
];

async function main() {
  console.log('⚽ Ajout de TOUS les championnats de football de The Odds API...\n');
  console.log(`📊 Total: ${ALL_SOCCER_LEAGUES.length} championnats\n`);

  let added = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const league of ALL_SOCCER_LEAGUES) {
    try {
      // Check if already exists
      const { data: existing } = await supabaseAdmin
        .from('sports')
        .select('id, active')
        .eq('api_key', league.api_key)
        .single();

      if (existing) {
        // Update if needed (in case we have better data)
        const { error: updateError } = await supabaseAdmin
          .from('sports')
          .update({
            title: league.title,
            description: league.description,
            sport_group: league.sport_group,
            has_outrights: league.has_outrights,
            // Don't update active status if it already exists
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour ${league.title}:`, updateError.message);
          errors++;
        } else {
          console.log(`🔄 Mis à jour: ${league.title}`);
          updated++;
        }
      } else {
        // Insert new league
        const { error: insertError } = await supabaseAdmin
          .from('sports')
          .insert(league);

        if (insertError) {
          console.error(`❌ Erreur ajout ${league.title}:`, insertError.message);
          errors++;
        } else {
          console.log(`✅ Ajouté: ${league.title}`);
          added++;
        }
      }
    } catch (err: any) {
      console.error(`❌ Erreur pour ${league.title}:`, err.message);
      errors++;
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📊 Résumé:');
  console.log(`   - Nouveaux championnats ajoutés: ${added}`);
  console.log(`   - Championnats mis à jour: ${updated}`);
  console.log(`   - Déjà existants (non modifiés): ${skipped}`);
  console.log(`   - Erreurs: ${errors}`);
  console.log(`   - Total traités: ${ALL_SOCCER_LEAGUES.length}`);
  console.log('═'.repeat(80));
  console.log('\n✅ Terminé!');
  console.log('   Tous les championnats de football sont maintenant disponibles dans l\'interface.');
  console.log('   Les championnats hors saison seront automatiquement activés quand leur saison reprendra.');
}

main();
