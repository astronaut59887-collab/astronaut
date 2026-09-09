import type { AppState } from "@/lib/types";

export const STORAGE_KEY = "starmate.app.v1";

export const EMPTY_STATE: AppState = {
  version: 1,
  profile: null,
  character: null,
  messages: [],
  memories: [],
  settings: {
    memoryEnabled: true,
    autoPlayVoice: false,
    reducedMotion: false,
  },
  relationship: null,
};

export function loadState(): AppState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== 1) return EMPTY_STATE;
    return {
      ...EMPTY_STATE,
      ...parsed,
      settings: { ...EMPTY_STATE.settings, ...parsed.settings },
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
