// Startup for Wispbyte - Node.js - ES module
import 'dotenv/config';
console.log("Sentinal Bot - Starting...");
if (!process.env.DISCORD_BOT_TOKEN) {
  console.error("DISCORD_BOT_TOKEN not set");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set - DB features disabled");
}
await import('./dist/index.js');
console.log("Bot index.js loaded - check logs for Logged in as ...");
