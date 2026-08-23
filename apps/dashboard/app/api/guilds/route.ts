
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { fetchUserGuilds, fetchBotGuilds } from "@/lib/discord";
import { hasManageGuild } from "@/lib/utils";
export async function GET(req: NextRequest){
  const token=req.cookies.get("session")?.value;
  if(!token) return NextResponse.json({error:"Unauthorized"},{status:401});
  const sess=await verifySessionToken(token);
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const user=await prisma.user.findUnique({where:{id:sess.userId}});
    if(!user?.accessToken) return NextResponse.json({error:"No access token, re-login"},{status:401});
    const guilds=await fetchUserGuilds(user.accessToken);
    const botGuilds=await fetchBotGuilds();
    const enriched=guilds.map(g=> ({...g, botInstalled: botGuilds.has(g.id), canManage: hasManageGuild(parseInt(g.permissions)), iconUrl: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`:null }));
    return NextResponse.json({guilds: enriched});
  }catch(e){ return NextResponse.json({error:"Failed to fetch guilds "+e},{status:500});}
}
