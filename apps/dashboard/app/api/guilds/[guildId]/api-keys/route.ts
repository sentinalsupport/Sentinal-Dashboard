
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const keys=await prisma.apiKey.findMany({where:{userId:sess.userId}, orderBy:{createdAt:"desc"}});
  return NextResponse.json({keys});
}
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  const raw="sk_"+randomBytes(24).toString("hex");
  const hash=createHash("sha256").update(raw).digest("hex");
  const k=await prisma.apiKey.create({data:{ userId:sess.userId, name: body.name||"API Key", keyHash: hash }});
  return NextResponse.json({key: raw, id: k.id});
}
