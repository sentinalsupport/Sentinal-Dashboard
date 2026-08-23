import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";
const token = process.env.DISCORD_BOT_TOKEN!;
const appId = process.env.DISCORD_APPLICATION_ID!;
if(!token || !appId){ console.error("Missing token/appId"); process.exit(1); }
const rest = new REST({version:"10"}).setToken(token);
const body = commands.map(c=> c.data.toJSON());
console.log("Deploying", body.length, "commands...");
await rest.put(Routes.applicationCommands(appId), { body });
console.log("✅ Deployed global commands");
// also try guild commands if GUILD_ID provided
if(process.env.DISCORD_GUILD_ID){
  await rest.put(Routes.applicationGuildCommands(appId, process.env.DISCORD_GUILD_ID), { body });
  console.log("✅ Deployed guild commands");
}
