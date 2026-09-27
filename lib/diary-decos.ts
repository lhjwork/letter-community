/** 다이어리 데코 카탈로그. 전부 인라인 SVG/CSS — 파일 업로드·외부 리소스 없음 (인쇄에서도 벡터로 그대로) */

export type DecoType = "sticker" | "tape" | "label" | "letter";

export interface DiaryDeco {
  id: string;
  type: DecoType;
  src: string; // 스티커 id / 마테 패턴 id / (label은 "") / 편지는 letterId
  x: number; // 종이 폭 기준 %
  y: number; // 종이 폭 기준 %
  w: number; // 종이 폭 기준 %
  rotate: number;
  z: number;
  text?: string;
  color?: string;
}

export const MAX_DECOS = 20;

/** 스티커 잉크색 (판화 별색 느낌, 소인 기획과 같은 계열) */
export const STICKER_COLORS = ["#FF7F65", "#E8735C", "#3F6B55", "#4A5E8A", "#C9A227", "#7A6455", "#2B3446"] as const;

/** 스티커: 32×32 viewBox 안의 path. fill은 currentColor */
export const STICKERS: Record<string, { label: string; path: string }> = {
  heart: { label: "하트", path: "M16 28 C6 20 2 15 2 10 a6 6 0 0 1 11-3 l3 3 3-3 a6 6 0 0 1 11 3 c0 5-4 10-14 18z" },
  star: { label: "별", path: "M16 2 l4 9 10 1-7.5 6.5 2.5 10L16 23 7 28.5 9.5 18.5 2 12l10-1z" },
  moon: { label: "달", path: "M22 3a13 13 0 1 0 8 23A11 11 0 0 1 22 3z" },
  sun: { label: "해", path: "M16 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0-8 2 5h-4zm0 30-2-5h4zM1 16l5-2v4zm30 0-5 2v-4zM5 5l5 2-3 3zm22 22-5-2 3-3zM5 27l2-5 3 3zM27 5l-2 5-3-3z" },
  cloud: { label: "구름", path: "M9 26a6 6 0 0 1-1-12 8 8 0 0 1 15-3 6 6 0 0 1 3 15z" },
  flower: { label: "꽃", path: "M16 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0-11a5 5 0 0 1 5 5v5a5 5 0 0 1-10 0V6a5 5 0 0 1 5-5zm0 20a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0v-1a5 5 0 0 1 5-5zM5 11a5 5 0 0 1 5 5 5 5 0 0 1-5 5H4a5 5 0 0 1 0-10zm22 0a5 5 0 0 1 0 10h-1a5 5 0 0 1 0-10z" },
  leaf: { label: "잎", path: "M29 3C14 3 4 11 3 27c16 1 24-9 26-24zM6 26 22 9" },
  coffee: { label: "커피", path: "M4 8h20v10a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8zm20 3h2a3 3 0 0 1 0 6h-2zM6 29h18v2H6zM10 2c0 3 3 3 3 6M15 2c0 3 3 3 3 6" },
  envelope: { label: "편지", path: "M2 7h28v18H2zm0 0 14 11L30 7v3L16 21 2 10z" },
  note: { label: "음표", path: "M12 4v18a5 4 0 1 1-2-3.2V4zm0 0 14-3v16a5 4 0 1 1-2-3.2V5.5L12 8z" },
  paw: { label: "발자국", path: "M16 14c5 0 9 4 9 8a5 5 0 0 1-6 5c-1 0-2-1-3-1s-2 1-3 1a5 5 0 0 1-6-5c0-4 4-8 9-8zM7 8a3 4 0 1 1 0 8 3 4 0 0 1 0-8zm18 0a3 4 0 1 1 0 8 3 4 0 0 1 0-8zM12 2a3 4 0 1 1 0 8 3 4 0 0 1 0-8zm8 0a3 4 0 1 1 0 8 3 4 0 0 1 0-8z" },
  sparkle: { label: "반짝", path: "M16 2c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11zM26 22c.5 3 1.5 4 4 4.5-2.5.5-3.5 1.5-4 4.5-.5-3-1.5-4-4-4.5 2.5-.5 3.5-1.5 4-4.5z" },
};

/** 마스킹테이프: 바탕색 + 무늬 (CSS background) */
export const TAPES: Record<string, { label: string; bg: string; pattern?: string }> = {
  mint: { label: "민트 줄무늬", bg: "#BFE3D0", pattern: "repeating-linear-gradient(90deg, transparent 0 8px, rgba(255,255,255,.45) 8px 11px)" },
  yellow: { label: "노랑 도트", bg: "#F6E3A1", pattern: "radial-gradient(rgba(255,255,255,.7) 1.5px, transparent 1.6px)" },
  coral: { label: "코랄 체크", bg: "#F9C9C0", pattern: "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)" },
  blue: { label: "하늘 사선", bg: "#CFDCEF", pattern: "repeating-linear-gradient(45deg, transparent 0 6px, rgba(255,255,255,.5) 6px 8px)" },
  kraft: { label: "크라프트", bg: "#D9C4A3", pattern: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.04) 3px 4px)" },
  lilac: { label: "라일락", bg: "#DED2EC" },
};

export const newDecoId = () => Math.random().toString(36).slice(2, 10);

/** 새 데코의 초기 자리: 종이 가운데 근처, 살짝 비스듬히 */
export const randomPlacement = () => ({
  x: 30 + Math.random() * 20,
  y: 25 + Math.random() * 20,
  rotate: Math.round((Math.random() - 0.5) * 16),
});
