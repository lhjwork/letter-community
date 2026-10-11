import { RecipientAddressInput } from "@/types/recipient";

// 클라이언트와 서버 모두에서 사용 가능하도록 NEXT_PUBLIC_ 환경 변수 사용
// 서버 사이드에서는 BACKEND_URL도 fallback으로 사용
// 브라우저에서 환경 변수가 없으면 같은 오리진("")으로 요청 → nginx가 /api/ 를 백엔드로 프록시
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window === "undefined" ? process.env.BACKEND_URL : "");

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

/**
 * 백엔드 API 호출 유틸리티
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
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

  if (BACKEND_URL === undefined) {
    throw new Error("Backend URL is not configured");
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...restOptions,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    // 백엔드 토큰이 거부되면 헤더만 로그인 상태로 남는 일이 없도록 세션을 끊는다
    if (response.status === 401 && token && typeof window !== "undefined") {
      const { handleTokenExpiration } = await import("./auth-utils");
      await handleTokenExpiration();
    }
    const error = await response.json().catch(() => ({
      message: "Unknown error occurred",
    }));
    throw new Error(error.message || error.error || `API Error: ${response.status}`);
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
  data: { name?: string; email?: string; image?: string },
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
  },
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
 * 사연 등록 (story)
 * 백엔드 엔드포인트: POST /api/letters (type: "story")
 */
export async function createStory(
  data: {
    title: string;
    content: string;
    authorName: string;
    ogTitle?: string;
    ogPreviewText?: string;
    category?: string;
    contentType?: "text" | "html";
    envelope?: "seongsu" | "myeongdong";
    isAnonymous?: boolean;
    recipientName?: string;
  },
  token?: string,
): Promise<{ data: { _id: string } }> {
  return apiRequest("/api/letters", {
    method: "POST",
    token,
    body: JSON.stringify({
      ...data,
      type: "story",
    }),
  });
}

/**
 * 편지 생성 (URL 공유용)
 * 백엔드 엔드포인트: POST /api/letters/create
 */
