
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const cmds=await prisma.customCommand.findMany({where:{guildId:params.guildId}});
  return NextResponse.json({commands:cmds});
}
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  if(!/^[a-z0-9_-]{1,32}$/.test(body.name)) return NextResponse.json({error:"Invalid name"},{status:400});
  const c=await prisma.customCommand.create({data:{ guildId:params.guildId, name: body.name.toLowerCase(), response: body.response, enabled: body.enabled??true }});
  return NextResponse.json(c,{status:201});
}
