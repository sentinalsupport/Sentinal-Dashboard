import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "fallback-secret-please-change-32-chars-long");
export interface SessionPayload { userId: string; username: string; avatar?: string | null; exp?: number; }
export async function createSessionToken(payload: SessionPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try { const { payload } = await jwtVerify(token, secret); return payload as unknown as SessionPayload; } catch { return null; }
}
export async function getSession(): Promise<SessionPayload | null> {
  const c = cookies().get("session")?.value;
  if (!c) return null;
  return verifySessionToken(c);
}
export async function setSessionCookie(token: string) {
  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60*60*24*7,
  });
}
export function clearSessionCookie() {
  cookies().set("session", "", { httpOnly: true, path: "/", maxAge: 0 });
}
export function hashIp(ip: string) {
  // simple hash, not cryptographic but avoids storing raw IP
  let h = 0; for (let i=0;i<ip.length;i++) h = ((h<<5)-h)+ip.charCodeAt(i); return Math.abs(h).toString(16);
}
