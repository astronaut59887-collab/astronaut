# StarMate 星伴

一个“住在手机里的宇宙外星 AI 朋友”Web MVP。它不是普通聊天框，而是围绕初次相遇、角色生命感、长期记忆和用户可控隐私构建的完整体验。

## 已实现

- 沉浸式首次接触与命名流程
- 根据用户名稳定生成外观、名字、触角和徽章
- 具备待机、倾听、思考、开心、难过和困惑状态的动态角色
- 无需 API Key 的本地对话 Provider
- 长期记忆提取、去重、自然召回和显式“记住／忘记”指令
- 记忆查看、编辑、单条删除、全部清空、暂停保存与 JSON 导出
- 浏览器语音识别和语音合成渐进增强，不支持时自动回退到文字
- AI 身份透明说明、敏感信息过滤和减少动态效果
- 移动端优先的响应式界面

## 本地运行

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。

## 验证

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

推荐手动验证以下记忆闭环：

1. 发送“以后叫我小宇”。
2. 发送“我特别喜欢吃辣拉面”。
3. 刷新页面。
4. 询问“你记得我喜欢什么吗？”。
5. 在“我的记忆”中修改或删除该偏好，再次询问。

## 架构

```text
app/                    Next.js App Router 页面和全局视觉
components/             应用编排、动态角色、宇宙背景
lib/character.ts        确定性角色生成
lib/memory.ts           规则记忆提取、过滤、合并、召回
lib/providers.ts        可替换 LLMProvider 及本地 Mock 实现
lib/storage.ts          本地持久化与用户数据导出
lib/types.ts            领域模型和结构化回复协议
tests/                  记忆及角色生成测试
```

`LLMProvider` 返回文字、情绪、动画、语音风格和实际引用的记忆 ID。接入 OpenAI、Gemini、Claude 或本地模型时，只需实现同一接口，不需要改动 UI 或记忆编排。

## 数据与隐私

当前 MVP 是单设备、单用户、本地优先版本。角色、消息和长期记忆只存储在浏览器 `localStorage`，不会发送到服务器。用户可以导出数据或一键删除本地账户。密码、验证码、银行卡／身份证号和医疗诊断等常见敏感信息默认不会进入长期记忆。

## 下一阶段

- 服务端身份与 PostgreSQL 持久化
- 真实流式 LLM、STT、TTS Provider
- 向量检索与事件时间解析
- React Three Fiber 3D 模型、骨骼动画和口型同步
- 跨设备同步、通知和完整关系成长系统
