"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CHARACTERS,
  CHARACTER_ORDER,
  type CharacterId,
  loadSelectedCharacter,
} from "@/lib/v2/characters";
import {
  formatTime,
  saveLocalBest,
  submitScore,
  type ScoreRecord,
} from "@/lib/v2/scores";
import GameShell from "@/components/v2/GameShell";
import Title from "@/components/v2/Title";
import BestRow from "@/components/v2/BestRow";

type Hand = "rock" | "paper" | "scissors";
type Round = "idle" | "thinking" | "reveal";
type Outcome = "win" | "lose" | "draw";
type Phase = "intro" | "playing" | "done";

const HAND_LABEL: Record<Hand, string> = {
  rock: "주먹",
  paper: "보",
  scissors: "가위",
};

const HAND_EMOJI: Record<Hand, string> = {
  rock: "✊",
  paper: "🖐️",
  scissors: "✌️",
};

const TARGET = 10;

const WIN_LINES = [
  "이겼다~! 🎉",
  "내가 짱! 💖",
  "야호~ 한 점!",
  "이건 못 참지!",
  "당연한 결과지~",
];
const LOSE_LINES = [
  "졌다... 분해!",
  "다음 판!! 다음 판!!",
  "어어어... 망했네...",
  "운빨이야 운빨!",
  "한 번만 더!!",
];
const DRAW_LINES = [
  "비겼어!",
  "음? 또 같네?",
  "심심하게 비기다니!",
  "이거 뭐야~",
];

function judge(p: Hand, o: Hand): Outcome {
  if (p === o) return "draw";
  if (
    (p === "rock" && o === "scissors") ||
    (p === "scissors" && o === "paper") ||
    (p === "paper" && o === "rock")
  )
    return "win";
  return "lose";
}

const STORAGE_LAST = "v2:rps:last";

export default function RpsPage() {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterId | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");

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

  return (
    <GameShell>
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex w-full flex-col items-center"
          >
            <Title text="가위 바위 보!" subtitle={`${charInfo.label}, 10승까지 가즈아!`} />
            <div className="mt-6 max-w-xl rounded-3xl border-[4px] border-white bg-white/85 px-6 py-5 text-center font-comic text-lg shadow-flashSm">
              먼저 <b style={{ color: "#ff5b8a" }}>10승</b> 하는 사람이 승리!<br />
              비기는 건 점수 안 줘~ 시간 기록 도전!
            </div>

            <BestRow
              game="rps"
              character={character}
              difficulty="default"
              metric="ms"
            />

            <button
              className="btn-flash mt-8 text-2xl"
              style={{ paddingInline: "2.4rem", paddingBlock: "1.1rem" }}
              onClick={() => setPhase("playing")}
            >
              ▶ 도전!
            </button>
          </motion.div>
        )}

        {phase === "playing" && (
          <Playing
            key="playing"
            character={character}
            onFinish={() => setPhase("done")}
          />
        )}

        {phase === "done" && (
          <DoneScreen
            key="done"
            character={character}
            onAgain={() => setPhase("playing")}
            onIntro={() => setPhase("intro")}
          />
        )}
      </AnimatePresence>
    </GameShell>
  );
}

function pickOpponent(self: CharacterId): CharacterId {
  const others = CHARACTER_ORDER.filter((c) => c !== self);
  return others[Math.floor(Math.random() * others.length)];
}

