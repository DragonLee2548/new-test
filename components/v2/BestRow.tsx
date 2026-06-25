"use client";

import { useEffect, useState } from "react";
import type { CharacterId } from "@/lib/v2/characters";
import {
  fetchTopScore,
  formatTime,
  loadLocalBest,
  type GameKey,
  type ScoreRecord,
} from "@/lib/v2/scores";

type Props = {
  game: GameKey;
  character: CharacterId;
  difficulty: string;
  metric: "score" | "ms";
  /** Current attempt value to highlight, if any. */
  justNow?: number;
};

export default function BestRow({ game, character, difficulty, metric, justNow }: Props) {
  const [localBest, setLocalBest] = useState<ScoreRecord | null>(null);
  const [topBest, setTopBest] = useState<ScoreRecord | null>(null);

  useEffect(() => {
    setLocalBest(loadLocalBest(game, character, difficulty));
    let live = true;
    fetchTopScore(game, character, difficulty)
      .then((r) => {
        if (live) setTopBest(r);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [game, character, difficulty]);

  const fmt = (v?: number) => {
    if (v === undefined) return "—";
    return metric === "score" ? `${v}점` : formatTime(v);
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 font-comic text-sm">
      <div className="rounded-full bg-white/80 px-3 py-1 shadow-flashSm">
        🏆 내 최고:&nbsp;
        <b style={{ color: "#e85a86" }}>
          {fmt(metric === "score" ? localBest?.score : localBest?.ms)}
        </b>
      </div>
      {topBest && (
        <div className="rounded-full bg-white/80 px-3 py-1 shadow-flashSm">
          👑 전체 최고:&nbsp;
          <b style={{ color: "#4ea8ff" }}>
            {fmt(metric === "score" ? topBest.score : topBest.ms)}
          </b>
          <span className="ml-1 text-[#4a3640]/60">({topBest.character})</span>
        </div>
      )}
      {justNow !== undefined && (
        <div className="rounded-full bg-white/80 px-3 py-1 shadow-flashSm">
          ⭐ 이번:&nbsp;
          <b style={{ color: "#6cc24a" }}>{fmt(justNow)}</b>
        </div>
      )}
    </div>
  );
}
