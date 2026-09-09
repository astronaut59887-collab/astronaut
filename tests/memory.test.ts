import { describe, expect, it } from "vitest";
import {
  containsSensitiveInformation,
  extractMemoryCandidates,
  forgetMatchingMemory,
  mergeMemories,
  relevantMemories,
} from "../lib/memory";

describe("memory extraction", () => {
  it("ignores ordinary short-lived meal updates", () => {
    expect(extractMemoryCandidates("我今天吃了炒饭")).toEqual([]);
  });

  it("extracts durable preferences", () => {
    expect(extractMemoryCandidates("我特别喜欢吃辣拉面")).toMatchObject([
      { type: "PREFERENCE", content: "喜欢吃辣拉面", importance: "A" },
    ]);
  });

  it("does not mistake a question for a stated preference", () => {
    expect(extractMemoryCandidates("你记得我喜欢什么吗？")).toEqual([]);
  });

  it("gives requested names highest priority", () => {
    expect(extractMemoryCandidates("以后叫我小宇")).toMatchObject([
      { type: "PROFILE", content: "希望被叫作小宇", importance: "S" },
    ]);
  });

  it("rejects common sensitive data", () => {
    expect(containsSensitiveInformation("记住：我的银行卡是 6222021234567890")).toBe(true);
    expect(extractMemoryCandidates("记住：我的银行卡是 6222021234567890")).toEqual([]);
  });

  it("updates a nickname rather than duplicating the profile memory", () => {
    const first = mergeMemories([], extractMemoryCandidates("以后叫我小宇"));
    const second = mergeMemories(first, extractMemoryCandidates("以后叫我阿星"));
    expect(second).toHaveLength(1);
    expect(second[0].content).toBe("希望被叫作阿星");
  });

  it("forgets a matching fact and retrieves relevant ones", () => {
    const memories = mergeMemories([], extractMemoryCandidates("我特别喜欢猫"));
    expect(relevantMemories(memories, "你记得我喜欢什么吗")).toHaveLength(1);
    const result = forgetMatchingMemory(memories, "忘记：猫");
    expect(result.removed).toHaveLength(1);
    expect(result.memories).toEqual([]);
  });
});
