/**
 * 익명 사용자 세션 ID 관리
 * 로그인하지 않은 사용자를 식별하기 위한 고유 ID 생성 및 관리
 */

const SESSION_ID_KEY = "anonymous_session_id";
const SESSION_ID_EXPIRY_KEY = "anonymous_session_id_expiry";
const SESSION_EXPIRY_DAYS = 30; // 30일

/**
 * 고유한 SessionId 생성
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * SessionId 저장
 */
export function saveSessionId(sessionId: string): void {
  try {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + SESSION_EXPIRY_DAYS);
    localStorage.setItem(SESSION_ID_EXPIRY_KEY, expiryDate.toISOString());
  } catch (error) {
    console.error("SessionId 저장 실패:", error);
  }
}

/**
 * SessionId 조회 (없으면 새로 생성)
 */
export function getOrCreateSessionId(): string {
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    const expiryStr = localStorage.getItem(SESSION_ID_EXPIRY_KEY);

    // SessionId가 없거나 만료된 경우
    if (!sessionId || !expiryStr) {
      const newSessionId = generateSessionId();
      saveSessionId(newSessionId);
      return newSessionId;
    }

    // 만료 여부 확인
    const expiry = new Date(expiryStr);
    if (new Date() > expiry) {
      const newSessionId = generateSessionId();
      saveSessionId(newSessionId);
      return newSessionId;
    }

    return sessionId;
  } catch (error) {
    console.error("SessionId 조회 실패:", error);
    const newSessionId = generateSessionId();
    saveSessionId(newSessionId);
    return newSessionId;
  }
}

/**
 * SessionId 조회 (없으면 null)
 */
export function getSessionId(): string | null {
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    const expiryStr = localStorage.getItem(SESSION_ID_EXPIRY_KEY);

    if (!sessionId || !expiryStr) {
      return null;
    }

    // 만료 여부 확인
    const expiry = new Date(expiryStr);
    if (new Date() > expiry) {
      clearSessionId();
      return null;
    }

    return sessionId;
  } catch (error) {
    console.error("SessionId 조회 실패:", error);
    return null;
  }
}

/**
 * SessionId 삭제
 */
export function clearSessionId(): void {
  try {
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(SESSION_ID_EXPIRY_KEY);
  } catch (error) {
    console.error("SessionId 삭제 실패:", error);
  }
}

/**
 * SessionId 갱신 (만료 시간 연장)
 */
export function refreshSessionId(): void {
  try {
    const sessionId = getSessionId();
    if (sessionId) {
      saveSessionId(sessionId);
    }
  } catch (error) {
    console.error("SessionId 갱신 실패:", error);
  }
}
