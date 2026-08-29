"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

function useGuildSetting(guildId: string, key: string){
  const [data,setData]=React.useState<any>(null);
  const [loading,setLoading]=React.useState(true);
  const [msg,setMsg]=React.useState("");
  React.useEffect(()=>{
    fetch(`/api/guilds/${guildId}/settings`).then(r=>r.json()).then(j=>{ setData(j[key] || j); setLoading(false);}).catch(()=>setLoading(false));
  },[guildId,key]);
  const save=async (payload:any)=>{
    setMsg("Saving...");
    const r= await fetch(`/api/guilds/${guildId}/settings`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({[key]:payload})});
    const j=await r.json();
    setMsg(r.ok?"Saved ✅":"Error: "+(j.error||r.statusText));
    setTimeout(()=>setMsg(""),3000);
  };
  return {data,loading,msg,save,setData};
}

export function WelcomeForm({guildId}:{guildId:string}){
  const {data,loading,msg,save}=useGuildSetting(guildId,"welcome");
  const [form,setForm]=React.useState<any>({});
  React.useEffect(()=>{ if(data) setForm(data); },[data]);
  if(loading) return <p>Loading...</p>;
  return <Card>
    <CardHeader><CardTitle>Welcome System</CardTitle><CardDescription>Variables: {"{user} {username} {userid} {server} {membercount}"}</CardDescription></CardHeader>
    <CardContent className="space-y-3">
      <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})} /> Enable</label>
      <Label>Channel ID</Label><Input value={form.channelId||""} onChange={e=>setForm({...form,channelId:e.target.value})} placeholder="123456789..." />
      <Label>Message</Label><Textarea value={form.message||""} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Welcome {user} to {server}!" />
      <Label>Embed Title</Label><Input value={form.embedTitle||""} onChange={e=>setForm({...form,embedTitle:e.target.value})} />
      <Label>Embed Description</Label><Textarea value={form.embedDescription||""} onChange={e=>setForm({...form,embedDescription:e.target.value})} />
      <Label>Color</Label><Input type="color" value={form.embedColor||"#5865F2"} onChange={e=>setForm({...form,embedColor:e.target.value})} />
      <div className="flex gap-2">
        <Button onClick={()=>save(form)}>Save</Button>
        <Button variant="outline" onClick={async()=>{
          const r= await fetch(`/api/guilds/${guildId}/welcome/test`,{method:"POST"});
          alert(r.ok?"Test sent to Discord":"Failed: "+await r.text());
        }}>Test (send to Discord)</Button>
      </div>
      {msg && <p className="text-sm text-primary">{msg}</p>}
      <div className="border rounded p-3 bg-muted"><p className="text-sm font-medium">Preview</p><p className="text-sm">{form.message?.replace("{user}","@User").replace("{server}","Server") || "No message"}</p></div>
    </CardContent>
  </Card>;
}

export function GenericSettings({guildId,title,desc,settingKey,fields}:{guildId:string,title:string,desc:string,settingKey:string,fields:Array<{key:string,label:string,type:string,placeholder?:string}>}){
  const {data,loading,msg,save}=useGuildSetting(guildId,settingKey);
  const [form,setForm]=React.useState<any>({});
  React.useEffect(()=>{ if(data) setForm(data); },[data]);
  if(loading) return <p>Loading...</p>;
  return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader><CardContent className="space-y-3">
    {fields.map(f=> <div key={f.key}>
      <Label>{f.label}</Label>
      {f.type==="checkbox" ? <input type="checkbox" checked={!!form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.checked})} /> :
       f.type==="textarea" ? <Textarea value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} /> :
       f.type==="color" ? <Input type="color" value={form[f.key]||"#5865F2"} onChange={e=>setForm({...form,[f.key]:e.target.value})} /> :
       <Input value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} />}
    </div>)}
    <Button onClick={()=>save(form)}>Save</Button>
    {msg && <p className="text-sm text-primary">{msg}</p>}
    </CardContent>
  </Card>;
}

