import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getDrafts, deleteDraft, publishDraft } from "@/lib/draft-api";
import { DraftLetter } from "@/types/draft";

export function useDraftManagement() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // JWT 토큰 획득
  const getToken = useCallback((): string | null => {
    // NextAuth 세션에서 백엔드 토큰 가져오기
    if (session?.backendToken) {
      return session.backendToken;
    }

    // localStorage에서 토큰 가져오기 (fallback)
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }

    return null;
  }, [session?.backendToken]);

  const handleDeleteDraft = useCallback(
    async (draftId: string): Promise<boolean> => {
      const token = getToken();

      if (!token) {
        setError("로그인이 필요합니다.");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await deleteDraft(token, draftId);
        if (response.success) {
          return true;
        } else {
          setError("삭제에 실패했습니다.");
          return false;
        }
      } catch (err) {
        let errorMessage = "삭제 중 오류가 발생했습니다.";

        if (err instanceof Error) {
          if (err.message.includes("Authentication required")) {
            errorMessage = "로그인이 필요합니다.";
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const handlePublishDraft = useCallback(
    async (draftId: string): Promise<{ success: boolean; url?: string }> => {
      const token = getToken();

      if (!token) {
        setError("로그인이 필요합니다.");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return { success: false };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await publishDraft(token, draftId);
        if (response.success) {
          return { success: true, url: response.data.url };
        } else {
          setError("발행에 실패했습니다.");
          return { success: false };
        }
      } catch (err) {
        let errorMessage = "발행 중 오류가 발생했습니다.";

        if (err instanceof Error) {
          if (err.message.includes("Authentication required")) {
            errorMessage = "로그인이 필요합니다.";
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const fetchDrafts = useCallback(
    async (
      params: {
        page?: number;
        limit?: number;
        sort?: "latest" | "oldest" | "wordCount";
        type?: "all" | "friend" | "story";
      } = {}
    ) => {
      const token = getToken();

      if (!token) {
        setError("로그인이 필요합니다.");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getDrafts(token, params);
        if (response.success) {
          return response.data;
        } else {
          setError("목록 조회에 실패했습니다.");
          return null;
        }
      } catch (err) {
        let errorMessage = "목록 조회 중 오류가 발생했습니다.";

        if (err instanceof Error) {
          if (err.message.includes("Authentication required")) {
            errorMessage = "로그인이 필요합니다.";
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  return {
    loading,
    error,
    handleDeleteDraft,
    handlePublishDraft,
    fetchDrafts,
    clearError: () => setError(null),
  };
}
