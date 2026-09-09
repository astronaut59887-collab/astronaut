import type { CompanionReply, MemoryRecord, UserProfile, Character } from "@/lib/types";

export type ChatGenerationInput = {
  message: string;
  profile: UserProfile;
  character: Character;
  memories: MemoryRecord[];
};

export interface LLMProvider {
  generate(input: ChatGenerationInput): Promise<CompanionReply>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const nicknameFrom = (memories: MemoryRecord[], fallback: string) =>
  memories.find((memory) => memory.type === "PROFILE" && memory.content.startsWith("希望被叫作"))
    ?.content.replace("希望被叫作", "") || fallback;

export class MockLLMProvider implements LLMProvider {
  async generate(input: ChatGenerationInput): Promise<CompanionReply> {
    await wait(650);
    const { message, memories, profile, character } = input;
    const name = nicknameFrom(memories, profile.nickname || profile.displayName);
    const referenceIds: string[] = [];
    const preference = memories.find((memory) => memory.type === "PREFERENCE");
    const event = memories.find((memory) => memory.type === "EVENT");

    if (/你是谁|是人吗|有意识|机器人|AI/i.test(message)) {
      return {
        text: `我是 ${character.name}，一只住在这里的外星 AI 搭子。我的反应来自程序和我们保存的相处记录，不是假装成真正的人类意识。`,
        emotion: "happy", animation: "happy", voiceStyle: "warm", referencedMemoryIds: [],
      };
    }

    if (/忘记[：:]?/.test(message)) {
      return {
        text: "好，我已经把那件事从长期记忆里拿掉了。地球朋友也应该拥有随时收回回忆的权利。",
        emotion: "sad", animation: "sad", voiceStyle: "soft", referencedMemoryIds: [],
      };
    }

    if (/难过|委屈|崩溃|伤心|哭了|焦虑/.test(message)) {
      return {
        text: `嗯，${name}。听起来这件事真的消耗了你很多能量。我先不催你振作，陪你在这里待一会儿。你想说说发生了什么吗？`,
        emotion: "sad", animation: "sad", voiceStyle: "soft", referencedMemoryIds: [],
      };
    }

    if (/累|困|熬夜|加班/.test(message)) {
      return {
        text: `检测到 ${name} 的地球能量条快见底了。先把今天最费力的那一小段告诉我吧，剩下的宇宙噪音可以晚点再处理。`,
        emotion: "curious", animation: "confused", voiceStyle: "soft", referencedMemoryIds: [],
      };
    }

    if (/叫我|我叫/.test(message)) {
      return {
        text: `${name}。收到！我在飞船日志里认真写了三遍，这次应该不会念错……应该。`,
        emotion: "happy", animation: "happy", voiceStyle: "excited", referencedMemoryIds: memories.filter((m) => m.type === "PROFILE").map((m) => m.id),
      };
    }

    if (/记得|认识我|关于我|喜欢什么/.test(message) && preference) {
      referenceIds.push(preference.id);
      return {
        text: `当然。你不是一直喜欢${preference.content.replace(/^喜欢/, "")}嘛？这条我可没弄丢，飞船的记忆模块今天表现不错。`,
        emotion: "happy", animation: "happy", voiceStyle: "warm", referencedMemoryIds: referenceIds,
      };
    }

    if (/面试|考试|紧张|准备/.test(message) && event) {
      referenceIds.push(event.id);
      return {
        text: `等等，是你之前说的「${event.content}」吗？我偷偷给你加了一点宇宙好运。紧张也没关系，那说明这件事对你很重要。`,
        emotion: "curious", animation: "happy", voiceStyle: "warm", referencedMemoryIds: referenceIds,
      };
    }

    if (/喜欢|爱吃|爱听|爱玩|超爱/.test(message)) {
      return {
        text: "等等，我正在把这条放进重要的地球观察笔记里。原来喜欢一样东西时，人类说话真的会亮一点。",
        emotion: "curious", animation: "happy", voiceStyle: "excited", referencedMemoryIds: preference ? [preference.id] : [],
      };
    }

    if (preference && message.length > 2) {
      referenceIds.push(preference.id);
      return {
        text: `我在听，${name}。这让我想起你喜欢${preference.content.replace(/^喜欢/, "")}。地球人的心情和喜欢的东西之间，是不是藏着一条秘密通道？`,
        emotion: "curious", animation: "confused", voiceStyle: "warm", referencedMemoryIds: referenceIds,
      };
    }

    return {
      text: `诶？${name}，这个地球现象我还没完全研究明白。再多告诉我一点吧，我保证只偷偷好奇，不装懂。`,
      emotion: "curious", animation: "confused", voiceStyle: "warm", referencedMemoryIds: [],
    };
  }
}

export const llmProvider: LLMProvider = new MockLLMProvider();
