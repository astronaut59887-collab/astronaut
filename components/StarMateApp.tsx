"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BellOff,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  Download,
  Gamepad2,
  Heart,
  Home,
  Keyboard,
  Laugh,
  Lightbulb,
  MessageCircle,
  Mic,
  Moon,
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
import { archetypeLabels, generateCharacter } from "@/lib/character";
import { dailyMission, localDateKey } from "@/lib/daily";
import {
  extractMemoryCandidates,
  forgetMatchingMemory,
  mergeMemories,
  relevantMemories,
} from "@/lib/memory";
import { currentGrowth } from "@/lib/progression";
import { llmProvider } from "@/lib/providers";
import { downloadState, EMPTY_STATE, loadState, saveState, STORAGE_KEY } from "@/lib/storage";
import { stopVoicePlayback, voiceProvider } from "@/lib/voice-client";
import type {
  AppState,
  Character,
  CharacterMood,
  InteractionMode,
  MemoryRecord,
  MessageFeedback,
  VoiceStyle,
} from "@/lib/types";
import { CosmicRoom } from "@/components/CosmicRoom";
import { GrowthPanel } from "@/components/GrowthPanel";
import { MemoryPlanet } from "@/components/MemoryPlanet";
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
const feedbackItems: { value: MessageFeedback; label: string; icon: typeof Heart }[] = [
  { value: "love", label: "喜欢", icon: Heart },
  { value: "funny", label: "好笑", icon: Laugh },
  { value: "helpful", label: "有帮助", icon: Lightbulb },
  { value: "dislike", label: "不喜欢", icon: VolumeX },
];
const modeItems: { value: InteractionMode; label: string; icon: typeof Moon; prompt: string }[] = [
  { value: "sleep", label: "哄睡", icon: Moon, prompt: "今天辛苦了，陪我进入休眠模式吧。" },
  { value: "study", label: "一起学习", icon: BookOpen, prompt: "陪我一起学习，我们先拆一个小目标。" },
  { value: "game", label: "玩个游戏", icon: Gamepad2, prompt: "我们玩个宇宙猜谜吧。" },
];

function daysTogether(firstMetAt: string) {
  return Math.max(1, Math.floor((Date.now() - new Date(firstMetAt).getTime()) / 86_400_000) + 1);
}

