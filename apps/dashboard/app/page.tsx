import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Shield, Ticket, BarChart3 } from "lucide-react";
export default function Home(){
  return <div className="min-h-screen flex flex-col">
    <header className="border-b sticky top-0 bg-background/80 backdrop-blur z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center text-white font-bold">D</div><span className="font-bold text-lg">Discord Dashboard</span></div>
        <div className="flex gap-2">
          <Link href="/api/auth/discord"><Button>Login with Discord</Button></Link>
          <Link href="/dashboard"><Button variant="outline">Dashboard</Button></Link>
        </div>
      </div>
    </header>
    <section className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
      <div className="text-center space-y-6 py-10">
        <h1 className="text-5xl font-extrabold tracking-tight">Professional Discord<br/><span className="text-[#5865F2]">Bot & Dashboard</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Moderation, Automod, Tickets, Welcome, Leveling, Giveaways, Reaction Roles, Analytics — everything in one polished dashboard.</p>
        <div className="flex justify-center gap-3">
          <Link href="/api/auth/discord"><Button size="lg">Login with Discord</Button></Link>
          <a href="https://discord.com/api/oauth2/authorize?client_id=1493217033956102215&permissions=8&scope=bot%20applications.commands" target="_blank"><Button size="lg" variant="outline">Invite Bot</Button></a>
        </div>
        <p className="text-sm text-muted-foreground">Bot ID: 1493217033956102215 • OAuth redirect: /api/auth/discord/callback</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4 mt-8">
        {[
          {icon:Shield,title:"Moderation",desc:"Ban, Kick, Timeout, Warn, Purge, Slowmode, Lock"},
          {icon:Ticket,title:"Tickets",desc:"Panels, transcripts, claim, add/remove users"},
          {icon:Bot,title:"Automod",desc:"Anti-spam, anti-link, bad words, raid protection"},
          {icon:BarChart3,title:"Analytics",desc:"Joins, leaves, commands, tickets, XP charts"},
        ].map(c=> <Card key={c.title}><CardHeader><CardTitle className="flex items-center gap-2"><c.icon className="w-5 h-5 text-primary"/>{c.title}</CardTitle><CardDescription>{c.desc}</CardDescription></CardHeader><CardContent><span className="text-xs text-muted-foreground">Fully functional • DB backed • Bot connected</span></CardContent></Card>)}
      </div>
      <Card className="mt-8">
        <CardHeader><CardTitle>How it works</CardTitle><CardDescription>Frontend → API → Prisma → PostgreSQL → Discord Bot → Discord API</CardDescription></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>1. Login with Discord OAuth2 (identify + guilds)</p>
          <p>2. Select a server where you have Manage Server permission</p>
          <p>3. Configure Welcome, Autorole, Logging, Tickets — saved to PostgreSQL and live in the bot</p>
          <p>4. Use slash commands in Discord — all permission-checked and logged</p>
        </CardContent>
      </Card>
    </section>
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">Built with Next.js, discord.js, Prisma & PostgreSQL</footer>
  </div>;
}
