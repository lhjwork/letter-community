"use client";

import { DraftLetter } from "@/types/draft";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Send, Clock } from "lucide-react";

interface DraftCardProps {
  draft: DraftLetter;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
}

// 날짜 계산 함수를 컴포넌트 외부로 분리
function calculateDraftDays(createdAt: string) {
  const now = new Date();
  const createdTime = new Date(createdAt);
  const daysOld = Math.ceil((now.getTime() - createdTime.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilDeletion = 30 - daysOld;
  const isNearDeletion = daysUntilDeletion <= 5; // 5일 이하 남으면 경고

  return { daysOld, daysUntilDeletion, isNearDeletion };
}

export default function DraftCard({ draft, onEdit, onDelete, onPublish }: DraftCardProps) {
  const displayTitle = draft.title || draft.autoTitle || "제목 없음";
  const previewContent = draft.content.replace(/<[^>]*>/g, "").substring(0, 100);

  // 날짜 계산
  const { daysUntilDeletion, isNearDeletion } = calculateDraftDays(draft.createdAt);

  return (
    <Card className={`hover:shadow-md transition-shadow ${isNearDeletion ? "border-orange-200 bg-orange-50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg line-clamp-1">{displayTitle}</h3>
              {isNearDeletion && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span>{daysUntilDeletion}일 후 삭제</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={draft.type === "friend" ? "default" : "secondary"}>{draft.type === "friend" ? "친구편지" : "이야기편지"}</Badge>
              <Badge variant="outline">{draft.category}</Badge>
            </div>
          </div>
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
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {previewContent}
          {draft.content.length > 100 && "..."}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{draft.saveCount}회 저장</span>
          </div>
          <div className="text-right">
            <div className="text-gray-600">
              작성:{" "}
              {new Date(draft.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className={`text-xs mt-1 ${isNearDeletion ? "text-orange-600 font-medium" : "text-gray-400"}`}>
              삭제 예정:{" "}
              {new Date(new Date(draft.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}{" "}
              ({daysUntilDeletion}일 후)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
