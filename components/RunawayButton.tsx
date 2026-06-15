"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  label: string;
  /** 계속 흔들리며 모양이 변형되는 와리가리 모드 */
  wiggle?: boolean;
  /** 도망가는 반경(px) */
  range?: number;
};

/**
 * 마우스가 근처에 오면 무작위 위치로 도망가서 누를 수 없는 버튼.
 * 모바일에서도 pointerdown 시점에 미리 도망가 클릭을 회피한다.
 */
export default function RunawayButton({ label, wiggle = false, range = 150 }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [moved, setMoved] = useState(false);

  const flee = () => {
    const x = (Math.random() * 2 - 1) * range;
    const y = (Math.random() * 2 - 1) * (range * 0.7);
    setPos({ x, y });
    setMoved(true);
  };

  return (
    <motion.button
      type="button"
      aria-label={`${label} (누를 수 없어요)`}
      onMouseEnter={flee}
      onPointerEnter={flee}
      onPointerDown={(e) => {
        e.preventDefault();
        flee();
      }}
      onFocus={flee}
      animate={{
        x: pos.x,
        y: pos.y,
        rotate: wiggle ? [0, -7, 6, -5, 7, 0] : moved ? [0, -10, 10, 0] : 0,
        skewX: wiggle ? [0, 8, -8, 6, 0] : 0,
        scale: wiggle ? [1, 1.06, 0.94, 1.04, 1] : 1,
      }}
      transition={{
        x: { type: "spring", stiffness: 500, damping: 16 },
        y: { type: "spring", stiffness: 500, damping: 16 },
        rotate: wiggle
          ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4 },
        skewX: wiggle
          ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 },
        scale: wiggle
          ? { duration: 1.3, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 },
      }}
      className="relative z-10 rounded-2xl border-2 border-dashed border-rose/60 bg-white/80 px-6 py-3 text-lg font-semibold text-deeprose shadow-soft"
    >
      {label}
    </motion.button>
  );
}
