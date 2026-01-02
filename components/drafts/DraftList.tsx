"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getDrafts, deleteDraft, publishDraft } from "@/lib/draft-api";
import { DraftLetter, DraftListResponse } from "@/types/draft";
import DraftCard from "./DraftCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface DraftListProps {
  onEditDraft?: (draftId: string) => void;
}

export default function DraftList({ onEditDraft }: DraftListProps) {
  const { data: session } = useSession();
  const [drafts, setDrafts] = useState<DraftLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState({
    totalDrafts: 0,
    totalWords: 0,
    oldestDraft: null as string | null,
  });
  const [filters, setFilters] = useState({
    sort: "latest" as "latest" | "oldest",
    type: "all" as "all" | "friend" | "story",
  });

  const fetchDrafts = async (page = 1) => {
    const token = session?.backendToken || (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);

    if (!token) {
      console.error("No auth token available");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    setLoading(true);
    try {
      const response = await getDrafts(token, {
        page,
        limit: pagination.limit,
        ...filters,
      });

      if (response.success) {
        setDrafts(response.data.drafts);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("임시저장 목록 조회 실패:", error);
      if (error instanceof Error && error.message.includes("Authentication required")) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts(1);
  }, [session?.backendToken, filters]);

  const handleDeleteDraft = async (draftId: string) => {
    const token = session?.backendToken || (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);

    if (!token) {
      alert("로그인이 필요합니다.");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteDraft(token, draftId);
      fetchDrafts(pagination.page);
    } catch (error) {
      console.error("임시저장 삭제 실패:", error);
      if (error instanceof Error && error.message.includes("Authentication required")) {
        alert("로그인이 필요합니다.");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    const token = session?.backendToken || (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);

    if (!token) {
      alert("로그인이 필요합니다.");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    if (!confirm("편지를 발행하시겠습니까?")) return;

    try {
      const response = await publishDraft(token, draftId);
      if (response.success) {
        alert("편지가 성공적으로 발행되었습니다!");
        window.open(response.data.url, "_blank");
        fetchDrafts(pagination.page);
      }
    } catch (error) {
      console.error("편지 발행 실패:", error);
      if (error instanceof Error && error.message.includes("Authentication required")) {
        alert("로그인이 필요합니다.");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } else {
        alert("발행 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 정보 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalDrafts}</div>
          <div className="text-sm text-gray-600">임시저장된 편지</div>
        </div>

        {/* 자동 삭제 안내 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">자동 정리 안내</span>
          </div>
          <p className="text-blue-600 text-xs mt-1">임시저장은 작성일로부터 30일 후 자동으로 삭제됩니다. 중요한 편지는 미리 발행해 주세요.</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-4">
        <Select value={filters.sort} onValueChange={(value: any) => setFilters((prev) => ({ ...prev, sort: value }))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="oldest">오래된순</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={(value: any) => setFilters((prev) => ({ ...prev, type: value }))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="friend">친구편지</SelectItem>
            <SelectItem value="story">이야기편지</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 임시저장 목록 */}
      {drafts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>임시저장된 편지가 없습니다.</p>
          <p className="text-sm mt-2">편지를 작성하고 임시저장 버튼을 클릭하세요.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <DraftCard key={draft._id} draft={draft} onEdit={() => onEditDraft?.(draft._id)} onDelete={() => handleDeleteDraft(draft._id)} onPublish={() => handlePublishDraft(draft._id)} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage} onClick={() => fetchDrafts(pagination.page - 1)}>
            이전
          </Button>
          <span className="flex items-center px-4 text-sm">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => fetchDrafts(pagination.page + 1)}>
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
