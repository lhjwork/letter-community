import { auth } from "@/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FLOWS, TABS, getMe, getMyRecords, type Flow, type Tab } from "./api";
import MyPageView, { MAX, STEP } from "./MyPageView";

export const metadata: Metadata = { title: "마이페이지 | Letter" };

const pick = <T extends string>(v: string | string[] | undefined, list: readonly { value: T }[], fallback: T) =>
  list.find((o) => o.value === v)?.value ?? fallback;

export default async function MyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth();
  const token = session?.backendToken;
  if (!token) redirect("/");

  const sp = await searchParams;
  const tab = pick<Tab>(sp.tab, TABS, "all");
  const flow = pick<Flow>(sp.flow, FLOWS, "all");
  const n = Math.min(MAX, Math.max(STEP, Math.ceil(Number(sp.n) / STEP) * STEP || STEP));

  // 세션은 있는데 백엔드 토큰이 만료·무효(401)면 오류 화면 대신 홈으로
  const data = await Promise.all([getMe(token), getMyRecords(token, tab, flow, n)]).catch(() => null);
  if (!data) redirect("/");
  const [me, records] = data;
  return <MyPageView me={me} records={records} tab={tab} flow={flow} n={n} />;
}
