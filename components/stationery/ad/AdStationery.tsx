/**
 * 광고(협찬) 편지지 B5 · 봉투 인쇄 시트 시안 3방향. 비교용 시안이며 어디에도 연결하지 않는다.
 * A 조용한 협찬 표기 / B 매장 우표 / C 쿠폰 동봉형. 단위 mm, 원점은 재단선 왼쪽 위.
 * 편지지 규격·줄 위치·토큰은 ../AirmailV8.tsx 와 같다. 봉투는 ../EnvelopeSheet.tsx(원본 인쇄 시트) 위에 광고 조각만 얹는다.
 * ponytail: 편지지 공통 조각(띠·소인·QR·Sheet)은 아직 복제. 시안이 확정되면 AirmailV8 export 로 합친다.
 */
import type { ReactNode } from "react";
import { EnvelopeSheet, L } from "../EnvelopeSheet";

export type AdVariant = "a" | "b" | "c";

/** 광고주에게 받는 값. 로고는 지금은 SVG 워드마크(BrandMark)로 그린다. */
export type Sponsor = {
  name: string; // 오후세시 커피
  short: string; // 오후세시
  info: string; // 주소 · 영업시간 한 줄
  paperLine: string; // A 편지지 문구
  envelopeLine: string; // A 봉투 문구
  benefit: string; // C 혜택
  terms: string; // C 조건
  landingUrl: string;
};

export const AFTERNOON_3PM: Sponsor = {
  name: "오후세시 커피",
  short: "오후세시",
  info: "성수동 연무장길 · 매일 12시–21시",
  paperLine: "이 편지지는 오후세시 커피가 함께 만들었어요",
  envelopeLine: "이 봉투는 오후세시 커피가 함께 만들었어요",
  benefit: "편지를 가져오면 따뜻한 차 한 잔을 드려요",
  terms: "2026년 11월 30일까지 · 1인 1회",
  landingUrl: "https://letter.seoul.kr/ad/afternoon-3pm",
};

const BLEED = 3;
const C = {
  cream: "#F3EEE4",
  paper: "#FFFDF8",
  ink: "#2B2B2B",
  sub: "#5A524A",
  brick: "#B44A33",
  brickBand: "#C8553D",
  blue: "#3E6E8E",
  green: "#2F5D4A", // 광고주 브랜드색. 이 한 색만 광고에 쓴다
  dot: "#90A8B5",
  rule: "#8A7F72",
  line: "#D8CDBB",
};
const PEN = "'Nanum Pen Script', cursive";
const SERIF = "'Nanum Myeongjo', serif";
const ANTON = "Anton, 'Nanum Myeongjo', sans-serif";

/* ---------- 공통 조각 (AirmailV8 과 동일) ---------- */

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-ink`} x="-15%" y="-15%" width="130%" height="130%" primitiveUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0.45" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="11" result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.2 0 0 0 2.35" result="mask" />
        <feComposite in="d" in2="mask" operator="in" />
      </filter>
      {/* 라인 드로잉용: 펜 선이 약간 흔들리게만 */}
      <filter id={`${id}-pen`} x="-10%" y="-10%" width="120%" height="120%" primitiveUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0.35" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

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

function Postmark({ id, x, y, r = 11, color = C.brick, waves = true }: { id: string; x: number; y: number; r?: number; color?: string; waves?: boolean }) {
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

/** QR 판 28.5mm: 원본 600px 중 여백 73px → 코드 20.5mm + 여백 4mm */
function Qr({ x, y, src, url }: { x: number; y: number; src: string; url: string }) {
  return (
    <g>
      <rect x={x} y={y} width={28.5} height={28.5} rx={0.8} fill={C.paper} stroke={C.line} strokeWidth={0.25} />
      <image href={src} x={x + 0.7} y={y + 0.7} width={27.1} height={27.1}><title>{url}</title></image>
    </g>
  );
}

/** 여백을 잘라낸 QR 코드 20mm (쿠폰처럼 높이가 모자랄 때). 조용한 영역은 둘레 바탕이 맡는다. */
function QrTight({ x, y, src, url, size = 20 }: { x: number; y: number; src: string; url: string; size?: number }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="73 73 454 454">
      <image href={src} width={600} height={600}><title>{url}</title></image>
    </svg>
  );
}

function StampLabel({ x, y, w, h, color, children, size = 7 }: { x: number; y: number; w: number; h: number; color: string; children: ReactNode; size?: number }) {
  return (
    <g transform={`rotate(-2 ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} rx={0.8} fill="none" stroke={color} strokeWidth={0.8} />
      <text x={x + w / 2} y={y + h / 2 + size * 0.32} textAnchor="middle" fill={color} fontFamily={PEN} fontSize={size}>{children}</text>
    </g>
  );
}

