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
  if(!cfg) return <p>Loading...</p>;
  const update=(k:string,v:any)=> setCfg({...cfg,[k]:{...cfg[k],...v}});
  return <div className="space-y-4">
    <Card><CardHeader><CardTitle>Anti-Spam</CardTitle></CardHeader><CardContent className="space-y-2">
      <label className="flex gap-2"><input type="checkbox" checked={!!cfg.antiSpam?.enabled} onChange={e=>update("antiSpam",{enabled:e.target.checked})} /> Enabled</label>
      <Label>Messages per interval</Label><Input type="number" value={cfg.antiSpam?.messages||5} onChange={e=>update("antiSpam",{messages:parseInt(e.target.value)})} />
      <Label>Interval (s)</Label><Input type="number" value={cfg.antiSpam?.interval||5} onChange={e=>update("antiSpam",{interval:parseInt(e.target.value)})} />
      <Label>Action</Label><select value={cfg.antiSpam?.action||"delete"} onChange={e=>update("antiSpam",{action:e.target.value})} className="border rounded px-2 py-1"><option value="delete">Delete</option><option value="warn">Warn</option><option value="timeout">Timeout</option></select>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Anti-Link</CardTitle></CardHeader><CardContent className="space-y-2">
      <label className="flex gap-2"><input type="checkbox" checked={!!cfg.antiLink?.enabled} onChange={e=>update("antiLink",{enabled:e.target.checked})} /> Enabled</label>
      <Label>Allowed domains (comma separated)</Label><Input value={(cfg.antiLink?.allowedDomains||[]).join(",")} onChange={e=>update("antiLink",{allowedDomains:e.target.value.split(",").map((s:string)=>s.trim()).filter(Boolean)})} />
      <label className="flex gap-2"><input type="checkbox" checked={!!cfg.antiLink?.blockInvite} onChange={e=>update("antiLink",{blockInvite:e.target.checked})} /> Block Discord invites</label>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Bad Words</CardTitle></CardHeader><CardContent className="space-y-2">
      <label className="flex gap-2"><input type="checkbox" checked={!!cfg.badWords?.enabled} onChange={e=>update("badWords",{enabled:e.target.checked})} /> Enabled</label>
      <Label>Words (comma separated)</Label><Input value={(cfg.badWords?.words||[]).join(",")} onChange={e=>update("badWords",{words:e.target.value.split(",").map((s:string)=>s.trim()).filter(Boolean)})} />
    </CardContent></Card>
    <Button onClick={save}>Save Automod</Button>{msg && <span className="ml-2 text-sm">{msg}</span>}
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
