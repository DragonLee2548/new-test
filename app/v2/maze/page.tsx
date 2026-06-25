"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CHARACTERS, type CharacterId, loadSelectedCharacter } from "@/lib/v2/characters";
import { formatTime, saveLocalBest, submitScore, type ScoreRecord } from "@/lib/v2/scores";
import GameShell from "@/components/v2/GameShell";
import Title from "@/components/v2/Title";
import BestRow from "@/components/v2/BestRow";

type Difficulty = "easy" | "normal" | "hard";

const DIFFICULTY_CFG: Record<Difficulty, { rows: number; cols: number; label: string; color: string }> = {
  easy: { rows: 7, cols: 7, label: "하 (7×7)", color: "#7bd389" },
  normal: { rows: 11, cols: 11, label: "중 (11×11)", color: "#ffd84d" },
  hard: { rows: 15, cols: 15, label: "상 (15×15)", color: "#ff5b8a" },
};

type Phase = "settings" | "playing" | "done";
type Dir = "up" | "down" | "left" | "right";

type Cell = { top: boolean; right: boolean; bottom: boolean; left: boolean };

function generateMaze(rows: number, cols: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
    }))
  );
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const stack: [number, number][] = [[0, 0]];
  visited[0][0] = true;

  const dirs: { dr: number; dc: number; cur: keyof Cell; nxt: keyof Cell }[] = [
    { dr: -1, dc: 0, cur: "top", nxt: "bottom" },
    { dr: 1, dc: 0, cur: "bottom", nxt: "top" },
    { dr: 0, dc: -1, cur: "left", nxt: "right" },
    { dr: 0, dc: 1, cur: "right", nxt: "left" },
  ];

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const candidates = dirs
      .map((d) => ({ ...d, nr: r + d.dr, nc: c + d.dc }))
      .filter((d) => d.nr >= 0 && d.nr < rows && d.nc >= 0 && d.nc < cols && !visited[d.nr][d.nc]);
    if (candidates.length === 0) {
      stack.pop();
      continue;
    }
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    grid[r][c][pick.cur] = false;
    grid[pick.nr][pick.nc][pick.nxt] = false;
    visited[pick.nr][pick.nc] = true;
    stack.push([pick.nr, pick.nc]);
  }
  return grid;
}

export default function MazePage() {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterId | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
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
            <Title text="미로 탈출!" subtitle={`${charInfo.label}, 출구는 어디?`} />

            <div className="mt-8 w-full max-w-xl rounded-3xl border-[4px] border-white bg-white/80 p-5 shadow-flashSm">
              <h3 className="mb-3 font-comic text-xl">🎚 난이도</h3>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(DIFFICULTY_CFG) as Difficulty[]).map((d) => {
                  const active = difficulty === d;
                  const cls = active ? (d === "easy" ? "btn-green" : d === "normal" ? "btn-yellow" : "") : "btn-ghost";
                  return (
                    <button key={d} onClick={() => setDifficulty(d)} className={`btn-flash ${cls} text-lg`}>
                      {DIFFICULTY_CFG[d].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border-[3px] border-white bg-white/80 px-5 py-3 font-comic text-base shadow-flashSm">
              ⌨️ 방향키 / 화면 버튼으로 이동해서 🏁까지 가!
            </div>

            <BestRow game="maze" character={character} difficulty={difficulty} metric="ms" />

            <button className="btn-flash mt-8 text-2xl" style={{ paddingInline: "2.4rem", paddingBlock: "1.1rem" }} onClick={() => setPhase("playing")}>
              ▶ 출발!
            </button>
          </motion.div>
        )}

        {phase === "playing" && (
          <PlayingMaze
            key={`play-${difficulty}-${Date.now()}`}
            character={character}
            difficulty={difficulty}
            rows={cfg.rows}
            cols={cfg.cols}
            onFinish={() => setPhase("done")}
          />
        )}

        {phase === "done" && (
          <DoneScreen key="done" character={character} difficulty={difficulty} onAgain={() => setPhase("playing")} onSettings={() => setPhase("settings")} />
        )}
      </AnimatePresence>
    </GameShell>
  );
}

const STORAGE_LAST = "v2:maze:last";

type PlayingProps = {
  character: CharacterId;
  difficulty: Difficulty;
  rows: number;
  cols: number;
  onFinish: () => void;
};

