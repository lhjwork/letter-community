"use client";

import { DraftLetter } from "@/types/draft";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Send, Trash2, Calendar, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale/ko";

interface DraftPreviewModalProps {
  draft: DraftLetter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onPublish: () => void;
  onDelete: () => void;
}

export default function DraftPreviewModal({ draft, open, onOpenChange, onEdit, onPublish, onDelete }: DraftPreviewModalProps) {
  if (!draft) return null;

  const displayTitle = draft.title || draft.autoTitle || "제목 없음";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="line-clamp-1">{displayTitle}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onPublish}>
                <Send className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 메타 정보 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Badge variant={draft.type === "friend" ? "default" : "secondary"}>{draft.type === "friend" ? "친구편지" : "이야기편지"}</Badge>
              <Badge variant="outline">{draft.category}</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{draft.wordCount.toLocaleString()}자</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(draft.lastSavedAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
              <span>{draft.saveCount}회 저장</span>
            </div>
          </div>

          {/* 내용 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{draft.content || "내용이 없습니다."}</div>
          </div>

          {/* 작성 정보 */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <div>생성일: {new Date(draft.createdAt).toLocaleString()}</div>
            <div>마지막 수정: {new Date(draft.lastSavedAt).toLocaleString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
