"use client";

import { motion } from "framer-motion";

type Props = {
  text: string;
  x: number;
  y: number;
  color?: string;
  size?: number;
};

export default function PopText({ text, x, y, color = "#ff5b8a", size = 44 }: Props) {
  return (
    <motion.div
      initial={{ scale: 0.4, y: 0, opacity: 0, rotate: -15 }}
      animate={{ scale: 1.3, y: -70, opacity: 1, rotate: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 50,
        fontFamily: "Jua, sans-serif",
        fontSize: size,
        color,
        WebkitTextStroke: "3px white",
        textShadow: "0 6px 0 rgba(0,0,0,0.18)",
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </motion.div>
  );
}