function PlayingMaze({ character, difficulty, rows, cols, onFinish }: PlayingProps) {
  const charInfo = CHARACTERS[character];
  const grid = useMemo(() => generateMaze(rows, cols), [rows, cols]);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [facing, setFacing] = useState<Dir>("down");
  const [start] = useState<number>(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const finishedRef = useRef(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const cellSize = useMemo(() => {
    const maxBoardPx = Math.min(640, typeof window === "undefined" ? 480 : Math.min(window.innerWidth - 40, 640));
    return Math.floor(maxBoardPx / cols);
  }, [cols]);

  // Timer
  useEffect(() => {
    const id = window.setInterval(() => setElapsed(Date.now() - start), 50);
    return () => window.clearInterval(id);
  }, [start]);

  const tryMove = useCallback(
    (dir: Dir) => {
      setFacing(dir);
      setPos(([r, c]) => {
        const cell = grid[r][c];
        let nr = r;
        let nc = c;
        if (dir === "up" && !cell.top) nr = r - 1;
        else if (dir === "down" && !cell.bottom) nr = r + 1;
        else if (dir === "left" && !cell.left) nc = c - 1;
        else if (dir === "right" && !cell.right) nc = c + 1;
        return [nr, nc];
      });
    },
    [grid]
  );

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        tryMove("up");
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        tryMove("down");
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        tryMove("left");
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        tryMove("right");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove]);

  // Win detect
  useEffect(() => {
    if (finishedRef.current) return;
    if (pos[0] === rows - 1 && pos[1] === cols - 1) {
      finishedRef.current = true;
      const ms = Date.now() - start;
      const record: ScoreRecord = {
        game: "maze",
        character,
        difficulty,
        ms,
        at: new Date().toISOString(),
      };
      window.sessionStorage.setItem(STORAGE_LAST, JSON.stringify({ ms }));
      saveLocalBest(record);
      submitScore(record).catch(() => {});
      window.setTimeout(() => onFinish(), 800);
    }
  }, [pos, rows, cols, start, character, difficulty, onFinish]);

  const sprite =
    facing === "up" ? charInfo.sprites.back : facing === "down" ? charInfo.sprites.front : facing === "left" ? charInfo.sprites.left : charInfo.sprites.right;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-xl items-center justify-between font-comic">
        <div className="rounded-full bg-white/80 px-4 py-2 text-xl shadow-flashSm">
          ⏱ <b style={{ color: "#4ea8ff" }}>{formatTime(elapsed)}</b>
        </div>
        <div className="rounded-full bg-white/80 px-4 py-2 text-base shadow-flashSm">
          난이도:&nbsp;<b>{DIFFICULTY_CFG[difficulty].label}</b>
        </div>
      </div>

      <div
        ref={boardRef}
        className="relative mt-4 rounded-[2rem] border-[6px] border-white shadow-flash"
        style={{
          width: cellSize * cols + 12,
          height: cellSize * rows + 12,
          padding: 6,
          background: "linear-gradient(180deg,#e9f3ff,#cfe4ff)",
        }}
        tabIndex={0}
      >
        <div className="relative" style={{ width: cellSize * cols, height: cellSize * rows }}>
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  position: "absolute",
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize,
                  height: cellSize,
                  boxSizing: "border-box",
                  borderTop: cell.top ? "3px solid #4a3640" : "none",
                  borderRight: cell.right ? "3px solid #4a3640" : "none",
                  borderBottom: cell.bottom ? "3px solid #4a3640" : "none",
                  borderLeft: cell.left ? "3px solid #4a3640" : "none",
                }}
              />
            ))
          )}

          {/* Goal */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, -10] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{
              position: "absolute",
              left: (cols - 1) * cellSize + cellSize * 0.15,
              top: (rows - 1) * cellSize + cellSize * 0.15,
              width: cellSize * 0.7,
              height: cellSize * 0.7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: cellSize * 0.55,
              filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.18))",
            }}
          >
            🏁
          </motion.div>

          {/* Player */}
          <motion.div
            animate={{
              left: pos[1] * cellSize + cellSize * 0.05,
              top: pos[0] * cellSize + cellSize * 0.05,
            }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            style={{
              position: "absolute",
              width: cellSize * 0.9,
              height: cellSize * 0.9,
            }}
          >
            <Image
              src={sprite}
              alt={charInfo.label}
              width={cellSize}
              height={cellSize}
              className="select-none"
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Mobile controls */}
      <div className="mt-5 grid grid-cols-3 gap-2" style={{ width: 220 }}>
        <span />
        <button
          className="btn-flash btn-blue text-xl"
          onTouchStart={(e) => {
            e.preventDefault();
            tryMove("up");
          }}
          onClick={() => tryMove("up")}
        >
          ↑
        </button>
        <span />
        <button
          className="btn-flash btn-blue text-xl"
          onTouchStart={(e) => {
            e.preventDefault();
            tryMove("left");
          }}
          onClick={() => tryMove("left")}
        >
          ←
        </button>
        <button
          className="btn-flash btn-ghost text-xl"
          onTouchStart={(e) => {
            e.preventDefault();
            tryMove("down");
          }}
          onClick={() => tryMove("down")}
        >
          ↓
        </button>
        <button
          className="btn-flash btn-blue text-xl"
          onTouchStart={(e) => {
            e.preventDefault();
            tryMove("right");
          }}
          onClick={() => tryMove("right")}
        >
          →
        </button>
      </div>
    </motion.div>
  );
}

function DoneScreen({
  character,
  difficulty,
  onAgain,
  onSettings,
}: {
  character: CharacterId;
  difficulty: Difficulty;
  onAgain: () => void;
  onSettings: () => void;
}) {
  const charInfo = CHARACTERS[character];
  const [ms, setMs] = useState(0);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_LAST);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { ms: number };
      setMs(parsed.ms);
    } catch {}
  }, []);

  const lines = [`${charInfo.label}, 출구 발견 성공!`, "와우 길눈이 밝네~", `${charInfo.label}: ${charInfo.catchphrase}`];
  const line = lines[Math.floor(Math.random() * lines.length)];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full flex-col items-center">
      <Title text="탈출 성공!" colors={["#ff5b8a", "#ffd84d", "#4ea8ff", "#6cc24a", "#c98bff"]} />
      <p className="mt-3 font-comic text-2xl">{line}</p>
      <div className="mt-6 rounded-3xl border-[4px] border-white bg-white/85 px-8 py-5 text-center shadow-flash">
        <div className="font-comic text-sm text-[#4a3640]/70">기록</div>
        <div className="font-comic text-4xl" style={{ color: "#ff5b8a" }}>
          {formatTime(ms)}
        </div>
      </div>

      <BestRow game="maze" character={character} difficulty={difficulty} metric="ms" justNow={ms} />

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button className="btn-flash btn-green text-xl" onClick={onAgain}>
          🔁 다시!
        </button>
        <button className="btn-flash btn-yellow text-xl" onClick={onSettings}>
          ⚙️ 난이도 변경
        </button>
      </div>
    </motion.div>
  );
}
