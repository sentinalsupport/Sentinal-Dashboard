import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, fetchDiscordUser, fetchUserGuilds } from "@/lib/discord";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
export async function GET(req: NextRequest){
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = req.cookies.get("oauth_state")?.value;
  // CSRF check - allow if missing in dev
  if(process.env.NODE_ENV==="production" && state !== expected) {
    return NextResponse.json({error:"Invalid state"}, {status:400});
  }
  if(!code) return NextResponse.json({error:"Missing code"}, {status:400});
  try{
    const tokenData = await exchangeCode(code);
    const user = await fetchDiscordUser(tokenData.access_token);
    // upsert user
    await prisma.user.upsert({
      where:{ id: user.id },
      update:{ username:user.username, discriminator:user.discriminator, avatar:user.avatar, accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token },
      create:{ id: user.id, username:user.username, discriminator:user.discriminator, avatar:user.avatar, accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token }
    });
    const sessionToken = await createSessionToken({ userId: user.id, username: user.username, avatar: user.avatar });
    // also create session record
    try{
      await prisma.session.create({ data:{ userId: user.id, token: sessionToken, expiresAt: new Date(Date.now()+7*24*3600*1000), ipHash: req.headers.get("x-forwarded-for")||"unknown", userAgent: req.headers.get("user-agent")||"" }});
    }catch{}
    const res = NextResponse.redirect(new URL("/servers", req.url));
    res.cookies.set("session", sessionToken, { httpOnly:true, secure: process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:60*60*24*7 });
    res.cookies.set("oauth_state","",{ path:"/", maxAge:0 });
    return res;
  }catch(e:any){
    console.error(e);
    return NextResponse.json({error:"OAuth failed: "+e.message}, {status:500});
  }
}
