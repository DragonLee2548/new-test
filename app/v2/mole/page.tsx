"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CHARACTERS,
  type CharacterId,
  loadSelectedCharacter,
} from "@/lib/v2/characters";
import {
  saveLocalBest,
  submitScore,
  type ScoreRecord,
} from "@/lib/v2/scores";
import GameShell from "@/components/v2/GameShell";
import Title from "@/components/v2/Title";
import PopText from "@/components/v2/PopText";
import BestRow from "@/components/v2/BestRow";

type Difficulty = "easy" | "normal" | "hard";
type Duration = 40 | 60;

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
};

const DIFFICULTY_CFG: Record<
  Difficulty,
  { visibleMs: number; spawnMs: number; maxLive: number; baseTarget40: number; color: string }
> = {
  easy: { visibleMs: 1300, spawnMs: 550, maxLive: 2, baseTarget40: 20, color: "#7bd389" },
  normal: { visibleMs: 950, spawnMs: 400, maxLive: 2, baseTarget40: 30, color: "#ffd84d" },
  hard: { visibleMs: 700, spawnMs: 280, maxLive: 3, baseTarget40: 42, color: "#ff5b8a" },
};

const HOLE_COUNT = 9;
const HIT_TEXTS = ["뿅!", "팡!", "맞았다!", "퍽!", "GET!", "콱!"];

type Mole = {
  id: number;
  hole: number;
  diesAt: number;
};

type Pop = { id: number; text: string; x: number; y: number; color: string };

type Phase = "settings" | "playing" | "done";

const STORAGE_LAST = "v2:mole:last";

export default function MolePage() {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterId | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [duration, setDuration] = useState<Duration>(40);
  const [phase, setPhase] = useState<Phase>("settings");

  useEffect(() => {
    const c = loadSelectedCharacter();
    if (!c) {
      router.replace("/v2");
      return;
    }
    setCharacter(c);
  }, [router]);

  if (!character) {
    return (
      <GameShell>
        <div />
      </GameShell>
    );
  }

  const charInfo = CHARACTERS[character];
  const cfg = DIFFICULTY_CFG[difficulty];
  const target = Math.round(cfg.baseTarget40 * (duration / 40));
  const diffKey = `${difficulty}-${duration}s`;

  return (
    <GameShell>
      <AnimatePresence mode="wait">
        {phase === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex w-full flex-col items-center"
          >
            <Title text="두더지 잡기!" subtitle={`${charInfo.label}와 함께~ 🔨`} />
            <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
              <SettingsBlock title="⏱ 시간을 골라!">
                <div className="grid grid-cols-2 gap-3">
                  {[40, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d as Duration)}
                      className={`btn-flash ${duration === d ? "btn-blue" : "btn-ghost"} text-xl`}
                    >
                      {d}초
                    </button>
                  ))}
                </div>
              </SettingsBlock>
              <SettingsBlock title="🎚 난이도를 골라!">
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "normal", "hard"] as Difficulty[]).map((d) => {
                    const active = difficulty === d;
                    const cls = active
                      ? d === "easy"
                        ? "btn-green"
                        : d === "normal"
                        ? "btn-yellow"
                        : ""
                      : "btn-ghost";
                    return (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`btn-flash ${cls} text-lg`}
                        style={{ paddingInline: "0.6rem" }}
                      >
                        {DIFFICULTY_LABEL[d]}
                      </button>
                    );
                  })}
                </div>
              </SettingsBlock>
            </div>

            <div className="mt-6 rounded-2xl border-[3px] border-white bg-white/80 px-5 py-3 font-comic text-lg shadow-flashSm">
              🎯 목표:&nbsp;
              <span style={{ color: cfg.color }}>{target}마리</span> 잡으면 성공!
            </div>

            <BestRow
              game="mole"
              character={character}
              difficulty={diffKey}
              metric="score"
            />

            <button
              className="btn-flash mt-8 text-2xl"
              style={{ paddingInline: "2.4rem", paddingBlock: "1.1rem" }}
              onClick={() => setPhase("playing")}
            >
              ▶ 시작!
            </button>
          </motion.div>
        )}

        {phase === "playing" && (
          <PlayingMole
            key={`play-${difficulty}-${duration}`}
            character={character}
            duration={duration}
            difficulty={difficulty}
            target={target}
            onFinish={() => setPhase("done")}
          />
        )}

        {phase === "done" && (
          <DoneScreen
            key="done"
            character={character}
            difficulty={difficulty}
            duration={duration}
            target={target}
            onAgain={() => setPhase("playing")}
            onSettings={() => setPhase("settings")}
          />
        )}
      </AnimatePresence>
    </GameShell>
  );
}

function SettingsBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-flashSm">
      <h3 className="mb-3 font-comic text-xl">{title}</h3>
      {children}
    </div>
  );
}

type PlayingProps = {
  character: CharacterId;
  duration: Duration;
  difficulty: Difficulty;
  target: number;
  onFinish: () => void;
};

