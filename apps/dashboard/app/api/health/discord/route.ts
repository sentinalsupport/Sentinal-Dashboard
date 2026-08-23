import { NextResponse } from "next/server";
export async function GET(){
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({status:"no_token"},{status:500});
  try{ const r=await fetch("https://discord.com/api/v10/users/@me",{headers:{Authorization:`Bot ${process.env.DISCORD_BOT_TOKEN}`}}); const j=await r.json(); return NextResponse.json({status: r.ok?"ok":"error", data:j}, {status: r.ok?200:500}); }catch(e:any){ return NextResponse.json({status:"error", error:e.message},{status:500});}
}
