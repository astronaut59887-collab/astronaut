"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronRight,
  Download,
  Home,
  Keyboard,
  MessageCircle,
  Mic,
  Pencil,
  Radio,
  RotateCcw,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { generateCharacter } from "@/lib/character";
import {
  extractMemoryCandidates,
  forgetMatchingMemory,
  mergeMemories,
  relevantMemories,
} from "@/lib/memory";
import { llmProvider } from "@/lib/providers";
import { downloadState, EMPTY_STATE, loadState, saveState, STORAGE_KEY } from "@/lib/storage";
import type {
  AppState,
  Character,
  CharacterMood,
  MemoryRecord,
} from "@/lib/types";
import { ProceduralAlien } from "@/components/ProceduralAlien";
import { SpaceBackdrop } from "@/components/SpaceBackdrop";

type View = "home" | "chat" | "memories" | "settings";
type OnboardingStep = "contact" | "name" | "reveal";
type SpeechResultEvent = { results: { 0: { 0: { transcript: string } } } };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & typeof globalThis & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const memoryLabels: Record<MemoryRecord["type"], string> = {
  PROFILE: "关于你",
  PREFERENCE: "你的偏好",
  EVENT: "重要事件",
  EMOTION: "情绪片段",
  HABIT: "生活习惯",
};

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function daysTogether(firstMetAt: string) {
  return Math.max(1, Math.floor((Date.now() - new Date(firstMetAt).getTime()) / 86_400_000) + 1);
}

function greeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 6) return `${name}，这么晚还没睡？飞船的夜灯给你留着。`;
  if (hour < 11) return `早呀。今天的地球看起来适合发生一点好事。`;
  if (hour < 18) return `${name}，你回来啦。我刚刚在研究云为什么不会掉下来。`;
  return `晚上好，${name}。今天收集到什么地球故事了吗？`;
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.96;
  utterance.pitch = 1.12;
  window.speechSynthesis.speak(utterance);
}

