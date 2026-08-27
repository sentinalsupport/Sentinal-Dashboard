import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default async function DashboardPage(){
  const s = await getSession();
  if(!s) redirect("/api/auth/discord");
  return <div className="max-w-6xl mx-auto p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Welcome, {s.username}</h1>
      <div className="flex gap-2"><Link href="/servers"><Button>Select Server</Button></Link><Link href="/api/auth/logout"><Button variant="outline">Logout</Button></Link></div>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.02]"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-[#3dd68c] shadow-[0_0_8px_#3dd68c]"/> Bot Status</CardTitle></CardHeader><CardContent><BotStatus /></CardContent></Card>
      <Card className="border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.02]"><CardHeader><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader><CardContent><QuickStats /></CardContent></Card>
      <Card className="border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.02]"><CardHeader><CardTitle className="text-sm">Next Steps</CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm text-muted-foreground"><li className="flex gap-2"><span className="text-[#ffb338]">1.</span> Select a server</li><li className="flex gap-2"><span className="text-[#ffb338]">2.</span> Configure welcome & autorole</li><li className="flex gap-2"><span className="text-[#ffb338]">3.</span> Try /ping in Discord</li></ul></CardContent></Card>
    </div>
    <Card className="border-[#ffb338]/20 bg-gradient-to-br from-[#ffb338]/10 via-transparent to-transparent"><CardHeader><CardTitle className="flex items-center gap-2">Invite Sentinal to your server</CardTitle></CardHeader><CardContent className="flex flex-wrap items-center gap-3"><p className="text-sm text-muted-foreground">Add the bot with one click — then configure from dashboard.</p><a href="https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands" target="_blank"><Button className="bg-[#ffb338] text-[#1a1205] hover:bg-[#ffbe55] font-semibold">Invite Bot →</Button></a></CardContent></Card>
  </div>;
}
async function BotStatus(){
  try{
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/health`, { cache:"no-store" });
    const j = await res.json();
    const isOk = j.status === "ok" && j.database === "ok" && String(j.discord).includes("ok");
    return <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><span className={`px-2 py-1 rounded-full text-xs font-medium ${isOk ? "bg-[#3dd68c]/15 text-[#3dd68c] border border-[#3dd68c]/20" : "bg-[#ff5d5d]/15 text-[#ff5d5d] border border-[#ff5d5d]/20"}`}>{isOk ? "● Online" : "● Offline"}</span></div>
      <div className="flex items-center justify-between"><span className="text-muted-foreground">Database</span><span className="text-xs font-mono">{j.database}</span></div>
      <div className="flex items-center justify-between"><span className="text-muted-foreground">Discord API</span><span className="text-xs font-mono">{String(j.discord).slice(0,20)}</span></div>
      <div className="flex items-center justify-between"><span className="text-muted-foreground">Uptime</span><span className="text-xs font-mono">{j.uptime ? Math.floor(j.uptime/3600)+"h "+Math.floor((j.uptime%3600)/60)+"m" : "—"}</span></div>
    </div>;
  }catch(e){ return <div className="text-sm text-muted-foreground">Offline — check configuration</div>; }
}
async function QuickStats(){
  try{
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/health`, { cache:"no-store" });
    const j = await res.json();
    return <div className="grid grid-cols-2 gap-3 text-center">
      <div className="rounded-xl bg-black/20 p-3 border border-white/5"><div className="text-lg font-bold">{j.guilds && typeof j.guilds === 'number' ? j.guilds : "—"}</div><div className="text-[11px] font-mono text-muted-foreground">guilds</div></div>
      <div className="rounded-xl bg-black/20 p-3 border border-white/5"><div className="text-lg font-bold">53</div><div className="text-[11px] font-mono text-muted-foreground">commands</div></div>
      <div className="rounded-xl bg-black/20 p-3 border border-white/5"><div className="text-lg font-bold">{j.database==="ok"?"✓":"—"}</div><div className="text-[11px] font-mono text-muted-foreground">database</div></div>
      <div className="rounded-xl bg-black/20 p-3 border border-white/5"><div className="text-lg font-bold">{String(j.discord).includes("ok")?"✓":"—"}</div><div className="text-[11px] font-mono text-muted-foreground">discord</div></div>
    </div>;
  }catch{ return <div className="text-sm text-muted-foreground">Stats unavailable</div>; }
}
