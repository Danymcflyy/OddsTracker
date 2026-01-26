/**
 * Script pour activer le paramètre use_sql_search
 * Doit être exécuté après avoir appliqué la migration 20260126000000_optimize_search_events.sql
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes!');
  console.error('   Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableSqlSearch() {
  console.log('\n⚙️  Configuration de la recherche SQL optimisée...\n');

  try {
    // Vérifier si le paramètre existe déjà
    const { data: existing, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'use_sql_search')
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existing) {
      console.log(`   📊 Paramètre trouvé: use_sql_search = ${existing.value}`);

      if (existing.value === true) {
        console.log('   ✓ La recherche SQL optimisée est déjà activée!\n');
        return;
      }

      // Mettre à jour pour activer
      console.log('   🔄 Activation en cours...');
      const { error: updateError } = await supabase
        .from('settings')
        .update({
          value: true,
          description: 'Use optimized PostgreSQL RPC function for advanced search (handles large databases)',
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'use_sql_search');

      if (updateError) throw updateError;

      console.log('   ✓ use_sql_search activé avec succès!\n');
    } else {
      // Créer le paramètre
      console.log('   📝 Création du paramètre...');
      const { error: insertError } = await supabase
        .from('settings')
        .insert({
          key: 'use_sql_search',
          value: true,
          description: 'Use optimized PostgreSQL RPC function for advanced search (handles large databases)',
        });

      if (insertError) throw insertError;

      console.log('   ✓ use_sql_search créé et activé avec succès!\n');
    }

    console.log('🎉 Configuration terminée!\n');
    console.log('   La recherche avancée utilise maintenant la fonction SQL optimisée.');
    console.log('   Avantages:');
    console.log('   • Filtrage côté serveur (PostgreSQL)');
    console.log('   • Performance optimale même avec des millions de matchs');
    console.log('   • Indexes utilisés pour accélérer les requêtes');
    console.log('   • Support complet du paramètre oddsType (opening/closing/both)\n');

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message || error);
    console.log('\n📝 Vous pouvez activer manuellement dans Supabase:');
    console.log('\n1. Ouvrez le SQL Editor: https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new');
    console.log('\n2. Exécutez cette requête:\n');
    console.log('   INSERT INTO settings (key, value, description)');
    console.log('   VALUES (\'use_sql_search\', \'true\', \'Use optimized PostgreSQL RPC for search\')');
    console.log('   ON CONFLICT (key) DO UPDATE SET');
    console.log('     value = \'true\',');
    console.log('     description = \'Use optimized PostgreSQL RPC for search\',');
    console.log('     updated_at = NOW();\n');
    process.exit(1);
  }
}

// Exécuter
enableSqlSearch()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