function Onboarding({ onComplete }: { onComplete: (name: string, character: Character) => void }) {
  const [step, setStep] = useState<OnboardingStep>("contact");
  const [name, setName] = useState("");
  const [draft, setDraft] = useState<Character | null>(null);
  const [companionName, setCompanionName] = useState("");

  const reveal = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const generated = generateCharacter(trimmed);
    setDraft(generated);
    setCompanionName(generated.name);
    setStep("reveal");
  };

  return (
    <main className="onboarding-shell">
      <SpaceBackdrop />
      <div className="onboarding-brand"><Sparkles size={16} /> STARMATE / FIRST CONTACT</div>
      <AnimatePresence mode="wait">
        {step === "contact" && (
          <motion.section
            key="contact"
            className="contact-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <div className="signal-ring"><Radio size={26} /></div>
            <p className="eyebrow">未知信号 · 00:01</p>
            <div className="contact-copy">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>检测到地球生命。</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>你好。</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.75 }}>我好像……迷路了。</motion.p>
              <motion.strong initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>你愿意成为我在地球的第一个朋友吗？</motion.strong>
            </div>
            <motion.button
              className="primary-button"
              onClick={() => setStep("name")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3 }}
            >
              当然 <ChevronRight size={18} />
            </motion.button>
          </motion.section>
        )}

        {step === "name" && (
          <motion.section key="name" className="name-card" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }}>
            <button className="icon-button back-button" onClick={() => setStep("contact")} aria-label="返回"><ArrowLeft size={19} /></button>
            <div className="orbit-mark"><span>?</span></div>
            <p className="eyebrow">地球朋友档案 · 01</p>
            <h1>你叫什么？</h1>
            <p className="muted">我得先知道该怎么称呼我的第一个地球朋友。</p>
            <form onSubmit={reveal} className="name-form">
              <label htmlFor="earth-name">你喜欢的名字</label>
              <input id="earth-name" autoFocus maxLength={16} value={name} onChange={(event) => setName(event.target.value)} placeholder="输入你的名字" />
              <button className="primary-button" disabled={!name.trim()}>告诉它 <ChevronRight size={18} /></button>
            </form>
          </motion.section>
        )}

        {step === "reveal" && draft && (
          <motion.section key="reveal" className="reveal-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="eyebrow">宇宙基因匹配完成 · 100%</p>
            <h1>这是你的宇宙搭子。</h1>
            <ProceduralAlien character={{ ...draft, name: companionName || draft.name }} mood="happy" />
            <div className="reveal-name">
              <span>它的名字</span>
              <input aria-label="伙伴名字" maxLength={12} value={companionName} onChange={(event) => setCompanionName(event.target.value)} />
              <p>“嗯……至少飞船资料是这么写的。”</p>
            </div>
            <button className="primary-button" disabled={!companionName.trim()} onClick={() => onComplete(name.trim(), { ...draft, name: companionName.trim() })}>
              就叫这个 <Sparkles size={17} />
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

export function StarMateApp() {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>("home");
  const [mood, setMood] = useState<CharacterMood>("idle");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");
  const [editingMemory, setEditingMemory] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setState(loadState());
    setLoaded(true);
    const speechWindow = window as SpeechWindow;
    setVoiceSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: state.settings.reducedMotion ? "auto" : "smooth" });
  }, [state.messages, busy, state.settings.reducedMotion]);

  const navItems = useMemo(() => [
    { id: "home" as const, label: "舱室", icon: Home },
    { id: "chat" as const, label: "对话", icon: MessageCircle },
    { id: "memories" as const, label: "记忆", icon: Brain },
    { id: "settings" as const, label: "设置", icon: Settings },
  ], []);

  if (!loaded) return <main className="loading-screen"><SpaceBackdrop /><span className="loading-dot" />正在接收宇宙信号</main>;

  const completeOnboarding = (name: string, character: Character) => {
    const now = new Date().toISOString();
    setState({
      ...EMPTY_STATE,
      profile: { id: crypto.randomUUID(), displayName: name, nickname: name, createdAt: now, lastActiveAt: now },
      character,
      relationship: { firstMetAt: now, lastInteractionAt: now, activeDays: [dateKey()] },
      messages: [{
        id: crypto.randomUUID(),
        role: "assistant",
        content: `你好，${name}。我是 ${character.name}。飞船可能坏了一大点，但认识你这件事好像很幸运。`,
        emotion: "happy",
        createdAt: now,
      }],
    });
  };

  if (!state.profile || !state.character || !state.relationship) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const profile = state.profile;
  const character = state.character;
  const relationship = state.relationship;
  const displayName = state.memories.find((memory) => memory.type === "PROFILE" && memory.content.startsWith("希望被叫作"))?.content.replace("希望被叫作", "") || profile.nickname;

  const startListening = () => {
    setVoiceNotice("");
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceNotice("这个浏览器暂时听不见你，不过你可以打字告诉我。");
      setView("chat");
      return;
    }
    recognitionRef.current?.stop();
    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
      setView("chat");
    };
    recognition.onerror = () => setVoiceNotice("刚才的信号有点模糊。再试一次，或者打字告诉我吧。");
    recognition.onend = () => setMood("idle");
    recognitionRef.current = recognition;
    setMood("listening");
    setVoiceNotice("我在听……说完后会把声音变成文字。");
    recognition.start();
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMood("thinking");
    setVoiceNotice("");

    const now = new Date().toISOString();
    const userMessage = { id: crypto.randomUUID(), role: "user" as const, content: text, createdAt: now };
    const forgotten = forgetMatchingMemory(state.memories, text);
    const candidates = state.settings.memoryEnabled && forgotten.removed.length === 0
      ? extractMemoryCandidates(text)
      : [];
    const updatedMemories = mergeMemories(forgotten.memories, candidates);
    const requestedName = candidates.find((item) => item.type === "PROFILE" && item.content.startsWith("希望被叫作"));
    const updatedProfile = requestedName
      ? { ...profile, nickname: requestedName.content.replace("希望被叫作", ""), lastActiveAt: now }
      : { ...profile, lastActiveAt: now };
    const activeDays = relationship.activeDays.includes(dateKey())
      ? relationship.activeDays
      : [...relationship.activeDays, dateKey()];
    const workingState: AppState = {
      ...state,
      profile: updatedProfile,
      memories: updatedMemories,
      messages: [...state.messages, userMessage],
      relationship: { ...relationship, activeDays, lastInteractionAt: now },
      character: { ...character, experience: character.experience + 2 },
    };
    setState(workingState);

    try {
      const reply = await llmProvider.generate({
        message: text,
        profile: updatedProfile,
        character,
        memories: relevantMemories(updatedMemories, text),
      });
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: reply.text,
        emotion: reply.emotion,
        referencedMemoryIds: reply.referencedMemoryIds,
        createdAt: new Date().toISOString(),
      };
      setMood(reply.animation);
      setState({ ...workingState, messages: [...workingState.messages, assistantMessage] });
      if (state.settings.autoPlayVoice) speak(reply.text);
      window.setTimeout(() => setMood("idle"), 2600);
    } catch {
      setMood("confused");
      setState({
        ...workingState,
        messages: [...workingState.messages, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "信号刚刚被一颗小行星撞歪了。可以再发一次吗？",
          emotion: "confused",
          createdAt: new Date().toISOString(),
        }],
      });
    } finally {
      setBusy(false);
    }
  };

  const updateMemory = (memory: MemoryRecord) => {
    const content = editingText.trim();
    if (!content) return;
    setState({ ...state, memories: state.memories.map((item) => item.id === memory.id ? { ...item, content, updatedAt: new Date().toISOString() } : item) });
    setEditingMemory(null);
  };

  const resetAccount = () => {
    if (!window.confirm("删除后，本地保存的对话和记忆都无法恢复。确定让飞船重新起航吗？")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.speechSynthesis?.cancel();
    setState(EMPTY_STATE);
    setView("home");
  };

  return (
    <main className={`app-shell ${state.settings.reducedMotion ? "reduce-motion" : ""}`}>
      <SpaceBackdrop />
      <aside className="side-nav">
        <div className="brand-lockup"><span><Sparkles size={18} /></span><div><strong>StarMate</strong><small>宇宙搭子计划</small></div></div>
        <nav aria-label="主导航">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><Icon size={19} /><span>{label}</span></button>
          ))}
        </nav>
        <div className="signal-status"><i /> 本地飞船 · 在线<small>记忆只保存在这台设备</small></div>
      </aside>

      <section className="app-content">
        <header className="mobile-header">
          <div className="brand-lockup"><span><Sparkles size={16} /></span><strong>StarMate</strong></div>
          <span className="online-pill"><i /> ONLINE</span>
        </header>

        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div key="home" className="home-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="home-heading">
                <div><p className="eyebrow">舱室编号 · {String(character.seed).slice(0, 6)}</p><h1>{character.name}</h1></div>
                <div className="level-pill"><span>LV. {character.level}</span><i><b style={{ width: `${Math.min(100, character.experience)}%` }} /></i></div>
              </div>
              <div className="companion-zone">
                <div className="speech-orbit">
                  <span className="bubble-label">来自 {character.name}</span>
                  <p>{greeting(displayName)}</p>
                </div>
                <ProceduralAlien character={character} mood={mood} />
                <div className="status-strip">
                  <span><i className="status-dot" /> {mood === "listening" ? "正在听你说" : mood === "thinking" ? "正在想一想" : "心情不错"}</span>
                  <span>认识你第 {daysTogether(relationship.firstMetAt)} 天</span>
                </div>
              </div>
              <div className="home-actions">
                <button className={`voice-button ${mood === "listening" ? "listening" : ""}`} onClick={startListening}><span><Mic size={25} /></span><div><strong>{mood === "listening" ? "我在听…" : "和它说话"}</strong><small>{voiceSupported ? "点击开始 · 说完自动停止" : "当前浏览器可能不支持语音"}</small></div></button>
                <button className="keyboard-button" onClick={() => setView("chat")}><Keyboard size={21} /><span>打字聊聊</span><ChevronRight size={17} /></button>
                {voiceNotice && <p className="voice-notice">{voiceNotice}</p>}
              </div>
            </motion.div>
          )}

          {view === "chat" && (
            <motion.div key="chat" className="chat-view" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="view-header chat-header">
                <div className="mini-companion"><ProceduralAlien character={character} mood={mood} compact /></div>
                <div><p className="eyebrow">量子通信已连接</p><h1>和 {character.name} 聊聊</h1></div>
                <button className="icon-button" onClick={() => setState({ ...state, settings: { ...state.settings, autoPlayVoice: !state.settings.autoPlayVoice } })} aria-label="切换语音朗读">{state.settings.autoPlayVoice ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
              </div>
              <div className="message-list">
                {state.messages.map((message) => (
                  <div className={`message-row message-row--${message.role}`} key={message.id}>
                    {message.role === "assistant" && <span className="message-avatar" style={{ background: character.appearance.body }}>{character.name.slice(0, 1)}</span>}
                    <div className="message-bubble">
                      <p>{message.content}</p>
                      <time>{new Date(message.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</time>
                    </div>
                  </div>
                ))}
                {busy && <div className="message-row message-row--assistant"><span className="message-avatar" style={{ background: character.appearance.body }}>{character.name.slice(0, 1)}</span><div className="typing-indicator"><i /><i /><i /></div></div>}
                <div ref={messagesEnd} />
              </div>
              {voiceNotice && <p className="voice-notice chat-voice-notice">{voiceNotice}</p>}
              <form className="composer" onSubmit={sendMessage}>
                <button type="button" className={`composer-mic ${mood === "listening" ? "active" : ""}`} onClick={startListening} aria-label="语音输入"><Mic size={20} /></button>
                <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="把今天的故事告诉它…" maxLength={500} aria-label="消息" />
                <button className="send-button" disabled={!input.trim() || busy} aria-label="发送"><Send size={19} /></button>
              </form>
            </motion.div>
          )}

          {view === "memories" && (
            <motion.div key="memories" className="panel-view" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="view-header"><div className="view-icon"><Brain size={22} /></div><div><p className="eyebrow">MEMORY CONSTELLATION</p><h1>我的记忆</h1></div></div>
              <div className="privacy-banner"><ShieldCheck size={22} /><div><strong>你的记忆属于你。</strong><p>你可以随时修改、删除，或者让我停止长期记忆。</p></div></div>
              <label className="setting-row memory-toggle"><div><strong>允许 {character.name} 记住重要的事</strong><p>普通闲聊不会被保存为长期记忆。</p></div><input type="checkbox" checked={state.settings.memoryEnabled} onChange={(event) => setState({ ...state, settings: { ...state.settings, memoryEnabled: event.target.checked } })} /><span className="toggle" /></label>
              <div className="memory-toolbar"><span>{state.memories.length} 颗记忆星</span><div><button onClick={() => downloadState(state)}><Download size={16} /> 导出</button><button className="danger-text" disabled={!state.memories.length} onClick={() => { if (window.confirm("清空后无法恢复。确定清空所有长期记忆吗？")) setState({ ...state, memories: [] }); }}><Trash2 size={16} /> 清空</button></div></div>
              <div className="memory-grid">
                {state.memories.length === 0 && <div className="empty-state"><span><Sparkles size={27} /></span><h2>记忆星图还是空的</h2><p>等我们多认识一点，这里会慢慢亮起来。</p><button onClick={() => setView("chat")}>去聊几句</button></div>}
                {state.memories.map((memory) => (
                  <article className={`memory-card memory-card--${memory.type.toLowerCase()}`} key={memory.id}>
                    <div className="memory-meta"><span>{memoryLabels[memory.type]}</span><time>{new Date(memory.createdAt).toLocaleDateString("zh-CN")}</time></div>
                    {editingMemory === memory.id ? (
                      <div className="memory-edit"><input autoFocus value={editingText} onChange={(event) => setEditingText(event.target.value)} /><button onClick={() => updateMemory(memory)} aria-label="保存"><Check size={17} /></button><button onClick={() => setEditingMemory(null)} aria-label="取消"><X size={17} /></button></div>
                    ) : <p>{memory.content}</p>}
                    <div className="memory-actions"><button onClick={() => { setEditingMemory(memory.id); setEditingText(memory.content); }}><Pencil size={15} /> 修改</button><button onClick={() => setState({ ...state, memories: state.memories.filter((item) => item.id !== memory.id) })}><Trash2 size={15} /> 忘掉</button></div>
                  </article>
                ))}
              </div>
            </motion.div>
          )}

          {view === "settings" && (
            <motion.div key="settings" className="panel-view settings-view" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="view-header"><div className="view-icon"><Settings size={22} /></div><div><p className="eyebrow">FLIGHT CONFIGURATION</p><h1>飞船设置</h1></div></div>
              <section className="settings-section"><h2>互动方式</h2>
                <label className="setting-row"><div><strong>自动朗读回复</strong><p>使用浏览器内置语音，不会上传音频。</p></div><input type="checkbox" checked={state.settings.autoPlayVoice} onChange={(event) => setState({ ...state, settings: { ...state.settings, autoPlayVoice: event.target.checked } })} /><span className="toggle" /></label>
                <label className="setting-row"><div><strong>减少动态效果</strong><p>减少漂浮、闪烁和页面过渡。</p></div><input type="checkbox" checked={state.settings.reducedMotion} onChange={(event) => setState({ ...state, settings: { ...state.settings, reducedMotion: event.target.checked } })} /><span className="toggle" /></label>
              </section>
              <section className="settings-section"><h2>关于你的搭子</h2><div className="transparency-card"><ShieldCheck size={21} /><p><strong>{character.name} 是一个有外星伙伴设定的 AI。</strong>它不会声称自己拥有真实的人类意识。当前演示使用本地规则模型，未来可以替换为其他 AI Provider。</p></div></section>
              <section className="settings-section"><h2>本地数据</h2><div className="data-actions"><button onClick={() => downloadState(state)}><Download size={18} /><span><strong>导出我的数据</strong><small>下载 JSON 格式副本</small></span><ChevronRight size={17} /></button><button className="danger-action" onClick={resetAccount}><RotateCcw size={18} /><span><strong>删除本地账户</strong><small>清除角色、对话与全部记忆</small></span><ChevronRight size={17} /></button></div></section>
              <p className="version-note">STARMATE FLIGHT BUILD 0.1 · LOCAL FIRST</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <nav className="bottom-nav" aria-label="移动端导航">
        {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><Icon size={20} /><span>{label}</span></button>)}
      </nav>
    </main>
  );
}
