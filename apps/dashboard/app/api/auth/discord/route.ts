import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
export async function GET(req: NextRequest){
  // If already logged in, skip OAuth
  const token = req.cookies.get("session")?.value;
  if(token){
    const sess = await verifySessionToken(token).catch(()=>null);
    if(sess) return NextResponse.redirect(new URL("/servers", req.url));
  }
  const state = Math.random().toString(36).slice(2);
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    response_type: "code",
    scope: "identify guilds",
    state,
  });
  const url = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  const res = NextResponse.redirect(url);
  res.cookies.set("oauth_state", state, { httpOnly:true, secure: process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:600 });
  return res;
}
