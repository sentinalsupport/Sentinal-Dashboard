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
  return <div className="max-w-6xl mx-auto p-6 space-y-6">
    <h1 className="text-2xl font-bold">Select a server</h1>
    <p className="text-muted-foreground text-sm">Only servers where you have Manage Server permission can be managed. Bot must be invited.</p>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guilds.map(g=>{
        const canManage = hasManageGuild(parseInt(g.permissions));
        const hasBot = botGuilds.has(g.id);
        const icon = getGuildIconUrl(g.id, g.icon);
        return <Card key={g.id} className={canManage ? "" : "opacity-60"}>
          <CardHeader className="flex flex-row items-center gap-3">
            {icon ? <img src={icon} alt="" className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">{g.name.slice(0,2)}</div>}
            <div><CardTitle className="text-base">{g.name}</CardTitle><span className="text-xs text-muted-foreground">{g.id} • {g.owner?"Owner":"Member"}</span></div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-xs">{hasBot ? "✅ Bot installed" : "❌ Bot not installed"} {canManage ? "• ✅ Manage" : "• ❌ No permission"}</span>
            {canManage ? (hasBot ? <Link href={`/guild/${g.id}`}><Button size="sm">Manage</Button></Link> : <a href={`https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`} target="_blank"><Button size="sm" variant="outline">Invite</Button></a>) : <Button size="sm" disabled>No Access</Button>}
          </CardContent>
        </Card>;
      })}
    </div>
  </div>;
}
