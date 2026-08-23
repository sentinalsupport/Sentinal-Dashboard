
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  if(!token) return NextResponse.json({error:"Unauthorized"},{status:401});
  const sess=await verifySessionToken(token);
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  const ok=await verifyGuildAccess(sess.userId, params.guildId);
  if(!ok) return NextResponse.json({error:"Forbidden - no manage permission or bot not in guild"},{status:403});
  // fetch guild via bot
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({guildId:params.guildId, note:"BOT_TOKEN not configured"});
  try{
    const r=await fetch(`https://discord.com/api/v10/guilds/${params.guildId}`,{headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`}});
    const j=await r.json();
    return NextResponse.json(j,{status:r.status});
  }catch(e){ return NextResponse.json({error:String(e)},{status:500});}
}
