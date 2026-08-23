import { describe, it, expect } from "vitest";
import { hasManageGuild } from "@/lib/utils";

describe("auth", ()=>{
  it("hasManageGuild checks ADMINISTRATOR", ()=>{
    expect(hasManageGuild(0x8)).toBe(true);
  });
  it("hasManageGuild checks MANAGE_GUILD", ()=>{
    expect(hasManageGuild(0x20)).toBe(true);
  });
  it("rejects no perms", ()=>{
    expect(hasManageGuild(0x0)).toBe(false);
  });
});
