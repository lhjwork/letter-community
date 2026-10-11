/**
 * 항공우편 v8 편지지(B5). 봉투는 EnvelopeSheet.tsx(원본 인쇄 시트 레이아웃). 소스 하나로 화면 미리보기와 인쇄용 PDF를 같이 낸다.
 * 단위는 전부 mm(viewBox = 블리드 포함 실치수). 좌표 원점은 재단선 왼쪽 위.
 * 줄 위치(LINE_Y)는 기존 편지지(260907)와 같아야 한다. 웹 편지 쓰기 화면이 이 위치에 맞춰져 있다.
 */
import type { ReactNode } from "react";

const BLEED = 3;
export const C = {
  cream: "#F3EEE4",
  paper: "#FFFDF8",
  ink: "#2B2B2B",
  sub: "#5A524A",
  brick: "#B44A33",
  brickBand: "#C8553D",
  blue: "#3E6E8E",
  dot: "#90A8B5", // 파랑 55% 를 크림 위에 섞은 값. 투명도 대신 실색으로 둔다(인쇄 오버프린트 방지)
  rule: "#8A7F72",
};
export const PEN = "'Nanum Pen Script', cursive";
export const SERIF = "'Nanum Myeongjo', serif";
export const ANTON = "Anton, 'Nanum Myeongjo', sans-serif";

/* ---------- 공통 조각 ---------- */

export function Defs({ id }: { id: string }) {
  return (
    <defs>
      {/* 마른 잉크: 가장자리 흔들림 + 잉크 빠진 자리 */}
      <filter id={`${id}-ink`} x="-15%" y="-15%" width="130%" height="130%" primitiveUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0.45" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="11" result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.2 0 0 0 2.35" result="mask" />
        <feComposite in="d" in2="mask" operator="in" />
      </filter>
    </defs>
  );
}

/** 항공우편 띠: 파랑 4 / 흰 2 / 벽돌 4 / 흰 2 (mm), 45°. <pattern>은 Chrome PDF에서 72dpi로 래스터되어 사각형으로 그린다. */
function AirStripes({ id, x, y, w, h }: { id: string; x: number; y: number; w: number; h: number }) {
  const cx = x + w / 2, cy = y + h / 2, d = Math.hypot(w, h) / 2 + 12;
  const n = Math.ceil((2 * d) / 12);
  return (
    <g>
      <clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={C.paper} />
        <g transform={`rotate(45 ${cx} ${cy})`}>
          {Array.from({ length: n }, (_, i) => (
            <g key={i}>
              <rect x={cx - d + i * 12} y={cy - d} width={4} height={2 * d} fill={C.blue} />
              <rect x={cx - d + i * 12 + 6} y={cy - d} width={4} height={2 * d} fill={C.brickBand} />
            </g>
          ))}
        </g>
      </g>
    </g>
  );
}

/** 소인: 이중 원 + SEOUL · 26, 날짜 없음, 12° 회전, 불투명 0.75 */
export function Postmark({ id, x, y, r = 11, color = C.brick, waves = true }: { id: string; x: number; y: number; r?: number; color?: string; waves?: boolean }) {
  const wave = (dy: number) => `M ${r + 1.5} ${dy} q 2.2 -1.4 4.4 0 t 4.4 0 t 4.4 0 t 4.4 0`;
  return (
    <g transform={`translate(${x} ${y}) rotate(-12)`} opacity={0.75} filter={`url(#${id}-ink)`} fill="none" stroke={color}>
      <circle r={r} strokeWidth={0.55} />
      <circle r={r * 0.82} strokeWidth={0.3} />
      <text y={-r * 0.3} textAnchor="middle" fill={color} stroke="none" fontFamily={ANTON} fontSize={r * 0.3} letterSpacing={r * 0.03}>SEOUL</text>
      <line x1={-r * 0.62} x2={r * 0.62} y1={-r * 0.15} y2={-r * 0.15} strokeWidth={0.3} />
      <line x1={-r * 0.62} x2={r * 0.62} y1={r * 0.38} y2={r * 0.38} strokeWidth={0.3} />
      <text y={r * 0.3} textAnchor="middle" fill={color} stroke="none" fontFamily={ANTON} fontSize={r * 0.42} letterSpacing={r * 0.04}>26</text>
      <text y={r * 0.66} textAnchor="middle" fill={color} stroke="none" fontFamily={ANTON} fontSize={r * 0.2} letterSpacing={r * 0.03}>LETTER</text>
      {waves && [-3.2, 0, 3.2].map((dy) => <path key={dy} d={wave(dy)} strokeWidth={0.45} />)}
    </g>
  );
}

/** QR: 원본 PNG는 600px 중 73px이 여백. 27.1mm로 놓으면 코드 20.5mm + 여백 3.3mm, 판 0.7mm 더해 4mm */
function Qr({ x, y, src, url }: { x: number; y: number; src: string; url: string }) {
  return (
    <g>
      <rect x={x} y={y} width={28.5} height={28.5} rx={0.8} fill={C.paper} stroke="#D8CDBB" strokeWidth={0.25} />
      <image href={src} x={x + 0.7} y={y + 0.7} width={27.1} height={27.1}>
        <title>{url}</title>
      </image>
    </g>
  );
}

