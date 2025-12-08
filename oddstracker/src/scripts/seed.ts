/**
 * Script d'initialisation de la base de données
 * Usage: npm run db:seed
 */

import 'dotenv/config';
import { prisma } from '../lib/db/prisma';
import { TARGET_SPORTS } from '../types';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Initialisation de la base de données...\n');

  // 1. Créer les settings
  console.log('⚙️  Création des paramètres...');
  const password = process.env.APP_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.settings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      passwordHash,
      apiRequestsMax: 200,
    },
  });
  console.log(`   ✅ Mot de passe configuré: ${password}`);

  // 2. Créer les sports et ligues
  console.log('\n🏆 Création des sports et ligues...');

  for (const sportConfig of TARGET_SPORTS) {
    const sport = await prisma.sport.upsert({
      where: { key: sportConfig.key },
      update: { name: sportConfig.name },
      create: { key: sportConfig.key, name: sportConfig.name },
    });

    console.log(`   📌 ${sport.name}`);

    for (const leagueConfig of sportConfig.leagues) {
      await prisma.league.upsert({
        where: { key: leagueConfig.key },
        update: { 
          name: leagueConfig.name,
          country: leagueConfig.country,
        },
        create: {
          key: leagueConfig.key,
          name: leagueConfig.name,
          country: leagueConfig.country,
          sportId: sport.id,
        },
      });
      console.log(`      └─ ${leagueConfig.name} (${leagueConfig.country})`);
    }
  }

  // 3. Résumé
  const stats = await prisma.$transaction([
    prisma.sport.count(),
    prisma.league.count(),
    prisma.fixture.count(),
    prisma.odds.count(),
  ]);

  console.log('\n' + '═'.repeat(40));
  console.log('📊 Base de données initialisée:');
  console.log('═'.repeat(40));
  console.log(`   Sports: ${stats[0]}`);
  console.log(`   Ligues: ${stats[1]}`);
  console.log(`   Matchs: ${stats[2]}`);
  console.log(`   Cotes:  ${stats[3]}`);
  console.log('═'.repeat(40));

  console.log('\n✅ Initialisation terminée!');
  console.log('\n📋 Prochaines étapes:');
  console.log('   npm run test:api    → Tester la connexion API');
  console.log('   npm run sync:daily  → Synchroniser les cotes');
  console.log('   npm run dev         → Lancer l\'application');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
