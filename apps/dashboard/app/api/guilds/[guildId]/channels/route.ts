
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({channels:[]});
  const r=await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/channels`,{headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`}});
  const j=await r.json();
  return NextResponse.json({channels: Array.isArray(j)? j: []},{status:r.status});
}
