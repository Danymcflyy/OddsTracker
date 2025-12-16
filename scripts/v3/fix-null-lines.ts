/**
 * Script de nettoyage - Remplacer line=NULL par line=0
 * Pour résoudre les conflits de duplicate key
 */

// Charger les variables d'environnement EN PREMIER
import './load-env';

import { supabaseAdmin } from '@/lib/db';

async function fixNullLines() {
  console.log('🔧 Nettoyage des valeurs line=NULL...\n');

  try {
    // Mettre à jour toutes les lignes avec line=NULL pour les mettre à 0
    const { data, error } = await supabaseAdmin
      .from('odds')
      .update({ line: 0 })
      .is('line', null);

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log('✅ Nettoyage terminé');
    console.log(`   Lignes mises à jour: ${data?.length || 'inconnu'}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

fixNullLines().catch(console.error);