/** 화면: 회색 바탕 위 종이 + 재단선 점선. 인쇄: 블리드 포함 페이지 한 장. */
function Sheet({ kind, w, h, children }: { kind: string; w: number; h: number; children: ReactNode }) {
  const pw = w + BLEED * 2;
  const ph = h + BLEED * 2;
  return (
    <div className="stn-wrap" data-kind={kind}>
      <style>{`
        @page stn-${kind} { size: ${pw}mm ${ph}mm; margin: 0; }
        .stn-wrap[data-kind="${kind}"] { page: stn-${kind}; }
        .stn-wrap { min-height: 100vh; background: #D9D3C8; display: flex; justify-content: center; align-items: center; padding: 32px; }
        .stn-wrap svg { display: block; box-shadow: 0 2px 14px rgba(43,43,43,.18); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          html, body { background: none !important; margin: 0 !important; }
          .stn-wrap { min-height: 0; padding: 0; display: block; background: none; }
          .stn-wrap svg { box-shadow: none; }
          .stn-trim { display: none !important; }
        }
      `}</style>
      <svg width={`${pw}mm`} height={`${ph}mm`} viewBox={`${-BLEED} ${-BLEED} ${pw} ${ph}`} xmlns="http://www.w3.org/2000/svg">
        <Defs id={kind} />
        {children}
        <rect className="stn-trim" x={0} y={0} width={w} height={h} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={0.2} strokeDasharray="1.5 1" />
      </svg>
    </div>
  );
}

/* ---------- 편지지 B5 ---------- */

const PAPER_W = 182;
const PAPER_H = 256;
/** 기존 편지지와 같은 줄 위치(재단 높이 대비 %). 1번째 To, 11번째 From. */
export const LINE_Y_PCT = [25.22, 30.83, 36.5, 42.14, 47.78, 53.42, 59.06, 64.67, 70.33, 76.0, 81.61];
const LINE_X0 = PAPER_W * 0.096;
const LINE_X1 = PAPER_W * 0.903;
const LAST_X0 = PAPER_W * 0.18;

type QrProps = { qrSrc?: string; qrUrl?: string };

export function AirmailV8Paper({ qrSrc = "/stationery/letter_qr.png", qrUrl = "https://letter.seoul.kr/" }: QrProps) {
  const id = "paper";
  const ys = LINE_Y_PCT.map((p) => (PAPER_H * p) / 100);
  return (
    <Sheet kind={id} w={PAPER_W} h={PAPER_H}>
      <rect x={-BLEED} y={-BLEED} width={PAPER_W + BLEED * 2} height={PAPER_H + BLEED * 2} fill={C.cream} />
      {/* 위아래 항공우편 띠: 재단 안쪽 4mm + 블리드 3mm */}
      <AirStripes id="paper-top" x={-BLEED} y={-BLEED} w={PAPER_W + BLEED * 2} h={4 + BLEED} />
      <AirStripes id="paper-bottom" x={-BLEED} y={PAPER_H - 4} w={PAPER_W + BLEED * 2} h={4 + BLEED} />

      {/* 로고 + 주소 */}
      <image href="/images/logo-image.png" x={58} y={15} width={26} height={17.4} />
      <text x={87} y={29.5} fill={C.ink} fontFamily={PEN} fontSize={13}>Letter</text>
      <text x={PAPER_W / 2} y={40} textAnchor="middle" fill={C.sub} fontFamily={SERIF} fontSize={3.4} letterSpacing={0.35}>letter.seoul.kr</text>

      <Postmark id={id} x={146} y={30} />

      {/* 괘선 11줄 (점선) */}
      <g stroke={C.dot} strokeWidth={0.5} strokeLinecap="round" strokeDasharray="0 1.6">
        {ys.map((y, i) => <line key={y} x1={i === 10 ? LAST_X0 : LINE_X0} x2={LINE_X1} y1={y} y2={y} />)}
      </g>
      {/* To 는 줄 왼쪽 여백에, From 은 마지막 줄 앞 빈칸에. 줄 위 글 자리는 비워 둔다. */}
      <text x={LINE_X0 - 1.2} y={ys[0] - 0.8} textAnchor="end" fill={C.blue} fontFamily={PEN} fontSize={6.5}>To.</text>
      <text x={LINE_X0} y={ys[10] - 0.8} fill={C.blue} fontFamily={PEN} fontSize={6.5}>From.</text>

      {/* 하단: QR + 한 줄 */}
      <Qr x={LINE_X0} y={218} src={qrSrc} url={qrUrl} />
      <text x={LINE_X0 + 32} y={234} fill={C.ink} fontFamily={SERIF} fontSize={3.6}>사연을 보내면 답장이 와요</text>

      {/* 항공우편 라벨 */}
      <g transform="rotate(-2 146 231)" fill={C.blue} textAnchor="middle">
        <rect x={128} y={224} width={36} height={14} rx={0.8} fill="none" stroke={C.blue} strokeWidth={0.8} />
        <text x={146} y={230.2} fontFamily={ANTON} fontSize={4.2} letterSpacing={0.5}>BY AIR MAIL</text>
        <text x={146} y={235.6} fontFamily={PEN} fontSize={5}>항공우편 par avion</text>
      </g>
    </Sheet>
  );
}
