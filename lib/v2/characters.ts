import { assetPath } from "@/lib/assetPath";

export type CharacterId = "우사기" | "치이카와" | "하치와레";

export type CharacterInfo = {
  id: CharacterId;
  label: string;
  tagline: string;
  catchphrase: string;
  themeFrom: string;
  themeTo: string;
  accent: string;
  ring: string;
  portrait: string;
  portraitBg: string;
  set: string;
  setNbg: string;
  sprites: {
    mole: string;
    hammer: string;
    front: string;
    back: string;
    left: string;
    right: string;
    rock: string;
    paper: string;
    scissors: string;
  };
};

const sprite = (name: CharacterId, key: string) =>
  assetPath(`/image/v2/${name}_${key}.png`);

export const CHARACTERS: Record<CharacterId, CharacterInfo> = {
  우사기: {
    id: "우사기",
    label: "우사기",
    tagline: "텐션 200% 야생토끼",
    catchphrase: "야하~! 가볼까!?",
    themeFrom: "#fff3a8",
    themeTo: "#ffd54f",
    accent: "#ff9d2e",
    ring: "#ffb347",
    portrait: assetPath("/image/먼작귀/우사기.webp"),
    portraitBg: assetPath("/image/먼작귀/우사기_기본.webp"),
    set: assetPath("/image/먼작귀/우사기_세트.png"),
    setNbg: assetPath("/image/v2/우사기_세트_nbg.png"),
    sprites: {
      mole: sprite("우사기", "두더지"),
      hammer: sprite("우사기", "뿅망치"),
      front: sprite("우사기", "앞"),
      back: sprite("우사기", "뒤"),
      left: sprite("우사기", "왼쪽"),
      right: sprite("우사기", "오른쪽"),
      rock: sprite("우사기", "주먹"),
      paper: sprite("우사기", "보"),
      scissors: sprite("우사기", "가위"),
    },
  },
  치이카와: {
    id: "치이카와",
    label: "치이카와",
    tagline: "여리여리 울보 챔피언",
    catchphrase: "하와와… 힘낼게…!",
    themeFrom: "#ffe1c2",
    themeTo: "#ffb98a",
    accent: "#e07a3a",
    ring: "#f5a06a",
    portrait: assetPath("/image/먼작귀/치이카와.webp"),
    portraitBg: assetPath("/image/먼작귀/치이카와_기본.webp"),
    set: assetPath("/image/먼작귀/치이카와_세트.png"),
    setNbg: assetPath("/image/v2/치이카와_세트_nbg.png"),
    sprites: {
      mole: sprite("치이카와", "두더지"),
      hammer: sprite("치이카와", "뿅망치"),
      front: sprite("치이카와", "앞"),
      back: sprite("치이카와", "뒤"),
      left: sprite("치이카와", "왼쪽"),
      right: sprite("치이카와", "오른쪽"),
      rock: sprite("치이카와", "주먹"),
      paper: sprite("치이카와", "보"),
      scissors: sprite("치이카와", "가위"),
    },
  },
  하치와레: {
    id: "하치와레",
    label: "하치와레",
    tagline: "쾌활 만능 햇살냥",
    catchphrase: "걱정마, 내가 있잖아!",
    themeFrom: "#cfe9ff",
    themeTo: "#7ec0ff",
    accent: "#2c84d8",
    ring: "#4ea8ff",
    portrait: assetPath("/image/먼작귀/하치와레.webp"),
    portraitBg: assetPath("/image/먼작귀/하치와레_기본.webp"),
    set: assetPath("/image/먼작귀/하치와레_세트.png"),
    setNbg: assetPath("/image/v2/하치와레_세트_nbg.png"),
    sprites: {
      mole: sprite("하치와레", "두더지"),
      hammer: sprite("하치와레", "뿅망치"),
      front: sprite("하치와레", "앞"),
      back: sprite("하치와레", "뒤"),
      left: sprite("하치와레", "왼쪽"),
      right: sprite("하치와레", "오른쪽"),
      rock: sprite("하치와레", "주먹"),
      paper: sprite("하치와레", "보"),
      scissors: sprite("하치와레", "가위"),
    },
  },
};

export const CHARACTER_ORDER: CharacterId[] = ["우사기", "치이카와", "하치와레"];

const STORAGE_KEY = "v2:selectedCharacter";

export function loadSelectedCharacter(): CharacterId | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "우사기" || v === "치이카와" || v === "하치와레") return v;
  return null;
}

export function saveSelectedCharacter(id: CharacterId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}
