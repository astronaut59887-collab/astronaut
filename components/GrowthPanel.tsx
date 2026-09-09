"use client";

import { Check, LockKeyhole, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { growthStages, type GrowthStage } from "@/lib/progression";

export function GrowthPanel({
  open,
  onClose,
  growth,
}: {
  open: boolean;
  onClose: () => void;
  growth: { score: number; current: GrowthStage; next: GrowthStage | null; progress: number };
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.section className="growth-panel" initial={{ opacity: 0, y: 30, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={onClose} aria-label="关闭"><X size={19} /></button>
            <div className="growth-hero"><span><Sparkles size={20} /></span><p className="eyebrow">RELATIONSHIP CONSTELLATION</p><h2>Lv.{growth.current.level} · {growth.current.name}</h2><p>{growth.current.lore}</p></div>
            <div className="growth-progress"><div><span>同行能量 {growth.score}</span><span>{growth.next ? `距离 ${growth.next.name}` : "已抵达最远坐标"}</span></div><i><b style={{ width: `${growth.progress}%` }} /></i></div>
            <div className="growth-roadmap">
              {growthStages.map((stage) => {
                const unlocked = stage.level <= growth.current.level;
                return <article className={unlocked ? "unlocked" : ""} key={stage.level}><span>{unlocked ? <Check size={15} /> : <LockKeyhole size={14} />}</span><div><strong>Lv.{stage.level} · {stage.name}</strong><p>{stage.unlock}</p></div></article>;
              })}
            </div>
            <p className="growth-note">等级由互动天数、重要分享、回忆、共同任务和你的反馈一起决定，不按消息数量刷级。</p>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
