import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { saveDraft } from "@/lib/draft-api";
import { DraftSaveState } from "@/types/draft";

interface UseDraftManualSaveProps {
  content: string;
  title?: string;
  type?: "friend" | "story";
  category?: string;
  draftId?: string;
  onSave?: (draftId: string) => void;
  onError?: (error: string) => void;
}

export function useDraftManualSave({ content, title, type, category, draftId, onSave, onError }: UseDraftManualSaveProps) {
  const { data: session } = useSession();
  const [saveState, setSaveState] = useState<DraftSaveState>({
    status: "idle",
    lastSavedAt: null,
    saveCount: 0,
  });

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

  // 수동 저장 함수
  const manualSave = useCallback(async () => {
    const token = getToken();

    if (!token) {
      const errorMessage = "로그인이 필요합니다.";
      onError?.(errorMessage);
      setSaveState((prev) => ({ ...prev, status: "error", error: errorMessage }));

      // 로그인 페이지로 리다이렉트
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    if (!content.trim()) {
      const errorMessage = "저장할 내용이 없습니다.";
      onError?.(errorMessage);
      setSaveState((prev) => ({ ...prev, status: "error", error: errorMessage }));
      return;
    }

    setSaveState((prev) => ({ ...prev, status: "saving" }));

    try {
      const response = await saveDraft(token, {
        draftId,
        title,
        content,
        type,
        category,
      });

      if (response.success) {
        setSaveState({
          status: "saved",
          lastSavedAt: new Date(),
          saveCount: response.data.saveCount,
        });

        onSave?.(response.data._id);
      } else {
        throw new Error("저장에 실패했습니다.");
      }
    } catch (error) {
      let errorMessage = "저장 중 오류가 발생했습니다";

      if (error instanceof Error) {
        if (error.message.includes("Authentication required")) {
          errorMessage = "로그인이 필요합니다.";
          // 로그인 페이지로 리다이렉트
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        } else {
          errorMessage = error.message;
        }
      }

      setSaveState((prev) => ({ ...prev, status: "error", error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [getToken, content, title, type, category, draftId, onSave, onError]);

  return {
    saveState,
    manualSave,
  };
}
