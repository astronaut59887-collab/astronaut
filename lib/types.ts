export type CharacterMood =
  | "idle"
  | "listening"
  | "thinking"
  | "talking"
  | "happy"
  | "excited"
  | "curious"
  | "sad"
  | "sleepy"
  | "shy"
  | "angry"
  | "surprised"
  | "confused";

export type CharacterArchetype = "healer" | "trickster" | "sage" | "tsundere";
export type InteractionMode = "chat" | "sleep" | "study" | "game";
export type MessageFeedback = "love" | "funny" | "helpful" | "dislike";

export type MemoryType =
  | "PROFILE"
  | "PREFERENCE"
  | "EVENT"
  | "EMOTION"
  | "HABIT";

export type MemoryImportance = "S" | "A" | "B";

export type UserProfile = {
  id: string;
  displayName: string;
  nickname: string;
  createdAt: string;
  lastActiveAt: string;
};

export type CharacterAppearance = {
  body: string;
  belly: string;
  accent: string;
  eye: string;
  antennaStyle: "orb" | "leaf" | "double";
  badge: "star" | "moon" | "planet";
  archetype: CharacterArchetype;
  pattern: "plain" | "nebula" | "freckles" | "glow";
  accessory: "none" | "cape" | "glasses" | "satchel";
};

export type Character = {
  id: string;
  name: string;
  species: string;
  seed: number;
  appearance: CharacterAppearance;
  level: number;
  experience: number;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  emotion?: CharacterMood;
  createdAt: string;
  referencedMemoryIds?: string[];
  feedback?: MessageFeedback;
  mode?: InteractionMode;
};

export type MemoryRecord = {
  id: string;
  type: MemoryType;
  content: string;
  normalizedKey: string;
  importance: MemoryImportance;
  createdAt: string;
  updatedAt: string;
};

export type UserSettings = {
  memoryEnabled: boolean;
  autoPlayVoice: boolean;
  reducedMotion: boolean;
  speechRate: number;
  speechVolume: number;
  notificationEnabled: boolean;
  theme: "midnight" | "aurora";
};

export type Relationship = {
  firstMetAt: string;
  lastInteractionAt: string;
  activeDays: string[];
  meaningfulInteractions: number;
  completedMissions: string[];
};

export type DailyCheckIn = {
  date: string;
  mood: "great" | "okay" | "tired" | "low";
};

export type AppState = {
  version: 2;
  profile: UserProfile | null;
  character: Character | null;
  messages: ChatMessage[];
  memories: MemoryRecord[];
  settings: UserSettings;
  relationship: Relationship | null;
  checkIns: DailyCheckIn[];
};

export type CompanionReply = {
  text: string;
  emotion: CharacterMood;
  animation: CharacterMood;
  voiceStyle: "neutral" | "warm" | "excited" | "soft";
  referencedMemoryIds: string[];
};
