
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const r=await prisma.reactionRole.findMany({where:{guildId:params.guildId}});
  return NextResponse.json({roles:r});
}
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  const rr=await prisma.reactionRole.create({data:{ guildId:params.guildId, channelId: body.channelId, messageId: body.messageId, emoji: body.emoji, roleId: body.roleId }});
  if(process.env.DISCORD_BOT_TOKEN){
    try{ await fetch(`https://discord.com/api/v10/channels/${body.channelId}/messages/${body.messageId}/reactions/${encodeURIComponent(body.emoji)}/@me`,{method:"PUT", headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`}});}catch{}
  }
  return NextResponse.json(rr,{status:201});
}
