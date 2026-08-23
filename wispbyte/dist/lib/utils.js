import { EmbedBuilder, PermissionsBitField } from "discord.js";
export function embed(title, desc, color = 0x5865F2) { return new EmbedBuilder().setTitle(title).setDescription(desc).setColor(color).setTimestamp(); }
export function hasPerm(memberPermissions, perm) { return (memberPermissions & PermissionsBitField.Flags.Administrator) !== 0n || (memberPermissions & perm) !== 0n; }
export function replaceVars(text, vars) { let out = text; for (const [k, v] of Object.entries(vars))
    out = out.replaceAll(`{${k}}`, v); return out; }
