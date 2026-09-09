import { hashSeed } from "@/lib/character";

export type DailyMission = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
};

const missions = [
  { title: "研究一种地球食物", description: "告诉我一种你今天想吃的东西。", prompt: "今天一起研究一种地球食物吧。我最近想吃的是……", icon: "食" },
  { title: "收集一件小好事", description: "再普通也可以，宇宙日志不嫌小。", prompt: "今天发生的一件小好事是……", icon: "光" },
  { title: "听一首地球音乐", description: "告诉我哪首歌让你停了一下。", prompt: "今天想和你分享的一首歌是……", icon: "歌" },
  { title: "观察今天的天空", description: "它是什么颜色？有云吗？", prompt: "我刚刚看了看今天的天空，它……", icon: "云" },
  { title: "给未来留一句话", description: "写给明天的自己，也写给我。", prompt: "我想对明天的自己说……", icon: "信" },
  { title: "找到一个充电瞬间", description: "什么事情让你恢复了一点能量？", prompt: "今天让我恢复一点能量的是……", icon: "能" },
];

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dailyMission(date = new Date()): DailyMission {
  const dateId = localDateKey(date);
  const selected = missions[hashSeed(dateId) % missions.length];
  return { ...selected, id: `${dateId}:${selected.title}` };
}
