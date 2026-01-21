import { supabaseAdmin } from '../lib/supabase/admin';

async function main() {
  const { data: sports, error } = await supabaseAdmin
    .from('sports')
    .select('*')
    .order('title');

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  console.log(`\n📊 Total de sports dans la base: ${sports?.length || 0}\n`);

  // Chercher spécifiquement la Suède et la Finlande
  const sweden = sports?.filter(s => s.title.includes('Sweden') || s.title.includes('Allsvenskan') || s.title.includes('Superettan'));
  const finland = sports?.filter(s => s.title.includes('Finland') || s.title.includes('Veikkausliiga'));

  console.log('🇸🇪 Suède:');
  sweden?.forEach(s => console.log(`  - ${s.title} (${s.api_key})`));

  console.log('\n🇫🇮 Finlande:');
  finland?.forEach(s => console.log(`  - ${s.title} (${s.api_key})`));

  console.log('\n📋 Tous les championnats de football (Soccer):');
  const soccerSports = sports?.filter(s => s.sport_group === 'Soccer');
  console.log(`Total football: ${soccerSports?.length || 0}\n`);
  soccerSports?.forEach(s => console.log(`  - ${s.title}`));
}

main();
