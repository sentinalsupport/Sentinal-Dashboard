const fs=require('fs'),path=require('path');
const base=path.join(__dirname,'../apps/dashboard/app/api');
function write(p,content){ const full=path.join(base,p); fs.mkdirSync(path.dirname(full),{recursive:true}); fs.writeFileSync(full,content); console.log('wrote',p); }

// guilds list
write('guilds/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { fetchUserGuilds, fetchBotGuilds } from "@/lib/discord";
import { hasManageGuild } from "@/lib/utils";
export async function GET(req: NextRequest){
  const token=req.cookies.get("session")?.value;
  if(!token) return NextResponse.json({error:"Unauthorized"},{status:401});
  const sess=await verifySessionToken(token);
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  try{
    const user=await prisma.user.findUnique({where:{id:sess.userId}});
    if(!user?.accessToken) return NextResponse.json({error:"No access token, re-login"},{status:401});
    const guilds=await fetchUserGuilds(user.accessToken);
    const botGuilds=await fetchBotGuilds();
    const enriched=guilds.map(g=> ({...g, botInstalled: botGuilds.has(g.id), canManage: hasManageGuild(parseInt(g.permissions)), iconUrl: g.icon ? \`https://cdn.discordapp.com/icons/\${g.id}/\${g.icon}.png\`:null }));
    return NextResponse.json({guilds: enriched});
  }catch(e){ return NextResponse.json({error:"Failed to fetch guilds "+e},{status:500});}
}
`);

// guild specific
write('guilds/[guildId]/route.ts', `
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
    const r=await fetch(\`https://discord.com/api/v10/guilds/\${params.guildId}\`,{headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`}});
    const j=await r.json();
    return NextResponse.json(j,{status:r.status});
  }catch(e){ return NextResponse.json({error:String(e)},{status:500});}
}
`);

// settings
write('guilds/[guildId]/settings/route.ts', `
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
`);

// members, roles, channels
write('guilds/[guildId]/members/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({members:[], note:"BOT_TOKEN missing"});
  try{
    const r=await fetch(\`https://discord.com/api/v10/guilds/\${params.guildId}/members?limit=50\`,{headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`}});
    const j=await r.json();
    return NextResponse.json({members: Array.isArray(j)? j: []},{status:r.status});
  }catch(e){ return NextResponse.json({error:String(e)},{status:500});}
}
`);
write('guilds/[guildId]/roles/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({roles:[]});
  const r=await fetch(\`https://discord.com/api/v10/guilds/\${params.guildId}/roles\`,{headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`}});
  const j=await r.json();
  return NextResponse.json({roles: Array.isArray(j)? j: []},{status:r.status});
}
`);
write('guilds/[guildId]/channels/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({channels:[]});
  const r=await fetch(\`https://discord.com/api/v10/guilds/\${params.guildId}/channels\`,{headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`}});
  const j=await r.json();
  return NextResponse.json({channels: Array.isArray(j)? j: []},{status:r.status});
}
`);

// moderation
write('guilds/[guildId]/moderation/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const logs=await prisma.moderationAction.findMany({where:{guildId:params.guildId}, orderBy:{createdAt:"desc"}, take:50});
  return NextResponse.json({logs});
}
`);

// automod
write('guilds/[guildId]/automod/route.ts', `
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
`);

// tickets
write('guilds/[guildId]/tickets/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const tickets=await prisma.ticket.findMany({where:{guildId:params.guildId}, orderBy:{createdAt:"desc"}, take:50});
  return NextResponse.json({tickets});
}
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  const t=await prisma.ticket.create({data:{ guildId:params.guildId, creatorId: body.creatorId || sess.userId, status:"open", categoryId: body.categoryId }});
  return NextResponse.json(t,{status:201});
}
`);
write('guilds/[guildId]/tickets/[ticketId]/close/route.ts', `
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
    await fetch(\`https://discord.com/api/v10/channels/\${t.channelId}\`,{method:"DELETE", headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`}});
  }
  return NextResponse.json({ok:true, ticket:t});
}
`);

// commands
write('guilds/[guildId]/commands/route.ts', `
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
`);
write('guilds/[guildId]/commands/[id]/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function DELETE(req:NextRequest,{params}:{params:{guildId:string,id:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  await prisma.customCommand.delete({where:{id:params.id}});
  return NextResponse.json({ok:true});
}
export async function PATCH(req:NextRequest,{params}:{params:{guildId:string,id:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  const c=await prisma.customCommand.update({where:{id:params.id}, data: body });
  return NextResponse.json(c);
}
`);

