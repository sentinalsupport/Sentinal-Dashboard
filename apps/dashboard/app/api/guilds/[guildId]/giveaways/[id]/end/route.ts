
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function POST(req:NextRequest,{params}:{params:{guildId:string,id:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const g=await prisma.giveaway.findUnique({where:{id:params.id}});
  if(!g) return NextResponse.json({error:"Not found"},{status:404});
  const entries=await prisma.giveawayEntry.findMany({where:{giveawayId:params.id}});
  const shuffled=entries.sort(()=>0.5-Math.random());
  const winners=shuffled.slice(0,g.winnerCount).map(e=>e.userId);
  const updated=await prisma.giveaway.update({where:{id:params.id}, data:{ ended:true, winnerIds: winners }});
  if(process.env.DISCORD_BOT_TOKEN && g.channelId){
    await fetch(`https://discord.com/api/v10/channels/${g.channelId}/messages`,{method:"POST", headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`,"Content-Type":"application/json"}, body:JSON.stringify({content:`🎉 Giveaway ended! Winners: ${winners.map(id=> `<@${id}>`).join(", ") || "No entries"}`})});
  }
  return NextResponse.json(updated);
}
