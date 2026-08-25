import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchUserGuilds, fetchBotGuilds, getGuildIconUrl } from "@/lib/discord";
import { hasManageGuild } from "@/lib/utils";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ServersPage(){
  const session = await getSession();
  if(!session) redirect("/api/auth/discord");
  // need to retrieve access token from DB? For demo, fetch via session lookup
  // Fallback: show message if not stored
  let guilds: any[] = [];
  let botGuilds = new Set<string>();
  try{
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where:{ id: session.userId }});
    if(user?.accessToken){
      guilds = await fetchUserGuilds(user.accessToken);
      botGuilds = await fetchBotGuilds();
    }
  }catch(e){}
  if(guilds.length===0){
    return <div className="max-w-4xl mx-auto p-6"><Card><CardHeader><CardTitle>No guilds found</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Could not fetch guilds. Ensure you logged in via Discord OAuth and DATABASE_URL is configured. <br/><Link href="/api/auth/discord" className="text-primary underline">Re-login</Link></CardContent></Card></div>;
  }
  const sorted = [...guilds].sort((a,b)=>{
    const aAdmin = (parseInt(a.permissions) & 0x8) !==0 || a.owner;
    const bAdmin = (parseInt(b.permissions) & 0x8) !==0 || b.owner;
    const aHas = botGuilds.has(a.id);
    const bHas = botGuilds.has(b.id);
    const aScore = (aAdmin && aHas ? 2 : aHas ? 1 : 0);
    const bScore = (bAdmin && bHas ? 2 : bHas ? 1 : 0);
    return bScore - aScore;
  });
  const configurable = sorted.filter(g=> ((parseInt(g.permissions) & 0x8)!==0 || g.owner) && botGuilds.has(g.id));
  const inviteNeeded = sorted.filter(g=> !botGuilds.has(g.id));
  const noAccess = sorted.filter(g=> !((parseInt(g.permissions) & 0x8)!==0 || g.owner) && botGuilds.has(g.id));
  const renderCard = (g:any)=>{
    const isAdmin = (parseInt(g.permissions) & 0x8)!==0 || g.owner;
    const hasBot = botGuilds.has(g.id);
    const icon = getGuildIconUrl(g.id, g.icon);
    return <Card key={g.id} className={isAdmin ? "" : "opacity-60"}>
      <CardHeader className="flex flex-row items-center gap-3">
        {icon ? <img src={icon} alt="" className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">{g.name.slice(0,2)}</div>}
        <div><CardTitle className="text-base">{g.name}</CardTitle><span className="text-xs text-muted-foreground">{g.id} • {g.owner?"Owner":"Member"}</span></div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-xs">{hasBot ? "✅ Bot installed" : "❌ Bot not installed"} {isAdmin ? "• ✅ Admin" : "• ❌ No admin"}</span>
        {hasBot ? (isAdmin ? <Link href={`/guild/${g.id}`}><Button size="sm">Configure</Button></Link> : <a href={`https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`} target="_blank"><Button size="sm" className="bg-[#ffb338] text-[#1a1205] hover:bg-[#ffbe55] border-[#ffb338] font-semibold shadow-[0_6px_16px_rgba(255,179,56,0.35)]">Invite Bot</Button></a>) : <a href={`https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`} target="_blank"><Button size="sm" className="bg-[#ffb338] text-[#1a1205] hover:bg-[#ffbe55] border-[#ffb338] font-semibold shadow-[0_6px_16px_rgba(255,179,56,0.35)]">Invite Bot</Button></a>}
      </CardContent>
    </Card>;
  };
  return <div className="max-w-6xl mx-auto p-6 space-y-8">
    <div><h1 className="text-2xl font-bold">Select a server</h1><p className="text-muted-foreground text-sm">Top: servers you can configure (Admin + bot invited). Bottom: bot not invited — Invite for all.</p></div>
    <div>
      <h2 className="font-semibold mb-3">✅ Configurable (Admin + Bot installed) — {configurable.length}</h2>
      {configurable.length===0 ? <p className="text-sm text-muted-foreground">No servers with bot + admin. Invite below.</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{configurable.map(renderCard)}</div>}
    </div>
    <div>
      <h2 className="font-semibold mb-3">📨 Bot not invited — Invite button for all ({inviteNeeded.length})</h2>
      {inviteNeeded.length===0 ? <p className="text-sm text-muted-foreground">Bot is in all your servers.</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{inviteNeeded.map(renderCard)}</div>}
    </div>
    {noAccess.length>0 && <div>
      <h2 className="font-semibold mb-3">🔒 Bot installed but no Admin ({noAccess.length})</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{noAccess.map(renderCard)}</div>
    </div>}
  </div>;
}
