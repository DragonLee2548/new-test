import type { CharacterId } from "./characters";

export type GameKey = "mole" | "maze" | "rps";

export type ScoreRecord = {
  game: GameKey;
  character: CharacterId;
  difficulty: string;
  /** higher-is-better metric (e.g. mole score). undefined if only time matters */
  score?: number;
  /** lower-is-better metric in milliseconds (maze clear time, rps total time) */
  ms?: number;
  /** display name for leaderboard (optional, defaults to character) */
  name?: string;
  /** ISO timestamp recorded client-side */
  at: string;
};

function bestKey(game: GameKey, character: CharacterId, difficulty: string): string {
  return `v2:best:${game}:${character}:${difficulty}`;
}

export function loadLocalBest(
  game: GameKey,
  character: CharacterId,
  difficulty: string,
): ScoreRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(bestKey(game, character, difficulty));
    if (!raw) return null;
    return JSON.parse(raw) as ScoreRecord;
  } catch {
    return null;
  }
}

function isBetter(prev: ScoreRecord | null, next: ScoreRecord): boolean {
  if (!prev) return true;
  if (next.score !== undefined && prev.score !== undefined) {
    return next.score > prev.score;
  }
  if (next.ms !== undefined && prev.ms !== undefined) {
    return next.ms < prev.ms;
  }
  return true;
}

/** Returns true if this record is a new local best (and was saved). */
export function saveLocalBest(record: ScoreRecord): boolean {
  if (typeof window === "undefined") return false;
  const prev = loadLocalBest(record.game, record.character, record.difficulty);
  if (!isBetter(prev, record)) return false;
  window.localStorage.setItem(
    bestKey(record.game, record.character, record.difficulty),
    JSON.stringify(record),
  );
  return true;
}

/** Fire-and-forget submit to Google Apps Script if configured. */
export async function submitScore(record: ScoreRecord): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_V2_SCORES_URL;
  if (!url) return false;
  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(record),
    });
    return true;
  } catch {
    return false;
  }
}

/** Fetch top score for a game/character/difficulty combo. Returns null if not configured/unavailable. */
export async function fetchTopScore(
  game: GameKey,
  character: CharacterId,
  difficulty: string,
): Promise<ScoreRecord | null> {
  const url = process.env.NEXT_PUBLIC_V2_SCORES_URL;
  if (!url) return null;
  try {
    const qs = new URLSearchParams({ game, character, difficulty });
    const res = await fetch(`${url}?${qs.toString()}`, { method: "GET" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; top?: ScoreRecord };
    if (!data.ok || !data.top) return null;
    return data.top;
  } catch {
    return null;
  }
}

export function formatTime(ms: number): string {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  if (m > 0) return `${m}분 ${s.toFixed(2)}초`;
  return `${s.toFixed(2)}초`;
}
