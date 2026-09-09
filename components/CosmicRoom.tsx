"use client";

import type { MemoryRecord } from "@/lib/types";

export function CosmicRoom({ memories }: { memories: MemoryRecord[] }) {
  return (
    <div className="cosmic-room" aria-hidden="true">
      <div className="room-window">
        <span className="window-planet window-planet--one" />
        <span className="window-planet window-planet--two" />
        <span className="shooting-star" />
      </div>
      <div className="room-frame room-frame--left" />
      <div className="room-frame room-frame--right" />
      <div className="cosmic-plant"><i /><i /><i /><span /></div>
      <div className="energy-console"><i /><span>CORE 98%</span></div>
      <div className="memory-wall">
        {memories.slice(0, 7).map((memory, index) => (
          <i key={memory.id} style={{ "--memory-index": index } as React.CSSProperties} />
        ))}
      </div>
      <div className="room-floor"><i /><i /><i /></div>
    </div>
  );
}
