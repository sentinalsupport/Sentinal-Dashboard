"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { LayoutDashboard, Server, Shield, Bot, Ticket, Crown, Settings, FileText, Megaphone, BarChart3, Users, Hash, Palette, Bell, Gift, MessageSquare, Verified, TrendingUp, Webhook, Key } from "lucide-react";
import { cn } from "@/lib/utils";
const nav = [
  { label:"Dashboard", href:"/dashboard", icon: LayoutDashboard },
  { label:"Servers", href:"/servers", icon: Server },
  { label:"Moderation", href:"/moderation", icon: Shield },
  { label:"AutoMod", href:"/automod", icon: Bot },
  { label:"Welcome", href:"/welcome", icon: Bell },
  { label:"Goodbye", href:"/goodbye", icon: Bell },
  { label:"Autorole", href:"/autorole", icon: Verified },
  { label:"Leveling", href:"/leveling", icon: TrendingUp },
  { label:"Tickets", href:"/tickets", icon: Ticket },
  { label:"Suggestions", href:"/suggestions", icon: MessageSquare },
  { label:"Giveaways", href:"/giveaways", icon: Gift },
  { label:"Polls", href:"/polls", icon: BarChart3 },
  { label:"Custom Commands", href:"/commands", icon: FileText },
  { label:"Embeds", href:"/embeds", icon: Palette },
  { label:"Announcements", href:"/announcements", icon: Megaphone },
  { label:"Reaction Roles", href:"/reaction-roles", icon: Users },
  { label:"Verification", href:"/verification", icon: Verified },
  { label:"Members", href:"/members", icon: Users },
  { label:"Roles", href:"/roles", icon: Users },
  { label:"Channels", href:"/channels", icon: Hash },
  { label:"Logging", href:"/logging", icon: FileText },
  { label:"Analytics", href:"/analytics", icon: BarChart3 },
  { label:"Webhooks", href:"/webhooks", icon: Webhook },
  { label:"API Keys", href:"/api-keys", icon: Key },
  { label:"Settings", href:"/settings", icon: Settings },
  { label:"Premium", href:"/premium", icon: Crown },
];
export function Sidebar({ guildId, guild: initialGuild }: { guildId?: string, guild?: any }){
  const pathname = usePathname();
  const base = guildId ? `/guild/${guildId}` : "";
  const [open,setOpen]=React.useState(false);
  const [guild,setGuild]=React.useState<any>(initialGuild || null);
  React.useEffect(()=>{
    if(initialGuild) { setGuild(initialGuild); return; }
    if(!guildId) return;
    fetch(`/api/guilds/${guildId}`, { credentials: 'include' }).then(r=>r.ok?r.json():null).then(j=>{
      if(j && !j.error) setGuild(j);
      else if(j?.name) setGuild(j);
    }).catch(()=>{});
  },[guildId, initialGuild]);
  const iconUrl = guild?.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64` : null;
  return <>
    <button onClick={()=>setOpen(!open)} className="lg:hidden fixed top-4 left-4 z-50 bg-card border rounded-md p-2">☰</button>
    <aside className={cn("w-64 shrink-0 border-r bg-card/50 backdrop-blur min-h-screen sticky top-0 hidden lg:block overflow-y-auto", open && "block fixed inset-0 z-40 w-64 lg:sticky")}>
      <div className="p-4 border-b flex items-center gap-2">
        {guildId && guild ? (
          <>
            {iconUrl ? <img src={iconUrl} alt="" className="w-8 h-8 rounded-lg ring-1 ring-white/10" /> : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffb338] to-[#ff8a2b] flex items-center justify-center text-[#1a1205] font-bold">{guild.name.slice(0,1)}</div>}
            <div className="min-w-0">
              <div className="font-semibold text-sm leading-tight truncate" style={{fontFamily:"'Space Grotesk', sans-serif"}}>{guild.name}</div>
              <div className="text-[11px] font-mono text-muted-foreground truncate">{guild.id}</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center text-white font-bold">D</div>
            <span className="font-semibold">Discord Dashboard</span>
            <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">v1.0</span>
          </>
        )}
      </div>
      <nav className="p-2 space-y-0.5">
        {nav.map(i=>{
          const href = guildId && !["/dashboard","/servers","/settings","/premium"].includes(i.href) ? base + i.href : i.href;
          const active = pathname===href || pathname.startsWith(href+"/");
          return <Link key={i.label} href={href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors", active && "bg-muted font-medium")}>
            <i.icon className="w-4 h-4" /> {i.label}
          </Link>;
        })}
      </nav>
      <div className="p-4 mt-auto border-t text-xs text-muted-foreground">
        <a href="https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands" target="_blank" className="text-primary hover:underline">Invite Bot</a>
      </div>
    </aside>
    {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={()=>setOpen(false)} />}
  </>;
}
