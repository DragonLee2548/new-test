"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  label: string;
};

/**
 * 마우스가 근처에 오면 매우매우 작아지고 disabled 되는 버튼.
 */
export default function ShrinkButton({ label }: Props) {
  const [shrunk, setShrunk] = useState(false);

  return (
    <motion.button
      type="button"
      disabled={shrunk}
      aria-label={`${label} (누를 수 없어요)`}
      onMouseEnter={() => setShrunk(true)}
      onPointerEnter={() => setShrunk(true)}
      onFocus={() => setShrunk(true)}
      animate={{
        scale: shrunk ? 0.08 : 1,
        opacity: shrunk ? 0.35 : 1,
        filter: shrunk ? "grayscale(1)" : "grayscale(0)",
      }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="rounded-2xl border-2 border-gray-300 bg-white/70 px-6 py-3 text-lg font-semibold text-gray-400 shadow-soft disabled:cursor-not-allowed"
    >
      {label}
    </motion.button>
  );
}
