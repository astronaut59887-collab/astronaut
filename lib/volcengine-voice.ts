export type VolcengineTTSRequest = {
  user: { uid: string };
  req_params: {
    text: string;
    speaker: string;
    audio_params: {
      format: "mp3";
      sample_rate: 24000;
      speech_rate: number;
    };
  };
};

type VolcengineFrame = {
  code?: number;
  message?: string;
  data?: string;
};

export function toVolcengineSpeechRate(rate: number) {
  return Math.max(-50, Math.min(100, Math.round((rate - 1) * 100)));
}

export function buildVolcengineTTSRequest(text: string, speaker: string, rate: number): VolcengineTTSRequest {
  return {
    user: { uid: "starmate-web" },
    req_params: {
      text,
      speaker,
      audio_params: {
        format: "mp3",
        sample_rate: 24000,
        speech_rate: toVolcengineSpeechRate(rate),
      },
    },
  };
}

export function parseConcatenatedJsonObjects(raw: string): unknown[] {
  const values: unknown[] = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];

    if (start < 0) {
      if (/\s/.test(character)) continue;
      if (character !== "{") throw new Error("Volcengine TTS returned an invalid stream");
      start = index;
      depth = 1;
      continue;
    }

    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "\"") inString = false;
      continue;
    }

    if (character === "\"") inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        values.push(JSON.parse(raw.slice(start, index + 1)) as unknown);
        start = -1;
      }
    }
  }

  if (start >= 0 || inString || values.length === 0) {
    throw new Error("Volcengine TTS returned an incomplete stream");
  }

  return values;
}

export function decodeVolcengineAudio(raw: string) {
  const frames = parseConcatenatedJsonObjects(raw) as VolcengineFrame[];
  const failed = frames.find((frame) => typeof frame.code === "number" && frame.code >= 40_000_000);
  if (failed) throw new Error(failed.message || "Volcengine TTS synthesis failed");

  const chunks = frames
    .map((frame) => frame.data)
    .filter((data): data is string => typeof data === "string" && data.length > 0)
    .map((data) => Buffer.from(data, "base64"));

  if (chunks.length === 0) throw new Error("Volcengine TTS returned no audio");
  return Buffer.concat(chunks);
}
