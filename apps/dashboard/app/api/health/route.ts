import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){
  let db="unknown"; try{ await prisma.$queryRaw`SELECT 1`; db="ok"; }catch(e:any){ db="error: "+e.message }
  let discord="unknown";
  try{
    if(process.env.DISCORD_BOT_TOKEN){
      const r=await fetch("https://discord.com/api/v10/users/@me",{headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`}});
      discord= r.ok ? "ok" : `error ${r.status}`;
    } else discord="no token";
  }catch(e:any){ discord="error "+e.message }
  return NextResponse.json({
    status: db==="ok" ? "ok":"degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: db,
    discord,
    guilds: "via /api/guilds",
  });
}
