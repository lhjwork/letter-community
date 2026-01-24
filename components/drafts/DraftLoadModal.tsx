"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, FileText, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { getDrafts, deleteDraft } from "@/lib/draft-api";
import { DraftLetter } from "@/types/draft";

interface DraftLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: DraftLetter) => void;
}

export default function DraftLoadModal({
  isOpen,
  onClose,
  onLoadDraft,
}: DraftLoadModalProps) {
  const [drafts, setDrafts] = useState<DraftLetter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  // 임시저장 목록 불러오기
  const loadDrafts = async () => {
    if (!session?.backendToken) return;

    setIsLoading(true);
    try {
      const response = await getDrafts(session.backendToken, {
        type: "friend", // friend 타입의 임시저장만 가져오기
        sort: "latest",
        limit: 50,
      });
      if (response.success) {
        setDrafts(response.data.drafts || response.data);
      }
    } catch (error) {
      console.error("임시저장 목록 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 임시저장 삭제
  const handleDeleteDraft = async (draftId: string) => {
    if (!session?.backendToken) return;
    if (!confirm("이 임시저장을 삭제하시겠습니까?")) return;

    try {
      const response = await deleteDraft(session.backendToken, draftId);
      if (response.success) {
        setDrafts(drafts.filter((draft) => draft._id !== draftId));
      }
    } catch (error) {
      console.error("임시저장 삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  // 임시저장 불러오기
  const handleLoadDraft = (draft: DraftLetter) => {
    onLoadDraft(draft);
    onClose();
  };

  // 모달이 열릴 때 임시저장 목록 불러오기
  useEffect(() => {
    if (isOpen && session?.backendToken) {
      loadDrafts();
    }
  }, [isOpen, session?.backendToken]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, ".");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[800px]! h-[600px]! max-w-[800px]! p-0 bg-white rounded-lg overflow-hidden"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2
              className="text-[48px] text-[#757575] font-normal"
              style={{ fontFamily: "Nanum JangMiCe, cursive" }}
            >
              임시저장 불러오기
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-[#757575]" />
            </Button>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 안내 메시지 */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2 text-[#757575] text-[20px]">
                <Clock className="w-5 h-5 text-[#FF9883]" />
                <span>임시저장은 작성 후 30일 이후 자동으로 삭제돼요.</span>
              </div>
            </div>

            {/* 임시저장 목록 */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-[#FF9883] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-[#757575]">불러오는 중...</p>
                  </div>
                </div>
              ) : drafts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-[#C4C4C4] mx-auto mb-4" />
                    <p className="text-[#757575] text-[20px]">
                      저장된 임시저장이 없습니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {drafts.map((draft) => (
                    <div
                      key={draft._id}
                      className="border border-[#C4C4C4] rounded-lg p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-[18px] font-medium text-[#424242] mb-1">
                            {draft.title || "제목없음"}
                          </h3>
                          <p className="text-[18px] text-[#757575]">
                            {formatDate(draft.lastSavedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleDeleteDraft(draft._id)}
                            variant="outline"
                            size="sm"
                            className="w-20 h-12 border-2 border-[#C4C4C4] text-[#757575] text-[18px] font-medium hover:bg-gray-50"
                          >
                            삭제
                          </Button>
                          <Button
                            onClick={() => handleLoadDraft(draft)}
                            className="w-20 h-12 bg-[#FF7F65] hover:bg-[#FF6B4F] text-white text-[18px] font-medium"
                          >
                            불러오기
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
