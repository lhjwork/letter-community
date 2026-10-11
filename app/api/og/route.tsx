import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const C = { bg: "#F3EEE4", paper: "#FFFDF8", rule: "#D8CDBB", ink: "#2B2B2B", ink2: "#5A524A", brick: "#B44A33", blue: "#3E6E8E", band: "#C8553D" };

const KIND = {
  friend: { stamp: "마음 편지", color: C.blue },
  story: { stamp: "사연 편지", color: C.brick },
  reply: { stamp: "답장", color: C.blue },
} as const;

/** Google Fonts 에서 이 이미지에 쓰는 글자만 잘라 받는다(한글 전체 폰트는 수 MB). 실패하면 null → 기본 글꼴 */
async function loadFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** 항공우편 띠(파랑·흰·벽돌·흰 사선). satori 는 repeating-linear-gradient 가 불안정해 조각을 그린다 */
function Band({ top }: { top: boolean }) {
  const stripes = [C.blue, "#FFFFFF", C.band, "#FFFFFF"];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, [top ? "top" : "bottom"]: 0, height: 16, display: "flex", overflow: "hidden" }}>
      {Array.from({ length: 80 }, (_, i) => (
        <div key={i} style={{ width: 18, height: 40, marginTop: -12, flexShrink: 0, background: stripes[i % 4], transform: "skewX(-45deg)" }} />
      ))}
    </div>
  );
}

/**
 * OG 이미지(v8): 항공우편 띠 + 괘선 종이 + 스탬프·소인 + 제목·본문 두 줄
 * URL: /api/og?text=<본문 앞부분>&title=<제목>&kind=friend|story|reply&to=<받는 사람>
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const text = (q.get("text") || "편지로 마음을 전하는 특별한 공간").slice(0, 90);
  // 펜체 58px 로 한 줄에 약 24자. 넘으면 말줄임(satori 는 textOverflow 를 안정적으로 지원하지 않음)
  const rawTitle = q.get("title") || "";
  const title = rawTitle.length > 24 ? `${rawTitle.slice(0, 23)}…` : rawTitle;
  const to = (q.get("to") || "").slice(0, 20);
  const kind = KIND[(q.get("kind") as keyof typeof KIND) || "friend"] ?? KIND.friend;
  const origin = process.env.NEXT_PUBLIC_URL || request.nextUrl.origin;

  const penText = `${title}${to}To.Letter${kind.stamp}답장이 있는 편지 플랫폼`;
  const [pen, myeongjo] = await Promise.all([loadFont("Nanum+Pen+Script", penText), loadFont("Nanum+Myeongjo", text)]);
  const fonts = [
    ...(pen ? [{ name: "Pen", data: pen, weight: 400 as const, style: "normal" as const }] : []),
    ...(myeongjo ? [{ name: "Myeongjo", data: myeongjo, weight: 400 as const, style: "normal" as const }] : []),
  ];

  try {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: C.bg }}>
          <Band top />
          <Band top={false} />

          {/* 종이: 괘선 36px 리듬, 살짝 기울임, 아래로 겹친 종이 그림자 */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              width: 1000,
              height: 448,
              padding: "64px 72px 0",
              background: C.paper,
              border: `1px solid ${C.rule}`,
              boxShadow: "0 10px 0 -4px #E3DACB, 0 20px 0 -8px #EAE2D3",
              transform: "rotate(-0.6deg)",
            }}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 63 + i * 36 + 36, height: 1, background: C.rule }} />
            ))}

            <div style={{ position: "absolute", top: -22, left: 40, display: "flex", padding: "6px 16px", border: `4px solid ${kind.color}`, borderRadius: 4, background: C.paper, color: kind.color, fontFamily: "Pen", fontSize: 34, transform: "rotate(-2deg)" }}>
              {kind.stamp}
            </div>
            {/* 소인: satori 는 border double 미지원 → 원 두 개 */}
            <div style={{ position: "absolute", top: 32, right: 44, width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.blue}`, borderRadius: 48, opacity: 0.75, transform: "rotate(12deg)" }}>
              <div style={{ width: 84, height: 84, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.blue}`, borderRadius: 42, color: C.blue, fontSize: 15, letterSpacing: 2 }}>LETTER</div>
            </div>

            {to && <div style={{ display: "flex", height: 36, alignItems: "flex-end", fontFamily: "Pen", fontSize: 34, color: C.brick }}>To. {to}</div>}
            {title && (
              <div style={{ display: "flex", marginTop: to ? 6 : 0, height: 66, alignItems: "flex-end", fontFamily: "Pen", fontSize: 58, color: C.ink, maxWidth: 760, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {title}
              </div>
            )}
            <div style={{ display: "flex", marginTop: 30, fontFamily: "Myeongjo", fontSize: 30, lineHeight: "72px", color: C.ink2, maxWidth: 856, maxHeight: 144, overflow: "hidden" }}>{text}</div>
          </div>

          {/* 브랜드: 오른쪽 아래 */}
          <div style={{ position: "absolute", right: 64, bottom: 36, display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${origin}/v8/logo.png`} width={60} height={40} alt="" style={{ objectFit: "contain" }} />
            <span style={{ fontFamily: "Pen", fontSize: 40, color: C.ink }}>Letter</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: fonts.length ? fonts : undefined },
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
