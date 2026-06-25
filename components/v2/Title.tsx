"use client";

import { motion } from "framer-motion";

type Props = {
  text: string;
  subtitle?: string;
  colors?: string[];
};

const DEFAULT_COLORS = ["#ff5b8a", "#ff9d2e", "#ffd84d", "#6cc24a", "#4ea8ff", "#c98bff"];

export default function Title({ text, subtitle, colors = DEFAULT_COLORS }: Props) {
  return (
    <div className="text-center select-none">
      <motion.h1
        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 12 }}
        className="font-round text-6xl md:text-8xl leading-[0.95] tracking-tight"
        style={{ textShadow: "6px 6px 0 rgba(0,0,0,0.2)", letterSpacing: "0.02em" }}
      >
        {text.split("").map((c, i) => (
          <motion.span
            key={i}
            style={{
              display: "inline-block",
              color: colors[i % colors.length],
              WebkitTextStroke: "3px white",
              paintOrder: "stroke fill",
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 1.6,
              delay: i * 0.08,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {c === " " ? " " : c}
          </motion.span>
        ))}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-3 font-comic text-lg md:text-2xl text-[#4a3640]"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