// embeds, announcements, polls, giveaways, etc
write('guilds/[guildId]/embeds/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  if(!body.channelId) return NextResponse.json({error:"channelId required"},{status:400});
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({error:"BOT_TOKEN missing"},{status:500});
  const embed={ title: body.title, description: body.description, color: parseInt((body.color||"#5865F2").replace("#",""),16) };
  const r=await fetch(\`https://discord.com/api/v10/channels/\${body.channelId}/messages\`,{method:"POST", headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`,"Content-Type":"application/json"}, body:JSON.stringify({embeds:[embed]})});
  const j=await r.json();
  return NextResponse.json(j,{status:r.status});
}
`);
write('guilds/[guildId]/announcements/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({error:"BOT_TOKEN missing"},{status:500});
  const embed={ title: body.title, description: body.description, color: parseInt((body.color||"#5865F2").replace("#",""),16) };
  const r=await fetch(\`https://discord.com/api/v10/channels/\${body.channelId}/messages\`,{method:"POST", headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`,"Content-Type":"application/json"}, body:JSON.stringify({embeds:[embed]})});
  const j=await r.json();
  return NextResponse.json(j,{status:r.status});
}
`);
write('guilds/[guildId]/polls/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({error:"BOT_TOKEN missing"},{status:500});
  const options = (body.options||[]).map((o:string,i:number)=> \`\${i+1}. \${o}\`).join("\\n");
  const content = \`📊 **\${body.question}**\\n\${options}\\n\\nReact to vote!\`;
  const r=await fetch(\`https://discord.com/api/v10/channels/\${body.channelId}/messages\`,{method:"POST", headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`,"Content-Type":"application/json"}, body:JSON.stringify({content})});
  const j=await r.json();
  return NextResponse.json(j,{status:r.status});
}
`);
write('guilds/[guildId]/welcome/test/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const cfg=await prisma.welcomeSettings.findUnique({where:{guildId:params.guildId}});
  if(!cfg?.channelId) return NextResponse.json({error:"Welcome channel not configured"},{status:400});
  if(!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({error:"BOT_TOKEN missing"},{status:500});
  let content = cfg.message || "Welcome {user} to {server}!";
  content = content.replace("{user}", \`<@\${sess.userId}>\`).replace("{username}", sess.username).replace("{server}", params.guildId).replace("{membercount}","100");
  let embeds=undefined;
  if(cfg.embedEnabled) embeds=[{title:cfg.embedTitle, description:cfg.embedDescription, color: parseInt((cfg.embedColor||"#5865F2").replace("#",""),16)}];
  const r=await fetch(\`https://discord.com/api/v10/channels/\${cfg.channelId}/messages\`,{method:"POST", headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`,"Content-Type":"application/json"}, body:JSON.stringify({content, embeds})});
  const j=await r.json();
  return NextResponse.json(j,{status:r.status});
}
`);
write('guilds/[guildId]/analytics/route.ts', `
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
`);
write('guilds/[guildId]/suggestions/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const s=await prisma.suggestion.findMany({where:{guildId:params.guildId}, orderBy:{createdAt:"desc"}, take:50});
  return NextResponse.json({suggestions:s});
}
`);
write('guilds/[guildId]/giveaways/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const g=await prisma.giveaway.findMany({where:{guildId:params.guildId}, orderBy:{createdAt:"desc"}});
  return NextResponse.json({giveaways:g});
}
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  const endsAt=new Date(Date.now()+(body.durationHours||24)*3600*1000);
  const g=await prisma.giveaway.create({data:{ guildId:params.guildId, channelId: body.channelId, prize: body.prize, winnerCount: body.winnerCount||1, endsAt, createdById: sess.userId }});
  if(process.env.DISCORD_BOT_TOKEN && body.channelId){
    await fetch(\`https://discord.com/api/v10/channels/\${body.channelId}/messages\`,{method:"POST", headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`,"Content-Type":"application/json"}, body:JSON.stringify({content:\`🎉 **GIVEAWAY** 🎉\\nPrize: \${body.prize}\\nWinners: \${body.winnerCount||1}\\nEnds: <t:\${Math.floor(endsAt.getTime()/1000)}:R>\\nReact with 🎉 to enter!\`, embeds:[{title:"Giveaway", description: body.prize, color:0x5865F2 }]})});
  }
  return NextResponse.json(g,{status:201});
}
`);
write('guilds/[guildId]/giveaways/[id]/end/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function POST(req:NextRequest,{params}:{params:{guildId:string,id:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const g=await prisma.giveaway.findUnique({where:{id:params.id}});
  if(!g) return NextResponse.json({error:"Not found"},{status:404});
  const entries=await prisma.giveawayEntry.findMany({where:{giveawayId:params.id}});
  const shuffled=entries.sort(()=>0.5-Math.random());
  const winners=shuffled.slice(0,g.winnerCount).map(e=>e.userId);
  const updated=await prisma.giveaway.update({where:{id:params.id}, data:{ ended:true, winnerIds: winners }});
  if(process.env.DISCORD_BOT_TOKEN && g.channelId){
    await fetch(\`https://discord.com/api/v10/channels/\${g.channelId}/messages\`,{method:"POST", headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`,"Content-Type":"application/json"}, body:JSON.stringify({content:\`🎉 Giveaway ended! Winners: \${winners.map(id=> \`<@\${id}>\`).join(", ") || "No entries"}\`})});
  }
  return NextResponse.json(updated);
}
`);
write('guilds/[guildId]/reaction-roles/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const r=await prisma.reactionRole.findMany({where:{guildId:params.guildId}});
  return NextResponse.json({roles:r});
}
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  const rr=await prisma.reactionRole.create({data:{ guildId:params.guildId, channelId: body.channelId, messageId: body.messageId, emoji: body.emoji, roleId: body.roleId }});
  if(process.env.DISCORD_BOT_TOKEN){
    try{ await fetch(\`https://discord.com/api/v10/channels/\${body.channelId}/messages/\${body.messageId}/reactions/\${encodeURIComponent(body.emoji)}/@me\`,{method:"PUT", headers:{Authorization:\`Bot \${process.env.DISCORD_BOT_TOKEN}\`}});}catch{}
  }
  return NextResponse.json(rr,{status:201});
}
`);
write('guilds/[guildId]/leveling/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const leaderboard=await prisma.level.findMany({where:{guildId:params.guildId}, orderBy:{xp:"desc"}, take:20});
  return NextResponse.json({leaderboard});
}
`);
write('guilds/[guildId]/webhooks/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function POST(req:NextRequest,{params}:{params:{guildId:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await req.json();
  const w=await prisma.webhook.create({data:{ guildId:params.guildId, name: body.name, url: body.url }});
  return NextResponse.json(w,{status:201});
}
`);
write('guilds/[guildId]/webhooks/test/route.ts', `
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
`);
write('guilds/[guildId]/api-keys/route.ts', `
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
`);
write('guilds/[guildId]/api-keys/[id]/route.ts', `
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyGuildAccess } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
export async function DELETE(req:NextRequest,{params}:{params:{guildId:string,id:string}}){
  const token=req.cookies.get("session")?.value;
  const sess=token? await verifySessionToken(token):null;
  if(!sess) return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await verifyGuildAccess(sess.userId, params.guildId)) return NextResponse.json({error:"Forbidden"},{status:403});
  await prisma.apiKey.delete({where:{id:params.id}});
  return NextResponse.json({ok:true});
}
`);
console.log('api gen done');
