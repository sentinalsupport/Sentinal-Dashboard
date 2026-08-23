# Deploy to Render

1. Push this repo to GitHub (ensure `.env` is gitignored).
2. Render > New > Blueprint > Connect repo > uses `render.yaml`.
3. Render will create:
   - `discord-dashboard` (web, Next.js) — `https://YOUR-URL.onrender.com`
   - `discord-bot` (private service, discord.js)
   - `discordbot-db` (Postgres)

4. In Render dashboard set secrets for both services:
   - `DISCORD_CLIENT_SECRET=Cm5hDndXy2Q3qpJDwh0wSBjkOZCm4ny`
   - `DISCORD_BOT_TOKEN=MTQ5MzIxNzAz...` (full token)

5. Update `DISCORD_REDIRECT_URI` in **both** Render service and Discord Developer Portal > OAuth2 > Redirects:
   - `https://YOUR-URL.onrender.com/api/auth/discord/callback`
   - Keep localhost also for local dev: add both URLs in portal (Discord allows multiple).

6. After first deploy, Render runs `prisma migrate deploy` automatically via docker-compose? For Blueprint, add manual step if needed:
   - Shell > `npx prisma migrate deploy --schema=./prisma/schema.prisma`

7. Verify:
   - `https://YOUR-URL.onrender.com/api/health` → `database: ok`, `discord: ok`
   - Invite: `https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands`
   - Login with Discord → Servers → Manage.

Local still works with `DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback`.
