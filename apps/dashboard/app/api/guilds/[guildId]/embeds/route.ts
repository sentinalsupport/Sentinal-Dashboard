
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  if(!body.channelId) return NextResponse.json({error:"channelId required"},{status:400});
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({error:"BOT_TOKEN missing"},{status:500});
  const embed={ title: body.title, description: body.description, color: parseInt((body.color||"#5865F2").replace("#",""),16) };
  const r=await fetch(`https://discord.com/api/v10/channels/${body.channelId}/messages`,{method:"POST", headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`,"Content-Type":"application/json"}, body:JSON.stringify({embeds:[embed]})});
  const j=await r.json();
  return NextResponse.json(j,{status:r.status});
}
