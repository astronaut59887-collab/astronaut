import { describe, expect, it } from "vitest";
import { currentGrowth, growthScore } from "../lib/progression";
import type { ChatMessage, MemoryRecord, Relationship } from "../lib/types";

const relationship: Relationship = {
  firstMetAt: "2026-01-01T00:00:00.000Z",
  lastInteractionAt: "2026-01-01T00:00:00.000Z",
  activeDays: ["2026-01-01"],
  meaningfulInteractions: 0,
  completedMissions: [],
};

describe("relationship progression", () => {
  it("does not reward raw message count", () => {
    const spam: ChatMessage[] = Array.from({ length: 100 }, (_, index) => ({
      id: String(index), role: "user", content: "hi", createdAt: "2026-01-01T00:00:00.000Z",
    }));
    expect(growthScore(relationship, [], spam)).toBe(growthScore(relationship, [], []));
  });

  it("combines active days, memories, feedback, and missions", () => {
    const memory: MemoryRecord = {
      id: "m1", type: "PREFERENCE", content: "喜欢猫", normalizedKey: "PREFERENCE:喜欢猫",
      importance: "A", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const messages: ChatMessage[] = [{
      id: "a1", role: "assistant", content: "你好", feedback: "love", createdAt: "2026-01-01T00:00:00.000Z",
    }];
    const progressed = {
      ...relationship,
      activeDays: ["2026-01-01", "2026-01-02"],
      meaningfulInteractions: 3,
      completedMissions: ["mission-1"],
    };
    expect(growthScore(progressed, [memory], messages)).toBe(61);
    expect(currentGrowth(progressed, [memory], messages).current.level).toBe(2);
  });
});
