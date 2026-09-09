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
  const { antennaStyle, badge, pattern, accessory, archetype } = character.appearance;

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
      <div className={`alien alien--${mood} alien--${archetype} alien--pattern-${pattern}`} style={style}>
        <div className={`antennae antennae--${antennaStyle}`}><span /><span /></div>
        {accessory === "cape" && <div className="alien-cape" />}
        <div className="alien-ear alien-ear--left" />
        <div className="alien-ear alien-ear--right" />
        <div className="alien-body">
          <div className="alien-pattern" />
          <div className="alien-face">
            <div className="alien-eye"><i><b /></i></div>
            <div className="alien-eye"><i><b /></i></div>
            <div className="alien-cheek alien-cheek--left" />
            <div className="alien-cheek alien-cheek--right" />
            <div className="alien-mouth" />
          </div>
          <div className="alien-belly">
            <span className={`alien-badge alien-badge--${badge}`}>
              {badge === "star" ? "✦" : badge === "moon" ? "☾" : "◉"}
            </span>
          </div>
        </div>
        {accessory === "glasses" && <div className="alien-glasses"><span /><span /></div>}
        {accessory === "satchel" && <div className="alien-satchel"><span /></div>}
        <div className="alien-arm alien-arm--left" />
        <div className="alien-arm alien-arm--right" />
        <div className="alien-foot alien-foot--left" />
        <div className="alien-foot alien-foot--right" />
        {mood === "sleepy" && <div className="sleep-stars"><i>z</i><i>z</i><i>✦</i></div>}
        {(mood === "excited" || mood === "surprised") && <div className="joy-sparks"><i>✦</i><i>✦</i><i>•</i></div>}
        {mood === "angry" && <div className="anger-spark">⌁</div>}
      </div>
      <div className="alien-shadow" />
    </motion.div>
  );
}