function Sheet({ kind, w, h, children }: { kind: string; w: number; h: number; children: ReactNode }) {
  const pw = w + BLEED * 2;
  const ph = h + BLEED * 2;
  return (
    <div className="stn-wrap" data-kind={kind}>
      <style>{`
        @page stn-${kind} { size: ${pw}mm ${ph}mm; margin: 0; }
        .stn-wrap[data-kind="${kind}"] { page: stn-${kind}; }
        .stn-wrap { min-height: 100vh; background: #D9D3C8; display: flex; justify-content: center; align-items: center; padding: 32px; }
        .stn-wrap svg { display: block; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .stn-wrap > svg { box-shadow: 0 2px 14px rgba(43,43,43,.18); }
        @media print {
          html, body { background: none !important; margin: 0 !important; }
          .stn-wrap { min-height: 0; padding: 0; display: block; background: none; }
          .stn-wrap > svg { box-shadow: none; }
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

/* ---------- 광고주 조각 ---------- */

/** 로고 대용 워드마크: 3시를 가리키는 시계 + 오후세시(Pen) + 3PM(Anton). 브랜드색 한 색. */
function BrandMark({ x, y, size = 1, color = C.green }: { x: number; y: number; size?: number; color?: string }) {
  // y 는 글자 기준선. size 1 = 시계 지름 4.4mm
  const s = size;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <g fill="none" stroke={color} strokeWidth={0.42} strokeLinecap="round">
        <circle cx={2.2} cy={-1.5} r={2.2} />
        <line x1={2.2} y1={-1.5} x2={2.2} y2={-3.1} />
        <line x1={2.2} y1={-1.5} x2={3.4} y2={-1.5} />
      </g>
      <text x={5.4} y={0} fontFamily={PEN} fontSize={5.4}>{"오후세시"}</text>
      <text x={17.2} y={-0.2} fontFamily={ANTON} fontSize={2.3} letterSpacing={0.2}>3PM</text>
    </g>
  );
}

/** 커피잔 라인 드로잉(선만). 원점 = 잔 입구 왼쪽, 폭 12 단위. */
function Cup({ id, x, y, s = 1, color = C.green, steam = C.brick, bg = "none" }: { id: string; x: number; y: number; s?: number; color?: string; steam?: string; bg?: string }) {
  const sw = 0.45 / s;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id}-pen)`}>
      <g stroke={color} strokeWidth={sw}>
        <path d="M0 0 H12 V3.6 Q12 9.6 6 9.6 Q0 9.6 0 3.6 Z" fill={bg} />
        <path d="M12 1.6 q3.4 0 3.4 2.4 q0 2.6 -3.6 2.8" />
        <path d="M-2.4 11.2 Q6 12.6 14.4 11.2" />
      </g>
      <g stroke={steam} strokeWidth={sw * 0.8}>
        <path d="M3.8 -1.4 q-1.2 -1.6 0 -3.2 q1.2 -1.6 0 -3.2" />
        <path d="M7.6 -1.4 q-1.2 -1.6 0 -3.2 q1.2 -1.6 0 -3.2" />
      </g>
    </g>
  );
}

/** 창문 라인 드로잉: 사각 창 + 십자 창살 + 아치 */
function Window({ id, x, y, w, h, color = C.blue }: { id: string; x: number; y: number; w: number; h: number; color?: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={0.35} strokeLinecap="round" filter={`url(#${id}-pen)`}>
      <path d={`M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h}`} />
      <line x1={x + w / 2} x2={x + w / 2} y1={y} y2={y + h} />
      <line x1={x} x2={x + w} y1={y + h * 0.55} y2={y + h * 0.55} />
      <line x1={x - 1.5} x2={x + w + 1.5} y1={y + h} y2={y + h} />
    </g>
  );
}

