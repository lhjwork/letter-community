import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "letter_session";
const VISITOR_KEY = "letter_visitor";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분

export interface SessionInfo {
  sessionId: string;
  visitorId: string;
  isNewVisitor: boolean;
  visitCount: number;
  startedAt: number;
}

export function getOrCreateSession(): SessionInfo {
  if (typeof window === "undefined") {
    return {
      sessionId: "server",
      visitorId: "server",
      isNewVisitor: false,
      visitCount: 0,
      startedAt: Date.now(),
    };
  }

  // 방문자 정보 (영구 저장)
  const visitorData = localStorage.getItem(VISITOR_KEY);
  let visitorId: string;
  let visitCount: number;
  let isNewVisitor = false;

  if (visitorData) {
    const parsed = JSON.parse(visitorData);
    visitorId = parsed.visitorId;
    visitCount = parsed.visitCount;
  } else {
    visitorId = uuidv4();
    visitCount = 0;
    isNewVisitor = true;
  }

  // 세션 정보 (세션 스토리지)
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  let sessionId: string;
  let startedAt: number;

  if (sessionData) {
    const parsed = JSON.parse(sessionData);
    const now = Date.now();

    // 세션 타임아웃 체크
    if (now - parsed.lastActivity > SESSION_TIMEOUT) {
      // 새 세션 시작
      sessionId = uuidv4();
      startedAt = now;
      visitCount += 1;
    } else {
      sessionId = parsed.sessionId;
      startedAt = parsed.startedAt;
    }
  } else {
    // 새 세션
    sessionId = uuidv4();
    startedAt = Date.now();
    visitCount += 1;
  }

  // 저장
  localStorage.setItem(VISITOR_KEY, JSON.stringify({ visitorId, visitCount }));
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      sessionId,
      startedAt,
      lastActivity: Date.now(),
    })
  );

  return {
    sessionId,
    visitorId,
    isNewVisitor,
    visitCount,
    startedAt,
  };
}

export function updateSessionActivity(): void {
  if (typeof window === "undefined") return;

  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (sessionData) {
    const parsed = JSON.parse(sessionData);
    parsed.lastActivity = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
  }
}
