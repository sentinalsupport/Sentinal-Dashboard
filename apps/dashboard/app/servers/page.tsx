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
  // Only owner/admin servers, sorted with bot-installed first
  const adminGuilds = guilds.filter(g=> (parseInt(g.permissions) & 0x8)!==0 || g.owner);
  const sorted = [...adminGuilds].sort((a,b)=> Number(botGuilds.has(b.id)) - Number(botGuilds.has(a.id)));
  const configurable = sorted.filter(g=> botGuilds.has(g.id));
  const inviteNeeded = sorted.filter(g=> !botGuilds.has(g.id));
  const renderCard = (g:any)=>{
    const hasBot = botGuilds.has(g.id);
    const icon = getGuildIconUrl(g.id, g.icon);
    return <div key={g.id} className="group relative overflow-hidden rounded-[18px] border border-[#1e2638] bg-gradient-to-b from-[#121724] to-[#0e1322] p-[1px] hover:border-[#ffb338]/30 transition-all hover:translate-y-[-2px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      <div className="rounded-[17px] bg-gradient-to-b from-[#121724] to-[#0e1322] p-5">
        <div className="flex items-center gap-4">
          {icon ? <img src={icon} alt="" className="w-14 h-14 rounded-2xl ring-1 ring-white/10 shadow-lg" /> : <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1c233a] to-[#121724] border border-white/5 flex items-center justify-center text-white font-bold text-lg">{g.name.slice(0,2).toUpperCase()}</div>}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[15px] leading-tight truncate" style={{fontFamily:"'Space Grotesk', sans-serif"}}>{g.name}</h3>
            <p className="text-[11px] font-mono text-[#677084] truncate">{g.id} • {g.owner?"Owner":"Admin"}</p>
            <span className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${hasBot?"bg-[#3dd68c] shadow-[0_0_8px_#3dd68c]":"bg-[#ff5d5d]"}`} /> {hasBot?"Bot online":"Bot not invited"}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#9aa4b8]">{hasBot?"Ready to configure":"Invite to unlock"}</span>
          {hasBot ? <Link href={`/guild/${g.id}`}><span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffb338] text-[#1a1205] text-[13px] font-semibold shadow-[0_8px_20px_rgba(255,179,56,0.35)] hover:bg-[#ffbe55] transition">Configure →</span></Link> : <a href={`https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`} target="_blank"><span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffb338] text-[#1a1205] text-[13px] font-bold shadow-[0_8px_20px_rgba(255,179,56,0.35)] hover:bg-[#ffbe55] transition">Invite Bot →</span></a>}
        </div>
      </div>
    </div>;
  };
  return <div className="max-w-6xl mx-auto p-6 space-y-8">
    <div className="relative overflow-hidden rounded-[22px] border border-white/5 bg-gradient-to-br from-[#121724] via-[#0e1322] to-[#07090e] p-6 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_20%_0%,rgba(255,179,56,0.12),transparent_60%),radial-gradient(600px_300px_at_90%_10%,rgba(106,140,255,0.10),transparent_60%)]" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{fontFamily:"'Space Grotesk', sans-serif"}}>Your servers</h1>
          <p className="text-sm text-[#9aa4b8] mt-1.5">Only servers where you’re <b className="text-white">Owner/Admin</b> — {adminGuilds.length} found • {configurable.length} ready • {inviteNeeded.length} need invite</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#677084]"><span className="w-2 h-2 rounded-full bg-[#3dd68c]"/> Bot live <span className="w-2 h-2 rounded-full bg-[#ffb338]"/> Sentinel theme</div>
      </div>
    </div>
    <div>
      <h2 className="font-semibold mb-3 flex items-center gap-2" style={{fontFamily:"'Space Grotesk', sans-serif"}}><span className="w-7 h-7 rounded-full bg-[#3dd68c]/15 border border-[#3dd68c]/20 grid place-items-center text-[#3dd68c]">✓</span> Ready to configure — {configurable.length}</h2>
      {configurable.length===0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-[#9aa4b8]">No admin servers with bot yet — invite below to unlock.</div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{configurable.map(renderCard)}</div>}
    </div>
    <div>
      <h2 className="font-semibold mb-3 flex items-center gap-2" style={{fontFamily:"'Space Grotesk', sans-serif"}}><span className="w-7 h-7 rounded-full bg-[#ffb338]/15 border border-[#ffb338]/20 grid place-items-center text-[#ffb338]">＋</span> Invite needed — {inviteNeeded.length}</h2>
      {inviteNeeded.length===0 ? <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center text-sm text-[#9aa4b8]">All your admin servers have the bot — you’re set.</div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{inviteNeeded.map(renderCard)}</div>}
    </div>
  </div>;
}
