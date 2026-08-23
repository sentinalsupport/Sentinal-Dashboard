const DISCORD_API = "https://discord.com/api/v10";

export async function exchangeCode(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
  });
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!res.ok) throw new Error(`token exchange failed ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}

export async function fetchDiscordUser(accessToken: string) {
  const r = await fetch(`${DISCORD_API}/users/@me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error("fetch user failed");
  return r.json() as Promise<{ id: string; username: string; discriminator: string; avatar: string | null; email?: string }>;
}

export async function fetchUserGuilds(accessToken: string) {
  const r = await fetch(`${DISCORD_API}/users/@me/guilds`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error("fetch guilds failed");
  return r.json() as Promise<Array<{ id: string; name: string; icon: string | null; owner: boolean; permissions: string; }>>;
}

export async function fetchBotGuilds() {
  if (!process.env.DISCORD_BOT_TOKEN) return new Set<string>();
  try {
    const r = await fetch(`${DISCORD_API}/users/@me/guilds`, { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } });
    if (!r.ok) return new Set<string>();
    const j = await r.json() as Array<{ id: string }>;
    return new Set(j.map(g=>g.id));
  } catch { return new Set<string>(); }
}

export function getGuildIconUrl(id: string, icon: string | null) {
  if (!icon) return null;
  return `https://cdn.discordapp.com/icons/${id}/${icon}.png`;
}

export async function botHasGuild(guildId: string) {
  const set = await fetchBotGuilds();
  return set.has(guildId);
}

export function discordInviteUrl() {
  const id = process.env.DISCORD_CLIENT_ID || process.env.DISCORD_APPLICATION_ID;
  const perms = "8"; // admin for demo; production should use minimal 268823616
  return `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=${perms}&scope=bot%20applications.commands`;
}
