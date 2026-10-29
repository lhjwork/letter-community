import { apiRequest } from "@/lib/api";

// 문구는 myPage.tabs.<value> / myPage.flows.<value>
export const TABS = [{ value: "all" }, { value: "sent" }, { value: "received" }, { value: "stories" }] as const;
export const FLOWS = [{ value: "all" }, { value: "story" }, { value: "heart" }] as const;
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
  /** 답장이면 원래 사연 제목 */
  storyTitle?: string;
  /** 받은 답장을 실물 편지로 신청했는지 */
  physical?: boolean;
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
