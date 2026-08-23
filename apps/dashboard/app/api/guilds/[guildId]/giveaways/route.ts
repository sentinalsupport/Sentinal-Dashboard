
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const g=await prisma.giveaway.findMany({where:{guildId:params.guildId}, orderBy:{createdAt:"desc"}});
  return NextResponse.json({giveaways:g});
}
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  const endsAt=new Date(Date.now()+(body.durationHours||24)*3600*1000);
  const g=await prisma.giveaway.create({data:{ guildId:params.guildId, channelId: body.channelId, prize: body.prize, winnerCount: body.winnerCount||1, endsAt, createdById: sess.userId }});
  if(process.env.DISCORD_BOT_TOKEN && body.channelId){
    await fetch(`https://discord.com/api/v10/channels/${body.channelId}/messages`,{method:"POST", headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`,"Content-Type":"application/json"}, body:JSON.stringify({content:`🎉 **GIVEAWAY** 🎉\nPrize: ${body.prize}\nWinners: ${body.winnerCount||1}\nEnds: <t:${Math.floor(endsAt.getTime()/1000)}:R>\nReact with 🎉 to enter!`, embeds:[{title:"Giveaway", description: body.prize, color:0x5865F2 }]})});
  }
  return NextResponse.json(g,{status:201});
}
