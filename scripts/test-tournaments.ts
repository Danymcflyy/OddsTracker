import "./load-env";

import { oddsPapiClient } from "@/lib/api/oddspapi";
import { loadOddsApiKey } from "@/lib/settings/odds-api-key";

/**
 * Script de test pour lister les tournois disponibles
 * Usage: npm run test:tournaments -- --sport=10 [--country=england] [--search=premier]
 */

interface CliOptions {
  sportId: number;
  countrySlug?: string;
  search?: string;
}

async function run() {
  const storedKey = await loadOddsApiKey();
  oddsPapiClient.setApiKey(storedKey);

  const options = parseArgs();

  const filters = [];
  if (options.countrySlug) filters.push(`pays=${options.countrySlug}`);
  if (options.search) filters.push(`recherche="${options.search}"`);

  console.log(`🏟️  Récupération des tournois pour sport=${options.sportId}${filters.length ? ` • ${filters.join(' • ')}` : ''}`);

  try {
    const tournaments = await oddsPapiClient.getTournaments(options.sportId);

    console.log(`\n📊 ${tournaments.length} tournois trouvés\n`);

    // Filtrer les tournois avec name défini
    let validTournaments = tournaments.filter(t => t?.tournamentName);

    // Filtrer par pays si spécifié (côté client car l'API ne le supporte pas)
    if (options.countrySlug) {
      validTournaments = validTournaments.filter(t =>
        t.categorySlug.toLowerCase() === options.countrySlug!.toLowerCase()
      );
    }

    // Filtrer par recherche si spécifié
    if (options.search) {
      validTournaments = validTournaments.filter(t =>
        t.tournamentName.toLowerCase().includes(options.search!.toLowerCase())
      );
    }

    console.log(`✅ ${validTournaments.length} tournois après filtrage\n`);

    const byCountry = new Map<string, typeof validTournaments>();

    validTournaments.forEach(t => {
      const country = t.categorySlug || 'international';
      if (!byCountry.has(country)) {
        byCountry.set(country, []);
      }
      byCountry.get(country)!.push(t);
    });

    // Afficher par pays
    Array.from(byCountry.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([country, tourneys]) => {
        console.log(`\n🌍 ${country.toUpperCase()}`);
        tourneys.forEach(t => {
          const fixtures = t.futureFixtures + t.upcomingFixtures;
          console.log(`   • ID ${t.tournamentId.toString().padStart(6)} - ${t.tournamentName} (${fixtures} matchs à venir)`);
        });
      });

    // Afficher un exemple de commande pour importer
    if (validTournaments.length > 0) {
      const example = validTournaments.find(t =>
        t.tournamentName.toLowerCase().includes('premier') ||
        t.tournamentName.toLowerCase().includes('ligue 1')
      ) || validTournaments[0];

      console.log(`\n💡 Exemple de commande pour importer les matchs de "${example.tournamentName}" :`);
      console.log(`   npm run manual:oddspapi -- --sport=${options.sportId} --tournament=${example.tournamentId} --days=3 --limit=5`);
    }

    // Warnings pour les tournois sans nom
    const invalidCount = tournaments.length - validTournaments.length;
    if (invalidCount > 0) {
      console.log(`\n⚠️  ${invalidCount} tournois ignorés (sans nom)`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tournois:', error);
    throw error;
  }
}

function parseArgs(): CliOptions {
  const params = new URLSearchParams();
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value = ""] = arg.replace(/^--/, "").split("=");
      params.set(key, value);
    }
  });

  const sportId = parseInt(params.get("sport") ?? "10", 10);
  const countrySlug = params.get("country") || undefined;
  const search = params.get("search") || undefined;

  return { sportId, countrySlug, search };
}

run().catch((error) => {
  console.error("💥 Échec du test", error);
  process.exit(1);
});
