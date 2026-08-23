
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  const ok=await verifyGuildAccess(sess.userId, params.guildId);
  if(!ok) return NextResponse.json({error:"Forbidden"},{status:403});
  try{
    const welcome=await prisma.welcomeSettings.findUnique({where:{guildId:params.guildId}});
    const goodbye=await prisma.goodbyeSettings.findUnique({where:{guildId:params.guildId}});
    const autorole=await prisma.autoRoleSettings.findUnique({where:{guildId:params.guildId}});
    const logging=await prisma.loggingSettings.findUnique({where:{guildId:params.guildId}});
    const guildSettings=await prisma.guildSettings.findUnique({where:{guildId:params.guildId}});
    const verification=await prisma.verificationSettings.findUnique({where:{guildId:params.guildId}});
    const levelSettings=await prisma.levelSettings.findUnique({where:{guildId:params.guildId}});
    return NextResponse.json({ welcome, goodbye, autorole, logging, guildSettings, verification, leveling: levelSettings });
  }catch(e){ return NextResponse.json({error:String(e)},{status:500});}
}
export async function PATCH(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  const ok=await verifyGuildAccess(sess.userId, params.guildId);
  if(!ok) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  try{
    if(body.welcome){
      await prisma.guild.upsert({where:{id:params.guildId}, update:{name:body.welcome.guildName||"Guild"}, create:{id:params.guildId, name: body.welcome.guildName||"Guild"}});
      await prisma.welcomeSettings.upsert({where:{guildId:params.guildId}, update: body.welcome, create:{guildId:params.guildId, ...body.welcome}});
    }
    if(body.goodbye) await prisma.goodbyeSettings.upsert({where:{guildId:params.guildId}, update: body.goodbye, create:{guildId:params.guildId, ...body.goodbye}});
    if(body.autorole) await prisma.autoRoleSettings.upsert({where:{guildId:params.guildId}, update: body.autorole, create:{guildId:params.guildId, ...body.autorole}});
    if(body.logging) await prisma.loggingSettings.upsert({where:{guildId:params.guildId}, update: body.logging, create:{guildId:params.guildId, ...body.logging}});
    if(body.verification) await prisma.verificationSettings.upsert({where:{guildId:params.guildId}, update: body.verification, create:{guildId:params.guildId, ...body.verification}});
    if(body.leveling) await prisma.levelSettings.upsert({where:{guildId:params.guildId}, update: body.leveling, create:{guildId:params.guildId, ...body.leveling}});
    if(body.tickets){
      await prisma.guild.upsert({where:{id:params.guildId}, update:{}, create:{id:params.guildId, name:"Guild"}});
      // store in guildSettings json? for now use audit log as placeholder
    }
    await prisma.dashboardAuditLog.create({ data:{ guildId: params.guildId, userId: sess.userId, action:"update_settings", newValue: body }});
    return NextResponse.json({ok:true});
  }catch(e){ return NextResponse.json({error:String(e)},{status:500});}
}
