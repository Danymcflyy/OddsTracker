import { getTheOddsApiClient } from '../lib/api/theoddsapi';

async function main() {
  const client = getTheOddsApiClient();

  try {
    console.log('🔍 Récupération de TOUS les sports depuis The Odds API...\n');
    const response = await client.getSports();
    const sports = response.data;

    console.log(`📊 Total de sports disponibles: ${sports.length}\n`);

    // Filtrer les sports de football/soccer
    const soccerSports = sports.filter((sport: any) =>
      sport.group === 'Soccer' ||
      sport.key.includes('soccer') ||
      sport.key.includes('football')
    );

    console.log(`⚽ Sports de football trouvés: ${soccerSports.length}\n`);

    // Rechercher spécifiquement la Suède et la Finlande
    const sweden = sports.filter((s: any) =>
      s.title.toLowerCase().includes('sweden') ||
      s.title.toLowerCase().includes('suède') ||
      s.title.toLowerCase().includes('allsvenskan')
    );

    const finland = sports.filter((s: any) =>
      s.title.toLowerCase().includes('finland') ||
      s.title.toLowerCase().includes('finlande') ||
      s.title.toLowerCase().includes('veikkausliiga')
    );

    console.log('🇸🇪 Sports de Suède trouvés:');
    if (sweden.length > 0) {
      sweden.forEach((s: any) => {
        console.log(`  - ${s.title} (${s.key}) - Group: ${s.group} - Active: ${s.active}`);
      });
    } else {
      console.log('  ❌ Aucun sport de Suède trouvé');
    }

    console.log('\n🇫🇮 Sports de Finlande trouvés:');
    if (finland.length > 0) {
      finland.forEach((s: any) => {
        console.log(`  - ${s.title} (${s.key}) - Group: ${s.group} - Active: ${s.active}`);
      });
    } else {
      console.log('  ❌ Aucun sport de Finlande trouvé');
    }

    // Afficher TOUS les sports de football disponibles
    console.log('\n📋 Liste COMPLÈTE des sports de football:');
    console.log('═'.repeat(80));

    const grouped = soccerSports.reduce((acc: any, sport: any) => {
      if (!acc[sport.group]) acc[sport.group] = [];
      acc[sport.group].push(sport);
      return acc;
    }, {});

    for (const [group, sportList] of Object.entries(grouped)) {
      console.log(`\n${group}:`);
      (sportList as any[]).forEach((s: any) => {
        const title = s.title.padEnd(50);
        console.log(`  - ${title} [${s.key}] Active: ${s.active}`);
      });
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  }
}

main();
