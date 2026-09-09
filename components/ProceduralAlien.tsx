"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import type { Character, CharacterMood } from "@/lib/types";

type AlienStyle = CSSProperties & {
  "--body": string;
  "--belly": string;
  "--accent": string;
  "--eye": string;
};

export function ProceduralAlien({
  character,
  mood = "idle",
  compact = false,
}: {
  character: Character;
  mood?: CharacterMood;
  compact?: boolean;
}) {
  const style: AlienStyle = {
    "--body": character.appearance.body,
    "--belly": character.appearance.belly,
    "--accent": character.appearance.accent,
    "--eye": character.appearance.eye,
  };

  return (
    <motion.div
      className={`alien-stage ${compact ? "alien-stage--compact" : ""}`}
      initial={{ opacity: 0, scale: 0.72, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 13 }}
      aria-label={`${character.name}，当前状态：${mood}`}
      role="img"
    >
      <div className="alien-glow" />
      <div className={`alien alien--${mood}`} style={style}>
        <div className={`antennae antennae--${character.appearance.antennaStyle}`}>
          <span /><span />
        </div>
        <div className="alien-ear alien-ear--left" />
        <div className="alien-ear alien-ear--right" />
        <div className="alien-body">
          <div className="alien-face">
            <div className="alien-eye"><i /></div>
            <div className="alien-eye"><i /></div>
            <div className="alien-cheek alien-cheek--left" />
            <div className="alien-cheek alien-cheek--right" />
            <div className="alien-mouth" />
          </div>
          <div className="alien-belly">
            <span className={`alien-badge alien-badge--${character.appearance.badge}`}>
              {character.appearance.badge === "star" ? "✦" : character.appearance.badge === "moon" ? "☾" : "◉"}
            </span>
          </div>
        </div>
        <div className="alien-arm alien-arm--left" />
        <div className="alien-arm alien-arm--right" />
        <div className="alien-foot alien-foot--left" />
        <div className="alien-foot alien-foot--right" />
      </div>
      <div className="alien-shadow" />
    </motion.div>
  );
}
