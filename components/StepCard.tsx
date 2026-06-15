"use client";

import Image from "next/image";
import { assetPath } from "@/lib/assetPath";

type Props = {
  step: number;
  total: number;
  badge?: string;
  question: string;
  hint?: string;
  character?: string;
  children: React.ReactNode;
};

export default function StepCard({
  step,
  total,
  badge,
  question,
  hint,
  character = assetPath("/image/333.png"),
  children,
}: Props) {
  return (
    <div className="w-full max-w-[640px] animate-pop rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-soft backdrop-blur-sm sm:p-9">
      {/* 진행 표시 */}
      <div className="mb-5 flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i + 1 === step
                ? "w-7 bg-rose"
                : i + 1 < step
                  ? "w-2 bg-rose/60"
                  : "w-2 bg-rose/20"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="animate-floaty">
          <Image
            src={character}
            alt="고양이 캐릭터"
            width={140}
            height={140}
            priority
            className="drop-shadow-[0_8px_16px_rgba(232,90,134,0.25)]"
          />
        </div>

        {badge && (
          <span className="mt-2 inline-block rounded-full bg-blush px-4 py-1 text-sm font-semibold text-deeprose">
            {badge}
          </span>
        )}

        <h2 className="mt-3 whitespace-pre-line text-xl font-bold leading-relaxed text-[#4a3640] sm:text-2xl">
          {question}
        </h2>

        {hint && <p className="mt-2 text-sm text-rose/80">{hint}</p>}

        <div className="mt-7 w-full">{children}</div>
      </div>
    </div>
  );
}
