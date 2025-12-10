const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

/**
 * 백엔드 API 호출 유틸리티
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, headers, ...restOptions } = options;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 추가 헤더 병합
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        defaultHeaders[key] = value;
      }
    });
  }

  // 백엔드 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...restOptions,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Unknown error occurred",
    }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(token: string) {
  return apiRequest("/api/users/me", {
    method: "GET",
    token,
  });
}

/**
 * 사용자 정보 업데이트
 */
export async function updateUser(
  token: string,
  data: { name?: string; email?: string; image?: string }
) {
  return apiRequest("/api/users/me", {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

/**
 * OAuth 계정 연결
 */
export async function linkOAuthAccount(
  token: string,
  data: {
    provider: string;
    providerId: string;
    accessToken?: string;
    refreshToken?: string;
    profile?: Record<string, unknown>;
  }
) {
  return apiRequest("/api/users/me/oauth/link", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

/**
 * OAuth 계정 연결 해제
 */
export async function unlinkOAuthAccount(token: string, provider: string) {
  return apiRequest(`/api/users/me/oauth/${provider}`, {
    method: "DELETE",
    token,
  });
}

export { BACKEND_URL };

/**
 * 편지 등록
 */
export async function createLetter(
  data: {
    title: string;
    content: string;
    authorName: string;
  },
  token?: string
) {
  return apiRequest("/api/letters", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}