function PlayingMole(props: PlayingProps) {
  const { character, duration, difficulty, target, onFinish } = props;
  const charInfo = CHARACTERS[character];
  const cfg = DIFFICULTY_CFG[difficulty];

  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [pops, setPops] = useState<Pop[]>([]);
  const [hammerPos, setHammerPos] = useState({ x: -1000, y: -1000 });
  const [hammerSwing, setHammerSwing] = useState(false);

  const moleIdRef = useRef(0);
  const popIdRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef(true);

  // Countdown — single source of truth for game-over.
  useEffect(() => {
    liveRef.current = true;
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          liveRef.current = false;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      window.clearInterval(id);
      liveRef.current = false;
    };
  }, []);

  // Spawn loop
  useEffect(() => {
    const spawn = window.setInterval(() => {
      if (!liveRef.current) return;
      setMoles((prev) => {
        if (prev.length >= cfg.maxLive) return prev;
        const occupied = new Set(prev.map((m) => m.hole));
        const free: number[] = [];
        for (let i = 0; i < HOLE_COUNT; i++) if (!occupied.has(i)) free.push(i);
        if (free.length === 0) return prev;
        const hole = free[Math.floor(Math.random() * free.length)];
        const id = ++moleIdRef.current;
        return [...prev, { id, hole, diesAt: Date.now() + cfg.visibleMs }];
      });
    }, cfg.spawnMs);
    return () => window.clearInterval(spawn);
  }, [cfg.spawnMs, cfg.maxLive, cfg.visibleMs]);

  // Despawn loop
  useEffect(() => {
    const tick = window.setInterval(() => {
      const now = Date.now();
      setMoles((prev) => prev.filter((m) => m.diesAt > now));
    }, 100);
    return () => window.clearInterval(tick);
  }, []);

  // End handling — fires when timeLeft hits 0.
  const finishedRef = useRef(false);
  useEffect(() => {
    if (timeLeft > 0 || finishedRef.current) return;
    finishedRef.current = true;
    const record: ScoreRecord = {
      game: "mole",
      character,
      difficulty: `${difficulty}-${duration}s`,
      score,
      at: new Date().toISOString(),
    };
    window.sessionStorage.setItem(
      STORAGE_LAST,
      JSON.stringify({ score, misses, target }),
    );
    const beatLocal = saveLocalBest(record);
    if (beatLocal) submitScore(record).catch(() => {});
    else submitScore(record).catch(() => {});
    const t = window.setTimeout(() => onFinish(), 600);
    return () => window.clearTimeout(t);
  }, [timeLeft, score, misses, target, character, difficulty, duration, onFinish]);

  // Track mouse for hammer
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setHammerPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const addPop = useCallback((text: string, x: number, y: number, color: string) => {
    const id = ++popIdRef.current;
    setPops((p) => [...p, { id, text, x, y, color }]);
    window.setTimeout(() => {
      setPops((p) => p.filter((q) => q.id !== id));
    }, 700);
  }, []);

  const onHit = useCallback(
    (mole: Mole, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!liveRef.current) return;
      setMoles((prev) => prev.filter((m) => m.id !== mole.id));
      setScore((s) => s + 1);
      const text = HIT_TEXTS[Math.floor(Math.random() * HIT_TEXTS.length)];
      const board = boardRef.current;
      if (board) {
        const r = board.getBoundingClientRect();
        addPop(
          text,
          e.clientX - r.left,
          e.clientY - r.top,
          ["#ff5b8a", "#ffd84d", "#4ea8ff", "#6cc24a"][popIdRef.current % 4],
        );
      }
      setHammerSwing(true);
      window.setTimeout(() => setHammerSwing(false), 150);
    },
    [addPop],
  );

  const onMiss = useCallback(
    (e: React.MouseEvent) => {
      if (!liveRef.current) return;
      setMisses((m) => m + 1);
      setHammerSwing(true);
      window.setTimeout(() => setHammerSwing(false), 150);
      const board = boardRef.current;
      if (board) {
        const r = board.getBoundingClientRect();
        addPop("헛스윙!", e.clientX - r.left, e.clientY - r.top, "#888");
      }
    },
    [addPop],
  );

  const progress = Math.min(100, (score / target) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex w-full flex-col items-center"
    >
      <div className="grid w-full max-w-3xl grid-cols-3 gap-3 font-comic text-lg">
        <Pill label="시간" value={`${timeLeft}초`} color="#4ea8ff" />
        <Pill label="점수" value={`${score} / ${target}`} color={cfg.color} />
        <Pill label="헛스윙" value={`${misses}`} color="#888" />
      </div>
      <div className="mt-3 w-full max-w-3xl">
        <div className="h-3 overflow-hidden rounded-full border-2 border-white bg-white/40">
          <div
            className="h-full transition-all"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg,#ffd84d,#ff5b8a,#4ea8ff)",
            }}
          />
        </div>
      </div>

      <div
        ref={boardRef}
        className="relative mt-5 cursor-hammer overflow-hidden rounded-[2rem] border-[6px] border-white shadow-flash"
        style={{
          width: "min(640px, 92vw)",
          aspectRatio: "1 / 1",
          backgroundImage:
            "radial-gradient(circle at 50% 100%, rgba(0,0,0,0.18), transparent 60%), linear-gradient(180deg,#c3e89e,#7ec979)",
        }}
        onClick={onMiss}
      >
        <div className="absolute inset-4 grid grid-cols-3 grid-rows-3 gap-3">
          {Array.from({ length: HOLE_COUNT }, (_, i) => (
            <Hole key={i} />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-4 grid grid-cols-3 grid-rows-3 gap-3">
          {Array.from({ length: HOLE_COUNT }, (_, i) => {
            const mole = moles.find((m) => m.hole === i);
            return (
              <div key={i} className="relative flex items-end justify-center">
                <AnimatePresence>
                  {mole && (
                    <motion.button
                      key={mole.id}
                      initial={{ y: "110%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "110%", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 22 }}
                      onClick={(e) => onHit(mole, e)}
                      className="pointer-events-auto relative -mb-2 flex h-[78%] w-[78%] items-end justify-center"
                      style={{ cursor: "none" }}
                    >
                      <Image
                        src={charInfo.sprites.mole}
                        alt="두더지"
                        width={180}
                        height={180}
                        className="select-none"
                        draggable={false}
                      />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {pops.map((p) => (
            <PopText key={p.id} text={p.text} x={p.x} y={p.y} color={p.color} />
          ))}
        </AnimatePresence>

        <div
          className="pointer-events-none absolute"
          style={{
            left: hammerPos.x,
            top: hammerPos.y,
            transform: `translate(-30%, -70%) rotate(${hammerSwing ? -55 : -15}deg)`,
            transition: "transform 80ms",
            zIndex: 60,
          }}
        >
          <Image
            src={charInfo.sprites.hammer}
            alt="뿅망치"
            width={120}
            height={120}
            className="drop-shadow-xl"
            draggable={false}
          />
        </div>
      </div>

      <p className="mt-3 font-comic text-base text-[#4a3640]/70">
        ※ 두더지가 튀어나오면 클릭!
      </p>
    </motion.div>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-full border-[3px] border-white bg-white/80 px-4 py-2 shadow-flashSm">
      <span className="text-sm text-[#4a3640]/70">{label}</span>
      <span className="font-comic text-2xl" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function Hole() {
  return (
    <div className="relative flex items-end justify-center">
      <div
        className="absolute bottom-0 h-[44%] w-full rounded-[50%/100%] border-4 border-[#3a4f1d] bg-gradient-to-b from-[#4a3a25] to-[#2a1f12] shadow-inner"
        style={{ borderTopWidth: 6 }}
      />
    </div>
  );
}

function DoneScreen({
  character,
  difficulty,
  duration,
  target,
  onAgain,
  onSettings,
}: {
  character: CharacterId;
  difficulty: Difficulty;
  duration: Duration;
  target: number;
  onAgain: () => void;
  onSettings: () => void;
}) {
  const charInfo = CHARACTERS[character];
  const [data, setData] = useState<{ score: number; misses: number; target: number } | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_LAST);
    if (!raw) return;
    try {
      setData(JSON.parse(raw));
    } catch {}
  }, []);

  const score = data?.score ?? 0;
  const misses = data?.misses ?? 0;
  const success = score >= target;
  const successLines = [
    `${charInfo.label}, 진짜 두더지 사냥꾼이네!`,
    "이 정도면 두더지들도 백기 들 듯…",
    "완전 신기록 각이야! 와우~",
  ];
  const failLines = [
    `${charInfo.label}: ${charInfo.catchphrase}`,
    "조금만 더 빠르게! 다시 도전!",
    "두더지가 비웃고 있어… 분하다!",
  ];
  const line = (success ? successLines : failLines)[Math.floor(Math.random() * 3)];
  const headline = success ? "대성공!" : "아쉽다…";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220 }}
      className="flex w-full flex-col items-center"
    >
      <Title
        text={headline}
        colors={
          success
            ? ["#ffd84d", "#ff5b8a", "#4ea8ff", "#6cc24a"]
            : ["#ff5b8a", "#888", "#4a3640"]
        }
      />
      <p className="mt-3 font-comic text-2xl text-center">{line}</p>

      <div className="mt-6 grid w-full max-w-xl grid-cols-3 gap-3">
        <Pill label="점수" value={`${score}`} color="#ff5b8a" />
        <Pill label="목표" value={`${target}`} color="#4ea8ff" />
        <Pill label="헛스윙" value={`${misses}`} color="#888" />
      </div>

      <BestRow
        game="mole"
        character={character}
        difficulty={`${difficulty}-${duration}s`}
        metric="score"
        justNow={score}
      />

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button className="btn-flash btn-green text-xl" onClick={onAgain}>
          🔁 한 판 더!
        </button>
        <button className="btn-flash btn-yellow text-xl" onClick={onSettings}>
          ⚙️ 설정 바꾸기
        </button>
      </div>
    </motion.div>
  );
}
