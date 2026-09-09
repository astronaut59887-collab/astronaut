import type { CharacterMood, VoiceStyle } from "@/lib/types";

export type VoicePlaybackInput = {
  text: string;
  style: VoiceStyle;
  emotion: CharacterMood;
  rate: number;
  volume: number;
  onStart?: () => void;
  onEnd?: () => void;
};

export interface TextToSpeechProvider {
  speak(input: VoicePlaybackInput): Promise<boolean>;
  stop(): void;
}

let activeAudio: HTMLAudioElement | null = null;
let activeAudioUrl: string | null = null;

function clearRemoteAudio() {
  if (activeAudio) {
    activeAudio.onplay = null;
    activeAudio.onended = null;
    activeAudio.onerror = null;
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
  if (activeAudioUrl) {
    URL.revokeObjectURL(activeAudioUrl);
    activeAudioUrl = null;
  }
}

export class BrowserTextToSpeechProvider implements TextToSpeechProvider {
  async speak(input: VoicePlaybackInput) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return false;
    this.stop();

    return new Promise<boolean>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(input.text);
      utterance.lang = "zh-CN";
      utterance.rate = input.rate;
      utterance.volume = input.volume;
      utterance.pitch = input.style === "excited" ? 1.18 : input.style === "soft" ? 1.04 : 1.12;
      utterance.onstart = () => input.onStart?.();
      utterance.onend = () => { input.onEnd?.(); resolve(true); };
      utterance.onerror = () => { input.onEnd?.(); resolve(false); };
      window.speechSynthesis.speak(utterance);
    });
  }

  stop() {
    window.speechSynthesis?.cancel();
  }
}

export class RemoteTextToSpeechProvider implements TextToSpeechProvider {
  async speak(input: VoicePlaybackInput) {
    this.stop();
    const response = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: input.text,
        voiceStyle: input.style,
        rate: input.rate,
      }),
    });
    if (!response.ok) throw new Error("Remote voice provider failed");

    const blob = await response.blob();
    if (!blob.size || !blob.type.startsWith("audio/")) throw new Error("Remote voice provider returned invalid audio");
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    activeAudio = audio;
    activeAudioUrl = url;
    audio.volume = input.volume;

    return new Promise<boolean>((resolve, reject) => {
      const finish = (played: boolean) => {
        clearRemoteAudio();
        if (played) input.onEnd?.();
        resolve(played);
      };
      audio.onplay = () => input.onStart?.();
      audio.onended = () => finish(true);
      audio.onerror = () => {
        clearRemoteAudio();
        reject(new Error("Remote voice playback failed"));
      };
      void audio.play().catch((error: unknown) => {
        clearRemoteAudio();
        reject(error);
      });
    });
  }

  stop() {
    clearRemoteAudio();
  }
}

export class FallbackTextToSpeechProvider implements TextToSpeechProvider {
  constructor(private primary: TextToSpeechProvider, private fallback: TextToSpeechProvider) {}

  async speak(input: VoicePlaybackInput) {
    try {
      return await this.primary.speak(input);
    } catch {
      return this.fallback.speak(input);
    }
  }

  stop() {
    this.primary.stop();
    this.fallback.stop();
  }
}

export const voiceProvider = new FallbackTextToSpeechProvider(
  new RemoteTextToSpeechProvider(),
  new BrowserTextToSpeechProvider(),
);

export function stopVoicePlayback() {
  voiceProvider.stop();
}
