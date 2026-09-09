import { describe, expect, it } from "vitest";
import {
  buildVolcengineTTSRequest,
  decodeVolcengineAudio,
  parseConcatenatedJsonObjects,
  toVolcengineSpeechRate,
} from "../lib/volcengine-voice";

describe("Volcengine TTS protocol", () => {
  it("parses concatenated JSON frames and joins audio chunks", () => {
    const first = Buffer.from("ID3");
    const second = Buffer.from([1, 2, 3]);
    const stream = [
      { data: first.toString("base64") },
      { sentence: { text: "带有 } 符号的内容" } },
      { data: second.toString("base64") },
      { code: 20_000_000, message: "ok" },
    ].map((frame) => JSON.stringify(frame)).join("\n");

    expect(decodeVolcengineAudio(stream)).toEqual(Buffer.concat([first, second]));
  });

  it("keeps braces inside JSON strings from ending a frame", () => {
    expect(parseConcatenatedJsonObjects('{"message":"a { b } c"}{"code":20000000}')).toEqual([
      { message: "a { b } c" },
      { code: 20_000_000 },
    ]);
  });

  it("rejects error frames", () => {
    expect(() => decodeVolcengineAudio('{"code":45000001,"message":"invalid request"}')).toThrow("invalid request");
  });

  it("maps StarMate settings to the V3 request shape", () => {
    const request = buildVolcengineTTSRequest("你好", "zh_female_xiaohe_uranus_bigtts", 1.4);
    expect(request.req_params.audio_params).toEqual({ format: "mp3", sample_rate: 24000, speech_rate: 40 });
    expect(request.req_params.speaker).toBe("zh_female_xiaohe_uranus_bigtts");
    expect(toVolcengineSpeechRate(0.6)).toBe(-40);
  });
});
