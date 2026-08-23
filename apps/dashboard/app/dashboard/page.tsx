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
      <Card><CardHeader><CardTitle>Bot Status</CardTitle></CardHeader><CardContent><BotStatus /></CardContent></Card>
      <Card><CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Guilds, members, commands tracked via /api/health</CardContent></Card>
      <Card><CardHeader><CardTitle>Next Steps</CardTitle></CardHeader><CardContent><ul className="list-disc pl-5 text-sm"><li>Select a server</li><li>Configure welcome & autorole</li><li>Try /ping in Discord</li></ul></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Invite Bot</CardTitle></CardHeader><CardContent><a className="text-primary underline" href="https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands" target="_blank">https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands</a></CardContent></Card>
  </div>;
}
async function BotStatus(){
  try{
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/health`, { cache:"no-store" });
    const j = await res.json();
    return <pre className="text-xs bg-muted p-3 rounded overflow-auto">{JSON.stringify(j,null,2)}</pre>;
  }catch(e){ return <span className="text-xs">Offline — configure DATABASE_URL & BOT_TOKEN</span>; }
}
