import type { Character, CharacterAppearance } from "@/lib/types";

const palettes = [
  { body: "#b9ff6a", belly: "#eaffc7", accent: "#7be05f", eye: "#26333c" },
  { body: "#b69cff", belly: "#e8e0ff", accent: "#7f6bdc", eye: "#22263d" },
  { body: "#69e6dd", belly: "#c9fff8", accent: "#32aaa6", eye: "#18353d" },
  { body: "#ff9fbd", belly: "#ffe0eb", accent: "#e3618c", eye: "#412534" },
  { body: "#ffc86b", belly: "#fff0c8", accent: "#e8903d", eye: "#3c3027" },
  { body: "#e9e2cf", belly: "#fffaf0", accent: "#c2b79d", eye: "#302b40" },
];

const names = ["啵啵", "莫比", "阿奇", "咕叽", "诺诺", "皮卡", "嘟嘟", "米塔"];
const species = ["漂浮绒星族", "星云软糖族", "月湾耳灵族", "光点观察族"];
const antennae: CharacterAppearance["antennaStyle"][] = ["orb", "leaf", "double"];
const badges: CharacterAppearance["badge"][] = ["star", "moon", "planet"];
const archetypes: CharacterAppearance["archetype"][] = ["healer", "trickster", "sage", "tsundere"];
const patterns: CharacterAppearance["pattern"][] = ["plain", "nebula", "freckles", "glow"];
const accessories: CharacterAppearance["accessory"][] = ["none", "satchel", "glasses", "cape"];

export const archetypeLabels: Record<CharacterAppearance["archetype"], { name: string; description: string }> = {
  healer: { name: "治愈系", description: "温暖、柔软，擅长安静陪伴" },
  trickster: { name: "搞怪系", description: "调皮、混乱，触角总有自己的想法" },
  sage: { name: "智慧系", description: "神秘、好奇，眼睛里像藏着星云" },
  tsundere: { name: "傲娇系", description: "小天才气质，嘴硬但很在意朋友" },
};

export function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function appearanceFromSeed(seed: number): CharacterAppearance {
  const palette = palettes[seed % palettes.length];
  const archetype = archetypes[(seed >>> 12) % archetypes.length];
  const archetypeAccessory: CharacterAppearance["accessory"] = archetype === "tsundere"
    ? ((seed >>> 4) % 2 ? "glasses" : "cape")
    : accessories[(seed >>> 15) % accessories.length];
  return {
    ...palette,
    antennaStyle: antennae[(seed >>> 6) % antennae.length],
    badge: badges[(seed >>> 9) % badges.length],
    archetype,
    pattern: patterns[(seed >>> 11) % patterns.length],
    accessory: archetypeAccessory,
  };
}

export function completeCharacter(character: Character): Character {
  return {
    ...character,
    appearance: { ...appearanceFromSeed(character.seed), ...character.appearance },
  };
}

export function generateCharacter(userName: string): Character {
  const seed = hashSeed(userName.trim().toLowerCase());
  return {
    id: crypto.randomUUID(),
    name: names[(seed >>> 3) % names.length],
    species: species[(seed >>> 5) % species.length],
    seed,
    appearance: appearanceFromSeed(seed),
    level: 1,
    experience: 0,
    createdAt: new Date().toISOString(),
  };
}
