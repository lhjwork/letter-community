# 편지 임시저장 기능 - 프론트엔드 구현 프롬프트

## 🎯 목표

편지 작성 중 언제든 임시저장하고, 마이페이지에서 작성 중인 편지를 관리할 수 있는 프론트엔드 UI/UX 구현

## 📋 요구사항

### 핵심 기능

1. **편지 작성 페이지 개선**

   - 수동저장 버튼
   - 저장 상태 표시 (저장 중, 저장 완료, 오류)
   - 임시저장 불러오기 기능

2. **마이페이지 - 임시저장 관리**

   - 임시저장된 편지 목록 (페이지네이션)
   - 편지 미리보기 및 편집 재개
   - 임시저장 삭제 및 정식 발행

3. **사용자 경험 최적화**
   - 작성 중 페이지 이탈 시 경고
   - 네트워크 오류 시 로컬 백업
   - 저장 상태 실시간 피드백

## 🗂️ 파일 구조

```
components/
├── letter/
│   ├── LetterEditor.tsx              # 편지 작성 에디터 (기존 개선)
│   ├── DraftSaveButton.tsx           # 수동 저장 버튼
│   ├── SaveIndicator.tsx             # 저장 상태 표시
│   └── DraftLoadModal.tsx            # 임시저장 불러오기 모달
├── drafts/
│   ├── DraftList.tsx                 # 임시저장 목록
│   ├── DraftCard.tsx                 # 임시저장 카드 컴포넌트
│   ├── DraftPreviewModal.tsx         # 임시저장 미리보기
│   └── DraftManagementPanel.tsx      # 임시저장 관리 패널
└── ui/
    ├── ConfirmDialog.tsx             # 확인 다이얼로그
    └── LoadingSpinner.tsx            # 로딩 스피너

app/
├── drafts/
│   └── page.tsx                      # 임시저장 관리 페이지
└── letter/
    └── write/
        └── page.tsx                  # 편지 작성 페이지 (기존 개선)

lib/
├── draft-api.ts                      # 임시저장 API 함수
├── manual-save.ts                    # 수동저장 훅
└── local-backup.ts                   # 로컬 백업 유틸

types/
└── draft.ts                          # 임시저장 타입 정의

hooks/
├── useDraftManualSave.ts             # 수동저장 훅
├── useDraftManagement.ts             # 임시저장 관리 훅
└── useBeforeUnload.ts                # 페이지 이탈 경고 훅
```

## 🔧 구현 세부사항

### 1. 타입 정의 (types/draft.ts)

```typescript
// 임시저장 편지 타입
export interface DraftLetter {
  _id: string;
  title: string;
  autoTitle: string;
  content: string;
  type: "friend" | "story";
  category: string;
  wordCount: number;
  saveCount: number;
  lastSavedAt: string;
  createdAt: string;
  recipientAddresses?: RecipientAddressInput[];
}

// 임시저장 목록 응답 타입
export interface DraftListResponse {
  success: boolean;
  data: {
    drafts: DraftLetter[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    stats: {
      totalDrafts: number;
      totalWords: number;
      oldestDraft: string | null;
    };
  };
}

// 임시저장 상태 타입
export interface DraftSaveState {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt: Date | null;
  saveCount: number;
  error?: string;
}
```

### 2. API 함수 (lib/draft-api.ts)

```typescript
import { apiRequest } from "./api";
import { DraftLetter, DraftListResponse } from "@/types/draft";

// 임시저장 생성/수정
export async function saveDraft(
  token: string,
  data: {
    draftId?: string;
    title?: string;
    content: string;
    type?: "friend" | "story";
    category?: string;
    recipientAddresses?: any[];
  }
): Promise<{ success: boolean; data: DraftLetter }> {
  const endpoint = data.draftId ? `/api/drafts/${data.draftId}` : "/api/drafts";
  const method = data.draftId ? "PUT" : "POST";

  return apiRequest(endpoint, {
    method,
    token,
    body: JSON.stringify(data),
  });
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

  return apiRequest(`/api/drafts?${searchParams.toString()}`, {
    method: "GET",
    token,
  });
}

// 임시저장 상세 조회
export async function getDraft(token: string, draftId: string): Promise<{ success: boolean; data: DraftLetter }> {
  return apiRequest(`/api/drafts/${draftId}`, {
    method: "GET",
    token,
  });
}

// 임시저장 삭제
export async function deleteDraft(token: string, draftId: string): Promise<{ success: boolean }> {
  return apiRequest(`/api/drafts/${draftId}`, {
    method: "DELETE",
    token,
  });
}

// 임시저장 → 정식 발행
export async function publishDraft(
  token: string,
  draftId: string,
  data?: {
    title?: string;
    content?: string;
    type?: "friend" | "story";
    category?: string;
  }
): Promise<{ success: boolean; data: { letterId: string; url: string; draftId: string } }> {
  return apiRequest(`/api/drafts/${draftId}/publish`, {
    method: "POST",
    token,
    body: data ? JSON.stringify(data) : undefined,
  });
}
```

