import type { ChatMessage, MemoryRecord, Relationship } from "@/lib/types";

export type GrowthStage = {
  level: number;
  name: string;
  shortName: string;
  minScore: number;
  unlock: string;
  lore: string;
};

export const growthStages: GrowthStage[] = [
  { level: 1, name: "初次相遇", shortName: "地球初见", minScore: 0, unlock: "基础表情与舱室", lore: "它说飞船只是‘坏了一点点’。" },
  { level: 2, name: "熟悉地球", shortName: "地球学徒", minScore: 45, unlock: "好奇动作与每日任务", lore: "它开始收集地球上微小但重要的事。" },
  { level: 3, name: "认识你", shortName: "记忆同行者", minScore: 110, unlock: "记忆星图与专属问候", lore: "它发现，记住一个人和记住知识并不一样。" },
  { level: 4, name: "你的朋友", shortName: "星际好友", minScore: 210, unlock: "新的宇宙故事", lore: "飞船坠落也许并不完全是一场意外。" },
  { level: 5, name: "宇宙搭子", shortName: "宇宙搭子", minScore: 360, unlock: "伙伴徽章与深度互动", lore: "它正在寻找一段从母星遗失的信号。" },
  { level: 6, name: "灵魂伙伴", shortName: "跨星朋友", minScore: 560, unlock: "完整同行纪念", lore: "两个世界因为一次相遇，有了共同坐标。" },
];

export function growthScore(relationship: Relationship, memories: MemoryRecord[], messages: ChatMessage[]) {
  const usefulMemories = memories.filter((memory) => memory.importance !== "B").length;
  const positiveFeedback = messages.filter((message) => message.feedback && message.feedback !== "dislike").length;
  return relationship.activeDays.length * 12
    + relationship.meaningfulInteractions * 3
    + relationship.completedMissions.length * 15
    + usefulMemories * 9
    + positiveFeedback * 4;
}

export function currentGrowth(relationship: Relationship, memories: MemoryRecord[], messages: ChatMessage[]) {
  const score = growthScore(relationship, memories, messages);
  const current = [...growthStages].reverse().find((stage) => score >= stage.minScore) ?? growthStages[0];
  const next = growthStages.find((stage) => stage.level === current.level + 1) ?? null;
  const progress = next
    ? Math.round(((score - current.minScore) / (next.minScore - current.minScore)) * 100)
    : 100;
  return { score, current, next, progress: Math.max(0, Math.min(100, progress)) };
}

export function unlockedStories(stageLevel: number) {
  return growthStages.filter((stage) => stage.level <= stageLevel).map((stage) => stage.lore);
}
