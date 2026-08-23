# Discord Dashboard — Production-Ready Bot + Dashboard

Full-stack Discord bot platform with OAuth2, PostgreSQL, Prisma, discord.js, Next.js.

## Features
- Discord OAuth2 (identify + guilds), httpOnly secure sessions (jose JWT), CSRF state
- 40+ slash commands: moderation, utility, tickets, config, leveling
- Automod: anti-spam, anti-link, bad words, mention spam, caps, raid protection
- Welcome/Goodbye, Autorole (hierarchy checked), Logging (multi-channel), Verification, Reaction Roles
- Tickets with panels, transcripts, claim/add/remove/close
- Custom commands (DB-backed), Embed builder (live preview), Announcements, Polls, Suggestions, Giveaways, Leveling/XP
- Member/Role/Channel management, Server & Bot Analytics, Audit logs, Webhooks, API keys, Notifications
- Dark/light theme, responsive, mobile nav

## Requirements
- Node.js 20+, pnpm 9+
- PostgreSQL 16+
- Discord Application with Bot (ID 1493217033956102215)

## Discord Developer Portal Setup
1. https://discord.com/developers/applications/1493217033956102215
2. OAuth2 -> Redirects: `http://localhost:3000/api/auth/discord/callback` (add prod URL too)
3. Bot -> Privileged Intents: Guilds, Guild Members (enable), Message Content (if needed), Add Bot with `bot` + `applications.commands`, perms `268823616` (or 8 for admin demo)
4. Copy Client Secret and Bot Token into `.env`

Invite URL:
```
https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands
```

## Env
Copy `.env.example` -> `.env` and fill:
```
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DATABASE_URL=postgresql://postgres:password@localhost:5432/discordbot
SESSION_SECRET=<random 32+ bytes hex>
```

## Setup
```bash
pnpm install
pnpm db:generate
pnpm db:migrate   # or pnpm --filter dashboard exec prisma migrate dev
pnpm bot:deploy   # register slash commands (needs BOT_TOKEN)
pnpm dev          # dashboard at http://localhost:3000
pnpm --filter bot dev  # bot in separate terminal
```

Scripts:
```
pnpm dev            # next dev
pnpm build          # next build + bot build
pnpm start          # next start
pnpm lint / typecheck
pnpm db:generate / db:migrate / db:studio
pnpm bot:deploy
```

## Docker
```bash
docker-compose up --build
# dashboard http://localhost:3000, postgres 5432, bot auto-connects
```

## Health Checks
- `/api/health` (db + discord)
- `/api/health/database`
- `/api/health/discord`

## Database Backups
```bash
pg_dump postgresql://postgres:password@localhost:5432/discordbot > backup.sql
# cron: 0 2 * * * pg_dump ... | gzip > /backups/$(date +\%F).sql.gz
```

## Security
- Helmet-style headers via middleware, httpOnly SameSite Lax cookies, Zod validation, Prisma params, permission checks (backend verifies MANAGE_GUILD), rate limiting (in-memory), guildId never trusted from frontend without verification.

## Testing
- `pnpm --filter dashboard typecheck` and manual OAuth + guild permission + welcome test.

## OAuth Flow
Login -> Discord authorize (identify guilds) -> callback -> exchange code -> fetch user+guilds -> create session (jose) -> dashboard -> servers (permission-checked) -> guild settings (all PATCH /api/guilds/:id/* verify MANAGE_GUILD).

## Limitations
- MessageContent intent only if enabled in portal
- Bot must be in guild to manage it
- Transcript stored in DB; file export via /api/guilds/:id/tickets/:id/close
```

