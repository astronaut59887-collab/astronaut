import type { MemoryRecord, MemoryType, MemoryImportance } from "@/lib/types";

export type MemoryCandidate = Pick<MemoryRecord, "type" | "content" | "normalizedKey" | "importance">;

const sensitivePatterns = [
  /密码|口令|验证码|支付密码/i,
  /(?:身份证|银行卡|信用卡).{0,8}\d{6,}/i,
  /\b(?:\d[ -]*?){13,19}\b/,
  /诊断为|确诊为|处方药/i,
];

const clean = (value: string) => value.trim().replace(/[。！!？?，,]+$/g, "").slice(0, 80);
const keyOf = (type: MemoryType, value: string) => `${type}:${clean(value).toLowerCase()}`;

function candidate(type: MemoryType, content: string, importance: MemoryImportance): MemoryCandidate {
  return { type, content: clean(content), normalizedKey: keyOf(type, content), importance };
}

export function containsSensitiveInformation(text: string) {
  return sensitivePatterns.some((pattern) => pattern.test(text));
}

export function extractMemoryCandidates(text: string): MemoryCandidate[] {
  const source = clean(text);
  if (!source || containsSensitiveInformation(source)) return [];

  const explicit = source.match(/^(?:请)?记住[：:]?\s*(.+)$/);
  if (explicit?.[1]) {
    const fact = clean(explicit[1]);
    const type: MemoryType = /喜欢|爱/.test(fact) ? "PREFERENCE" : "PROFILE";
    return [candidate(type, fact, "A")];
  }

  const nickname = source.match(/(?:以后)?(?:就)?叫我[「“\s]?([^，。！!？?”」]{1,12})/);
  if (nickname?.[1]) return [candidate("PROFILE", `希望被叫作${clean(nickname[1])}`, "S")];

  if (/[？?]$/.test(text.trim()) || /什么|是否|有没有|吗[？?]?$/.test(source)) return [];

  const preference = source.match(/我(?:特别|真的|很|最)?(?:喜欢|爱吃|爱听|爱玩|超爱)\s*(.+)/);
  if (preference?.[1]) return [candidate("PREFERENCE", `喜欢${clean(preference[1])}`, "A")];

  const event = source.match(/我?(明天|后天|下周|今天).{0,10}(面试|考试|约会|答辩|演出|比赛|入职|生日)(.*)/);
  if (event) return [candidate("EVENT", clean(`${event[1]}有${event[2]}${event[3]}`), "A")];

  const habit = source.match(/我(?:总是|经常|习惯|每天|通常)\s*(.+)/);
  if (habit?.[1]) return [candidate("HABIT", clean(habit[0]), "A")];

  const emotion = source.match(/我(?:今天|最近)?(?:真的|有点|很)?(难过|焦虑|委屈|低落|开心|兴奋)/);
  if (emotion?.[1]) return [candidate("EMOTION", clean(`最近感到${emotion[1]}`), "B")];

  return [];
}

export function mergeMemories(existing: MemoryRecord[], candidates: MemoryCandidate[]) {
  const next = [...existing];
  for (const item of candidates) {
    const now = new Date().toISOString();
    const exactIndex = next.findIndex((memory) => memory.normalizedKey === item.normalizedKey);
    const sameTypeIndex = item.type === "PROFILE"
      ? next.findIndex((memory) => memory.type === item.type && memory.content.startsWith("希望被叫作"))
      : -1;
    const index = exactIndex >= 0 ? exactIndex : sameTypeIndex;
    if (index >= 0) {
      next[index] = { ...next[index], ...item, updatedAt: now };
    } else {
      next.unshift({ ...item, id: crypto.randomUUID(), createdAt: now, updatedAt: now });
    }
  }
  return next;
}

export function forgetMatchingMemory(memories: MemoryRecord[], text: string) {
  const match = text.match(/^(?:请)?忘记[：:]?\s*(.+)$/);
  if (!match?.[1]) return { memories, removed: [] as MemoryRecord[] };
  const target = clean(match[1]);
  const removed = memories.filter((memory) =>
    memory.content.includes(target) || target.includes(memory.content.replace(/^(喜欢|希望被叫作)/, "")),
  );
  return { memories: memories.filter((memory) => !removed.includes(memory)), removed };
}

export function relevantMemories(memories: MemoryRecord[], message: string, limit = 3) {
  const intentBoost = /记得|认识我|关于我|喜欢什么|叫什么/.test(message);
  return [...memories]
    .map((memory) => {
      const overlap = [...new Set(message)].filter((char) => memory.content.includes(char)).length;
      const importance = memory.importance === "S" ? 4 : memory.importance === "A" ? 2 : 0;
      return { memory, score: overlap + importance + (intentBoost ? 4 : 0) };
    })
    .filter(({ score }) => score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ memory }) => memory);
}
