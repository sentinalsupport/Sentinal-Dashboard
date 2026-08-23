# Sentinal Bot — Wispbyte Deployment

**Startup file:** `index.js` (Pterodactyl → Startup → `node index.js`)

**Install:**
1. Upload this `wispbyte` folder contents to Wispbyte File Manager (root of server)
2. In Wispbyte Console:
```
npm install
npx prisma generate --schema=./prisma/schema.prisma
npm start
# or node index.js
```

**Env:** Set in Wispbyte Panel → Startup Variables or `.env`:
- `DISCORD_BOT_TOKEN` (required)
- `DISCORD_APPLICATION_ID=1493217033956102215`
- `DATABASE_URL` — use **External** URL from Render Postgres (not localhost): `postgresql://sentinal_db_user:gjvngzuze0oCQItRkzA3kuGLzTRsA6Ke@dpg-da5d27mk1f9s738a77sg-a.oregon-postgres.render.com/sentinal_db`
- Dashboard is on `https://sentinal-f9vz.onrender.com` — shares same DB, so dashboard settings (welcome, automod, tickets, etc.) work live with this bot.

**Features in this bot (53 slash commands + events):**
Moderation: ban/unban/kick/timeout/warn/warnings/clear/purge/slowmode/lock/unlock/lockall/unlockall/nick/softban
General: ping/help/about/botinfo/serverinfo/userinfo/avatar/banner/roleinfo/channelinfo/uptime/stats
Utility: announce/embed/poll/remind/afk/snipe/editsnipe
Tickets: ticket/ticketpanel/close/add/remove/claim/transcript (buttons)
Config: settings/config/setwelcome/setgoodbye/setautorole/setlogs/setmodlogs/setverification
Leveling: level/rank/leaderboard + XP, automod, reaction roles, giveaways, welcome/goodbye, autorole, logging, etc.

Logs: `✅ Logged in as Sentinal#xxxx — Guilds: X`