### 3. 수동저장 훅 (hooks/useDraftManualSave.ts)

```typescript
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

  // 수동 저장 함수
  const manualSave = useCallback(async () => {
    if (!session?.accessToken || !content.trim()) {
      onError?.("저장할 내용이 없습니다.");
      return;
    }

    setSaveState((prev) => ({ ...prev, status: "saving" }));

    try {
      const response = await saveDraft(session.accessToken, {
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
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "저장 중 오류가 발생했습니다";
      setSaveState((prev) => ({ ...prev, status: "error", error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [session?.accessToken, content, title, type, category, draftId, onSave, onError]);

  return {
    saveState,
    manualSave,
  };
}
```

### 4. 저장 상태 표시 컴포넌트 (components/letter/SaveIndicator.tsx)

```typescript
"use client";

import { DraftSaveState } from "@/types/draft";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

interface SaveIndicatorProps {
  saveState: DraftSaveState;
  className?: string;
}

export default function SaveIndicator({ saveState, className = "" }: SaveIndicatorProps) {
  const getStatusDisplay = () => {
    switch (saveState.status) {
      case "saving":
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: "저장 중...",
          color: "text-blue-600",
        };
      case "saved":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: `저장됨 (${saveState.saveCount}회)`,
          color: "text-green-600",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: "저장 실패",
          color: "text-red-600",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "저장 대기",
          color: "text-gray-500",
        };
    }
  };

  const { icon, text, color } = getStatusDisplay();

  return (
    <div className={`flex items-center gap-2 text-sm ${color} ${className}`}>
      {icon}
      <span>{text}</span>
      {saveState.lastSavedAt && <span className="text-xs text-gray-400">{new Date(saveState.lastSavedAt).toLocaleTimeString()}</span>}
    </div>
  );
}
```

### 5. 수동 저장 버튼 (components/letter/DraftSaveButton.tsx)

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { DraftSaveState } from "@/types/draft";

interface DraftSaveButtonProps {
  onSave: () => void;
  saveState: DraftSaveState;
  disabled?: boolean;
  className?: string;
}

export default function DraftSaveButton({ onSave, saveState, disabled = false, className = "" }: DraftSaveButtonProps) {
  const isLoading = saveState.status === "saving";

  return (
    <Button onClick={onSave} disabled={disabled || isLoading} variant="outline" size="sm" className={`flex items-center gap-2 ${className}`}>
      <Save className={`w-4 h-4 ${isLoading ? "animate-pulse" : ""}`} />
      {isLoading ? "저장 중..." : "임시저장"}
    </Button>
  );
}
```

### 6. 임시저장 목록 컴포넌트 (components/drafts/DraftList.tsx)

```typescript
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
    sort: "latest" as "latest" | "oldest" | "wordCount",
    type: "all" as "all" | "friend" | "story",
  });

  const fetchDrafts = async (page = 1) => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const response = await getDrafts(session.accessToken, {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts(1);
  }, [session?.accessToken, filters]);

  const handleDeleteDraft = async (draftId: string) => {
    if (!session?.accessToken) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteDraft(session.accessToken, draftId);
      fetchDrafts(pagination.page);
    } catch (error) {
      console.error("임시저장 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    if (!session?.accessToken) return;
    if (!confirm("편지를 발행하시겠습니까?")) return;

    try {
      const response = await publishDraft(session.accessToken, draftId);
      if (response.success) {
        alert("편지가 성공적으로 발행되었습니다!");
        window.open(response.data.url, "_blank");
        fetchDrafts(pagination.page);
      }
    } catch (error) {
      console.error("편지 발행 실패:", error);
      alert("발행 중 오류가 발생했습니다.");
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
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalDrafts}</div>
            <div className="text-sm text-gray-600">임시저장</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalWords.toLocaleString()}</div>
            <div className="text-sm text-gray-600">총 글자수</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.oldestDraft ? Math.ceil((Date.now() - new Date(stats.oldestDraft).getTime()) / (1000 * 60 * 60 * 24)) : 0}</div>
            <div className="text-sm text-gray-600">최대 보관일</div>
          </div>
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
            <SelectItem value="wordCount">글자수순</SelectItem>
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
          <p className="text-sm mt-2">편지를 작성하면 자동으로 임시저장됩니다.</p>
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
```

### 7. 임시저장 카드 컴포넌트 (components/drafts/DraftCard.tsx)

```typescript
"use client";

