
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function POST(req:NextRequest,{params}:{params:{guildId:string,ticketId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const t=await prisma.ticket.update({where:{id:params.ticketId}, data:{ status:"closed", closedAt: new Date() }});
  // try delete channel via bot
  if(t.channelId && process.env.DISCORD_BOT_TOKEN){
    await fetch(`https://discord.com/api/v10/channels/${t.channelId}`,{method:"DELETE", headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`}});
  }
  return NextResponse.json({ok:true, ticket:t});
}