/* ---------- 편지지 B5 ---------- */

const PAPER_W = 182;
const PAPER_H = 256;
const LINE_Y_PCT = [25.22, 30.83, 36.5, 42.14, 47.78, 53.42, 59.06, 64.67, 70.33, 76.0, 81.61];
const LINE_X0 = PAPER_W * 0.096;
const LINE_X1 = PAPER_W * 0.903;
const LAST_X0 = PAPER_W * 0.18;

/** 미리보기용 예시 손글씨. 인쇄 PDF 에는 넣지 않는다(sample=false). 줄 번호 → 글 */
const SAMPLE: Record<number, string> = {
  0: "지은에게",
  1: "지난번 같이 갔던 카페 기억나?",
  2: "창가 자리에서 오후 세시까지 얘기했던 날.",
  3: "그날 못 한 얘기를 여기 이어서 써 볼게.",
  10: "서른셋의 나",
};

type Common = { variant: AdVariant; sponsor?: Sponsor; qrSrc?: string; qrUrl?: string };

export function AdPaper({ variant, sponsor = AFTERNOON_3PM, qrSrc = "/stationery/letter_qr.png", qrUrl, sample = false }: Common & { sample?: boolean }) {
  const id = `ad-${variant}-paper`;
  const ys = LINE_Y_PCT.map((p) => (PAPER_H * p) / 100);
  const url = qrUrl ?? (variant === "c" ? sponsor.landingUrl : "https://letter.seoul.kr/");
  return (
    <Sheet kind={id} w={PAPER_W} h={PAPER_H}>
      <rect x={-BLEED} y={-BLEED} width={PAPER_W + BLEED * 2} height={PAPER_H + BLEED * 2} fill={C.cream} />
      <AirStripes id={`${id}-top`} x={-BLEED} y={-BLEED} w={PAPER_W + BLEED * 2} h={4 + BLEED} />
      <AirStripes id={`${id}-bottom`} x={-BLEED} y={PAPER_H - 4} w={PAPER_W + BLEED * 2} h={4 + BLEED} />

      <image href="/images/logo-image.png" x={58} y={15} width={26} height={17.4} />
      <text x={87} y={29.5} fill={C.ink} fontFamily={PEN} fontSize={13}>Letter</text>
      <text x={PAPER_W / 2} y={40} textAnchor="middle" fill={C.sub} fontFamily={SERIF} fontSize={3.4} letterSpacing={0.35}>letter.seoul.kr</text>
      <Postmark id={id} x={146} y={30} />

      {/* B: 상단 왼쪽, 매장 모티프 하나 (줄 영역 25% 위) */}
      {variant === "b" && (
        <g>
          <Cup id={id} x={20} y={24} s={1.25} />
          <text x={28} y={47} textAnchor="middle" fill={C.green} fontFamily={SERIF} fontSize={2.8}>{sponsor.name} · 성수</text>
        </g>
      )}

      <g stroke={C.dot} strokeWidth={0.5} strokeLinecap="round" strokeDasharray="0 1.6">
        {ys.map((y, i) => <line key={y} x1={i === 10 ? LAST_X0 : LINE_X0} x2={LINE_X1} y1={y} y2={y} />)}
      </g>
      <text x={LINE_X0 - 1.2} y={ys[0] - 0.8} textAnchor="end" fill={C.blue} fontFamily={PEN} fontSize={6.5}>To.</text>
      <text x={LINE_X0} y={ys[10] - 0.8} fill={C.blue} fontFamily={PEN} fontSize={6.5}>From.</text>

      {sample && (
        <g fill="#33302C" fontFamily={PEN} fontSize={8}>
          {Object.entries(SAMPLE).map(([i, t]) => (
            <text key={i} x={(Number(i) === 10 ? LAST_X0 : LINE_X0) + 2} y={ys[Number(i)] - 1.6}>{t}</text>
          ))}
        </g>
      )}

      {variant !== "c" ? (
        <g>
          <Qr x={LINE_X0} y={218} src={qrSrc} url={url} />
          <text x={LINE_X0 + 32} y={variant === "a" ? 230 : 234} fill={C.ink} fontFamily={SERIF} fontSize={3.6}>사연을 보내면 답장이 와요</text>
          <g transform="rotate(-2 146 231)" fill={C.blue} textAnchor="middle">
            <rect x={128} y={224} width={36} height={14} rx={0.8} fill="none" stroke={C.blue} strokeWidth={0.8} />
            <text x={146} y={230.2} fontFamily={ANTON} fontSize={4.2} letterSpacing={0.5}>BY AIR MAIL</text>
            <text x={146} y={235.6} fontFamily={PEN} fontSize={5}>항공우편 par avion</text>
          </g>
        </g>
      ) : null}

      {/* A: QR 옆 한 줄 협찬 표기 + 시계 아이콘(로고 자리) */}
      {variant === "a" && (
        <g>
          <g fill="none" stroke={C.green} strokeWidth={0.35} strokeLinecap="round">
            <circle cx={LINE_X0 + 33.6} cy={237.2} r={1.6} />
            <line x1={LINE_X0 + 33.6} y1={237.2} x2={LINE_X0 + 33.6} y2={236} />
            <line x1={LINE_X0 + 33.6} y1={237.2} x2={LINE_X0 + 34.5} y2={237.2} />
          </g>
          <text x={LINE_X0 + 36.6} y={238.2} fill={C.green} fontFamily={SERIF} fontSize={2.8}>{sponsor.paperLine}</text>
        </g>
      )}

      {/* C: 82% 줄 아래, 절취선으로 떼는 쿠폰 25mm */}
      {variant === "c" && (
        <g>
          <text x={LINE_X0} y={219} fill={C.ink} fontFamily={SERIF} fontSize={3.2}>사연을 보내면 답장이 와요 · letter.seoul.kr</text>
          <g transform="rotate(-2 146 216.5)" fill={C.blue} textAnchor="middle">
            <rect x={132} y={212} width={30} height={9} rx={0.8} fill="none" stroke={C.blue} strokeWidth={0.6} />
            <text x={147} y={218.2} fontFamily={ANTON} fontSize={3.6} letterSpacing={0.4}>BY AIR MAIL</text>
          </g>
          {/* 절취선: 재단까지 이어서 가위가 들어갈 자리를 만든다 */}
          <line x1={0} x2={PAPER_W} y1={225} y2={225} stroke={C.sub} strokeWidth={0.3} strokeDasharray="2 1.4" />
          <text x={PAPER_W - 6} y={223.6} textAnchor="end" fill={C.sub} fontFamily={SERIF} fontSize={2.2}>여기를 잘라 쓰세요</text>
          <rect x={14} y={226.5} width={154} height={23} rx={0.8} fill={C.paper} stroke={C.green} strokeWidth={0.35} />
          <QrTight x={17} y={228} src={qrSrc} url={url} />
          <BrandMark x={42} y={234} size={0.95} />
          <text x={42} y={241} fill={C.ink} fontFamily={SERIF} fontSize={3.7} fontWeight={700}>{sponsor.benefit}</text>
          <text x={42} y={246.4} fill={C.sub} fontFamily={SERIF} fontSize={2.6}>{sponsor.terms} · {sponsor.info}</text>
          <g transform="rotate(-3 153 237)">
            <rect x={143} y={230} width={20} height={14} rx={0.8} fill="none" stroke={C.green} strokeWidth={0.6} />
            <text x={153} y={236.2} textAnchor="middle" fill={C.green} fontFamily={ANTON} fontSize={3.4} letterSpacing={0.4}>COUPON</text>
            <text x={153} y={241.4} textAnchor="middle" fill={C.green} fontFamily={PEN} fontSize={4.2}>QR로 확인</text>
          </g>
        </g>
      )}
    </Sheet>
  );
}

