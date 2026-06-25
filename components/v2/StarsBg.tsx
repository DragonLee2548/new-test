"use client";

import { useMemo } from "react";

type Props = {
  count?: number;
  seed?: number;
};

const SHAPES = ["★", "✦", "✧", "❤", "✿", "♥", "◆"];

export default function StarsBg({ count = 28, seed = 1 }: Props) {
  const stars = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      left: rand() * 100,
      duration: 4 + rand() * 8,
      delay: rand() * -10,
      size: 14 + rand() * 22,
      rot: rand() * 360,
      shape: SHAPES[Math.floor(rand() * SHAPES.length)],
      color: ["#ff8fb7", "#ffd84d", "#9bd4ff", "#a3e5b3", "#d6b3ff"][
        Math.floor(rand() * 5)
      ],
    }));
  }, [count, seed]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {stars.map((star) => (
        <span
          key={star.key}
          style={{
            position: "absolute",
            left: `${star.left}%`,
            top: "-10vh",
            fontSize: `${star.size}px`,
            color: star.color,
            animation: `starFall ${star.duration}s linear ${star.delay}s infinite`,
            transform: `rotate(${star.rot}deg)`,
            textShadow: "0 0 6px rgba(255,255,255,0.7)",
          }}
        >
          {star.shape}
        </span>
      ))}
    </div>
  );
}