function Playing({
  character,
  onFinish,
}: {
  character: CharacterId;
  onFinish: () => void;
}) {
  const me = CHARACTERS[character];
  const opponent = useMemo(() => pickOpponent(character), [character]);
  const opp = CHARACTERS[opponent];

  const [myWins, setMyWins] = useState(0);
  const [oppWins, setOppWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [round, setRound] = useState<Round>("idle");
  const [myHand, setMyHand] = useState<Hand | null>(null);
  const [oppHand, setOppHand] = useState<Hand | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [comment, setComment] = useState("자, 골라봐!");
  const [start] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const finishedRef = useRef(false);

  // Timer
  useEffect(() => {
    const id = window.setInterval(() => setElapsed(Date.now() - start), 50);
    return () => window.clearInterval(id);
  }, [start]);

  const handlePick = useCallback(
    (h: Hand) => {
      if (round !== "idle") return;
      if (finishedRef.current) return;
      setMyHand(h);
      setOppHand(null);
      setOutcome(null);
      setRound("thinking");
      setComment("가위 바위 보!");

      const cpuChoice: Hand = (["rock", "paper", "scissors"] as Hand[])[
        Math.floor(Math.random() * 3)
      ];
      window.setTimeout(() => {
        setOppHand(cpuChoice);
        const out = judge(h, cpuChoice);
        setOutcome(out);
        if (out === "win") {
          setMyWins((w) => w + 1);
          setComment(WIN_LINES[Math.floor(Math.random() * WIN_LINES.length)]);
        } else if (out === "lose") {
          setOppWins((w) => w + 1);
          setComment(LOSE_LINES[Math.floor(Math.random() * LOSE_LINES.length)]);
        } else {
          setDraws((d) => d + 1);
          setComment(DRAW_LINES[Math.floor(Math.random() * DRAW_LINES.length)]);
        }
        setRound("reveal");
        window.setTimeout(() => {
          setRound("idle");
        }, 900);
      }, 700);
    },
    [round],
  );

  // Win/lose detect
  useEffect(() => {
    if (finishedRef.current) return;
    if (myWins >= TARGET || oppWins >= TARGET) {
      finishedRef.current = true;
      const ms = Date.now() - start;
      const playerWon = myWins >= TARGET;
      window.sessionStorage.setItem(
        STORAGE_LAST,
        JSON.stringify({
          ms,
          playerWon,
          myWins,
          oppWins,
          draws,
          opponent,
        }),
      );
      if (playerWon) {
        const record: ScoreRecord = {
          game: "rps",
          character,
          difficulty: "default",
          ms,
          at: new Date().toISOString(),
        };
        saveLocalBest(record);
        submitScore(record).catch(() => {});
      }
      window.setTimeout(() => onFinish(), 1100);
    }
  }, [myWins, oppWins, draws, start, character, opponent, onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex w-full flex-col items-center"
    >
      <div className="flex w-full max-w-3xl items-center justify-between font-comic">
        <div className="rounded-full bg-white/80 px-4 py-2 text-base shadow-flashSm">
          ⏱ <b style={{ color: "#4ea8ff" }}>{formatTime(elapsed)}</b>
        </div>
        <div className="rounded-full bg-white/80 px-4 py-2 text-base shadow-flashSm">
          비김: {draws}
        </div>
      </div>

      <div className="mt-4 grid w-full max-w-3xl grid-cols-2 gap-4">
        <PlayerCard
          name={me.label}
          accent={me.accent}
          portrait={me.portrait}
          hand={myHand}
          handImage={
            myHand === "rock"
              ? me.sprites.rock
              : myHand === "paper"
              ? me.sprites.paper
              : myHand === "scissors"
              ? me.sprites.scissors
              : null
          }
          score={myWins}
          target={TARGET}
          shake={outcome === "lose" && round === "reveal"}
        />
        <PlayerCard
          name={opp.label}
          accent={opp.accent}
          portrait={opp.portrait}
          hand={oppHand}
          handImage={
            oppHand === "rock"
              ? opp.sprites.rock
              : oppHand === "paper"
              ? opp.sprites.paper
              : oppHand === "scissors"
              ? opp.sprites.scissors
              : null
          }
          score={oppWins}
          target={TARGET}
          flip
          thinking={round === "thinking"}
          shake={outcome === "win" && round === "reveal"}
        />
      </div>

      <motion.div
        key={comment}
        initial={{ scale: 0.7, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="mt-4 rounded-3xl border-[3px] border-white bg-white/90 px-6 py-3 font-comic text-2xl shadow-flash"
        style={{
          color: outcome === "win" ? "#ff5b8a" : outcome === "lose" ? "#4a3640" : "#4ea8ff",
        }}
      >
        {comment}
      </motion.div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {(["rock", "scissors", "paper"] as Hand[]).map((h) => (
          <button
            key={h}
            disabled={round !== "idle"}
            onClick={() => handlePick(h)}
            className={`btn-flash text-xl ${
              h === "rock" ? "btn-yellow" : h === "paper" ? "btn-blue" : ""
            }`}
            style={{ paddingInline: "1.6rem", paddingBlock: "1rem" }}
          >
            <span style={{ fontSize: 36 }}>{HAND_EMOJI[h]}</span>
            <span className="ml-2">{HAND_LABEL[h]}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function PlayerCard({
  name,
  accent,
  portrait,
  hand,
  handImage,
  score,
  target,
  flip = false,
  thinking = false,
  shake = false,
}: {
  name: string;
  accent: string;
  portrait: string;
  hand: Hand | null;
  handImage: string | null;
  score: number;
  target: number;
  flip?: boolean;
  thinking?: boolean;
  shake?: boolean;
}) {
  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col items-center rounded-3xl border-[4px] border-white bg-white/85 p-4 shadow-flash"
    >
      <div className="flex w-full items-center justify-between">
        <div className="font-comic text-xl" style={{ color: accent }}>
          {name}
        </div>
        <div className="font-comic text-2xl">
          <b style={{ color: accent }}>{score}</b>
          <span className="text-sm text-[#4a3640]/60"> / {target}</span>
        </div>
      </div>
      <div className="relative mt-2 flex h-44 w-full items-center justify-center">
        <Image
          src={portrait}
          alt={name}
          width={120}
          height={120}
          style={{ transform: flip ? "scaleX(-1)" : undefined }}
          className="drop-shadow-lg"
        />
        <AnimatePresence>
          {thinking && (
            <motion.div
              key="thinking"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 font-comic text-base shadow-flashSm"
            >
              고민중…
            </motion.div>
          )}
          {handImage && !thinking && (
            <motion.div
              key={handImage}
              initial={{ scale: 0.3, opacity: 0, y: -30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute"
              style={{ bottom: 0, right: flip ? "auto" : -10, left: flip ? -10 : "auto" }}
            >
              <Image
                src={handImage}
                alt={hand ?? ""}
                width={100}
                height={100}
                style={{ transform: flip ? "scaleX(-1)" : undefined }}
                className="drop-shadow"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/60">
        <div
          className="h-full transition-all"
          style={{
            width: `${(score / target) * 100}%`,
            background: accent,
          }}
        />
      </div>
    </motion.div>
  );
}

function DoneScreen({
  character,
  onAgain,
  onIntro,
}: {
  character: CharacterId;
  onAgain: () => void;
  onIntro: () => void;
}) {
  const charInfo = CHARACTERS[character];
  const [data, setData] = useState<{
    ms: number;
    playerWon: boolean;
    myWins: number;
    oppWins: number;
    draws: number;
    opponent: CharacterId;
  } | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_LAST);
    if (!raw) return;
    try {
      setData(JSON.parse(raw));
    } catch {}
  }, []);

  if (!data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Title text="결과 정리중…" />
      </motion.div>
    );
  }

  const opp = CHARACTERS[data.opponent];
  const headline = data.playerWon ? "🏆 10승 달성!" : "😵 졌어…";
  const line = data.playerWon
    ? `${charInfo.label}: "${charInfo.catchphrase}" 와우, ${formatTime(data.ms)} 만에 정복!`
    : `${charInfo.label}: ${opp.label}한테 한 방 먹었네… 분해!`;
  const subLines = data.playerWon
    ? [
        "이 정도면 가위바위보 신!",
        "운빨이 아니야~ 실력이지!",
        "동네방네 자랑해도 되는 기록이야.",
      ]
    : [
        "다시 한 판! 복수전!",
        "다음엔 꼭 이긴다…!",
        "흠… 가위만 내지 말걸…",
      ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex w-full flex-col items-center"
    >
      <Title
        text={headline}
        colors={
          data.playerWon
            ? ["#ffd84d", "#ff5b8a", "#4ea8ff", "#6cc24a", "#c98bff"]
            : ["#888", "#4a3640", "#ff5b8a"]
        }
      />
      <p className="mt-3 max-w-xl text-center font-comic text-2xl">{line}</p>
      <p className="mt-1 text-center font-comic text-lg text-[#4a3640]/80">
        {subLines[Math.floor(Math.random() * subLines.length)]}
      </p>

      <div className="mt-6 grid w-full max-w-xl grid-cols-2 gap-3 font-comic text-lg">
        <div className="rounded-2xl border-[3px] border-white bg-white/85 px-4 py-3 text-center shadow-flashSm">
          나의 승 / 상대 승<br />
          <b style={{ color: "#ff5b8a", fontSize: 24 }}>
            {data.myWins} : {data.oppWins}
          </b>
        </div>
        <div className="rounded-2xl border-[3px] border-white bg-white/85 px-4 py-3 text-center shadow-flashSm">
          비긴 횟수<br />
          <b style={{ color: "#4ea8ff", fontSize: 24 }}>{data.draws}</b>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border-[4px] border-white bg-white/90 px-8 py-4 text-center shadow-flash">
        <div className="text-sm text-[#4a3640]/70">총 소요 시간</div>
        <div className="font-comic text-3xl" style={{ color: "#ff5b8a" }}>
          {formatTime(data.ms)}
        </div>
      </div>

      <BestRow
        game="rps"
        character={character}
        difficulty="default"
        metric="ms"
        justNow={data.playerWon ? data.ms : undefined}
      />

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button className="btn-flash btn-green text-xl" onClick={onAgain}>
          🔁 다시 한 판!
        </button>
        <button className="btn-flash btn-yellow text-xl" onClick={onIntro}>
          ↩ 소개로
        </button>
      </div>
    </motion.div>
  );
}
