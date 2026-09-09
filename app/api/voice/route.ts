import { NextResponse } from "next/server";
import { buildVolcengineTTSRequest, decodeVolcengineAudio } from "@/lib/volcengine-voice";

export const runtime = "nodejs";

const endpoint = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";
const defaultResourceId = "seed-tts-2.0";
const defaultVoice = "zh_female_xiaohe_uranus_bigtts";
const allowedStyles = new Set(["neutral", "warm", "excited", "soft"]);

type VoiceRequest = {
  text?: unknown;
  voiceStyle?: unknown;
  rate?: unknown;
};

function validText(text: string) {
  return [...text].length <= 300 && new TextEncoder().encode(text).length <= 1024;
}

export async function POST(request: Request) {
  const apiKey = process.env.VOLCENGINE_TTS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Volcengine TTS is not configured" }, { status: 503 });

  try {
    const input = await request.json() as VoiceRequest;
    const text = typeof input.text === "string" ? input.text.trim() : "";
    const rate = typeof input.rate === "number" && Number.isFinite(input.rate) ? input.rate : 1;
    if (!text || !validText(text) || !allowedStyles.has(String(input.voiceStyle))) {
      return NextResponse.json({ error: "Invalid voice request" }, { status: 400 });
    }

    const resourceId = process.env.VOLCENGINE_TTS_RESOURCE_ID || defaultResourceId;
    const voice = process.env.VOLCENGINE_TTS_VOICE || defaultVoice;
    const requestId = crypto.randomUUID();
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
        "X-Api-Resource-Id": resourceId,
        "X-Api-Request-Id": requestId,
      },
      body: JSON.stringify(buildVolcengineTTSRequest(text, voice, rate)),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (!upstream.ok) {
      const logId = upstream.headers.get("x-tt-logid");
      console.error("Volcengine TTS request failed", { status: upstream.status, logId, requestId });
      return NextResponse.json({ error: "Voice synthesis failed" }, { status: 502 });
    }

    const audio = decodeVolcengineAudio(await upstream.text());
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Volcengine TTS response could not be processed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Voice synthesis could not be processed" }, { status: 502 });
  }
}
