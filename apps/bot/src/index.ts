import { Client, GatewayIntentBits, Partials, Events, EmbedBuilder } from "discord.js";
import { commands } from "./commands/index.js";
import { prisma } from "./lib/prisma.js";
import { replaceVars } from "./lib/utils.js";

if(!process.env.DISCORD_BOT_TOKEN) console.warn("⚠️ DISCORD_BOT_TOKEN not set - bot will not connect");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
});

(global as any).snipes = new Map();
(global as any).editSnipes = new Map();
(global as any).cooldowns = new Map();
(global as any).spamMap = new Map();

client.once(Events.ClientReady, async (c)=>{
  console.log(`✅ Logged in as ${c.user.tag} (ID: ${c.user.id})`);
  console.log(`📊 Guilds: ${c.guilds.cache.size}`);
  // ensure guild records
  for(const [,g] of c.guilds.cache){
    await prisma.guild.upsert({ where:{id:g.id}, update:{name:g.name, icon:g.icon, memberCount:g.memberCount}, create:{id:g.id,name:g.name,icon:g.icon,memberCount:g.memberCount}}).catch(()=>null);
  }
});

client.on(Events.GuildCreate, async (g)=>{
  await prisma.guild.upsert({ where:{id:g.id}, update:{name:g.name}, create:{id:g.id,name:g.name,icon:g.icon}}).catch(()=>null);
  console.log(`+ Guild ${g.name} (${g.id})`);
});

client.on(Events.InteractionCreate, async (interaction)=>{
  if(interaction.isChatInputCommand()){
    const cmd = commands.find(c=> c.data.name === interaction.commandName);
    if(!cmd){ await interaction.reply({content:"Unknown command",ephemeral:true}); return; }
    // custom commands fallback
    try{
      await cmd.execute(interaction as any);
    }catch(e:any){
      console.error("Command error", interaction.commandName, e);
      if(interaction.replied || interaction.deferred) await interaction.followUp({content:"❌ Error: "+e.message,ephemeral:true}).catch(()=>null);
      else await interaction.reply({content:"❌ Error: "+e.message,ephemeral:true}).catch(()=>null);
    }
    // analytics
    if(interaction.guildId) await prisma.analytics.upsert({ where:{ guildId_date:{guildId:interaction.guildId, date: new Date(new Date().toISOString().slice(0,10))} }, update:{ commands:{increment:1}}, create:{guildId:interaction.guildId, date: new Date(new Date().toISOString().slice(0,10)), commands:1}}).catch(()=>null);
    return;
  }
  if(interaction.isButton()){
    if(interaction.customId==="create_ticket"){
      await interaction.deferReply({ephemeral:true}).catch(()=>null);
      const guild = interaction.guild!;
      const existing = await prisma.ticket.findFirst({where:{guildId:guild.id, creatorId:interaction.user.id, status:"open"}}).catch(()=>null);
      // limit check: max open tickets 3 per user
      const openCount = await prisma.ticket.count({where:{guildId:guild.id, creatorId:interaction.user.id, status:"open"}}).catch(()=>0);
      if(openCount>=3) { await interaction.editReply({content:"You have too many open tickets (max 3)"} as any); return; }
      const ch = await guild.channels.create({ name: `ticket-${interaction.user.username}`, type: 0, permissionOverwrites:[{id:guild.roles.everyone, deny:["ViewChannel" as any]}, {id:interaction.user.id, allow:["ViewChannel" as any,"SendMessages" as any]}]}).catch(()=>null);
      if(!ch) { await interaction.editReply({content:"Failed to create ticket channel"} as any); return; }
      await prisma.ticket.create({data:{guildId:guild.id, channelId:ch.id, creatorId:interaction.user.id}}).catch(()=>null);
      await ch.send({embeds:[new EmbedBuilder().setTitle("Ticket").setDescription(`Hello <@${interaction.user.id}>, support will be with you shortly.`).setColor(0x5865F2)], components:[{type:1,components:[{type:2,style:4,label:"Close",custom_id:"close_ticket"}]} as any]}).catch(()=>null);
      await interaction.editReply({content:`Ticket created: <#${ch.id}>`} as any);
    }
    if(interaction.customId==="close_ticket"){
      const t=await prisma.ticket.findFirst({where:{channelId:interaction.channelId}}).catch(()=>null);
      if(t) await prisma.ticket.update({where:{id:t.id}, data:{status:"closed", closedAt:new Date()}}).catch(()=>null);
      await interaction.reply({content:"Closing in 3s..."}).catch(()=>null);
      setTimeout(()=> (interaction.channel as any)?.delete().catch(()=>null), 3000);
    }
    if(interaction.customId.startsWith("verify_")){
      const roleId=interaction.customId.split("_")[1];
      const member=await interaction.guild!.members.fetch(interaction.user.id).catch(()=>null);
      if(member && roleId) await member.roles.add(roleId).catch(()=>null);
      await interaction.reply({content:"Verified!",ephemeral:true}).catch(()=>null);
    }
  }
});

