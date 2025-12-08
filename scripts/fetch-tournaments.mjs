import { config as loadEnv } from "dotenv";
import { promises as fs } from "fs";
import path from "path";

loadEnv({ path: ".env.local" });

const sportId = parseInt(process.argv[2] ?? "10", 10);
const baseUrl = process.env.ODDSPAPI_BASE_URL || "https://api.oddspapi.io";
const apiKey = process.env.ODDSPAPI_API_KEY;

if (!apiKey) {
  console.error("ODDSPAPI_API_KEY manquant");
  process.exit(1);
}

const url = new URL("/v4/tournaments", baseUrl);
url.searchParams.set("sportId", String(sportId));
url.searchParams.set("apiKey", apiKey);

const response = await fetch(url);
if (!response.ok) {
  const body = await response.text();
  console.error("Erreur API", response.status, body);
  process.exit(1);
}

const tournaments = await response.json();

if (!Array.isArray(tournaments) || !tournaments.length) {
  console.error("Aucun tournoi renvoyé");
  process.exit(1);
}

const grouped = new Map();

for (const tournament of tournaments) {
  if (!tournament?.tournamentId) continue;
  const country = tournament.categorySlug || "international";
  if (!grouped.has(country)) {
    grouped.set(country, []);
  }
  grouped.get(country).push(tournament);
}

const lines = [];
lines.push("");
lines.push(`### Mise à jour automatique - Sport ${sportId}`);
lines.push(`*(Généré le ${new Date().toISOString()})*`);
lines.push("");
lines.push("| Pays | ID | Tournoi | Matchs à venir |");
lines.push("|------|----|---------|----------------|");

Array.from(grouped.keys())
  .sort((a, b) => a.localeCompare(b))
  .forEach((country) => {
    const tourneys = grouped.get(country);
    tourneys
      .sort((a, b) => a.tournamentName.localeCompare(b.tournamentName))
      .forEach((tournament) => {
        const fixtures = (tournament.futureFixtures ?? 0) + (tournament.upcomingFixtures ?? 0);
        lines.push(
          `| ${country} | ${tournament.tournamentId} | ${tournament.tournamentName} | ${fixtures} |`
        );
      });
  });

lines.push("");

const filePath = path.join(process.cwd(), "TOURNAMENT_IDS.md");
await fs.appendFile(filePath, lines.join("\n"));

console.log(`✅ ${tournaments.length} tournois ajoutés à TOURNAMENT_IDS.md`);