import { DraftLetter } from "@/types/draft";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Send, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface DraftCardProps {
  draft: DraftLetter;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
}

export default function DraftCard({ draft, onEdit, onDelete, onPublish }: DraftCardProps) {
  const displayTitle = draft.title || draft.autoTitle || "제목 없음";
  const previewContent = draft.content.replace(/<[^>]*>/g, "").substring(0, 100);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">{displayTitle}</h3>
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{draft.wordCount.toLocaleString()}자</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{draft.saveCount}회 저장</span>
            </div>
          </div>
          <div>
            {formatDistanceToNow(new Date(draft.lastSavedAt), {
              addSuffix: true,
              locale: ko,
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 8. 페이지 이탈 경고 훅 (hooks/useBeforeUnload.ts)

```typescript
import { useEffect, useRef } from "react";

interface UseBeforeUnloadProps {
  when: boolean;
  message?: string;
}

export function useBeforeUnload({ when, message = "작성 중인 내용이 있습니다. 정말 나가시겠습니까?" }: UseBeforeUnloadProps) {
  const messageRef = useRef(message);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (when) {
        event.preventDefault();
        event.returnValue = messageRef.current;
        return messageRef.current;
      }
    };

    if (when) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when]);
}
```

### 9. 임시저장 관리 페이지 (app/drafts/page.tsx)

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DraftList from "@/components/drafts/DraftList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DraftsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleEditDraft = (draftId: string) => {
    router.push(`/letter/write?draftId=${draftId}`);
  };

  const handleNewLetter = () => {
    router.push("/letter/write");
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">임시저장</h1>
          <p className="text-gray-600 mt-2">작성 중인 편지를 관리하세요</p>
        </div>
        <Button onClick={handleNewLetter} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />새 편지 작성
        </Button>
      </div>

      <DraftList onEditDraft={handleEditDraft} />
    </div>
  );
}
```

### 10. 편지 작성 페이지 개선 (app/letter/write/page.tsx)

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDraftManualSave } from "@/hooks/useDraftManualSave";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { getDraft } from "@/lib/draft-api";
import SaveIndicator from "@/components/letter/SaveIndicator";
import DraftSaveButton from "@/components/letter/DraftSaveButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WriteLetterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "friend" as "friend" | "story",
    category: "기타",
  });
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId || undefined);
  const [isLoading, setIsLoading] = useState(!!draftId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 수동저장 훅
  const { saveState, manualSave } = useDraftManualSave({
    content: formData.content,
    title: formData.title,
    type: formData.type,
    category: formData.category,
    draftId: currentDraftId,
    onSave: (savedDraftId) => {
      setCurrentDraftId(savedDraftId);
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      console.error("저장 실패:", error);
    },
  });

  // 페이지 이탈 경고
  useBeforeUnload({
    when: hasUnsavedChanges && formData.content.length > 10,
    message: "작성 중인 편지가 저장되지 않았습니다. 정말 나가시겠습니까?",
  });

  // 임시저장 불러오기
  useEffect(() => {
    if (draftId && session?.accessToken) {
      loadDraft(draftId);
    }
  }, [draftId, session?.accessToken]);

  const loadDraft = async (id: string) => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      const response = await getDraft(session.accessToken, id);
      if (response.success) {
        const draft = response.data;
        setFormData({
          title: draft.title,
          content: draft.content,
          type: draft.type,
          category: draft.category,
        });
        setCurrentDraftId(draft._id);
      }
    } catch (error) {
      console.error("임시저장 불러오기 실패:", error);
      alert("임시저장을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handlePublish = async () => {
    // 정식 발행 로직
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // 발행 전 마지막 저장
    await manualSave();

    // 실제 편지 발행 API 호출
    // ... 기존 발행 로직
  };

  if (status === "loading" || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">편지 작성</h1>
        <div className="flex items-center gap-4">
          <SaveIndicator saveState={saveState} />
          <DraftSaveButton onSave={manualSave} saveState={saveState} />
        </div>
      </div>

      <div className="space-y-6">
        {/* 편지 타입 및 카테고리 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">편지 타입</label>
            <Select value={formData.type} onValueChange={(value: "friend" | "story") => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friend">친구편지</SelectItem>
                <SelectItem value="story">이야기편지</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <Input value={formData.category} onChange={(e) => handleInputChange("category", e.target.value)} placeholder="카테고리를 입력하세요" />
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
          <Input value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="편지 제목을 입력하세요" className="text-lg" />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
          <Textarea value={formData.content} onChange={(e) => handleInputChange("content", e.target.value)} placeholder="편지 내용을 작성하세요..." rows={20} className="resize-none" />
          <div className="text-right text-sm text-gray-500 mt-2">{formData.content.length.toLocaleString()}자</div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 pt-6 border-t">
          <Button variant="outline" onClick={() => router.push("/drafts")} className="flex-1">
            임시저장 목록
          </Button>
          <Button onClick={handlePublish} className="flex-1">
            편지 발행
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## 🎨 UI/UX 고려사항

### 1. 사용자 피드백

- 저장 상태 실시간 표시
- 네트워크 오류 시 명확한 안내
- 성공/실패 토스트 메시지

### 2. 접근성

- 키보드 단축키 지원 (Ctrl+S로 저장)
- 스크린 리더 지원
- 고대비 모드 지원

### 3. 반응형 디자인

- 모바일 최적화
- 태블릿 레이아웃 고려
- 터치 인터페이스 지원

## 🔒 보안 고려사항

### 1. 클라이언트 사이드 보안

- XSS 방지를 위한 입력값 검증
- 민감한 정보 로컬 저장 금지
- CSRF 토큰 검증

### 2. 데이터 보호

- 임시저장 데이터 암호화
- 로컬 백업 데이터 보안
- 세션 만료 시 데이터 정리

## 📱 성능 최적화

### 1. 렌더링 최적화

- React.memo 활용
- 불필요한 리렌더링 방지
- 가상화된 목록 (대용량 데이터)

### 2. 네트워크 최적화

- API 요청 디바운싱
- 캐싱 전략 구현
- 오프라인 지원

## 🧪 테스트 시나리오

### 1. 수동저장 테스트

- 저장 버튼 클릭 시 정상 저장 확인
- 네트워크 오류 시 재시도
- 중복 저장 방지

### 2. 사용자 경험 테스트

- 페이지 이탈 시 경고 표시
- 임시저장 목록 정확성
- 편집 재개 기능

### 3. 성능 테스트

- 대용량 텍스트 처리
- 다수 임시저장 목록 렌더링
- 메모리 누수 확인

## 🚀 배포 전 체크리스트

- [ ] 모든 컴포넌트 구현 및 테스트
- [ ] 수동저장 기능 검증
- [ ] 페이지 이탈 경고 동작 확인
- [ ] 반응형 디자인 검증
- [ ] 접근성 테스트
- [ ] 성능 최적화 적용
- [ ] 에러 처리 및 사용자 피드백
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 디바이스 테스트

이 프롬프트를 바탕으로 프론트엔드 개발을 진행하면 사용자 친화적인 편지 임시저장 시스템을 구축할 수 있습니다!

## ⚠️ 중요 참고사항

### 자동저장 기능 제외

- 이 프롬프트는 **수동저장만** 구현합니다
- 자동저장 기능은 의도적으로 제외되었습니다
- 사용자가 직접 "임시저장" 버튼을 클릭해야만 저장됩니다

### 수동저장의 장점

- **사용자 제어**: 언제 저장할지 사용자가 직접 결정
- **서버 부하 감소**: 불필요한 자동 API 호출 방지
- **명확한 피드백**: 저장 시점이 명확하여 사용자 경험 향상
- **데이터 정확성**: 의도하지 않은 중간 상태 저장 방지