export async function createLetter(
  data: {
    title: string;
    content: string;
    type: "friend" | "story";
    ogTitle?: string;
    ogPreviewText?: string;
    authorName?: string; // 사연용
    category?: string;
    contentType?: "text" | "html";
    envelope?: "seongsu" | "myeongdong";
    isAnonymous?: boolean;
    recipientName?: string;
    recipientAddresses?: RecipientAddressInput[]; // 수신자 주소 목록
    replyToId?: string; // 사연 답장인 경우 원본 사연 ID
  },
  token?: string,
): Promise<{
  message: string;
  data: {
    _id: string;
    title: string;
    url: string;
    type: string;
    createdAt: string;
  };
}> {
  return apiRequest("/api/letters/create", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export interface StoryReply {
  _id: string;
  title: string;
  ogPreviewText?: string;
  plainContent?: string;
  /** 익명 답장은 "익명" */
  authorName: string;
  isAnonymous?: boolean;
  /** 작성자가 레터(관리자) 계정 */
  isAdminReply: boolean;
  /** 관리자가 채택해 사연자에게 전해지는 답장 */
  isAdopted: boolean;
  createdAt: string;
}

/**
 * 사연에 달린 답장 목록 조회
 */
export async function getStoryReplies(
  storyId: string,
): Promise<{ data: StoryReply[] }> {
  return apiRequest(`/api/letters/${storyId}/replies`, {
    method: "GET",
    cache: "no-store",
  });
}

// === 사연 댓글 ===
export const COMMENT_MAX = 100;
export const COMMENT_PAGE = 5;

export interface StoryComment {
  _id: string;
  nickname: string;
  content: string;
  createdAt: string;
  isMine: boolean;
}

export interface CommentsResponse {
  success: boolean;
  data: { items: StoryComment[]; total: number; hasNextPage: boolean };
}

/** 댓글 목록 (오래된 순, 기본 5개). 토큰이 있으면 isMine 이 계산된다 */
export async function getComments(letterId: string, page = 1, token?: string): Promise<CommentsResponse> {
  return apiRequest(`/api/letters/${letterId}/comments?page=${page}&limit=${COMMENT_PAGE}`, { method: "GET", cache: "no-store", token });
}

export async function createComment(letterId: string, content: string, token: string): Promise<{ data: { _id: string; createdAt: string } }> {
  return apiRequest(`/api/letters/${letterId}/comments`, { method: "POST", token, body: JSON.stringify({ content }) });
}

export async function deleteComment(letterId: string, commentId: string, token: string): Promise<{ success: boolean }> {
  return apiRequest(`/api/letters/${letterId}/comments/${commentId}`, { method: "DELETE", token });
}

/**
 * 편지 상세 조회
 */
export async function getLetter(letterId: string): Promise<{
  success: boolean;
  data: {
    _id: string;
    title?: string;
    content?: string;
    contentType?: "text" | "html";
    category?: string;
    envelope?: "seongsu" | "myeongdong";
    isAnonymous?: boolean;
    recipientName?: string;
    isPublic?: boolean;
    type?: string;
  };
}> {
  return apiRequest(`/api/letters/${letterId}`, {
    method: "GET",
  });
}

// === S3 무료 서비스 종료로 이미지 관련 기능 비활성화 ===
// /**
//  * OG 이미지 업로드 (커스텀)
//  */
// export async function uploadOgImage(formData: FormData) {
//   const response = await fetch(`${BACKEND_URL}/api/og/upload`, {
//     method: "POST",
//     body: formData,
//   });
//
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({
//       message: "Unknown error occurred",
//     }));
//     throw new Error(error.message || error.error || `API Error: ${response.status}`);
//   }
//
//   return response.json();
// }
//
// /**
//  * OG 이미지 자동 생성 기록
//  */
// export async function recordAutoOgImage(letterId: string, ogImageUrl: string) {
//   return apiRequest("/api/og/auto-generate", {
//     method: "PATCH",
//     body: JSON.stringify({ letterId, ogImageUrl }),
//   });
// }
//
// /**
//  * OG 이미지 URL 조회
//  */
// export async function getOgImageUrl(letterId: string) {
//   return apiRequest(`/api/og/${letterId}`, {
//     method: "GET",
//   });
// }

export interface Letter {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  ogPreviewMessage?: string;
  ogBgColor?: string;
  ogIllustration?: string;
  ogFontSize?: number;
  // AI 분류 필드
  category?: string;
  aiMetadata?: {
    confidence: number;
    reason: string;
    tags: string[];
    classifiedAt: string;
    model: string;
  };
}

export interface GetMyLettersResponse {
  success: boolean;
  data: Letter[];
  pagination: Pagination;
}

/**
 * 내가 쓴 편지 목록 조회 (페이지네이션 지원)
 */
export async function getMyLetters(
  token: string,
  params?: { page?: number; limit?: number },
): Promise<GetMyLettersResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const endpoint =
    params && (params.page || params.limit)
      ? `/api/letters/my?${queryParams.toString()}`
      : "/api/letters/my";

  return apiRequest<GetMyLettersResponse>(endpoint, {
    method: "GET",
    token,
  });
}

/**
 * 내 사연 목록 조회
 */
export async function getMyStories(
  token: string,
  params?: { page?: number; limit?: number; search?: string; category?: string },
): Promise<StoriesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.category) queryParams.append("category", params.category);

  const qs = queryParams.toString();
  const endpoint = qs ? `/api/letters/my/stories?${qs}` : "/api/letters/my/stories";

  return apiRequest<StoriesResponse>(endpoint, {
    method: "GET",
    token,
  });
}

/**
 * 편지/사연 수정 (작성자 본인만)
 */
export async function updateLetter(
  letterId: string,
  data: {
    title?: string;
    content?: string;
    category?: string;
    contentType?: "text" | "html";
    envelope?: "seongsu" | "myeongdong";
    isAnonymous?: boolean;
    recipientName?: string;
    isPublic?: boolean;
    ogTitle?: string;
    ogPreviewText?: string;
  },
  token: string,
): Promise<{ success: boolean; data: { _id: string } }> {
  return apiRequest(`/api/letters/${letterId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

/**
 * 편지 삭제
 */
export async function deleteLetter(
  letterId: string,
  token: string,
): Promise<void> {
  return apiRequest(`/api/letters/${letterId}`, {
    method: "DELETE",
    token,
  });
}

// 사연 관련 타입
export interface Story {
  _id: string;
  type: "story";
  title?: string;
  content?: string;
  authorName?: string;
  recipientName?: string;
  category?: string;
  status?: string;
  viewCount?: number;
  likeCount?: number;
  /** 숨김·삭제 제외 답장 수 (featured·목록 응답에 실림) */
  replyCount?: number;
  /** 댓글 수 (목록·상세 응답에 실림) */
  commentCount?: number;
  /** 목록 응답: plainContent 앞 80자. content 는 실리지 않는다 */
  preview?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StoriesResponse {
  success: boolean;
  data: Story[];
  pagination: Pagination;
}

export type SortOption = "latest" | "oldest" | "popular";

export interface GetStoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: SortOption;
  category?: string;
}

/**
 * 사연 목록 조회 (공개 사연만)
 */
export async function getStories(
  params?: GetStoriesParams,
): Promise<StoriesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sort) queryParams.append("sort", params.sort);
  if (params?.category) queryParams.append("category", params.category);

  return apiRequest(`/api/letters/stories?${queryParams.toString()}`, {
    method: "GET",
  });
}

/**
 * 메인 랜딩 페이지용 추천 사연 조회 (최신 4개)
 */
export async function getFeaturedStories(): Promise<{
  success: boolean;
  data: Story[];
}> {
  // 홈은 매 요청 렌더링하되 이 fetch 결과를 60초 캐시 (빌드 시 빈 결과가 굳는 문제 방지)
  return apiRequest("/api/letters/stories/featured", {
    method: "GET",
    next: { revalidate: 60 },
  });
}

// 좋아요 관련 타입
export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}

export interface LikeResponse {
  success: boolean;
  message?: string;
  data: LikeStatus;
}

export interface MyLikesResponse {
  success: boolean;
  data: Story[];
  pagination: Pagination;
}

/**
 * 좋아요 추가
 */
export async function addLike(
  letterId: string,
  token: string,
): Promise<LikeResponse> {
  return apiRequest(`/api/letters/${letterId}/like`, {
    method: "POST",
    token,
  });
}

/**
 * 좋아요 취소
 */
export async function removeLike(
  letterId: string,
  token: string,
): Promise<LikeResponse> {
  return apiRequest(`/api/letters/${letterId}/like`, {
    method: "DELETE",
    token,
  });
}

/**
 * 좋아요 상태 확인
 */
export async function checkLikeStatus(
  letterId: string,
  token: string,
): Promise<LikeResponse> {
  return apiRequest(`/api/letters/${letterId}/like`, {
    method: "GET",
    token,
  });
}

/**
 * 내가 좋아요한 목록 조회
 */
export async function getMyLikes(
  token: string,
  params?: { page?: number; limit?: number },
): Promise<MyLikesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  return apiRequest(`/api/users/me/likes?${queryParams.toString()}`, {
    method: "GET",
    token,
  });
}
