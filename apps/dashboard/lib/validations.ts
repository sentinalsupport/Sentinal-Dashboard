import { z } from "zod";
export const welcomeSchema = z.object({
  enabled: z.boolean(),
  channelId: z.string().nullable().optional(),
  message: z.string().max(2000).nullable().optional(),
  embedEnabled: z.boolean().optional(),
  embedTitle: z.string().max(256).nullable().optional(),
  embedDescription: z.string().max(4000).nullable().optional(),
  embedColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  embedImage: z.string().url().nullable().optional().or(z.literal("")),
  embedThumbnail: z.string().url().nullable().optional().or(z.literal("")),
  embedFooter: z.string().max(2048).nullable().optional(),
});
export const automodSchema = z.object({
  antiSpam: z.object({ enabled: z.boolean(), messages: z.number().min(1).max(20), interval: z.number().min(1).max(60), action: z.string(), timeoutDuration: z.number().nullable().optional() }).optional(),
  antiLink: z.object({ enabled: z.boolean(), allowedDomains: z.array(z.string()), blockInvite: z.boolean(), action: z.string() }).optional(),
  badWords: z.object({ enabled: z.boolean(), words: z.array(z.string()), action: z.string() }).optional(),
  mentionSpam: z.object({ enabled: z.boolean(), maxMentions: z.number().min(1).max(20), action: z.string() }).optional(),
});
export const customCommandSchema = z.object({
  name: z.string().regex(/^[a-z0-9_-]{1,32}$/),
  response: z.string().min(1).max(2000),
  embedEnabled: z.boolean().optional(),
  embedTitle: z.string().max(256).optional(),
  embedDescription: z.string().max(4000).optional(),
  embedColor: z.string().optional(),
  requiredPermission: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
});
export const ticketSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
  supportRoleIds: z.array(z.string()).optional(),
  transcriptChannelId: z.string().nullable().optional(),
  welcomeMessage: z.string().max(2000).nullable().optional(),
});
