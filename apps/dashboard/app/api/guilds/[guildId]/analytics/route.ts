
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const analytics=await prisma.analytics.findMany({where:{guildId:params.guildId}, orderBy:{date:"desc"}, take:30});
  const moderationCount=await prisma.moderationAction.count({where:{guildId:params.guildId}});
  const ticketCount=await prisma.ticket.count({where:{guildId:params.guildId}});
  const levelCount=await prisma.level.count({where:{guildId:params.guildId}});
  return NextResponse.json({analytics, moderationCount, ticketCount, levelCount});
}
