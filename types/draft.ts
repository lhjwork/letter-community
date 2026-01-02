import { RecipientAddressInput } from "./recipient";

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

// 임시저장 생성/수정 요청 타입
export interface DraftSaveRequest {
  draftId?: string;
  title?: string;
  content: string;
  type?: "friend" | "story";
  category?: string;
  recipientAddresses?: RecipientAddressInput[];
}

// 임시저장 발행 요청 타입
export interface DraftPublishRequest {
  title?: string;
  content?: string;
  type?: "friend" | "story";
  category?: string;
}