export function AutomodForm({guildId}:{guildId:string}){
  const [cfg,setCfg]=React.useState<any>(null);
  const [msg,setMsg]=React.useState("");
  React.useEffect(()=>{ fetch(`/api/guilds/${guildId}/automod`).then(r=>r.json()).then(setCfg); },[guildId]);
  const save=async()=>{
    setMsg("Saving...");
    const r=await fetch(`/api/guilds/${guildId}/automod`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(cfg)});
    setMsg(r.ok?"Saved ✅":"Error");
    setTimeout(()=>setMsg(""),2000);
  };
  if(!cfg) return <div className="animate-pulse space-y-4"><div className="h-32 rounded-2xl bg-white/5"/><div className="h-32 rounded-2xl bg-white/5"/></div>;
  const update=(k:string,v:any)=> setCfg({...cfg,[k]:{...cfg[k],...v}});
  const Toggle = ({checked,onChange}:{checked:boolean,onChange:(v:boolean)=>void})=> <button onClick={()=>onChange(!checked)} className={`relative w-11 h-6 rounded-full transition ${checked?"bg-[#ffb338]":"bg-white/10"} border border-white/10`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition ${checked?"translate-x-5":""}`} /></button>;
  return <div className="space-y-6">
    <div className="rounded-[18px] border border-white/5 bg-gradient-to-br from-[#121724] via-[#0e1322] to-[#07090e] p-5 flex items-center justify-between">
      <div><h2 className="font-bold text-lg" style={{fontFamily:"'Space Grotesk', sans-serif"}}>Moderation — AutoMod</h2><p className="text-sm text-[#9aa4b8]">Security Bot-style protection, live from dashboard to Discord.</p></div>
      <Button onClick={save} className="bg-[#ffb338] text-[#1a1205] hover:bg-[#ffbe55] font-semibold shadow-[0_8px_20px_rgba(255,179,56,0.35)]">Save All</Button>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
    <Card className="border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.02] hover:border-[#ffb338]/20 transition"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-[15px]"><span className="w-8 h-8 rounded-lg bg-[#ffb338]/15 border border-[#ffb338]/20 grid place-items-center text-[#ffb338]">⚡</span> Anti-Spam</CardTitle><Toggle checked={!!cfg.antiSpam?.enabled} onChange={v=>update("antiSpam",{enabled:v})} /></CardHeader><CardContent className="space-y-3">
      <div><Label className="text-xs text-[#9aa4b8]">Messages / Interval</Label><div className="flex gap-2 mt-1"><Input type="number" className="bg-black/20" value={cfg.antiSpam?.messages||5} onChange={e=>update("antiSpam",{messages:parseInt(e.target.value)})} /><Input type="number" className="bg-black/20" value={cfg.antiSpam?.interval||5} onChange={e=>update("antiSpam",{interval:parseInt(e.target.value)})} /></div></div>
      <div><Label className="text-xs text-[#9aa4b8]">Action</Label><select value={cfg.antiSpam?.action||"delete"} onChange={e=>update("antiSpam",{action:e.target.value})} className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm"><option value="delete">Delete message</option><option value="warn">Warn</option><option value="timeout">Timeout 10m</option></select></div>
    </CardContent></Card>
    <Card className="border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.02] hover:border-[#6a8cff]/20 transition"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-[15px]"><span className="w-8 h-8 rounded-lg bg-[#6a8cff]/15 border border-[#6a8cff]/20 grid place-items-center text-[#6a8cff]">🔗</span> Anti-Link</CardTitle><Toggle checked={!!cfg.antiLink?.enabled} onChange={v=>update("antiLink",{enabled:v})} /></CardHeader><CardContent className="space-y-3">
      <div><Label className="text-xs text-[#9aa4b8]">Allowed domains</Label><Input className="bg-black/20 mt-1" placeholder="example.com, yoursite.gg" value={(cfg.antiLink?.allowedDomains||[]).join(", ")} onChange={e=>update("antiLink",{allowedDomains:e.target.value.split(",").map((s:string)=>s.trim()).filter(Boolean)})} /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!cfg.antiLink?.blockInvite} onChange={e=>update("antiLink",{blockInvite:e.target.checked})} className="accent-[#6a8cff]" /> Block Discord invites</label>
    </CardContent></Card>
    <Card className="border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.02]"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-[15px]"><span className="w-8 h-8 rounded-lg bg-[#ff5d5d]/15 border border-[#ff5d5d]/20 grid place-items-center text-[#ff5d5d]">⛔</span> Bad Words</CardTitle><Toggle checked={!!cfg.badWords?.enabled} onChange={v=>update("badWords",{enabled:v})} /></CardHeader><CardContent>
      <Label className="text-xs text-[#9aa4b8]">Words (comma separated)</Label><Input className="bg-black/20 mt-1" placeholder="badword1, badword2" value={(cfg.badWords?.words||[]).join(", ")} onChange={e=>update("badWords",{words:e.target.value.split(",").map((s:string)=>s.trim()).filter(Boolean)})} />
    </CardContent></Card>
    <Card className="border-[#ffb338]/20 bg-gradient-to-br from-[#ffb338]/10 via-[#121724] to-[#0e1322]"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-[15px]"><span className="w-8 h-8 rounded-lg bg-[#ff5d5d]/20 border border-[#ff5d5d]/30 grid place-items-center">🛡️</span> Raid Protection</CardTitle><Toggle checked={!!cfg.raid?.enabled} onChange={v=>update("raid",{enabled:v})} /></CardHeader><CardContent className="space-y-3">
      <div className="grid grid-cols-2 gap-2"><div><Label className="text-xs text-[#9aa4b8]">Threshold</Label><Input type="number" className="bg-black/20 mt-1" value={cfg.raid?.threshold||10} onChange={e=>update("raid",{threshold:parseInt(e.target.value)})} /></div><div><Label className="text-xs text-[#9aa4b8]">Window (s)</Label><Input type="number" className="bg-black/20 mt-1" value={cfg.raid?.window||60} onChange={e=>update("raid",{window:parseInt(e.target.value)})} /></div></div>
      <div><Label className="text-xs text-[#9aa4b8]">Action</Label><select value={cfg.raid?.action||"lock"} onChange={e=>update("raid",{action:e.target.value})} className="w-full mt-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm"><option value="lock">Lock all channels</option><option value="timeout">Timeout mass joiners</option></select></div>
    </CardContent></Card>
    </div>
    <div className="flex items-center gap-3"><Button onClick={save} className="bg-[#ffb338] text-[#1a1205] hover:bg-[#ffbe55] font-semibold px-8">Save Automod</Button>{msg && <span className="text-sm text-[#3dd68c]">{msg}</span>}<span className="text-xs font-mono text-[#677084]">Security Bot-style • live via Prisma</span></div>
  </div>;
}

export function CustomCommands({guildId}:{guildId:string}){
  const [list,setList]=React.useState<any[]>([]);
  const [form,setForm]=React.useState({name:"",response:"",enabled:true});
  const load=()=> fetch(`/api/guilds/${guildId}/commands`).then(r=>r.json()).then(j=> setList(Array.isArray(j)?j:j.commands||[]));
  React.useEffect(()=>{ load(); },[]);
  const create=async()=>{
    const r=await fetch(`/api/guilds/${guildId}/commands`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    if(r.ok){ setForm({name:"",response:"",enabled:true}); load(); } else alert(await r.text());
  };
  return <div className="space-y-4">
    <Card><CardHeader><CardTitle>Create Custom Command</CardTitle></CardHeader><CardContent className="space-y-2">
      <Label>Name (without slash, a-z0-9_-)</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="rules" />
      <Label>Response</Label><Textarea value={form.response} onChange={e=>setForm({...form,response:e.target.value})} placeholder="Please read the rules..." />
      <Button onClick={create}>Create</Button>
    </CardContent></Card>
    <div className="grid gap-2">
      {list.map((c:any)=><Card key={c.id}><CardContent className="pt-4 flex justify-between items-center">
        <div><p className="font-medium">/{c.name}</p><p className="text-sm text-muted-foreground">{c.response}</p></div>
        <Button variant="outline" onClick={async()=>{ await fetch(`/api/guilds/${guildId}/commands/${c.id}`,{method:"DELETE"}); load(); }}>Delete</Button>
      </CardContent></Card>)}
      {list.length===0 && <p className="text-sm text-muted-foreground">No custom commands yet.</p>}
    </div>
  </div>;
}

export function EmbedBuilder({guildId}:{guildId:string}){
  const [e,setE]=React.useState({title:"Hello",description:"This is an embed",color:"#5865F2",channelId:""});
  const [preview,setPreview]=React.useState(false);
  const send=async()=>{
    const r=await fetch(`/api/guilds/${guildId}/embeds`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});
    alert(r.ok?"Sent to Discord":"Failed "+await r.text());
  };
  return <div className="grid lg:grid-cols-2 gap-4">
    <Card><CardHeader><CardTitle>Embed Builder</CardTitle></CardHeader><CardContent className="space-y-2">
      <Label>Channel ID</Label><Input value={e.channelId} onChange={ev=>setE({...e,channelId:ev.target.value})} placeholder="Channel ID to send to" />
      <Label>Title</Label><Input value={e.title} onChange={ev=>setE({...e,title:ev.target.value})} />
      <Label>Description</Label><Textarea value={e.description} onChange={ev=>setE({...e,description:ev.target.value})} />
      <Label>Color</Label><Input type="color" value={e.color} onChange={ev=>setE({...e,color:ev.target.value})} />
      <Button onClick={send}>Send Embed to Discord</Button>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Live Preview (Discord-style)</CardTitle></CardHeader><CardContent>
      <div className="border-l-4 rounded p-3 bg-[#2b2d31] text-white" style={{borderColor:e.color}}><p className="font-bold">{e.title}</p><p className="text-sm text-zinc-300">{e.description}</p></div>
    </CardContent></Card>
  </div>;
}
