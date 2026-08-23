import { EmbedBuilder, PermissionsBitField } from "discord.js";
export function embed(title:string, desc:string, color:number=0x5865F2){ return new EmbedBuilder().setTitle(title).setDescription(desc).setColor(color).setTimestamp(); }
export function hasPerm(memberPermissions: bigint, perm: bigint){ return (memberPermissions & PermissionsBitField.Flags.Administrator) !== 0n || (memberPermissions & perm) !== 0n; }
export function replaceVars(text:string, vars:Record<string,string>){ let out=text; for(const [k,v] of Object.entries(vars)) out=out.replaceAll(`{${k}}`,v); return out; }
