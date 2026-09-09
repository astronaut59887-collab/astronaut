import { NextResponse } from "next/server";
import { buildCompanionPrompt } from "@/lib/persona";
import type { ChatGenerationInput } from "@/lib/providers";
import type { CompanionReply } from "@/lib/types";

const allowedEmotions = new Set(["idle", "happy", "excited", "curious", "sad", "sleepy", "shy", "angry", "surprised", "confused"]);
const allowedVoices = new Set(["neutral", "warm", "excited", "soft"]);

function isReply(value: unknown): value is CompanionReply {
  if (!value || typeof value !== "object") return false;
  const reply = value as Record<string, unknown>;
  return typeof reply.text === "string"
    && allowedEmotions.has(String(reply.emotion))
    && allowedEmotions.has(String(reply.animation))
    && allowedVoices.has(String(reply.voiceStyle))
    && Array.isArray(reply.referencedMemoryIds);
}

export async function POST(request: Request) {
  const apiKey = process.env.STARMATE_LLM_API_KEY;
  const baseUrl = (process.env.STARMATE_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.STARMATE_LLM_MODEL || "gpt-4.1-mini";
  if (!apiKey) return NextResponse.json({ error: "Remote AI provider is not configured" }, { status: 503 });

  try {
    const input = await request.json() as ChatGenerationInput;
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.85,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildCompanionPrompt(input) },
          { role: "user", content: input.message },
        ],
      }),
    });
    if (!response.ok) return NextResponse.json({ error: "AI provider request failed" }, { status: 502 });
    const payload = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = payload.choices?.[0]?.message?.content;
    const parsed: unknown = content ? JSON.parse(content) : null;
    if (!isReply(parsed)) return NextResponse.json({ error: "AI provider returned an invalid response" }, { status: 502 });
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "AI provider response could not be processed" }, { status: 502 });
  }
}
