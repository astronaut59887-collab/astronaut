import { afterEach, describe, expect, it, vi } from "vitest";
import { MockLLMProvider } from "../lib/providers";
import { generateCharacter } from "../lib/character";

const profile = { id: "u1", displayName: "小宇", nickname: "小宇", createdAt: "2026-01-01T00:00:00.000Z", lastActiveAt: "2026-01-01T00:00:00.000Z" };
const character = generateCharacter("小宇");
const provider = new MockLLMProvider();

async function generate(message: string, mode?: "sleep") {
  vi.useFakeTimers();
  const pending = provider.generate({ message, profile, character, memories: [], mode });
  await vi.runAllTimersAsync();
  return pending;
}

afterEach(() => vi.useRealTimers());

describe("companion modes and emotions", () => {
  it("uses a soft sleepy response in sleep mode", async () => {
    const result = await generate("陪我休息", "sleep");
    expect(result.emotion).toBe("sleepy");
    expect(result.voiceStyle).toBe("soft");
  });

  it("celebrates success without customer-service phrasing", async () => {
    const result = await generate("我面试成功了");
    expect(result.emotion).toBe("excited");
    expect(result.text).not.toContain("建议您");
  });

  it("acknowledges failure before offering analysis", async () => {
    const result = await generate("我失败了");
    expect(result.emotion).toBe("sad");
    expect(result.text).toContain("不好受");
  });
});
