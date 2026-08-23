// @ts-nocheck
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChatInputCommandInteraction, PermissionsBitField, ChannelType } from "discord.js";
import { prisma } from "../lib/prisma.js";
import { embed, replaceVars } from "../lib/utils.js";

export interface BotCommand { data: SlashCommandBuilder | any; execute: (i: ChatInputCommandInteraction)=>Promise<any>; }

function e(t:string,d:string){ return new EmbedBuilder().setTitle(t).setDescription(d).setColor(0x5865F2).setTimestamp(); }

export const commands: BotCommand[] = [
  // GENERAL
  { data: new SlashCommandBuilder().setName("ping").setDescription("Check bot ping"), execute: async (i)=> {
    await i.reply({ embeds:[ e("Pong!", `🏓 Latency: ${Date.now()-i.createdTimestamp}ms\nAPI: ${Math.round(i.client.ws.ping)}ms`)] });
  }},
  { data: new SlashCommandBuilder().setName("help").setDescription("Show help"), execute: async (i)=>{
    const list = commands.map(c=> `/${c.data.name} - ${c.data.description}`).join("\n");
    await i.reply({ embeds:[ e("Help", "```"+list.slice(0,3900)+"```")], ephemeral:true });
  }},
  { data: new SlashCommandBuilder().setName("about").setDescription("About the bot"), execute: async (i)=>{ await i.reply({embeds:[e("About","Professional Discord bot with dashboard, moderation, tickets, automod, leveling & more.").setFooter({text:"ID: 1493217033956102215"})]}); }},
  { data: new SlashCommandBuilder().setName("botinfo").setDescription("Bot info"), execute: async (i)=>{
    const c=i.client; await i.reply({embeds:[e("Bot Info", `Guilds: ${c.guilds.cache.size}\nUsers: ${c.users.cache.size}\nUptime: ${Math.floor(c.uptime!/1000)}s\nPing: ${c.ws.ping}ms`)]});
  }},
  { data: new SlashCommandBuilder().setName("serverinfo").setDescription("Server info"), execute: async (i)=>{
    if(!i.guild) return i.reply({content:"Guild only",ephemeral:true});
    const g=i.guild; await i.reply({embeds:[e(g.name, `ID: ${g.id}\nOwner: <@${g.ownerId}>\nMembers: ${g.memberCount}\nCreated: <t:${Math.floor(g.createdTimestamp/1000)}:F>`).setThumbnail(g.iconURL())]});
  }},
  { data: new SlashCommandBuilder().setName("userinfo").setDescription("User info").addUserOption(o=>o.setName("user").setDescription("user").setRequired(false)), execute: async (i)=>{
    const u=i.options.getUser("user")||i.user; const m=i.guild?.members.cache.get(u.id);
    await i.reply({embeds:[e(u.tag, `ID: ${u.id}\nJoined: ${m? `<t:${Math.floor(m.joinedTimestamp!/1000)}:R>`:"Unknown"}`).setThumbnail(u.displayAvatarURL())]});
  }},
  { data: new SlashCommandBuilder().setName("avatar").setDescription("Show avatar").addUserOption(o=>o.setName("user").setDescription("user")), execute: async (i)=>{
    const u=i.options.getUser("user")||i.user; await i.reply({embeds:[e(`${u.tag} Avatar`,"").setImage(u.displayAvatarURL({size:512}))]});
  }},
  { data: new SlashCommandBuilder().setName("banner").setDescription("Show banner").addUserOption(o=>o.setName("user").setDescription("user")), execute: async (i)=>{
    const u=i.options.getUser("user")||i.user; const fetched=await i.client.users.fetch(u.id,{force:true}); const url=fetched.bannerURL({size:512}); await i.reply({embeds:[url? e(`${u.tag} Banner`,"").setImage(url) : e("No banner","User has no banner")]});
  }},
  { data: new SlashCommandBuilder().setName("roleinfo").setDescription("Role info").addRoleOption(o=>o.setName("role").setDescription("role").setRequired(true)), execute: async (i)=>{
    const r=i.options.getRole("role",true); await i.reply({embeds:[e(`Role: ${r.name}`, `ID: ${r.id}\nColor: ${r.hexColor}\nMentionable: ${r.mentionable}`)]});
  }},
  { data: new SlashCommandBuilder().setName("channelinfo").setDescription("Channel info").addChannelOption(o=>o.setName("channel").setDescription("channel")), execute: async (i)=>{
    const c=i.options.getChannel("channel")||i.channel; await i.reply({embeds:[e("Channel Info", `ID: ${c.id}\nType: ${c.type}`)]});
  }},
  { data: new SlashCommandBuilder().setName("uptime").setDescription("Uptime"), execute: async (i)=>{ await i.reply({embeds:[e("Uptime", `<t:${Math.floor((Date.now()-i.client.uptime!)/1000)}:R>`)]}) }},
  { data: new SlashCommandBuilder().setName("stats").setDescription("Bot stats"), execute: async (i)=>{
    const c=i.client; await i.reply({embeds:[e("Stats", `Guilds: ${c.guilds.cache.size}\nPing: ${c.ws.ping}ms\nMemory: ${(process.memoryUsage().heapUsed/1024/1024).toFixed(1)}MB`)]});
  }},

  // MODERATION
  { data: new SlashCommandBuilder().setName("ban").setDescription("Ban a user").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)).addStringOption(o=>o.setName("reason").setDescription("reason")).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), execute: async (i)=>{
    if(!i.guild) return;
    const user=i.options.getUser("user",true); const reason=i.options.getString("reason")||"No reason";
    const member=await i.guild.members.fetch(user.id).catch(()=>null);
    if(member && !member.bannable) return i.reply({content:"Cannot ban - hierarchy",ephemeral:true});
    await i.guild.members.ban(user.id,{reason}).catch(e=>null);
    await prisma.moderationAction.create({data:{guildId:i.guild.id, userId:user.id, moderatorId:i.user.id, action:"ban", reason}}).catch(()=>null);
    await i.reply({embeds:[e("Banned", `${user.tag} banned. Reason: ${reason}`)]});
  }},
  { data: new SlashCommandBuilder().setName("unban").setDescription("Unban").addStringOption(o=>o.setName("userid").setDescription("user id").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), execute: async (i)=>{
    const id=i.options.getString("userid",true); await i.guild!.bans.remove(id).catch(()=>null); await i.reply({embeds:[e("Unbanned", `Unbanned ${id}`)]});
  }},
  { data: new SlashCommandBuilder().setName("kick").setDescription("Kick").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)).addStringOption(o=>o.setName("reason").setDescription("reason")).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), execute: async (i)=>{
    const u=i.options.getUser("user",true); const m=await i.guild!.members.fetch(u.id).catch(()=>null); if(!m) return i.reply({content:"Member not found",ephemeral:true}); if(!m.kickable) return i.reply({content:"Cannot kick",ephemeral:true}); await m.kick(i.options.getString("reason")||undefined); await prisma.moderationAction.create({data:{guildId:i.guild!.id,userId:u.id,moderatorId:i.user.id,action:"kick",reason:i.options.getString("reason")}}).catch(()=>null); await i.reply({embeds:[e("Kicked", `${u.tag} kicked`)]});
  }},
  { data: new SlashCommandBuilder().setName("timeout").setDescription("Timeout").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)).addIntegerOption(o=>o.setName("duration").setDescription("minutes").setRequired(true)).addStringOption(o=>o.setName("reason").setDescription("reason")).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), execute: async (i)=>{
    const u=i.options.getUser("user",true); const mins=i.options.getInteger("duration",true); const m=await i.guild!.members.fetch(u.id).catch(()=>null); if(!m) return i.reply({content:"Not found",ephemeral:true}); await m.timeout(mins*60*1000, i.options.getString("reason")||undefined); await prisma.moderationAction.create({data:{guildId:i.guild!.id,userId:u.id,moderatorId:i.user.id,action:"timeout",reason:i.options.getString("reason"),duration:mins}}).catch(()=>null); await i.reply({embeds:[e("Timeout", `${u.tag} timed out for ${mins}m`)]});
  }},
  { data: new SlashCommandBuilder().setName("untimeout").setDescription("Remove timeout").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), execute: async (i)=>{
    const u=i.options.getUser("user",true); const m=await i.guild!.members.fetch(u.id).catch(()=>null); if(m) await m.timeout(null); await i.reply({embeds:[e("Timeout removed", `${u.tag}`)]});
  }},
  { data: new SlashCommandBuilder().setName("warn").setDescription("Warn user").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)).addStringOption(o=>o.setName("reason").setDescription("reason").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), execute: async (i)=>{
    const u=i.options.getUser("user",true); const reason=i.options.getString("reason",true); await prisma.warning.create({data:{guildId:i.guild!.id,userId:u.id,moderatorId:i.user.id,reason}}); await prisma.moderationAction.create({data:{guildId:i.guild!.id,userId:u.id,moderatorId:i.user.id,action:"warn",reason}}).catch(()=>null); await i.reply({embeds:[e("Warned", `${u.tag} warned: ${reason}`)]});
  }},
  { data: new SlashCommandBuilder().setName("warnings").setDescription("Show warnings").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)), execute: async (i)=>{
    const u=i.options.getUser("user",true); const warns=await prisma.warning.findMany({where:{guildId:i.guild!.id,userId:u.id},orderBy:{createdAt:"desc"}}); if(!warns.length) return i.reply({embeds:[e("Warnings","No warnings")],ephemeral:true}); await i.reply({embeds:[e(`Warnings for ${u.tag}`, warns.map((w,idx)=> `${idx+1}. ${w.reason} - <t:${Math.floor(w.createdAt.getTime()/1000)}:R> by <@${w.moderatorId}>`).join("\n"))],ephemeral:true});
  }},
  { data: new SlashCommandBuilder().setName("clear").setDescription("Clear messages").addIntegerOption(o=>o.setName("amount").setDescription("1-100").setRequired(true).setMinValue(1).setMaxValue(100)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), execute: async (i)=>{
    const amt=i.options.getInteger("amount",true); if(i.channel?.type===ChannelType.GuildText) await (i.channel as any).bulkDelete(amt,true).catch(()=>null); await i.reply({content:`Cleared ${amt} messages`,ephemeral:true});
  }},
  { data: new SlashCommandBuilder().setName("purge").setDescription("Purge by user").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)).addIntegerOption(o=>o.setName("amount").setDescription("amount").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), execute: async (i)=>{
    const u=i.options.getUser("user",true); const amt=i.options.getInteger("amount")||20; const ch=i.channel as any; const msgs=await ch.messages.fetch({limit:100}); const filtered=[...msgs.values()].filter((m:any)=> m.author.id===u.id).slice(0,amt); await ch.bulkDelete(filtered,true).catch(()=>null); await i.reply({content:`Purged ${filtered.length} messages from ${u.tag}`,ephemeral:true});
  }},
  { data: new SlashCommandBuilder().setName("slowmode").setDescription("Set slowmode").addIntegerOption(o=>o.setName("seconds").setDescription("0-21600").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), execute: async (i)=>{
    const s=i.options.getInteger("seconds",true); await (i.channel as any).setRateLimitPerUser(s); await i.reply({embeds:[e("Slowmode", `Set to ${s}s`)]});
  }},
  { data: new SlashCommandBuilder().setName("lock").setDescription("Lock channel").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), execute: async (i)=>{
    await (i.channel as any).permissionOverwrites.edit(i.guild!.roles.everyone,{SendMessages:false}); await i.reply({embeds:[e("Locked","Channel locked")]});
  }},
  { data: new SlashCommandBuilder().setName("unlock").setDescription("Unlock channel").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), execute: async (i)=>{
    await (i.channel as any).permissionOverwrites.edit(i.guild!.roles.everyone,{SendMessages:null}); await i.reply({embeds:[e("Unlocked","Channel unlocked")]});
  }},
  { data: new SlashCommandBuilder().setName("lockall").setDescription("Lock all channels").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), execute: async (i)=>{
    for(const [,ch] of i.guild!.channels.cache) if(ch.type===ChannelType.GuildText) await (ch as any).permissionOverwrites.edit(i.guild!.roles.everyone,{SendMessages:false}).catch(()=>null); await i.reply({embeds:[e("Lockall","All channels locked")]});
  }},
  { data: new SlashCommandBuilder().setName("unlockall").setDescription("Unlock all").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), execute: async (i)=>{
    for(const [,ch] of i.guild!.channels.cache) if(ch.type===ChannelType.GuildText) await (ch as any).permissionOverwrites.edit(i.guild!.roles.everyone,{SendMessages:null}).catch(()=>null); await i.reply({embeds:[e("Unlockall","All channels unlocked")]});
  }},
  { data: new SlashCommandBuilder().setName("nick").setDescription("Change nickname").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)).addStringOption(o=>o.setName("nickname").setDescription("nickname").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames), execute: async (i)=>{
    const u=i.options.getUser("user",true); const nick=i.options.getString("nickname",true); const m=await i.guild!.members.fetch(u.id); await m.setNickname(nick).catch(()=>null); await i.reply({embeds:[e("Nickname", `${u.tag} -> ${nick}`)]});
  }},
  { data: new SlashCommandBuilder().setName("softban").setDescription("Softban (ban+unban to clear)").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), execute: async (i)=>{
    const u=i.options.getUser("user",true); await i.guild!.members.ban(u.id,{deleteMessageDays:1}).catch(()=>null); await i.guild!.bans.remove(u.id).catch(()=>null); await i.reply({embeds:[e("Softban", `${u.tag} softbanned`)]});
  }},

  // UTILITY
  { data: new SlashCommandBuilder().setName("announce").setDescription("Announce").addChannelOption(o=>o.setName("channel").setDescription("channel").setRequired(true)).addStringOption(o=>o.setName("message").setDescription("message").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), execute: async (i)=>{
    const ch=i.options.getChannel("channel",true) as any; const msg=i.options.getString("message",true); await ch.send({embeds:[e("📢 Announcement",msg)]}) ; await i.reply({content:"Announced",ephemeral:true});
  }},
  { data: new SlashCommandBuilder().setName("embed").setDescription("Send embed").addChannelOption(o=>o.setName("channel").setDescription("channel").setRequired(true)).addStringOption(o=>o.setName("title").setDescription("title").setRequired(true)).addStringOption(o=>o.setName("description").setDescription("desc").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), execute: async (i)=>{
    const ch=i.options.getChannel("channel",true) as any; const title=i.options.getString("title",true); const desc=i.options.getString("description",true); await ch.send({embeds:[e(title,desc)]}); await i.reply({content:"Sent",ephemeral:true});
  }},
  { data: new SlashCommandBuilder().setName("poll").setDescription("Create poll").addStringOption(o=>o.setName("question").setDescription("question").setRequired(true)).addStringOption(o=>o.setName("options").setDescription("comma separated").setRequired(true)), execute: async (i)=>{
    const q=i.options.getString("question",true); const opts=i.options.getString("options",true).split(",").map(s=>s.trim()); const emojis=["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣"]; let desc=opts.map((o,idx)=> `${emojis[idx]} ${o}`).join("\n"); const msg=await i.reply({embeds:[e(`📊 ${q}`,desc)], fetchReply:true}) as any; for(let idx=0; idx<opts.length && idx<5; idx++) await (msg as any).react(emojis[idx]).catch(()=>null);
  }},
  { data: new SlashCommandBuilder().setName("remind").setDescription("Remind").addStringOption(o=>o.setName("message").setDescription("msg").setRequired(true)).addIntegerOption(o=>o.setName("minutes").setDescription("minutes").setRequired(true)), execute: async (i)=>{
    const msg=i.options.getString("message",true); const mins=i.options.getInteger("minutes",true); await i.reply({content:`⏰ I'll remind you in ${mins} minutes: ${msg}`,ephemeral:true}); setTimeout(()=> i.followUp({content:`⏰ Reminder: ${msg}`,ephemeral:false}).catch(()=>null), mins*60*1000);
  }},
  { data: new SlashCommandBuilder().setName("afk").setDescription("Set AFK").addStringOption(o=>o.setName("reason").setDescription("reason")), execute: async (i)=>{
    const r=i.options.getString("reason")||"AFK"; // store in memory? for demo just reply
    await i.reply({embeds:[e("AFK", `${i.user.tag} is now AFK: ${r}`)]});
  }},
  { data: new SlashCommandBuilder().setName("snipe").setDescription("Snipe deleted message"), execute: async (i)=>{
    const s=(global as any).snipes?.get(i.channelId); if(!s) return i.reply({content:"Nothing to snipe",ephemeral:true}); await i.reply({embeds:[e(`Sniped by ${s.author}`, s.content).setFooter({text:`Channel: ${i.channel?.id}`})]});
  }},
  { data: new SlashCommandBuilder().setName("editsnipe").setDescription("Snipe edited"), execute: async (i)=>{
    const s=(global as any).editSnipes?.get(i.channelId); if(!s) return i.reply({content:"Nothing",ephemeral:true}); await i.reply({embeds:[e(`Edit snipe ${s.author}`, `Before: ${s.before}\nAfter: ${s.after}`)]});
  }},

  // TICKETS
  { data: new SlashCommandBuilder().setName("ticket").setDescription("Create ticket"), execute: async (i)=>{
    if(!i.guild) return;
    // simple ticket creation: create channel
    const cat = await prisma.ticket.findFirst({where:{guildId:i.guild.id}}).catch(()=>null);
    // create channel
    const ch=await i.guild.channels.create({name:`ticket-${i.user.username}`, type: ChannelType.GuildText, permissionOverwrites:[{id:i.guild.roles.everyone, deny:[PermissionsBitField.Flags.ViewChannel]}, {id:i.user.id, allow:[PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]}]}).catch(()=>null);
    if(!ch) return i.reply({content:"Failed to create ticket",ephemeral:true});
    await prisma.ticket.create({data:{guildId:i.guild.id, channelId:ch.id, creatorId:i.user.id}}).catch(()=>null);
    await ch.send({embeds:[e("Ticket Created", `Hello <@${i.user.id}>, support will be with you shortly.`)]});
    await i.reply({content:`Ticket created: <#${ch.id}>`,ephemeral:true});
  }},
  { data: new SlashCommandBuilder().setName("ticketpanel").setDescription("Create ticket panel").addChannelOption(o=>o.setName("channel").setDescription("channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), execute: async (i)=>{
    const ch=i.options.getChannel("channel",true) as any; const row={type:1,components:[{type:2,style:1,label:"🎫 Create Ticket",custom_id:"create_ticket"}]} as any; await ch.send({embeds:[e("Support Tickets","Click to create a ticket")], components:[row]}); await i.reply({content:"Panel created",ephemeral:true});
  }},
  { data: new SlashCommandBuilder().setName("close").setDescription("Close ticket").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), execute: async (i)=>{
    if(!i.channel || !("delete" in i.channel)) return i.reply({content:"Not in ticket",ephemeral:true});
    const t=await prisma.ticket.findFirst({where:{channelId:i.channelId}}); if(t) await prisma.ticket.update({where:{id:t.id},data:{status:"closed"}});
    await i.reply({content:"Closing ticket..."});
    setTimeout(()=> (i.channel as any).delete().catch(()=>null), 2000);
  }},
  { data: new SlashCommandBuilder().setName("add").setDescription("Add user to ticket").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)), execute: async (i)=>{
    const u=i.options.getUser("user",true); await (i.channel as any).permissionOverwrites.edit(u.id,{ViewChannel:true,SendMessages:true}); await i.reply({content:`Added ${u.tag}`});
  }},
  { data: new SlashCommandBuilder().setName("remove").setDescription("Remove user").addUserOption(o=>o.setName("user").setDescription("user").setRequired(true)), execute: async (i)=>{
    const u=i.options.getUser("user",true); await (i.channel as any).permissionOverwrites.delete(u.id).catch(()=>null); await i.reply({content:`Removed ${u.tag}`});
  }},
  { data: new SlashCommandBuilder().setName("claim").setDescription("Claim ticket"), execute: async (i)=>{
    const t=await prisma.ticket.findFirst({where:{channelId:i.channelId}}); if(t) await prisma.ticket.update({where:{id:t.id},data:{claimedById:i.user.id}}); await i.reply({embeds:[e("Claimed", `Claimed by ${i.user.tag}`)]});
  }},
  { data: new SlashCommandBuilder().setName("transcript").setDescription("Transcript").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), execute: async (i)=>{
    await i.deferReply({ephemeral:true});
    const msgs=await (i.channel as any).messages.fetch({limit:100}).catch(()=>null); let txt="Transcript:\n"; if(msgs) for(const [,m] of msgs) txt+=`[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content}\n`;
    await i.editReply({content: "```"+txt.slice(0,1900)+"```"});
  }},

  // CONFIG
  { data: new SlashCommandBuilder().setName("settings").setDescription("Show settings"), execute: async (i)=>{
    if(!i.guild) return; const w=await prisma.welcomeSettings.findUnique({where:{guildId:i.guild.id}}); await i.reply({embeds:[e("Settings", `Welcome: ${w?.enabled?"enabled":"disabled"}\nChannel: ${w?.channelId||"none"}`)],ephemeral:true});
  }},
  { data: new SlashCommandBuilder().setName("config").setDescription("Config help"), execute: async (i)=>{ await i.reply({content:"Use dashboard: /guild/"+i.guildId+"/welcome etc",ephemeral:true}); }},
  { data: new SlashCommandBuilder().setName("setwelcome").setDescription("Set welcome").addChannelOption(o=>o.setName("channel").setDescription("channel").setRequired(true)).addStringOption(o=>o.setName("message").setDescription("msg").setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), execute: async (i)=>{
    const ch=i.options.getChannel("channel",true) as any; const msg=i.options.getString("message")||"Welcome {user} to {server}!"; await prisma.welcomeSettings.upsert({where:{guildId:i.guild!.id},update:{enabled:true,channelId:ch.id,message:msg},create:{guildId:i.guild!.id,enabled:true,channelId:ch.id,message:msg}}); await i.reply({embeds:[e("Welcome set", `Channel: <#${ch.id}>\nMessage: ${msg}`)]});
  }},
  { data: new SlashCommandBuilder().setName("setgoodbye").setDescription("Set goodbye").addChannelOption(o=>o.setName("channel").setDescription("channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), execute: async (i)=>{
    const ch=i.options.getChannel("channel",true) as any; await prisma.goodbyeSettings.upsert({where:{guildId:i.guild!.id},update:{enabled:true,channelId:ch.id},create:{guildId:i.guild!.id,enabled:true,channelId:ch.id}}); await i.reply({embeds:[e("Goodbye set", `<#${ch.id}>`)]});
  }},
  { data: new SlashCommandBuilder().setName("setautorole").setDescription("Set autorole").addRoleOption(o=>o.setName("role").setDescription("role").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), execute: async (i)=>{
    const r=i.options.getRole("role",true); const botRole=i.guild!.members.me?.roles.highest; if(botRole && r.position >= botRole.position) return i.reply({content:"Role above bot",ephemeral:true}); await prisma.autoRoleSettings.upsert({where:{guildId:i.guild!.id},update:{enabled:true,roleId:r.id},create:{guildId:i.guild!.id,enabled:true,roleId:r.id}}); await i.reply({embeds:[e("Autorole set", `Role: <@&${r.id}>`)]});
  }},
  { data: new SlashCommandBuilder().setName("setlogs").setDescription("Set logs channel").addChannelOption(o=>o.setName("channel").setDescription("channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), execute: async (i)=>{
    const ch=i.options.getChannel("channel",true) as any; await prisma.loggingSettings.upsert({where:{guildId:i.guild!.id},update:{enabled:true,channelId:ch.id},create:{guildId:i.guild!.id,enabled:true,channelId:ch.id}}); await i.reply({embeds:[e("Logs set", `<#${ch.id}>`)]});
  }},
  { data: new SlashCommandBuilder().setName("setmodlogs").setDescription("Set modlogs").addChannelOption(o=>o.setName("channel").setDescription("channel").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), execute: async (i)=>{
    const ch=i.options.getChannel("channel",true) as any; await prisma.loggingSettings.upsert({where:{guildId:i.guild!.id},update:{modLogChannelId:ch.id},create:{guildId:i.guild!.id,modLogChannelId:ch.id}}); await i.reply({embeds:[e("Modlogs set", `<#${ch.id}>`)]});
  }},
  { data: new SlashCommandBuilder().setName("setverification").setDescription("Set verification").addRoleOption(o=>o.setName("role").setDescription("role").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), execute: async (i)=>{
    const r=i.options.getRole("role",true); await prisma.verificationSettings.upsert({where:{guildId:i.guild!.id},update:{enabled:true,roleId:r.id},create:{guildId:i.guild!.id,enabled:true,roleId:r.id}}); await i.reply({embeds:[e("Verification set", `<@&${r.id}>`)]});
  }},

  // LEVELING
  { data: new SlashCommandBuilder().setName("level").setDescription("Show level").addUserOption(o=>o.setName("user").setDescription("user")), execute: async (i)=>{
    const u=i.options.getUser("user")||i.user; const lvl=await prisma.level.findUnique({where:{guildId_userId:{guildId:i.guild!.id, userId:u.id}}}); await i.reply({embeds:[e(`Level for ${u.tag}`, lvl? `Level ${lvl.level} - ${lvl.xp} XP (${lvl.messageCount} msgs)` : "No XP yet")]});
  }},
  { data: new SlashCommandBuilder().setName("rank").setDescription("Rank").addUserOption(o=>o.setName("user").setDescription("user")), execute: async (i)=>{
    const u=i.options.getUser("user")||i.user; const lvl=await prisma.level.findUnique({where:{guildId_userId:{guildId:i.guild!.id, userId:u.id}}}); const all=await prisma.level.findMany({where:{guildId:i.guild!.id},orderBy:{xp:"desc"}}); const rank=all.findIndex(x=>x.userId===u.id)+1; await i.reply({embeds:[e(`Rank for ${u.tag}`, lvl? `Rank #${rank} - Level ${lvl.level} (${lvl.xp} XP)`:"No rank")]});
  }},
  { data: new SlashCommandBuilder().setName("leaderboard").setDescription("Leaderboard"), execute: async (i)=>{
    const top=await prisma.level.findMany({where:{guildId:i.guild!.id},orderBy:{xp:"desc"},take:10}); if(!top.length) return i.reply({content:"No data"}); const desc=top.map((t,idx)=> `${idx+1}. <@${t.userId}> - Level ${t.level} (${t.xp} XP)`).join("\n"); await i.reply({embeds:[e("Leaderboard",desc)]});
  }},
];
