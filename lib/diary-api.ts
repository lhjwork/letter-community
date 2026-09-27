import { apiRequest } from "./api";
import type { DiaryDeco } from "./diary-decos";

export const DIARY_PAPERS = [
  { id: "lined", label: "줄" },
  { id: "grid", label: "모눈" },
  { id: "dot", label: "도트" },
  { id: "blank", label: "무지" },
  { id: "cream", label: "크림" },
] as const;

/** 손글씨 폰트. jangmi는 사이트 기본, 나머지는 Google Fonts(OFL) */
export const DIARY_FONTS = [
  { id: "jangmi", label: "장미체", family: "'NanumJangMiCe', cursive" },
  { id: "pen", label: "펜", family: "'Nanum Pen Script', cursive" },
  { id: "gaegu", label: "개구", family: "'Gaegu', cursive" },
  { id: "himelody", label: "하이멜로디", family: "'Hi Melody', cursive" },
] as const;

export type DiaryPaper = (typeof DIARY_PAPERS)[number]["id"];
export type DiaryFont = (typeof DIARY_FONTS)[number]["id"];

export interface DiaryPage {
  date: string;
  content: string;
  decos: DiaryDeco[];
}
export const DIARY_BINDINGS = [
  { id: "spring", label: "스프링", desc: "펼침이 좋아요" },
  { id: "perfect", label: "무선", desc: "책 같은 느낌" },
] as const;
export type DiaryBinding = (typeof DIARY_BINDINGS)[number]["id"];
export type DiaryPhysicalStatus = "none" | "requested" | "approved" | "printing" | "sent" | "delivered" | "rejected";
export const DIARY_PHYSICAL_LABEL: Record<DiaryPhysicalStatus, string> = {
  none: "미신청",
  requested: "신청 접수",
  approved: "승인됨",
  printing: "인쇄 중",
  sent: "발송됨",
  delivered: "배송 완료",
  rejected: "반려",
};
export interface DiaryAddress {
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  memo?: string;
}
export interface DiaryPhysical {
  status: DiaryPhysicalStatus;
  binding: DiaryBinding;
  copies: number;
  address?: DiaryAddress;
  requestedAt?: string;
  updatedAt?: string;
  notes?: string;
}

export interface Diary {
  _id: string;
  title: string;
  month: string;
  paper: DiaryPaper;
  font: DiaryFont;
  pages: DiaryPage[];
  status: "writing" | "closed";
  physical: DiaryPhysical;
  updatedAt: string;
}

type Ok<T> = { success: true; data: T };

export const getMyDiaries = (token: string) => apiRequest<Ok<Diary[]>>("/api/diaries", { token });
export const getDiary = (id: string, token: string) => apiRequest<Ok<Diary>>(`/api/diaries/${id}`, { token });
export const createDiary = (data: { title: string; month: string; paper: DiaryPaper; font: DiaryFont }, token: string) =>
  apiRequest<Ok<Diary>>("/api/diaries", { method: "POST", body: JSON.stringify(data), token });
export const updateDiary = (id: string, data: Partial<Pick<Diary, "title" | "paper" | "font">>, token: string) =>
  apiRequest<Ok<Diary>>(`/api/diaries/${id}`, { method: "PATCH", body: JSON.stringify(data), token });
export const saveDiaryPage = (id: string, date: string, page: { content: string; decos: DiaryDeco[] }, token: string) =>
  apiRequest<Ok<{ date: string; savedAt: string }>>(`/api/diaries/${id}/pages/${date}`, { method: "PUT", body: JSON.stringify(page), token });
export const requestDiaryPhysical = (id: string, data: { binding: DiaryBinding; copies: number; address: DiaryAddress }, token: string) =>
  apiRequest<Ok<DiaryPhysical>>(`/api/diaries/${id}/physical-request`, { method: "POST", body: JSON.stringify(data), token });
/** 관리자 인쇄 링크(?t=)로 세션 없이 조회 */
export const getDiaryPrintView = (id: string, t: string) => apiRequest<Ok<Diary>>(`/api/diaries/${id}/print-view?t=${encodeURIComponent(t)}`);
export const deleteDiary = (id: string, token: string) => apiRequest<{ success: true }>(`/api/diaries/${id}`, { method: "DELETE", token });