client.on(Events.GuildMemberAdd, async (member)=>{
  // analytics
  await prisma.analytics.upsert({ where:{guildId_date:{guildId:member.guild.id, date:new Date(new Date().toISOString().slice(0,10))}}, update:{joins:{increment:1}}, create:{guildId:member.guild.id, date:new Date(new Date().toISOString().slice(0,10)), joins:1}}).catch(()=>null);
  // welcome
  const welcome=await prisma.welcomeSettings.findUnique({where:{guildId:member.guild.id}}).catch(()=>null);
  if(welcome?.enabled && welcome.channelId){
    const ch=member.guild.channels.cache.get(welcome.channelId) as any;
    if(ch){
      let content = replaceVars(welcome.message||"Welcome {user} to {server}!", {user:`<@${member.id}>`, username:member.user.username, userid:member.id, server:member.guild.name, membercount: String(member.guild.memberCount)});
      let embeds=undefined;
      if(welcome.embedEnabled) embeds=[new EmbedBuilder().setTitle(welcome.embedTitle||"Welcome").setDescription(replaceVars(welcome.embedDescription||"",{user:member.user.username,server:member.guild.name})).setColor(parseInt((welcome.embedColor||"#5865F2").replace("#",""),16)).setThumbnail(member.user.displayAvatarURL())];
      await ch.send({content, embeds}).catch(()=>null);
    }
  }
  // autorole
  const ar=await prisma.autoRoleSettings.findUnique({where:{guildId:member.guild.id}}).catch(()=>null);
  if(ar?.enabled && ar.roleId){
    const role=member.guild.roles.cache.get(ar.roleId);
    const botHighest=member.guild.members.me?.roles.highest;
    if(role && botHighest && role.position < botHighest.position) await member.roles.add(role.id).catch(()=>null);
  }
  // logging
  const logging=await prisma.loggingSettings.findUnique({where:{guildId:member.guild.id}}).catch(()=>null);
  const logChId=logging?.memberLogChannelId || logging?.channelId;
  if(logging?.enabled && logging.logMemberJoin && logChId){
    const ch=member.guild.channels.cache.get(logChId) as any;
    if(ch) await ch.send({embeds:[new EmbedBuilder().setTitle("Member Joined").setDescription(`${member.user.tag} (<@${member.id}>)`).setColor(0x57F287).setThumbnail(member.user.displayAvatarURL()).setTimestamp()]}).catch(()=>null);
  }
});

client.on(Events.GuildMemberRemove, async (member)=>{
  await prisma.analytics.upsert({ where:{guildId_date:{guildId:member.guild.id, date:new Date(new Date().toISOString().slice(0,10))}}, update:{leaves:{increment:1}}, create:{guildId:member.guild.id, date:new Date(new Date().toISOString().slice(0,10)), leaves:1}}).catch(()=>null);
  const goodbye=await prisma.goodbyeSettings.findUnique({where:{guildId:member.guild.id}}).catch(()=>null);
  if(goodbye?.enabled && goodbye.channelId){
    const ch=member.guild.channels.cache.get(goodbye.channelId) as any;
    if(ch){ let content=replaceVars(goodbye.message||"Goodbye {username}",{user:member.user.tag,username:member.user.username,userid:member.id,server:member.guild.name,membercount:String(member.guild.memberCount)}); await ch.send({content}).catch(()=>null);}
  }
});

