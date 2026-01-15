import { RecipientAddressInput } from "@/types/recipient";

// 클라이언트와 서버 모두에서 사용 가능하도록 NEXT_PUBLIC_ 환경 변수 사용
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
    category?: string; // AI 분류 카테고리
    aiMetadata?: {
      confidence: number;
      reason: string;
      tags: string[];
      classifiedAt: string;
      model: string;
    };
  },
  token?: string
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
    category?: string; // 사연용 AI 분류 카테고리
    recipientAddresses?: RecipientAddressInput[]; // 수신자 주소 목록
    aiMetadata?: {
      confidence: number;
      reason: string;
      tags: string[];
      classifiedAt: string;
      model: string;
    };
  },
  token?: string
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

/**
 * 편지 상세 조회
 */
export async function getLetter(letterId: string) {
  return apiRequest(`/api/letters/${letterId}`, {
    method: "GET",
  });
}

/**
 * OG 이미지 업로드 (커스텀)
 */
export async function uploadOgImage(formData: FormData) {
  const response = await fetch(`${BACKEND_URL}/api/og/upload`, {
    method: "POST",
    body: formData,
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
 * OG 이미지 자동 생성 기록
 */
export async function recordAutoOgImage(letterId: string, ogImageUrl: string) {
  return apiRequest("/api/og/auto-generate", {
    method: "PATCH",
    body: JSON.stringify({ letterId, ogImageUrl }),
  });
}

/**
 * OG 이미지 URL 조회
 */
export async function getOgImageUrl(letterId: string) {
  return apiRequest(`/api/og/${letterId}`, {
    method: "GET",
  });
}

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
  params?: { page?: number; limit?: number }
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
 * 편지 삭제
 */
export async function deleteLetter(
  letterId: string,
  token: string
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
  category?: string;
  status?: string;
  viewCount?: number;
  likeCount?: number;
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

export interface CategoryStats {
  total: number;
  categories: {
    category: string;
    count: number;
    percentage: string;
  }[];
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
  params?: GetStoriesParams
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
 * 카테고리 통계 조회
 */
export async function getCategoryStats(): Promise<{
  success: boolean;
  data: CategoryStats;
}> {
  return apiRequest("/api/letters/categories/stats", {
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
  return apiRequest("/api/letters/stories/featured", {
    method: "GET",
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
  token: string
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
  token: string
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
  token: string
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
  params?: { page?: number; limit?: number }
): Promise<MyLikesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  return apiRequest(`/api/users/me/likes?${queryParams.toString()}`, {
    method: "GET",
    token,
  });
}
