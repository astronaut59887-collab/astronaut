import { describe, expect, it } from "vitest";
import { generateCharacter, hashSeed } from "../lib/character";

describe("procedural character generation", () => {
  it("is deterministic for the same Earth name", () => {
    const first = generateCharacter("小宇");
    const second = generateCharacter("小宇");
    expect(first.seed).toBe(second.seed);
    expect(first.name).toBe(second.name);
    expect(first.appearance).toEqual(second.appearance);
  });

  it("generates distinct seeds for different names", () => {
    expect(hashSeed("小宇")).not.toBe(hashSeed("阿星"));
  });
});
