import { supabaseAdmin } from '../lib/supabase/admin';

async function main() {
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('*');

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  console.log(`\n👥 Utilisateurs dans la base: ${users?.length || 0}\n`);

  users?.forEach(u => {
    console.log(`  - ${u.username} (ID: ${u.id})`);
  });

  if (!users || users.length === 0) {
    console.log('\n⚠️  Aucun utilisateur trouvé!');
    console.log('   Vous devez créer un utilisateur pour vous connecter.');
  }
}

main();
