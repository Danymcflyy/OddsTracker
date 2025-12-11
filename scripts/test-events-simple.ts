/**
 * Test /v3/events without dates
 */

import "./load-env";

async function main() {
  const apiKey = process.env.ODDS_API_IO_KEY;
  const baseUrl = process.env.ODDS_API_BASE_URL || "https://api2.odds-api.io";

  console.log("🔍 Testing /v3/events without dates\n");

  // Test 1: Just sport
  console.log("Test 1: Just sport\n");
  let url = `${baseUrl}/v3/events?sport=football&apiKey=${apiKey}`;
  console.log(`URL: ${url}\n`);
  let response = await fetch(url);
  console.log(`Status: ${response.status}\n`);

  // Test 2: Sport + league
  console.log("Test 2: Sport + league\n");
  url = `${baseUrl}/v3/events?sport=football&league=england-premier-league&apiKey=${apiKey}`;
  console.log(`URL: ${url}\n`);
  response = await fetch(url);
  console.log(`Status: ${response.status}`);
  const data = await response.json();
  console.log(`Events found: ${Array.isArray(data) ? data.length : 0}\n`);

  // Test 3: Sport + league + dates
  console.log("Test 3: Sport + league + from (Unix timestamp)\n");
  const fromTimestamp = Math.floor(Date.now() / 1000);
  url = `${baseUrl}/v3/events?sport=football&league=england-premier-league&from=${fromTimestamp}&apiKey=${apiKey}`;
  console.log(`URL: ${url}\n`);
  response = await fetch(url);
  console.log(`Status: ${response.status}\n`);

  // Test 4: Sport + league + from + to
  console.log("Test 4: Sport + league + from + to\n");
  const toTimestamp = Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000);
  url = `${baseUrl}/v3/events?sport=football&league=england-premier-league&from=${fromTimestamp}&to=${toTimestamp}&apiKey=${apiKey}`;
  console.log(`URL: ${url}\n`);
  response = await fetch(url);
  console.log(`Status: ${response.status}`);
  if (!response.ok) {
    const text = await response.text();
    console.log(`Error: ${text.substring(0, 200)}`);
  }
}

main().catch(console.error);