client.on(Events.MessageCreate, async (msg)=>{
  if(msg.author.bot || !msg.guild) return;
  // automod & leveling & snipe setup
  // leveling
  const lvlSettings=await prisma.levelSettings.findUnique({where:{guildId:msg.guild.id}}).catch(()=>null);
  if(!lvlSettings || lvlSettings.enabled===false){
    // default enabled with cooldown
  }
  // simple XP
  const key=`${msg.guild.id}:${msg.author.id}`;
  const last=(global as any).cooldowns.get(key);
  const now=Date.now();
  const cooldown = (lvlSettings?.cooldownSeconds||60)*1000;
  if(!last || now-last > cooldown){
    (global as any).cooldowns.set(key, now);
    const xpGain = Math.floor((lvlSettings?.xpPerMessage||15)*(lvlSettings?.xpMultiplier||1));
    if(!lvlSettings?.ignoredChannelIds?.includes(msg.channelId) && !msg.member?.roles.cache.some((r:any)=> lvlSettings?.ignoredRoleIds?.includes(r.id))){
      const current=await prisma.level.findUnique({where:{guildId_userId:{guildId:msg.guild.id,userId:msg.author.id}}}).catch(()=>null);
      const newXp=(current?.xp||0)+xpGain;
      const newLevel=Math.floor(0.1*Math.sqrt(newXp));
      if(current) await prisma.level.update({where:{id:current.id}, data:{xp:newXp, level:newLevel, messageCount:{increment:1}, lastXpAt:new Date()}}).catch(()=>null);
      else await prisma.level.create({data:{guildId:msg.guild.id,userId:msg.author.id,xp:newXp,level:newLevel,messageCount:1,lastXpAt:new Date()}}).catch(()=>null);
      // level rewards check
      if(newLevel !== current?.level){
        const rewards=(lvlSettings?.levelRewards as any) || {};
        const roleId=rewards[newLevel];
        if(roleId) await msg.member?.roles.add(roleId).catch(()=>null);
      }
    }
  }

  // automod
  const rules=await prisma.autoModRule.findMany({where:{guildId:msg.guild.id, enabled:true}}).catch(()=>[]);
  for(const rule of rules){
    const cfg=rule.config as any;
    if(rule.type==="antiLink" && cfg?.enabled!==false){
      const hasLink=/https?:\/\/\S+/.test(msg.content);
      const isInvite= /discord\.gg\/\S+/.test(msg.content);
      if(hasLink || (cfg.blockInvite && isInvite)){
        const allowed=(cfg.allowedDomains||[]).some((d:string)=> msg.content.includes(d));
        if(!allowed){ await msg.delete().catch(()=>null); await msg.channel.send({embeds:[new EmbedBuilder().setDescription(`❌ Links not allowed ${msg.author}` ).setColor(0xED4245)]}).catch(()=>null); break; }
      }
    }
    if(rule.type==="badWords"){
      const words=(cfg?.words||[]) as string[];
      if(words.some((w:string)=> msg.content.toLowerCase().includes(w.toLowerCase()))){
        await msg.delete().catch(()=>null); if(rule.action==="warn") await prisma.warning.create({data:{guildId:msg.guild.id,userId:msg.author.id,moderatorId:msg.client.user.id,reason:"Bad word"}}).catch(()=>null); break;
      }
    }
    if(rule.type==="antiSpam"){
      const map=(global as any).spamMap as Map<string, number[]>;
      const arr=map.get(msg.author.id)||[];
      const now2=Date.now();
      const filtered=arr.filter(t=> now2-t < (cfg.interval||5)*1000);
      filtered.push(now2); map.set(msg.author.id, filtered);
      if(filtered.length > (cfg.messages||5)){ await msg.delete().catch(()=>null); if(rule.action==="timeout") await msg.member?.timeout(60*1000).catch(()=>null); map.set(msg.author.id, []); break; }
    }
    if(rule.type==="mentionSpam"){
      const mentions=msg.mentions.users.size+msg.mentions.roles.size;
      if(mentions > (cfg.maxMentions||5)){ await msg.delete().catch(()=>null); break; }
    }
  }

  // custom commands via prefix "!"? check DB
  if(msg.content.startsWith("!")){
    const name=msg.content.slice(1).split(" ")[0].toLowerCase();
    const cc=await prisma.customCommand.findUnique({where:{guildId_name:{guildId:msg.guild.id,name}}}).catch(()=>null);
    if(cc?.enabled){
      let content=cc.response;
      let embeds=undefined;
      if(cc.embedEnabled) embeds=[new EmbedBuilder().setTitle(cc.embedTitle||"").setDescription(cc.embedDescription||content).setColor(parseInt((cc.embedColor||"#5865F2").replace("#",""),16))];
      await msg.channel.send({content: cc.embedEnabled? undefined : content, embeds}).catch(()=>null);
    }
  }

  // reaction roles handle via messageReactionAdd not here
  // analytics messages
  await prisma.analytics.upsert({ where:{guildId_date:{guildId:msg.guild.id, date:new Date(new Date().toISOString().slice(0,10))}}, update:{messages:{increment:1}}, create:{guildId:msg.guild.id, date:new Date(new Date().toISOString().slice(0,10)), messages:1}}).catch(()=>null);
});

