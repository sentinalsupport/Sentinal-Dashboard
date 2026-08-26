import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function GuildLayout({ children, params }: { children: React.ReactNode; params: { id: string } }){
  const s = await getSession();
  if(!s) redirect("/api/auth/discord");
  let guild:any = null;
  try{
    if(process.env.DISCORD_BOT_TOKEN){
      const r = await fetch(`https://discord.com/api/v10/guilds/${params.id}`, { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }, next: { revalidate: 30 } });
      if(r.ok) guild = await r.json();
    }
  }catch{}
  const iconUrl = guild?.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : null;
  return <div className="flex min-h-screen">
    <Sidebar guildId={params.id} />
    <div className="flex-1 min-w-0 bg-background">
      <div className="border-b px-6 py-4 flex items-center justify-between bg-card/50 sticky top-0 z-10 backdrop-blur">
        <div className="flex items-center gap-3">
          {iconUrl ? <img src={iconUrl} alt="" className="w-9 h-9 rounded-xl ring-1 ring-white/10" /> : <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1c233a] to-[#121724] border border-white/5 grid place-items-center text-white font-bold">{(guild?.name || params.id).slice(0,2).toUpperCase()}</div>}
          <div>
            <div className="font-semibold leading-tight" style={{fontFamily:"'Space Grotesk', sans-serif"}}>{guild?.name || `Guild ${params.id}`}</div>
            <div className="text-xs font-mono text-muted-foreground">{guild?.id || params.id} • {guild?.member_count ? `${guild.member_count} members` : ""}</div>
          </div>
        </div>
        <a href="/servers" className="text-sm text-primary hover:underline">Change server</a>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>;
}
