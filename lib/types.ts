export type CharacterMood =
  | "idle"
  | "listening"
  | "thinking"
  | "talking"
  | "happy"
  | "curious"
  | "sad"
  | "confused";

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
};

export type Relationship = {
  firstMetAt: string;
  lastInteractionAt: string;
  activeDays: string[];
};

export type AppState = {
  version: 1;
  profile: UserProfile | null;
  character: Character | null;
  messages: ChatMessage[];
  memories: MemoryRecord[];
  settings: UserSettings;
  relationship: Relationship | null;
};

export type CompanionReply = {
  text: string;
  emotion: CharacterMood;
  animation: CharacterMood;
  voiceStyle: "neutral" | "warm" | "excited" | "soft";
  referencedMemoryIds: string[];
};
