import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function GuildHome({ params }: { params:{ id:string } }){
  const id=params.id;
  const links=[
    {href:`/guild/${id}/welcome`,label:"Welcome System"},
    {href:`/guild/${id}/automod`,label:"AutoMod"},
    {href:`/guild/${id}/tickets`,label:"Tickets"},
    {href:`/guild/${id}/moderation`,label:"Moderation"},
    {href:`/guild/${id}/commands`,label:"Custom Commands"},
    {href:`/guild/${id}/embeds`,label:"Embed Builder"},
    {href:`/guild/${id}/logging`,label:"Logging"},
    {href:`/guild/${id}/analytics`,label:"Analytics"},
  ];
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold">Server Dashboard</h1>
    <p className="text-muted-foreground text-sm">All settings save to PostgreSQL and are consumed live by the Discord bot.</p>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map(l=> <Card key={l.href}><CardHeader><CardTitle>{l.label}</CardTitle><CardDescription>Manage {l.label.toLowerCase()}</CardDescription></CardHeader><CardContent><Link href={l.href}><Button size="sm">Open</Button></Link></CardContent></Card>)}
    </div>
  </div>;
}