/* ---------- 봉투 인쇄 시트 (원본 레이아웃 + 광고 조각) ---------- */

/** 광고 조각은 앞면 왼쪽 빈 칸(x 75~119, y 125~165: From 우편번호 아래, To 도장 왼쪽, QR 위)과 우표 아래에만 놓는다. */
export function AdEnvelope({ variant, sponsor = AFTERNOON_3PM, qrSrc = "/stationery/letter_qr.png", qrUrl = "https://letter.seoul.kr/" }: Common) {
  const id = `ad-${variant}-envelope`;
  const ad = `${id}-ad`;
  const { x: sx, y: sy, w: sw, h: sh } = L.stamp;
  const x0 = L.fromZip.x;
  const holes: { cx: number; cy: number }[] = [];
  for (let x = sx; x <= sx + sw + 0.01; x += sw / 12) holes.push({ cx: x, cy: sy }, { cx: x, cy: sy + sh });
  for (let y = sy; y <= sy + sh + 0.01; y += sh / 13) holes.push({ cx: sx, cy: y }, { cx: sx + sw, cy: y });
  /* B: 협찬 매장 우표. 창문(파랑) + 커피잔(녹색) + 김(벽돌) 라인 드로잉 */
  const shopStamp = (
    <g>
      <rect x={sx} y={sy} width={sw} height={sh} fill={C.paper} stroke="#E4DED3" strokeWidth={0.2} />
      <g fill="#FFFFFF">{holes.map((h, i) => <circle key={i} cx={h.cx} cy={h.cy} r={0.85} />)}</g>
      <rect x={sx + 2} y={sy + 2} width={sw - 4} height={sh - 4} fill="none" stroke={C.green} strokeWidth={0.35} />
      <Window id={ad} x={sx + 7} y={sy + 4} w={18} h={17} />
      <Cup id={ad} x={sx + 10.5} y={sy + 13.2} s={0.78} bg={C.paper} />
      <text x={sx + sw - 3.6} y={sy + 26.2} textAnchor="end" fill={C.green} fontFamily={PEN} fontSize={5}>{sponsor.short}</text>
      <text x={sx + sw - 3.6} y={sy + 30.4} textAnchor="end" fill={C.ink} fontFamily={ANTON} fontSize={2.6} letterSpacing={0.25}>SEONGSU <tspan fill={C.brick}>26</tspan></text>
      <Postmark id={ad} x={sx + 1} y={sy + sh + 1} r={9.5} color={C.ink} waves={false} />
    </g>
  );
  return (
    <EnvelopeSheet kind={id} qrSrc={qrSrc} qrUrl={qrUrl} stamp={variant === "b" ? shopStamp : undefined}>
      <Defs id={ad} />
      {variant === "b" && (
        <text x={sx + sw} y={sy + sh + 14} textAnchor="end" fill={C.green} fontFamily={SERIF} fontSize={2.3}>{sponsor.info}</text>
      )}
      {/* A: 조용한 협찬 한 줄 + 주소 */}
      {variant === "a" && (
        <g>
          <g fill="none" stroke={C.green} strokeWidth={0.3} strokeLinecap="round">
            <circle cx={x0 + 1.3} cy={156.4} r={1.3} />
            <line x1={x0 + 1.3} y1={156.4} x2={x0 + 1.3} y2={155.4} />
            <line x1={x0 + 1.3} y1={156.4} x2={x0 + 2} y2={156.4} />
          </g>
          <text x={x0 + 3.6} y={157.3} fill={C.green} fontFamily={SERIF} fontSize={2.3}>{sponsor.envelopeLine}</text>
          <text x={x0 + 3.6} y={161.1} fill={C.sub} fontFamily={SERIF} fontSize={2.1}>{sponsor.info}</text>
        </g>
      )}
      {/* C: 선물이 들었다는 한 줄. 쿠폰 문구는 봉투에 쓰지 않는다 */}
      {variant === "c" && (
        <g>
          <StampLabel x={x0} y={129} w={44} h={9.5} color={C.green} size={5.6}>작은 선물이 함께 들었어요</StampLabel>
          <BrandMark x={x0 + 1} y={146} size={0.62} />
        </g>
      )}
    </EnvelopeSheet>
  );
}
