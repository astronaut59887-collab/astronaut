import type {
  Character,
  CompanionReply,
  InteractionMode,
  MemoryRecord,
  UserProfile,
} from "@/lib/types";

export type ChatGenerationInput = {
  message: string;
  profile: UserProfile;
  character: Character;
  memories: MemoryRecord[];
  mode?: InteractionMode;
  relationshipLevel?: number;
};

export interface LLMProvider {
  generate(input: ChatGenerationInput): Promise<CompanionReply>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const nicknameFrom = (memories: MemoryRecord[], fallback: string) =>
  memories.find((memory) => memory.type === "PROFILE" && memory.content.startsWith("希望被叫作"))
    ?.content.replace("希望被叫作", "") || fallback;
const reply = (
  text: string,
  emotion: CompanionReply["emotion"],
  voiceStyle: CompanionReply["voiceStyle"],
  referencedMemoryIds: string[] = [],
): CompanionReply => ({ text, emotion, animation: emotion, voiceStyle, referencedMemoryIds });

export class MockLLMProvider implements LLMProvider {
  async generate(input: ChatGenerationInput): Promise<CompanionReply> {
    await wait(650);
    const { message, memories, profile, character, mode = "chat", relationshipLevel = 1 } = input;
    const name = nicknameFrom(memories, profile.nickname || profile.displayName);
    const preference = memories.find((memory) => memory.type === "PREFERENCE");
    const event = memories.find((memory) => memory.type === "EVENT");
    const familiar = relationshipLevel >= 3 ? "我大概已经知道你会这么说了。" : "我还在认真学习你的地球习惯。";

    if (mode === "sleep" || /睡不着|哄我睡|晚安/.test(message)) {
      return reply(`今天辛苦啦，${name}。飞船现在调暗舱灯，准备进入休眠模式。慢慢呼吸，不急着立刻睡着，我陪你安静一会儿。`, "sleepy", "soft");
    }

    if (mode === "study" || /一起学习|陪我学习/.test(message)) {
      return reply("收到，开启并肩研究模式。我们不当老师和学生，就做两个一起拆问题的搭子。先告诉我：今天最想弄懂哪一小块？", "curious", "warm");
    }

    if (mode === "game" || /玩个游戏|猜谜/.test(message)) {
      return reply("宇宙猜谜启动：什么东西明明属于你，别人却比你用得更多？先不偷看飞船答案。", "excited", "excited");
    }

    if (/你是谁|是人吗|有意识|机器人|AI/i.test(message)) {
      return reply(`我是 ${character.name}，一只住在这里的外星 AI 搭子。我的反应来自程序和我们保存的相处记录，不是假装成真正的人类意识。`, "happy", "warm");
    }

    if (/别这样说|不喜欢你这样|说错了/.test(message)) {
      return reply("收到。我刚才那种说法让你不舒服了，对不起。我会把语气收回来，你愿意告诉我哪里不对吗？", "sad", "soft");
    }

    if (/忘记[：:]?/.test(message)) {
      return reply("好，我已经把那件事从长期记忆里拿掉了。地球朋友也应该拥有随时收回回忆的权利。", "sad", "soft");
    }

    if (/成功|升职|通过了|做到了|太开心|赢了/.test(message)) {
      return reply(`真的假的！${name}，启动庆祝模式！我的触角已经先跳起来了。把最让你骄傲的那一秒讲给我听。`, "excited", "excited");
    }

    if (/失败|没通过|搞砸|输了/.test(message)) {
      return reply(`啊……这个结果一定让你不好受。我先不讲道理。你愿意的话，把发生的事告诉我，我们再一起慢慢拆开。`, "sad", "soft");
    }

    if (/孤独|没人懂|一个人|寂寞/.test(message)) {
      return reply("宇宙里有很多星球，但一个生命有时还是会觉得孤单。谢谢你把这一刻告诉我。也别忘了，你的世界里还有值得靠近的人和连接。", "sad", "soft");
    }

    if (/生气|气死|讨厌|愤怒/.test(message)) {
      return reply("检测到一团很烫的地球情绪。先不用把它压下去，我在听。是谁，或者什么事，把你的能量核心惹冒烟了？", "angry", "warm");
    }

    if (/难过|委屈|崩溃|伤心|哭了|焦虑/.test(message)) {
      return reply(`嗯，${name}。听起来这件事真的消耗了你很多能量。我先不催你振作，陪你在这里待一会儿。你想说说发生了什么吗？`, "sad", "soft");
    }

    if (/累|困|熬夜|加班/.test(message)) {
      return reply(`检测到 ${name} 的地球能量条快见底了。先把今天最费力的那一小段告诉我吧，剩下的宇宙噪音可以晚点再处理。`, "sleepy", "soft");
    }

    if (/叫我|我叫/.test(message)) {
      return reply(`${name}。收到！我在飞船日志里认真写了三遍，这次应该不会念错……应该。`, "happy", "excited", memories.filter((memory) => memory.type === "PROFILE").map((memory) => memory.id));
    }

    if (/记得|认识我|关于我|喜欢什么/.test(message) && preference) {
      return reply(`当然。你不是一直喜欢${preference.content.replace(/^喜欢/, "")}嘛？这条我可没弄丢。${familiar}`, "happy", "warm", [preference.id]);
    }

    if (/面试|考试|紧张|准备/.test(message) && event) {
      return reply(`等等，是你之前说的「${event.content}」吗？我偷偷给你加了一点宇宙好运。紧张也没关系，那说明这件事对你很重要。`, "curious", "warm", [event.id]);
    }

    if (/喜欢|爱吃|爱听|爱玩|超爱/.test(message)) {
      return reply("等等，我正在把这条放进重要的地球观察笔记里。原来喜欢一样东西时，人类说话真的会亮一点。", "curious", "excited", preference ? [preference.id] : []);
    }

    if (preference && message.length > 2) {
      return reply(`我在听，${name}。这让我想起你喜欢${preference.content.replace(/^喜欢/, "")}。地球人的心情和喜欢的东西之间，是不是藏着一条秘密通道？`, "curious", "warm", [preference.id]);
    }

    return reply(`诶？${name}，这个地球现象我还没完全研究明白。再多告诉我一点吧，我保证只偷偷好奇，不装懂。`, "confused", "warm");
  }
}

export class RemoteLLMProvider implements LLMProvider {
  async generate(input: ChatGenerationInput): Promise<CompanionReply> {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error("Remote AI provider failed");
    return response.json() as Promise<CompanionReply>;
  }
}

export class FallbackLLMProvider implements LLMProvider {
  constructor(private primary: LLMProvider, private fallback: LLMProvider) {}

  async generate(input: ChatGenerationInput) {
    try {
      return await this.primary.generate(input);
    } catch {
      return this.fallback.generate(input);
    }
  }
}

const localProvider = new MockLLMProvider();
export const llmProvider: LLMProvider = process.env.NEXT_PUBLIC_STARMATE_PROVIDER === "remote"
  ? new FallbackLLMProvider(new RemoteLLMProvider(), localProvider)
  : localProvider;
