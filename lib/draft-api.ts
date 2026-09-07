import { DraftLetter, DraftListResponse, DraftSaveRequest, DraftPublishRequest } from "@/types/draft";
import { handleTokenExpiration, checkAuthError } from "./auth-utils";

// API Base URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

// 임시저장 생성/수정
export async function saveDraft(token: string, data: DraftSaveRequest): Promise<{ success: boolean; data: DraftLetter }> {
  const endpoint = data.draftId ? `${API_BASE_URL}/api/drafts/${data.draftId}` : `${API_BASE_URL}/api/drafts`;
  const method = data.draftId ? "PUT" : "POST";

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    await checkAuthError(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Save draft error:", error);
    if (error instanceof Error && error.message === "Authentication expired") {
      throw error; // 인증 에러는 상위로 전파
    }
    throw error;
  }
}

// 임시저장 목록 조회
export async function getDrafts(
  token: string,
  params: {
    page?: number;
    limit?: number;
    sort?: "latest" | "oldest" | "wordCount";
    type?: "all" | "friend" | "story";
  } = {}
): Promise<DraftListResponse> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/drafts?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await checkAuthError(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get drafts error:", error);
    if (error instanceof Error && error.message === "Authentication expired") {
      throw error; // 인증 에러는 상위로 전파
    }
    throw error;
  }
}

// 임시저장 상세 조회
export async function getDraft(token: string, draftId: string): Promise<{ success: boolean; data: DraftLetter }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/drafts/${draftId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await checkAuthError(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get draft error:", error);
    if (error instanceof Error && error.message === "Authentication expired") {
      throw error; // 인증 에러는 상위로 전파
    }
    throw error;
  }
}

// 임시저장 삭제
export async function deleteDraft(token: string, draftId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/drafts/${draftId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await checkAuthError(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Delete draft error:", error);
    if (error instanceof Error && error.message === "Authentication expired") {
      throw error; // 인증 에러는 상위로 전파
    }
    throw error;
  }
}

// 임시저장 → 정식 발행
export async function publishDraft(token: string, draftId: string, data?: DraftPublishRequest): Promise<{ success: boolean; data: { letterId: string; url: string; draftId: string } }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/drafts/${draftId}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    await checkAuthError(response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Publish draft error:", error);
    if (error instanceof Error && error.message === "Authentication expired") {
      throw error; // 인증 에러는 상위로 전파
    }
    throw error;
  }
}


