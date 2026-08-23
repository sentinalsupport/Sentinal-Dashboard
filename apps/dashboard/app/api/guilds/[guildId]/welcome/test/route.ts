
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const cfg=await prisma.welcomeSettings.findUnique({where:{guildId:params.guildId}});
  if(!cfg?.channelId) return NextResponse.json({error:"Welcome channel not configured"},{status:400});
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({error:"BOT_TOKEN missing"},{status:500});
  let content = cfg.message || "Welcome {user} to {server}!";
  content = content.replace("{user}", `<@${sess.userId}>`).replace("{username}", sess.username).replace("{server}", params.guildId).replace("{membercount}","100");
  let embeds=undefined;
  if(cfg.embedEnabled) embeds=[{title:cfg.embedTitle, description:cfg.embedDescription, color: parseInt((cfg.embedColor||"#5865F2").replace("#",""),16)}];
  const r=await fetch(`https://discord.com/api/v10/channels/${cfg.channelId}/messages`,{method:"POST", headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`,"Content-Type":"application/json"}, body:JSON.stringify({content, embeds})});
  const j=await r.json();
  return NextResponse.json(j,{status:r.status});
}
