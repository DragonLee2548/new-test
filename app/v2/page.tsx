"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CHARACTERS, CHARACTER_ORDER, type CharacterId, loadSelectedCharacter, saveSelectedCharacter } from "@/lib/v2/characters";
import StarsBg from "@/components/v2/StarsBg";
import Title from "@/components/v2/Title";

type Phase = "intro" | "character" | "game";

const GAMES: {
  id: "mole" | "maze" | "rps";
  title: string;
  emoji: string;
  blurb: string;
  href: string;
  color: string;
  shadow: string;
}[] = [
  {
    id: "mole",
    title: "두더지 잡기",
    emoji: "🔨",
    blurb: "뿅망치로 두더지 팡팡!\n40초 / 60초 모드",
    href: "/v2/mole",
    color: "linear-gradient(180deg,#ffe07a,#ff9d2e)",
    shadow: "#b86a17",
  },
  {
    id: "maze",
    title: "미로 탈출",
    emoji: "🧩",
    blurb: "방향키로 출구를 찾아라!\n하·중·상 난이도",
    href: "/v2/maze",
    color: "linear-gradient(180deg,#a3e5b3,#4fb56b)",
    shadow: "#2c7f3f",
  },
  {
    id: "rps",
    title: "가위바위보",
    emoji: "✌️",
    blurb: "10번 먼저 이기기!\n시간 기록 도전",
    href: "/v2/rps",
    color: "linear-gradient(180deg,#ffa8c8,#ff5b8a)",
    shadow: "#b6385d",
  },
];

export default function V2Page() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [selected, setSelected] = useState<CharacterId | null>(null);
  const [hoverChar, setHoverChar] = useState<CharacterId | null>(null);

  useEffect(() => {
    const saved = loadSelectedCharacter();
    if (saved) {
      setSelected(saved);
      setPhase("game");
    }
  }, []);

  const pickCharacter = (id: CharacterId) => {
    saveSelectedCharacter(id);
    setSelected(id);
    setPhase("game");
  };

  const resetCharacter = () => {
    setPhase("character");
  };

  return (
    <main className="flash-bg relative min-h-screen overflow-hidden">
      <StarsBg />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.section
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.3 } }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <div className="animate-floaty">
                <Title text="먼작귀 미니게임" subtitle="누가 누가 잘 노나~ ✨" />
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="mt-10">
                <button className="btn-flash text-2xl" style={{ paddingInline: "2.2rem", paddingBlock: "1.1rem" }} onClick={() => setPhase("character")}>
                  ▶ 시작하기!
                </button>
              </motion.div>

              <div className="mt-10 flex gap-6">
                {CHARACTER_ORDER.map((id, i) => (
                  <motion.div key={id} animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }} transition={{ duration: 2.4, delay: i * 0.3, repeat: Infinity }}>
                    <Image src={CHARACTERS[id].setNbg} alt={id} width={140} height={140} className="drop-shadow-xl" />
                  </motion.div>
                ))}
              </div>

              {/* <div className="mt-8">
                <Link
                  href="/v1"
                  className="text-sm text-[#4a3640]/60 underline underline-offset-4"
                >
                  v1 페이지로 →
                </Link>
              </div> */}
            </motion.section>
          )}

          {phase === "character" && (
            <motion.section
              key="character"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <Title text="캐릭터를 골라!" subtitle="누구로 플레이할까~?" />
              <div className="mt-10 flex flex-wrap items-stretch justify-center gap-6">
                {CHARACTER_ORDER.map((id) => {
                  const c = CHARACTERS[id];
                  const active = hoverChar === id;
                  return (
                    <motion.button
                      key={id}
                      onMouseEnter={() => setHoverChar(id)}
                      onMouseLeave={() => setHoverChar(null)}
                      onClick={() => pickCharacter(id)}
                      whileHover={{ scale: 1.05, rotate: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative flex w-[280px] h-[400px] flex-col items-center justify-between rounded-[2rem] border-[6px] border-white p-6 text-center shadow-flash"
                      style={{
                        background: `linear-gradient(180deg, ${c.themeFrom}, ${c.themeTo})`,
                      }}
                    >
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Image src={c.portrait} alt={c.label} width={160} height={160} className="drop-shadow-lg" />
                      </motion.div>
                      <div className="flex flex-col items-center">
                        <h2
                          className="font-round text-3xl"
                          style={{
                            color: c.accent,
                            WebkitTextStroke: "2px white",
                            paintOrder: "stroke fill",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {c.label}
                        </h2>
                        <p className="font-comic text-base text-[#4a3640]">{c.tagline}</p>
                        <p className={`mt-2 font-comic text-sm transition-opacity ${active ? "opacity-100" : "opacity-70"}`}>“{c.catchphrase}”</p>
                      </div>
                      <span className="inline-block rounded-full bg-white/85 px-4 py-1 font-comic text-sm text-[#4a3640] group-hover:animate-jelly">
                        나로 정할래! 💖
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-8">
                <button className="btn-flash btn-ghost text-base" onClick={() => setPhase("intro")}>
                  ← 뒤로
                </button>
              </div>
            </motion.section>
          )}

          {phase === "game" && selected && (
            <motion.section
              key="game"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <div className="flex w-full flex-col items-center gap-3">
                <CharacterBadge id={selected} onChange={resetCharacter} />
                <Title text="게임을 골라!" subtitle="뭐부터 해볼까~?" />
              </div>

              <div className="mt-10 flex flex-wrap items-stretch justify-center gap-6">
                {GAMES.map((g, i) => (
                  <motion.div
                    key={g.id}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * i, type: "spring", stiffness: 220 }}
                  >
                    <Link
                      href={g.href}
                      className="flex w-[280px] h-[400px] flex-col items-center justify-between rounded-[2rem] border-[6px] border-white p-6 text-center transition hover:-translate-y-1 hover:rotate-[-2deg]"
                      style={{ background: g.color, boxShadow: `0 10px 0 ${g.shadow}, 0 16px 28px rgba(0,0,0,0.2)` }}
                    >
                      <div className="text-6xl drop-shadow">{g.emoji}</div>
                      <h3
                        className="font-round text-4xl leading-none"
                        style={{
                          color: "#fff",
                          WebkitTextStroke: `3px ${g.shadow}`,
                          paintOrder: "stroke fill",
                          textShadow: `0 5px 0 ${g.shadow}, 0 8px 12px rgba(0,0,0,0.25)`,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {g.title}
                      </h3>
                      <p
                        className="whitespace-pre-line font-comic text-base text-white"
                        style={{ textShadow: `1px 1px 0 ${g.shadow}` }}
                      >
                        {g.blurb}
                      </p>
                      <div className="inline-block rounded-full bg-white px-5 py-1 font-comic text-base text-[#4a3640] shadow-flashSm">
                        ▶ 플레이
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function CharacterBadge({ id, onChange }: { id: CharacterId; onChange: () => void }) {
  const c = CHARACTERS[id];
  return (
    <div
      className="flex items-center gap-3 rounded-full border-[3px] border-white bg-white/70 px-4 py-2 shadow-flashSm"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <Image src={c.portrait} alt={c.label} width={40} height={40} />
      <div className="font-comic text-lg" style={{ color: c.accent }}>
        {c.label}
      </div>
      <button onClick={onChange} className="ml-2 rounded-full bg-[#4a3640] px-3 py-1 font-comic text-xs text-white hover:scale-105">
        변경
      </button>
    </div>
  );
}
