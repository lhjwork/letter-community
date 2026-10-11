import { apiRequest } from "@/lib/api";

export const TABS = [
  { value: "all", label: "전체" },
  { value: "sent", label: "보낸 편지" },
  { value: "received", label: "받은 편지" },
  { value: "stories", label: "나의 사연" },
] as const;
export const FLOWS = [
  { value: "all", label: "전체" },
  { value: "story", label: "사연 편지" },
  { value: "heart", label: "마음 편지" },
] as const;
export type Tab = (typeof TABS)[number]["value"];
export type Flow = (typeof FLOWS)[number]["value"];

export interface RecordItem {
  _id: string;
  kind: "sent" | "received" | "story";
  flow: "story" | "heart";
  label: string;
  badge: { text: string; tone: "blue" | "green" | "brick" | "muted" } | null;
  recipientName?: string;
  title: string;
  createdAt: string;
}

export interface MyRecords {
  data: RecordItem[];
  total: number;
  counts: { sent: number; received: number; stories: number; physical: number };
}

export interface Me {
  email: string;
  name: string;
  createdAt: string;
  nameUpdatedAt?: string;
  oauthAccounts: { provider: string }[];
}

export const getMe = (token: string) => apiRequest<{ data: Me }>("/api/users/me", { token, cache: "no-store" }).then((r) => r.data);

export const getMyRecords = (token: string, tab: Tab, flow: Flow, limit: number) =>
  apiRequest<{ data: MyRecords }>(`/api/letters/my/records?tab=${tab}&flow=${flow}&limit=${limit}`, { token, cache: "no-store" }).then((r) => r.data);
