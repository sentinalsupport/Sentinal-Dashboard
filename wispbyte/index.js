// Startup file for Wispbyte (Pterodactyl) — Node.js
// Main entry: node index.js
// This is the fully working Discord bot with everything
require('dotenv').config();
console.log("Sentinal Bot — Starting...");

// Ensure required env
if (!process.env.DISCORD_BOT_TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN not set in .env / Panel Variables");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL not set — bot will run but DB features (welcome, automod, leveling) disabled");
}

// Load the compiled bot (all 53 commands, events, automod, tickets, leveling, etc.)
require('./dist/index.js');

console.log("✅ Bot index.js loaded — check logs for 'Logged in as ...'");
