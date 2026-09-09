"use client";

import { Sparkles } from "lucide-react";
import type { MemoryRecord } from "@/lib/types";

const colors: Record<MemoryRecord["type"], string> = {
  PROFILE: "#c8ff68",
  PREFERENCE: "#ffd56b",
  EVENT: "#72e5d0",
  EMOTION: "#ff8eae",
  HABIT: "#7eb5ff",
};

export function MemoryPlanet({ memories, onSelect }: { memories: MemoryRecord[]; onSelect: (memory: MemoryRecord) => void }) {
  return (
    <section className="memory-planet" aria-label="回忆星球">
      <div className="planet-copy">
        <span><Sparkles size={13} /> MEMORY PLANET</span>
        <h2>{memories.length ? `${memories.length} 颗回忆正在发光` : "等待第一颗回忆星"}</h2>
        <p>每一件重要的小事，都会在这里留下坐标。</p>
      </div>
      <div className="planet-system">
        <div className="memory-orbit memory-orbit--outer" />
        <div className="memory-orbit memory-orbit--inner" />
        <div className="memory-world"><i /><span>我们的<br />回忆</span></div>
        {memories.slice(0, 10).map((memory, index) => {
          const angle = (index / Math.max(1, Math.min(memories.length, 10))) * Math.PI * 2 - Math.PI / 2;
          const radius = index % 2 === 0 ? 94 : 67;
          const x = 120 + Math.cos(angle) * radius;
          const y = 120 + Math.sin(angle) * radius;
          return (
            <button
              key={memory.id}
              className="memory-star"
              style={{ left: x, top: y, background: colors[memory.type], animationDelay: `${index * -0.4}s` }}
              onClick={() => onSelect(memory)}
              aria-label={`查看回忆：${memory.content}`}
            />
          );
        })}
      </div>
    </section>
  );
}
