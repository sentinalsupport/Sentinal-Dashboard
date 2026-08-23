
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  const r=await fetch(body.url,{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({content:"✅ Webhook test from Dashboard", username:"Dashboard"})});
  return NextResponse.json({ok:r.ok, status:r.status});
}
