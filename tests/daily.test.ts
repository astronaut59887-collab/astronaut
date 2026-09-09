import { describe, expect, it } from "vitest";
import { dailyMission, localDateKey } from "../lib/daily";

describe("daily companionship", () => {
  it("uses the browser-local calendar date", () => {
    expect(localDateKey(new Date(2026, 0, 2, 0, 5))).toBe("2026-01-02");
  });

  it("returns a stable mission for the same day", () => {
    const date = new Date(2026, 8, 9, 10, 0);
    expect(dailyMission(date)).toEqual(dailyMission(date));
    expect(dailyMission(date).id.startsWith("2026-09-09:")).toBe(true);
  });
});
