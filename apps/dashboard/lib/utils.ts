import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function hasManageGuild(perms: number) {
  const MANAGE_GUILD = 0x20;
  const ADMINISTRATOR = 0x8;
  return (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD;
}
export function formatDate(d: string | Date) { return new Date(d).toLocaleString(); }
export function truncate(s: string, n: number) { return s.length > n ? s.slice(0,n)+"..." : s; }
