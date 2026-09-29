/**
 * Google Analytics 4 래퍼.
 *
 * - 이벤트 이름/파라미터를 타입으로 고정해 오타·불일치를 막는다.
 * - GA_ID 미설정(로컬 등)이면 모든 호출이 no-op이라 어디서든 안전하게 부를 수 있다.
 * - 이벤트 목록/의미는 docs/analytics.md 참고.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const GA_ENABLED = GA_ID.length > 0;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type LetterType = "story" | "friend";
export type LoginProvider = "kakao" | "naver" | "instagram";

/** 이벤트 카탈로그. 키 = GA 이벤트명, 값 = 파라미터. */
export interface AnalyticsEvents {
  // ── 인증 ──────────────────────────────────────────────
  /** 로그인 모달이 열림. from = 어느 동선에서 요구됐는지 */
  login_dialog_open: { from: string };
  /** SNS 로그인 버튼 클릭(리다이렉트 직전) */
  login_start: { method: LoginProvider };
  /** GA 권장 이벤트. 세션이 authenticated로 바뀐 첫 순간 1회 */
  login: { method: string };
  logout: Record<string, never>;

  // ── 콘텐츠 작성 ───────────────────────────────────────
  letter_create: { letter_type: "friend"; is_reply: boolean; is_public: boolean; content_length: number };
  story_create: { letter_type: "story"; category: string; is_public: boolean; content_length: number };
  letter_update: { letter_type: LetterType; letter_id: string };
  letter_delete: { letter_type: LetterType; letter_id: string };
  draft_save: { letter_type: string; is_new: boolean };
  /** 등록 직전 맞춤법 교정 모달이 떴을 때 */
  proofread_shown: { correction_count: number };
  /** 교정 모달에서 등록 확정. selected_count 0이면 "그대로 등록" */
  proofread_confirm: { correction_count: number; selected_count: number };

  // ── 콘텐츠 소비 ───────────────────────────────────────
  letter_view: { letter_type: LetterType; letter_id: string; is_author: boolean };
  /** 봉투 애니메이션을 열어 편지 본문을 실제로 봄 */
  envelope_open: { letter_id: string };
  like: { letter_id: string; letter_type?: LetterType; action: "add" | "remove" };
  share: { method: "kakao" | "copy_link"; content_type: LetterType | "unknown"; item_id?: string };
  story_filter: { search: string; category: string; sort: string };

  // ── 실물 편지 ─────────────────────────────────────────
  physical_request: { letter_id: string; anonymous: boolean; is_duplicate?: boolean };

  // ── AI 기능 ───────────────────────────────────────────
  ai_chat_open: Record<string, never>;
  /** message_index = 이 세션에서 몇 번째 사용자 메시지인지(1부터) */
  ai_chat_message: { message_index: number };
  daily_prompt_write_click: { logged_in: boolean };

  // ── CTA ───────────────────────────────────────────────
  write_cta_click: { from: string; logged_in: boolean };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || !GA_ENABLED) return;
  window.dataLayer = window.dataLayer ?? [];
  // gtag.js 로드 전에도 dataLayer에 쌓아두면 로드 후 순서대로 처리된다.
  if (window.gtag) window.gtag(...args);
  else window.dataLayer.push(args);
}

/** 커스텀 이벤트 전송 */
export function track<E extends AnalyticsEventName>(event: E, params: AnalyticsEvents[E]) {
  gtag("event", event, params);
}

/** 라우트 전환 페이지뷰. GoogleAnalytics 컴포넌트에서만 호출 */
export function pageview(url: string) {
  gtag("event", "page_view", { page_path: url, page_location: window.location.href, page_title: document.title });
}

/** 로그인 사용자 식별. 로그아웃 시 null */
export function setUser(user: { id: string; provider?: string } | null) {
  gtag("set", "user_id", user?.id ?? null);
  gtag("set", "user_properties", {
    login_provider: user?.provider ?? "guest",
    is_logged_in: user ? "yes" : "no",
  });
}
