/**
 * List Available Bookmakers
 * Récupère la liste des bookmakers disponibles sur l'API
 */

import "./load-env";

async function main() {
  const apiKey = process.env.ODDS_API_IO_KEY;
  const baseUrl = process.env.ODDS_API_BASE_URL || "https://api2.odds-api.io";

  console.log("📚 Fetching available bookmakers...\n");

  const url = `${baseUrl}/v3/bookmakers?apiKey=${apiKey}`;
  console.log(`URL: ${url}\n`);

  try {
    const response = await fetch(url);
    const text = await response.text();

    console.log(`Status: ${response.status}`);
    console.log("");

    if (!response.ok) {
      console.error("❌ Error:");
      console.error(text);
      process.exit(1);
    }

    const data = JSON.parse(text);

    console.log("📖 Available bookmakers:\n");

    if (Array.isArray(data)) {
      data.forEach((bookmaker: any, index: number) => {
        console.log(`${index + 1}. ${bookmaker.name || bookmaker}`);
        if (typeof bookmaker === 'object') {
          console.log(`   Key: ${bookmaker.key || bookmaker.slug || 'N/A'}`);
        }
      });
    } else if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]: [string, any], index: number) => {
        console.log(`${index + 1}. ${typeof value === 'string' ? value : value.name || key}`);
        if (typeof value === 'object') {
          console.log(`   Details:`, JSON.stringify(value));
        }
      });
    }

    console.log("\n" + JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
