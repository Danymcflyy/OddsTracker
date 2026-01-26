/**
 * Script pour appliquer la migration SQL optimize_search_events
 * et activer le paramètre use_sql_search
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('📦 Application de la migration optimize_search_events...\n');

  try {
    // Lire le fichier SQL
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20260126000000_optimize_search_events.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('✓ Fichier de migration chargé');

    // Exécuter le SQL via l'API Supabase
    // Note: Supabase JS ne supporte pas l'exécution directe de SQL complexe
    // On doit utiliser l'API REST directement
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    // Si l'endpoint exec_sql n'existe pas, on va essayer une autre approche
    if (response.status === 404) {
      console.log('⚠️  L\'endpoint exec_sql n\'est pas disponible');
      console.log('📝 Veuillez exécuter la migration manuellement dans le dashboard Supabase:\n');
      console.log('1. Allez sur https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new');
      console.log('2. Copiez et collez le contenu du fichier:');
      console.log('   supabase/migrations/20260126000000_optimize_search_events.sql');
      console.log('3. Cliquez sur "Run"\n');

      // Continuer quand même pour vérifier/activer use_sql_search
      await enableSqlSearch();
      return;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${error}`);
    }

    console.log('✓ Migration appliquée avec succès!\n');

    // Activer use_sql_search
    await enableSqlSearch();

  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error);
    console.log('\n📝 Vous devez exécuter la migration manuellement:');
    console.log('1. Allez sur https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new');
    console.log('2. Copiez et collez le contenu du fichier:');
    console.log('   supabase/migrations/20260126000000_optimize_search_events.sql');
    console.log('3. Cliquez sur "Run"\n');

    // Essayer quand même d'activer use_sql_search
    await enableSqlSearch();
  }
}

async function enableSqlSearch() {
  console.log('⚙️  Configuration du paramètre use_sql_search...\n');

  try {
    // Vérifier si le paramètre existe déjà
    const { data: existing, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'use_sql_search')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      console.log(`   Paramètre existant trouvé: ${existing.value}`);

      if (existing.value === true) {
        console.log('✓ use_sql_search est déjà activé!\n');
        return;
      }

      // Mettre à jour pour activer
      const { error: updateError } = await supabase
        .from('settings')
        .update({
          value: true,
          description: 'Use optimized PostgreSQL RPC function for advanced search (handles large databases)',
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'use_sql_search');

      if (updateError) throw updateError;

      console.log('✓ use_sql_search a été activé!\n');
    } else {
      // Créer le paramètre
      const { error: insertError } = await supabase
        .from('settings')
        .insert({
          key: 'use_sql_search',
          value: true,
          description: 'Use optimized PostgreSQL RPC function for advanced search (handles large databases)',
        });

      if (insertError) throw insertError;

      console.log('✓ use_sql_search a été créé et activé!\n');
    }

    console.log('🎉 Configuration terminée!');
    console.log('   La recherche avancée utilise maintenant la fonction SQL optimisée.');
    console.log('   Cela permettra de filtrer efficacement même avec des millions de matchs.\n');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration de use_sql_search:', error);
    console.log('\n📝 Vous pouvez le faire manuellement dans le dashboard Supabase:');
    console.log('1. Allez dans l\'éditeur SQL');
    console.log('2. Exécutez cette requête:\n');
    console.log(`INSERT INTO settings (key, value, description)`);
    console.log(`VALUES ('use_sql_search', 'true', 'Use optimized PostgreSQL RPC function for advanced search')`);
    console.log(`ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = NOW();\n`);
  }
}

// Exécuter le script
applyMigration().catch(console.error);
