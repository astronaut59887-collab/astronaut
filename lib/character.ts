import type { Character, CharacterAppearance } from "@/lib/types";

const palettes = [
  { body: "#b9ff6a", belly: "#eaffc7", accent: "#7be05f", eye: "#26333c" },
  { body: "#b69cff", belly: "#e8e0ff", accent: "#7f6bdc", eye: "#22263d" },
  { body: "#69e6dd", belly: "#c9fff8", accent: "#32aaa6", eye: "#18353d" },
  { body: "#ff9fbd", belly: "#ffe0eb", accent: "#e3618c", eye: "#412534" },
  { body: "#ffc86b", belly: "#fff0c8", accent: "#e8903d", eye: "#3c3027" },
];

const names = ["啵啵", "莫比", "阿奇", "咕叽", "诺诺", "皮卡", "嘟嘟", "米塔"];
const antennae: CharacterAppearance["antennaStyle"][] = ["orb", "leaf", "double"];
const badges: CharacterAppearance["badge"][] = ["star", "moon", "planet"];

export function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function generateCharacter(userName: string): Character {
  const seed = hashSeed(userName.trim().toLowerCase());
  const palette = palettes[seed % palettes.length];
  return {
    id: crypto.randomUUID(),
    name: names[(seed >>> 3) % names.length],
    species: "漂浮绒星族",
    seed,
    appearance: {
      ...palette,
      antennaStyle: antennae[(seed >>> 6) % antennae.length],
      badge: badges[(seed >>> 9) % badges.length],
    },
    level: 1,
    experience: 0,
    createdAt: new Date().toISOString(),
  };
}