client.on(Events.MessageDelete, async (msg)=>{
  if(!msg.guild || msg.author?.bot) return;
  (global as any).snipes.set(msg.channelId, {content: msg.content, author: msg.author?.tag, createdAt: Date.now()});
  const logging=await prisma.loggingSettings.findUnique({where:{guildId:msg.guild.id}}).catch(()=>null);
  const chId=logging?.messageLogChannelId || logging?.channelId;
  if(logging?.enabled && logging.logMessageDelete && chId){
    const ch=msg.guild.channels.cache.get(chId) as any;
    if(ch) await ch.send({embeds:[new EmbedBuilder().setTitle("Message Deleted").setDescription(`**Author:** ${msg.author?.tag}\n**Channel:** <#${msg.channelId}>\n**Content:** ${msg.content||"No content"}`).setColor(0xED4245).setTimestamp()]}).catch(()=>null);
  }
});
client.on(Events.MessageUpdate, async (oldMsg, newMsg)=>{
  if(!newMsg.guild || newMsg.author?.bot) return;
  (global as any).editSnipes.set(newMsg.channelId, {before: (oldMsg as any).content, after: (newMsg as any).content, author: newMsg.author?.tag});
});

client.on(Events.GuildRoleCreate, async (role)=>{
  const logging=await prisma.loggingSettings.findUnique({where:{guildId:role.guild.id}}).catch(()=>null);
  const chId=logging?.serverLogChannelId || logging?.channelId;
  if(logging?.enabled && logging.logRoleChanges && chId){
    const ch=role.guild.channels.cache.get(chId) as any;
    if(ch) await ch.send({embeds:[new EmbedBuilder().setTitle("Role Created").setDescription(`${role.name} (${role.id})`).setColor(0x57F287)]}).catch(()=>null);
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user)=>{
  if(user.bot) return;
  const rr=await prisma.reactionRole.findFirst({where:{messageId: reaction.message.id, emoji: reaction.emoji.name||reaction.emoji.toString()}}).catch(()=>null);
  if(rr){
    const member=await reaction.message.guild?.members.fetch(user.id).catch(()=>null);
    if(member) await member.roles.add(rr.roleId).catch(()=>null);
  }
  // giveaway entry
  const giveaway=await prisma.giveaway.findFirst({where:{messageId: reaction.message.id}}).catch(()=>null);
  if(giveaway && reaction.emoji.name==="🎉"){
    await prisma.giveawayEntry.upsert({where:{giveawayId_userId:{giveawayId:giveaway.id, userId:user.id}}, update:{}, create:{giveawayId:giveaway.id, userId:user.id}}).catch(()=>null);
  }
});

client.on(Events.VoiceStateUpdate, async (oldS, newS)=>{
  const logging=await prisma.loggingSettings.findUnique({where:{guildId: newS.guild.id}}).catch(()=>null);
  if(logging?.enabled && logging.logVoice && logging.voiceLogChannelId){
    const ch=newS.guild.channels.cache.get(logging.voiceLogChannelId) as any;
    if(ch) await ch.send({embeds:[new EmbedBuilder().setTitle("Voice Activity").setDescription(`<@${newS.id}> ${oldS.channelId ? `moved from <#${oldS.channelId}>`:"joined"} to ${newS.channelId? `<#${newS.channelId}>`:"left"}`).setColor(0x5865F2)]}).catch(()=>null);
  }
});

// graceful shutdown
process.on("SIGINT", async ()=>{ await prisma.$disconnect(); client.destroy(); process.exit(0); });
process.on("SIGTERM", async ()=>{ await prisma.$disconnect(); client.destroy(); process.exit(0); });

client.login(process.env.DISCORD_BOT_TOKEN).catch(e=>{ console.error("Login failed:", e.message); });
