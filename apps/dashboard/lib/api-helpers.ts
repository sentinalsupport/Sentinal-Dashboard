import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchUserGuilds } from "@/lib/discord";
import { hasManageGuild } from "@/lib/utils";

export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  const { verifySessionToken } = await import("@/lib/auth");
  const payload = await verifySessionToken(token);
  return payload;
}

export async function verifyGuildAccess(userId: string, guildId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.accessToken) return false;
    const guilds = await fetchUserGuilds(user.accessToken);
    const g = guilds.find(x => x.id === guildId);
    if (!g) return false;
    return hasManageGuild(parseInt(g.permissions));
  } catch { return false; }
}

export function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}
export function error(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

// simple in-memory rate limiter
const rateMap = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.reset) {
    rateMap.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