function greeting(name: string, lastActiveAt: string) {
  const hour = new Date().getHours();
  const absentDays = Math.floor((Date.now() - new Date(lastActiveAt).getTime()) / 86_400_000);
  if (absentDays >= 2) return `${name}，你消失了 ${absentDays} 天。我还以为你的地球任务卡住了……不过你回来就好。`;
  if (hour < 6) return `${name}，这么晚还没睡？飞船的夜灯给你留着。`;
  if (hour < 11) return "早呀。今天的地球看起来适合发生一点好事。";
  if (hour < 18) return `${name}，你回来啦。我刚刚在研究云为什么不会掉下来。`;
  return `晚上好，${name}。今天收集到什么地球故事了吗？`;
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
          <motion.section key="contact" className="contact-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }}>
            <div className="signal-ring"><Radio size={26} /></div>
            <p className="eyebrow">未知信号 · 00:01</p>
            <div className="contact-copy">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>检测到地球生命。</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>你好。</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.75 }}>我好像……迷路了。</motion.p>
              <motion.strong initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>你愿意成为我在地球的第一个朋友吗？</motion.strong>
            </div>
            <motion.button className="primary-button" onClick={() => setStep("name")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 }}>当然 <ChevronRight size={18} /></motion.button>
          </motion.section>
        )}
        {step === "name" && (
          <motion.section key="name" className="name-card" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }}>
            <button className="icon-button back-button" onClick={() => setStep("contact")} aria-label="返回"><ArrowLeft size={19} /></button>
            <div className="orbit-mark"><span>?</span></div>
            <p className="eyebrow">地球朋友档案 · 01</p><h1>你叫什么？</h1>
            <p className="muted">我得先知道该怎么称呼我的第一个地球朋友。</p>
            <form onSubmit={reveal} className="name-form"><label htmlFor="earth-name">你喜欢的名字</label><input id="earth-name" autoFocus maxLength={16} value={name} onChange={(event) => setName(event.target.value)} placeholder="输入你的名字" /><button className="primary-button" disabled={!name.trim()}>告诉它 <ChevronRight size={18} /></button></form>
          </motion.section>
        )}
        {step === "reveal" && draft && (
          <motion.section key="reveal" className="reveal-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="eyebrow">宇宙基因匹配完成 · 100%</p><h1>这是你的宇宙搭子。</h1>
            <ProceduralAlien character={{ ...draft, name: companionName || draft.name }} mood="happy" />
            <div className="archetype-reveal"><strong>{archetypeLabels[draft.appearance.archetype].name}</strong><span>{archetypeLabels[draft.appearance.archetype].description}</span></div>
            <div className="reveal-name"><span>它的名字</span><input aria-label="伙伴名字" maxLength={12} value={companionName} onChange={(event) => setCompanionName(event.target.value)} /><p>“嗯……至少飞船资料是这么写的。”</p></div>
            <button className="primary-button" disabled={!companionName.trim()} onClick={() => onComplete(name.trim(), { ...draft, name: companionName.trim() })}>就叫这个 <Sparkles size={17} /></button>
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
  const [selectedMemory, setSelectedMemory] = useState<MemoryRecord | null>(null);
  const [growthOpen, setGrowthOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<InteractionMode>("chat");
  const messagesEnd = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const moodTimerRef = useRef<number | null>(null);
  const voiceRunRef = useRef(0);
  const tapCount = useRef(0);
  const mission = useMemo(() => dailyMission(), []);

  useEffect(() => {
    const stored = loadState();
    if (stored.relationship && !stored.relationship.activeDays.includes(localDateKey())) {
      stored.relationship = { ...stored.relationship, activeDays: [...stored.relationship.activeDays, localDateKey()] };
    }
    setState(stored);
    setLoaded(true);
    const speechWindow = window as SpeechWindow;
    setVoiceSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
  }, []);
  useEffect(() => { if (loaded) saveState(state); }, [state, loaded]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: state.settings.reducedMotion ? "auto" : "smooth" }); }, [state.messages, busy, state.settings.reducedMotion]);
  useEffect(() => () => {
    recognitionRef.current?.stop();
    if (moodTimerRef.current !== null) window.clearTimeout(moodTimerRef.current);
    stopVoicePlayback();
  }, []);

  const navItems = useMemo(() => [
    { id: "home" as const, label: "舱室", icon: Home },
    { id: "chat" as const, label: "对话", icon: MessageCircle },
    { id: "memories" as const, label: "星球", icon: Brain },
    { id: "settings" as const, label: "设置", icon: Settings },
  ], []);

  if (!loaded) return <main className="loading-screen"><SpaceBackdrop /><span className="loading-dot" />正在接收宇宙信号</main>;

  const completeOnboarding = (name: string, character: Character) => {
    const now = new Date().toISOString();
    setState({
      ...EMPTY_STATE,
      profile: { id: crypto.randomUUID(), displayName: name, nickname: name, createdAt: now, lastActiveAt: now },
      character,
      relationship: { firstMetAt: now, lastInteractionAt: now, activeDays: [localDateKey()], meaningfulInteractions: 0, completedMissions: [] },
      messages: [{ id: crypto.randomUUID(), role: "assistant", content: `你好，${name}。我是 ${character.name}。飞船可能坏了一大点，但认识你这件事好像很幸运。`, emotion: "happy", createdAt: now }],
    });
  };

  if (!state.profile || !state.character || !state.relationship) return <Onboarding onComplete={completeOnboarding} />;

  const profile = state.profile;
  const character = state.character;
  const relationship = state.relationship;
  const growth = currentGrowth(relationship, state.memories, state.messages);
  const missionComplete = relationship.completedMissions.includes(mission.id);
  const todayCheckIn = state.checkIns.find((checkIn) => checkIn.date === localDateKey());
  const displayName = state.memories.find((memory) => memory.type === "PROFILE" && memory.content.startsWith("希望被叫作"))?.content.replace("希望被叫作", "") || profile.nickname;

  const showMoodBriefly = (nextMood: CharacterMood, duration = 2200) => {
    if (moodTimerRef.current !== null) window.clearTimeout(moodTimerRef.current);
    setMood(nextMood);
    moodTimerRef.current = window.setTimeout(() => setMood("idle"), duration);
  };
  const stopCurrentVoice = () => {
    voiceRunRef.current += 1;
    stopVoicePlayback();
  };
  const playVoice = (text: string, style: VoiceStyle, emotion: CharacterMood) => {
    stopCurrentVoice();
    const run = voiceRunRef.current;
    void voiceProvider.speak({
      text,
      style,
      emotion,
      rate: state.settings.speechRate,
      volume: state.settings.speechVolume,
      onStart: () => { if (voiceRunRef.current === run) setMood("talking"); },
      onEnd: () => { if (voiceRunRef.current === run) showMoodBriefly(emotion, 1200); },
    }).then((played) => {
      if (!played && voiceRunRef.current === run) showMoodBriefly(emotion);
    }).catch(() => {
      if (voiceRunRef.current === run) showMoodBriefly(emotion);
    });
  };

  const startListening = () => {
    stopCurrentVoice();
    setVoiceNotice("");
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) { setVoiceNotice("这个浏览器暂时听不见你，不过你可以打字告诉我。"); setView("chat"); return; }
    recognitionRef.current?.stop();
    const recognition = new Recognition();
    recognition.lang = "zh-CN"; recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = (event) => { setInput(event.results[0][0].transcript); setView("chat"); };
    recognition.onerror = () => setVoiceNotice("刚才的信号有点模糊。再试一次，或者打字告诉我吧。");
    recognition.onend = () => setMood("idle");
    recognitionRef.current = recognition;
    setMood("listening"); setVoiceNotice("我在听……说完后会把声音变成文字。"); recognition.start();
  };

  const submitMessage = async (rawText: string, mode: InteractionMode = activeMode) => {
    const text = rawText.trim();
    if (!text || busy) return;
    stopCurrentVoice();
    if (moodTimerRef.current !== null) window.clearTimeout(moodTimerRef.current);
    setInput(""); setBusy(true); setMood("thinking"); setVoiceNotice("");
    const now = new Date().toISOString();
    const userMessage = { id: crypto.randomUUID(), role: "user" as const, content: text, createdAt: now, mode };
    const forgotten = forgetMatchingMemory(state.memories, text);
    const candidates = state.settings.memoryEnabled && forgotten.removed.length === 0 ? extractMemoryCandidates(text) : [];
    const updatedMemories = mergeMemories(forgotten.memories, candidates);
    const requestedName = candidates.find((item) => item.type === "PROFILE" && item.content.startsWith("希望被叫作"));
    const updatedProfile = requestedName ? { ...profile, nickname: requestedName.content.replace("希望被叫作", ""), lastActiveAt: now } : { ...profile, lastActiveAt: now };
    const meaningful = text.length >= 8 || candidates.length > 0;
    const updatedRelationship = { ...relationship, lastInteractionAt: now, meaningfulInteractions: relationship.meaningfulInteractions + (meaningful ? 1 : 0) };
    const workingState: AppState = { ...state, profile: updatedProfile, memories: updatedMemories, messages: [...state.messages, userMessage], relationship: updatedRelationship, character: { ...character, experience: character.experience + (meaningful ? 4 : 1) } };
    setState(workingState);
    try {
      const reply = await llmProvider.generate({ message: text, profile: updatedProfile, character, memories: relevantMemories(updatedMemories, text), mode, relationshipLevel: growth.current.level });
      const assistantMessage = { id: crypto.randomUUID(), role: "assistant" as const, content: reply.text, emotion: reply.emotion, voiceStyle: reply.voiceStyle, referencedMemoryIds: reply.referencedMemoryIds, createdAt: new Date().toISOString(), mode };
      setMood(reply.animation);
      setState({ ...workingState, messages: [...workingState.messages, assistantMessage] });
      if (state.settings.autoPlayVoice) playVoice(reply.text, reply.voiceStyle, reply.animation);
      else showMoodBriefly(reply.animation, 2600);
    } catch {
      setMood("confused");
      setState({ ...workingState, messages: [...workingState.messages, { id: crypto.randomUUID(), role: "assistant", content: "信号刚刚被一颗小行星撞歪了。可以再发一次吗？", emotion: "confused", createdAt: new Date().toISOString() }] });
    } finally { setBusy(false); }
  };

  const sendMessage = (event: FormEvent) => { event.preventDefault(); void submitMessage(input); };
  const launchMode = (mode: InteractionMode, prompt: string) => { setActiveMode(mode); setView("chat"); void submitMessage(prompt, mode); };
  const reactToMessage = (messageId: string, feedback: MessageFeedback) => setState({ ...state, messages: state.messages.map((message) => message.id === messageId ? { ...message, feedback: message.feedback === feedback ? undefined : feedback } : message) });
  const checkIn = (moodValue: AppState["checkIns"][number]["mood"], characterMood: CharacterMood) => {
    showMoodBriefly(characterMood);
    setState({ ...state, checkIns: [...state.checkIns.filter((item) => item.date !== localDateKey()), { date: localDateKey(), mood: moodValue }] });
  };
  const completeMission = () => {
    if (missionComplete) return;
    setState({ ...state, relationship: { ...relationship, completedMissions: [...relationship.completedMissions, mission.id] }, character: { ...character, experience: character.experience + 12 } });
    showMoodBriefly("excited", 2400);
  };
  const tapCompanion = () => {
    tapCount.current += 1; showMoodBriefly(tapCount.current % 3 === 0 ? "happy" : "curious", 1800);
  };
  const updateMemory = (memory: MemoryRecord) => {
    const content = editingText.trim(); if (!content) return;
    setState({ ...state, memories: state.memories.map((item) => item.id === memory.id ? { ...item, content, updatedAt: new Date().toISOString() } : item) }); setEditingMemory(null);
  };
  const requestNotifications = async () => {
    if (!("Notification" in window)) { setVoiceNotice("这个浏览器暂时不支持通知。"); return; }
    if (state.settings.notificationEnabled) { setState({ ...state, settings: { ...state.settings, notificationEnabled: false } }); return; }
    const permission = await Notification.requestPermission();
    setState({ ...state, settings: { ...state.settings, notificationEnabled: permission === "granted" } });
    if (permission !== "granted") setVoiceNotice("通知权限没有开启。你仍然可以正常使用所有陪伴功能。");
  };
  const resetAccount = () => {
    if (!window.confirm("删除后，本地保存的对话和记忆都无法恢复。确定让飞船重新起航吗？")) return;
    window.localStorage.removeItem(STORAGE_KEY); stopCurrentVoice(); setState(EMPTY_STATE); setView("home");
  };

  return (
    <main className={`app-shell theme-${state.settings.theme} ${state.settings.reducedMotion ? "reduce-motion" : ""}`}>
      <SpaceBackdrop />
      <aside className="side-nav">
        <div className="brand-lockup"><span><Sparkles size={18} /></span><div><strong>StarMate</strong><small>宇宙搭子计划</small></div></div>
        <nav aria-label="主导航">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
        <button className="side-growth" onClick={() => setGrowthOpen(true)}><span>Lv.{growth.current.level}</span><div><strong>{growth.current.shortName}</strong><i><b style={{ width: `${growth.progress}%` }} /></i></div></button>
        <div className="signal-status"><i /> 本地飞船 · 在线<small>记忆只保存在这台设备</small></div>
      </aside>

      <section className={`app-content ${view === "home" || view === "chat" ? "app-content--cosmic" : ""}`}>
        <header className="mobile-header"><div className="brand-lockup"><span><Sparkles size={16} /></span><strong>StarMate</strong></div><span className="online-pill"><i /> ONLINE</span></header>
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div key="home" className="home-view cosmic-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CosmicRoom memories={state.memories} />
              <div className="home-heading">
                <div><p className="eyebrow">{archetypeLabels[character.appearance.archetype].name} · {character.species}</p><h1>{character.name}</h1></div>
                <button className="evolution-pill" onClick={() => setGrowthOpen(true)}><span>Lv.{growth.current.level}</span><div><strong>{growth.current.shortName}</strong><i><b style={{ width: `${growth.progress}%` }} /></i></div><ChevronRight size={15} /></button>
              </div>
              <div className="companion-zone">
                <div className="speech-orbit"><span className="bubble-label">来自 {character.name}</span><p>{greeting(displayName, profile.lastActiveAt)}</p></div>
                <button className="companion-touch" onClick={tapCompanion} aria-label={`和 ${character.name} 互动`}><ProceduralAlien character={character} mood={mood} /></button>
                <div className="status-strip"><span><i className="status-dot" /> {mood === "listening" ? "正在听你说" : mood === "thinking" ? "正在想一想" : mood === "talking" ? "正在和你说话" : mood === "sleepy" ? "进入休眠模式" : "生命体征稳定"}</span><span>认识你第 {daysTogether(relationship.firstMetAt)} 天</span></div>
              </div>
              <div className="home-dock">
                <section className="check-in-card"><p>今天的能量怎么样？</p><div>{[["great", "好", "excited"], ["okay", "稳", "happy"], ["tired", "累", "sleepy"], ["low", "低", "sad"]].map(([value, icon, visual]) => <button key={value} aria-label={`今天状态：${icon}`} className={todayCheckIn?.mood === value ? "active" : ""} onClick={() => checkIn(value as AppState["checkIns"][number]["mood"], visual as CharacterMood)}>{icon}</button>)}</div></section>
                <div className="home-actions"><button className={`energy-voice energy-voice--${busy ? "replying" : mood === "listening" ? "listening" : "idle"}`} onClick={startListening}><span><i /><Mic size={26} /></span><strong>{mood === "listening" ? "我在听…" : "和它说话"}</strong><small>{voiceSupported ? "点击能量核心" : "可使用文字通信"}</small></button><button className="keyboard-button" onClick={() => setView("chat")}><Keyboard size={21} /><span>打字聊聊</span><ChevronRight size={17} /></button>{voiceNotice && <p className="voice-notice">{voiceNotice}</p>}</div>
                <section className="mission-card"><div><span>{mission.icon}</span><p><small>今日地球任务</small><strong>{mission.title}</strong></p></div><p>{mission.description}</p><div className="mission-actions"><button onClick={() => { setInput(mission.prompt); setView("chat"); }}>一起做</button><button className={missionComplete ? "done" : ""} onClick={completeMission}>{missionComplete ? <><Check size={13} /> 已完成</> : "完成打卡"}</button></div></section>
              </div>
            </motion.div>
          )}

          {view === "chat" && (
            <motion.div key="chat" className="chat-view cosmic-chat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CosmicRoom memories={state.memories} />
              <div className="view-header chat-header"><div className="mini-companion"><ProceduralAlien character={character} mood={mood} compact /></div><div><p className="eyebrow">量子通信已连接</p><h1>和 {character.name} 聊聊</h1></div><button className="icon-button" onClick={() => setState({ ...state, settings: { ...state.settings, autoPlayVoice: !state.settings.autoPlayVoice } })} aria-label="切换语音朗读">{state.settings.autoPlayVoice ? <Volume2 size={20} /> : <VolumeX size={20} />}</button></div>
              <div className="mode-strip"><span>一起：</span>{modeItems.map(({ value, label, icon: Icon, prompt }) => <button key={value} className={activeMode === value ? "active" : ""} onClick={() => launchMode(value, prompt)} disabled={busy}><Icon size={14} />{label}</button>)}</div>
              <div className="message-list">
                {state.messages.map((message) => (
                  <div className={`message-row message-row--${message.role}`} key={message.id}>
                    {message.role === "assistant" && <div className="message-alien"><ProceduralAlien character={character} mood={message.emotion ?? "idle"} compact /></div>}
                    <div className="message-stack"><div className="message-bubble"><p>{message.content}</p><time>{new Date(message.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</time></div>{message.role === "assistant" && <div className="message-feedback"><button onClick={() => playVoice(message.content, message.voiceStyle ?? "warm", message.emotion ?? "happy")} aria-label="朗读回复" title="朗读回复"><Volume2 size={13} /></button>{feedbackItems.map(({ value, label, icon: Icon }) => <button key={value} className={message.feedback === value ? "active" : ""} onClick={() => reactToMessage(message.id, value)} aria-label={label} title={label}><Icon size={13} /></button>)}</div>}</div>
                  </div>
                ))}
                {busy && <div className="message-row message-row--assistant"><div className="message-alien"><ProceduralAlien character={character} mood="thinking" compact /></div><div className="typing-indicator"><i /><i /><i /></div></div>}<div ref={messagesEnd} />
              </div>
              {voiceNotice && <p className="voice-notice chat-voice-notice">{voiceNotice}</p>}
              <form className="composer" onSubmit={sendMessage}><button type="button" className={`composer-mic ${mood === "listening" ? "active" : ""}`} onClick={startListening} aria-label="语音输入"><Mic size={20} /></button><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="把今天的故事告诉它…" maxLength={500} aria-label="消息" /><button className="send-button" disabled={!input.trim() || busy} aria-label="发送"><Send size={19} /></button></form>
            </motion.div>
          )}

          {view === "memories" && (
            <motion.div key="memories" className="panel-view memories-view" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="view-header"><div className="view-icon"><Brain size={22} /></div><div><p className="eyebrow">MEMORY CONSTELLATION</p><h1>回忆星球</h1></div></div>
              <MemoryPlanet memories={state.memories} onSelect={setSelectedMemory} />
              {selectedMemory && <div className="selected-memory"><button onClick={() => setSelectedMemory(null)} aria-label="关闭"><X size={16} /></button><span>{memoryLabels[selectedMemory.type]} · {new Date(selectedMemory.createdAt).toLocaleDateString("zh-CN")}</span><strong>{selectedMemory.content}</strong><p>这颗记忆星来自你们的一次真实对话。修改或删除后，未来的回复也会跟着改变。</p></div>}
              <div className="privacy-banner"><ShieldCheck size={22} /><div><strong>你的记忆属于你。</strong><p>你可以随时修改、删除，或者让我停止长期记忆。</p></div></div>
              <label className="setting-row memory-toggle"><div><strong>允许 {character.name} 记住重要的事</strong><p>普通闲聊不会被保存为长期记忆。</p></div><input type="checkbox" checked={state.settings.memoryEnabled} onChange={(event) => setState({ ...state, settings: { ...state.settings, memoryEnabled: event.target.checked } })} /><span className="toggle" /></label>
              <div className="memory-toolbar"><span>{state.memories.length} 颗记忆星</span><div><button onClick={() => downloadState(state)}><Download size={16} /> 导出</button><button className="danger-text" disabled={!state.memories.length} onClick={() => { if (window.confirm("清空后无法恢复。确定清空所有长期记忆吗？")) setState({ ...state, memories: [] }); }}><Trash2 size={16} /> 清空</button></div></div>
              <div className="memory-grid">{state.memories.length === 0 && <div className="empty-state"><span><Sparkles size={27} /></span><h2>记忆星图还是空的</h2><p>等我们多认识一点，这里会慢慢亮起来。</p><button onClick={() => setView("chat")}>去聊几句</button></div>}{state.memories.map((memory) => <article className={`memory-card memory-card--${memory.type.toLowerCase()}`} key={memory.id}><div className="memory-meta"><span>{memoryLabels[memory.type]}</span><time>{new Date(memory.createdAt).toLocaleDateString("zh-CN")}</time></div>{editingMemory === memory.id ? <div className="memory-edit"><input autoFocus value={editingText} onChange={(event) => setEditingText(event.target.value)} /><button onClick={() => updateMemory(memory)} aria-label="保存"><Check size={17} /></button><button onClick={() => setEditingMemory(null)} aria-label="取消"><X size={17} /></button></div> : <p>{memory.content}</p>}<div className="memory-actions"><button onClick={() => { setEditingMemory(memory.id); setEditingText(memory.content); }}><Pencil size={15} /> 修改</button><button onClick={() => setState({ ...state, memories: state.memories.filter((item) => item.id !== memory.id) })}><Trash2 size={15} /> 忘掉</button></div></article>)}</div>
            </motion.div>
          )}

          {view === "settings" && (
            <motion.div key="settings" className="panel-view settings-view" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="view-header"><div className="view-icon"><Settings size={22} /></div><div><p className="eyebrow">FLIGHT CONFIGURATION</p><h1>飞船设置</h1></div></div>
              <section className="settings-section"><h2>你的宇宙搭子</h2><label className="text-setting"><span>伙伴名字</span><input maxLength={12} value={character.name} onChange={(event) => setState({ ...state, character: { ...character, name: event.target.value } })} /></label><div className="character-trait"><span style={{ background: character.appearance.body }} /><div><strong>{archetypeLabels[character.appearance.archetype].name} · {character.species}</strong><p>{archetypeLabels[character.appearance.archetype].description}</p></div></div></section>
              <section className="settings-section"><h2>互动方式</h2><label className="setting-row"><div><strong>自动朗读回复</strong><p>优先使用火山引擎角色语音，未配置或失败时自动使用浏览器语音。</p></div><input type="checkbox" checked={state.settings.autoPlayVoice} onChange={(event) => setState({ ...state, settings: { ...state.settings, autoPlayVoice: event.target.checked } })} /><span className="toggle" /></label><label className="range-setting"><span>语速 <b>{state.settings.speechRate.toFixed(1)}×</b></span><input type="range" min="0.6" max="1.4" step="0.1" value={state.settings.speechRate} onChange={(event) => setState({ ...state, settings: { ...state.settings, speechRate: Number(event.target.value) } })} /></label><label className="range-setting"><span>音量 <b>{Math.round(state.settings.speechVolume * 100)}%</b></span><input type="range" min="0" max="1" step="0.1" value={state.settings.speechVolume} onChange={(event) => setState({ ...state, settings: { ...state.settings, speechVolume: Number(event.target.value) } })} /></label><label className="setting-row"><div><strong>减少动态效果</strong><p>减少漂浮、闪烁和页面过渡。</p></div><input type="checkbox" checked={state.settings.reducedMotion} onChange={(event) => setState({ ...state, settings: { ...state.settings, reducedMotion: event.target.checked } })} /><span className="toggle" /></label></section>
              <section className="settings-section"><h2>陪伴与外观</h2><button className="setting-button" onClick={requestNotifications}>{state.settings.notificationEnabled ? <Bell size={18} /> : <BellOff size={18} />}<span><strong>陪伴通知</strong><small>{state.settings.notificationEnabled ? "已允许，未来可接入事件提醒" : "完全自愿，可随时关闭"}</small></span><ChevronRight size={17} /></button><label className="setting-row"><div><strong>极光主题</strong><p>为宇宙舱加入薄荷和粉色星云。</p></div><input type="checkbox" checked={state.settings.theme === "aurora"} onChange={(event) => setState({ ...state, settings: { ...state.settings, theme: event.target.checked ? "aurora" : "midnight" } })} /><span className="toggle" /></label>{voiceNotice && <p className="settings-notice">{voiceNotice}</p>}</section>
              <section className="settings-section"><h2>关于你的搭子</h2><div className="transparency-card"><ShieldCheck size={21} /><p><strong>{character.name} 是一个有外星伙伴设定的 AI。</strong>它不会声称自己拥有真实的人类意识。当前版本使用本地规则模型，未来可替换为其他 AI Provider。</p></div></section>
              <section className="settings-section"><h2>本地数据</h2><div className="data-actions"><button onClick={() => downloadState(state)}><Download size={18} /><span><strong>导出我的数据</strong><small>下载 JSON 格式副本</small></span><ChevronRight size={17} /></button><button className="danger-action" onClick={resetAccount}><RotateCcw size={18} /><span><strong>删除本地账户</strong><small>清除角色、对话与全部记忆</small></span><ChevronRight size={17} /></button></div></section>
              <p className="version-note">STARMATE FLIGHT BUILD 0.2 · LOCAL FIRST</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <nav className="bottom-nav" aria-label="移动端导航">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}><Icon size={20} /><span>{label}</span></button>)}</nav>
      <GrowthPanel open={growthOpen} onClose={() => setGrowthOpen(false)} growth={growth} />
    </main>
  );
}
