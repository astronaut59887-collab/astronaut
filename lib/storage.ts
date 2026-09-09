import { completeCharacter } from "@/lib/character";
import type { AppState } from "@/lib/types";

export const STORAGE_KEY = "starmate.app.v1";

export const EMPTY_STATE: AppState = {
  version: 2,
  profile: null,
  character: null,
  messages: [],
  memories: [],
  settings: {
    memoryEnabled: true,
    autoPlayVoice: false,
    reducedMotion: false,
    speechRate: 0.96,
    speechVolume: 0.9,
    notificationEnabled: false,
    theme: "midnight",
  },
  relationship: null,
  checkIns: [],
};

type StoredState = Partial<Omit<AppState, "version">> & { version?: number };

export function loadState(): AppState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as StoredState;
    const character = parsed.character ? completeCharacter(parsed.character) : null;
    const relationship = parsed.relationship
      ? {
          ...parsed.relationship,
          meaningfulInteractions: parsed.relationship.meaningfulInteractions ?? 0,
          completedMissions: parsed.relationship.completedMissions ?? [],
        }
      : null;
    return {
      ...EMPTY_STATE,
      ...parsed,
      version: 2,
      character,
      relationship,
      settings: { ...EMPTY_STATE.settings, ...parsed.settings },
      checkIns: parsed.checkIns ?? [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: AppState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function downloadState(state: AppState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `starmate-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
