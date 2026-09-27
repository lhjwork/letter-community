import { apiRequest } from "./api";

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
}
export interface Diary {
  _id: string;
  title: string;
  month: string;
  paper: DiaryPaper;
  font: DiaryFont;
  pages: DiaryPage[];
  status: "writing" | "closed";
  updatedAt: string;
}

type Ok<T> = { success: true; data: T };

export const getMyDiaries = (token: string) => apiRequest<Ok<Diary[]>>("/api/diaries", { token });
export const getDiary = (id: string, token: string) => apiRequest<Ok<Diary>>(`/api/diaries/${id}`, { token });
export const createDiary = (data: { title: string; month: string; paper: DiaryPaper; font: DiaryFont }, token: string) =>
  apiRequest<Ok<Diary>>("/api/diaries", { method: "POST", body: JSON.stringify(data), token });
export const updateDiary = (id: string, data: Partial<Pick<Diary, "title" | "paper" | "font">>, token: string) =>
  apiRequest<Ok<Diary>>(`/api/diaries/${id}`, { method: "PATCH", body: JSON.stringify(data), token });
export const saveDiaryPage = (id: string, date: string, content: string, token: string) =>
  apiRequest<Ok<{ date: string; savedAt: string }>>(`/api/diaries/${id}/pages/${date}`, { method: "PUT", body: JSON.stringify({ content }), token });
export const deleteDiary = (id: string, token: string) => apiRequest<{ success: true }>(`/api/diaries/${id}`, { method: "DELETE", token });
