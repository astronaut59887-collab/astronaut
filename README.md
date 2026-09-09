# StarMate 星伴

一个“住在手机里的宇宙外星 AI 朋友”Web 产品原型。它围绕首次相遇、角色生命感、长期记忆、关系成长和用户可控隐私构建，不是普通聊天界面。

## 已实现

- 沉浸式首次接触、命名和专属角色生成
- 治愈、搞怪、智慧、傲娇四类确定性宇宙 DNA
- 宇宙房间、星云窗、宇宙植物、能量核心和回忆墙
- 待机、倾听、思考、聊天、开心、兴奋、难过、困倦、生气、害羞、惊讶和困惑状态
- 无需 API Key 的本地对话 Provider，可选 OpenAI 兼容远程 Provider
- 长期记忆提取、去重、自然召回和“记住／忘记”指令
- Memory Planet、记忆详情、编辑、删除、暂停、清空和 JSON 导出
- 六阶段关系成长，综合互动天数、有效交流、记忆、任务与反馈
- 每日心情签到、地球任务、特殊问候和渐进宇宙故事
- 哄睡、学习、猜谜互动模式和四种回复反馈
- 浏览器语音识别／朗读、语速音量控制和文字回退
- AI 身份透明、敏感信息过滤、通知授权、主题和减少动态效果
- v1 本地数据自动迁移与移动端优先响应式界面

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

打开 <http://localhost:3100>。开发服务器默认使用 3100 端口，避免常见的 3000 端口冲突。

## 可选：接入真实 AI

默认完全本地运行，不需要密钥。要接入 OpenAI 或其他兼容 Chat Completions 的服务：

```bash
copy .env.example .env.local
```

修改 `.env.local`：

```env
NEXT_PUBLIC_STARMATE_PROVIDER=remote
STARMATE_LLM_API_KEY=你的密钥
STARMATE_LLM_BASE_URL=https://api.openai.com/v1
STARMATE_LLM_MODEL=gpt-4.1-mini
```

密钥只在服务端 API Route 中读取。远程服务不可用时，应用会自动回退到本地 Provider。

## 验证

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
```

推荐手动验证：

1. 发送“以后叫我小宇”。
2. 发送“我特别喜欢吃辣拉面”。
3. 刷新页面并询问“你记得我喜欢什么吗？”。
4. 在“回忆星球”中修改或删除该偏好，再次询问。
5. 测试哄睡、学习、游戏模式、回复反馈和关系成长面板。

## 架构

```text
app/                    Next.js App Router、远程 AI API Route 和全局视觉
components/             应用编排、宇宙房间、动态角色、Memory Planet、成长面板
lib/character.ts        角色 DNA、原型、材质与配饰生成
lib/memory.ts           规则记忆提取、过滤、合并和召回
lib/progression.ts      多维关系成长与故事解锁
lib/daily.ts            本地日期和每日共同任务
lib/persona.ts          真实 Provider 的动态人格与安全 Prompt
lib/providers.ts        本地、远程及故障回退 LLMProvider
lib/storage.ts          v1/v2 迁移、本地持久化与数据导出
lib/types.ts            领域模型和结构化回复协议
tests/                  记忆、角色、关系、每日任务和人格行为测试
```

## 数据与隐私

默认模式中，角色、消息和长期记忆只存储在浏览器 `localStorage`，不会发送到服务器。启用远程 AI 后，当前消息和检索到的少量相关记忆会发送到配置的 AI 服务。用户可以暂停记忆、编辑或删除单条记忆、导出数据并删除本地账户。

## 尚需外部资源的生产能力

完整状态和后续资源清单见 [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)。
