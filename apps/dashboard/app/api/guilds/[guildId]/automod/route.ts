
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
const defaults={ antiSpam:{enabled:false,messages:5,interval:5,action:"delete"}, antiLink:{enabled:false,allowedDomains:[],blockInvite:true,action:"delete"}, badWords:{enabled:false,words:[],action:"delete"}, mentionSpam:{enabled:false,maxMentions:5,action:"delete"}};
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const rules=await prisma.autoModRule.findMany({where:{guildId:params.guildId}});
  const cfg={...defaults};
  for(const r of rules){ (cfg as any)[r.type]= { enabled: r.enabled, ...(r.config as any), action: r.action, timeoutDuration: r.timeoutDuration } }
  return NextResponse.json(cfg);
}
export async function PATCH(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  for(const [type, cfg] of Object.entries(body as any)){
    await prisma.autoModRule.upsert({ where:{ guildId_type:{ guildId:params.guildId, type } }, update:{ enabled: (cfg as any).enabled, config: cfg as any, action: (cfg as any).action||"delete" }, create:{ guildId:params.guildId, type, enabled:(cfg as any).enabled||false, config: cfg as any, action:(cfg as any).action||"delete"}});
  }
  return NextResponse.json({ok:true});
}
