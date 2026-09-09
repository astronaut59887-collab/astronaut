# StarMate 实现状态与生产路线

## 当前完成范围

Flight Build 0.2 已把四份产品、技术、人格与视觉规格中可在无密钥环境完成的核心体验落地：

- 首次接触、角色生成、宇宙房间和动态情绪表达
- 本地聊天、长期记忆、Memory Planet 和完整用户数据控制
- 关系成长、每日签到、共同任务、世界观解锁和特殊互动模式
- 回复反馈、AI 身份透明、安全语气和浏览器语音渐进增强
- 本地 Mock 与 OpenAI 兼容远程 LLM Provider，可自动回退

## 接入真实 AI 所需配置

应用支持 OpenAI 兼容的 Chat Completions API：

| 环境变量 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_STARMATE_PROVIDER=remote` | 启用服务端远程 Provider |
| `STARMATE_LLM_API_KEY` | 服务端密钥，不会进入浏览器代码 |
| `STARMATE_LLM_BASE_URL` | OpenAI 或兼容服务的 API 根地址 |
| `STARMATE_LLM_MODEL` | 要调用的模型名 |

远程响应必须符合结构化协议：文字、情绪、动画、语音风格和实际引用的记忆 ID。返回无效或请求失败时，客户端回退到本地人格 Provider。

## 仍需外部服务或专业资产

以下项目已经预留边界，但不能在没有资源的情况下诚实地标记为生产完成：

### 后端与账户

- PostgreSQL、Prisma、pgvector 和 Redis
- 邮箱、Google、Apple 登录及多用户数据隔离
- 跨设备同步、备份、恢复、限流、审计和删除传播
- S3 兼容的图片、文件、语音和回忆卡片存储

### AI 与多模态

- 真实流式 LLM 与更精细的长期记忆提取
- Embedding 语义检索和大规模记忆重排
- 图片／文件理解、用户授权后的多模态记忆
- 内容审核、危机场景策略和生产可观测性

### 语音

- 跨浏览器稳定 STT、自然角色 TTS 和流式音频
- 用户插话、语音活动检测、情绪音色和精确口型时间轴
- 可选服务：OpenAI Audio、Google Speech、ElevenLabs 或同类 Provider

### 3D 与 IP 资产

- React Three Fiber/WebGL 角色渲染、GLB 模型和 CSS 降级
- 专业骨骼、Blendshape、材质贴图、口型、服装和房间道具
- 品牌 Logo、宣传海报、角色设定三视图和视频动画
- 音效、背景音乐、专属声音与版权确认

### 主动触达与商业化

- PWA Service Worker、Web Push／FCM／APNs 与任务调度
- 用户可控频率、安静时段和事件提醒
- 订阅、权益、皮肤、服装、房间和内容资产管线

## 建议的生产实施顺序

1. **账户与 PostgreSQL**：让数据可靠、隔离并可跨设备同步。
2. **真实 LLM 与 Embedding**：替换本地规则，同时保留结构化安全校验和回退。
3. **生产语音**：先完成 STT/TTS Provider，再做打断和口型。
4. **专业 3D 角色资产**：在角色 DNA 与动画状态协议稳定后制作模型。
5. **通知与内容运营**：最后接入调度、世界观内容、商业化和增长系统。

每一阶段都必须保留用户对记忆、通知、导出和删除的最终控制权。
