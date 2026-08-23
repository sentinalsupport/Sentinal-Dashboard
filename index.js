#!/usr/bin/env node
// Main entry for Render — starts both dashboard (Next.js) and bot (discord.js)
// For backwards compatibility with old dashboard.js expectation
console.log("Starting Sentinal — Dashboard + Bot");
import { spawn } from "child_process";
const isProd = process.env.NODE_ENV === "production";

// Start Next.js dashboard on PORT
const dashboard = spawn("pnpm", ["--filter", "dashboard", "start"], { stdio: "inherit", env: process.env, shell: true });
dashboard.on("error", e=> console.error("dashboard spawn error", e));

// Start bot if token present
if (process.env.DISCORD_BOT_TOKEN) {
  const bot = spawn("pnpm", ["--filter", "bot", "start"], { stdio: "inherit", env: process.env, shell: true });
  bot.on("error", e=> console.error("bot spawn error", e));
} else {
  console.warn("DISCORD_BOT_TOKEN not set — bot not started");
}
