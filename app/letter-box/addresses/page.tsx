import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyRequestSummary } from "@/lib/api";
import { getAddresses } from "@/lib/address-api";
import { STATUS_SHORT, WRAP } from "../parts";
import AddressBook from "./AddressBook";

export const metadata: Metadata = { title: "주소록" };

export default async function AddressesPage() {
  const session = await auth();
  const token = session?.backendToken;
  if (!token) redirect("/");

  const [addresses, summary] = await Promise.all([
    getAddresses(token).then((r) => r.data ?? []).catch(() => null),
    getMyRequestSummary(token).then((r) => r.data).catch(() => null),
  ]);

  return (
    <main>
      <section className={`${WRAP} pb-2 pt-3 mobile-down:pb-0 mobile-down:pt-1`}>
        <Link href="/letter-box" className="inline-flex min-h-11 items-center font-pen text-xl text-ink-3 hover:text-brick mobile-down:text-lg">
          ← 우편함
        </Link>
      </section>

      {addresses === null ? (
        <section className={`${WRAP} pb-24 pt-5`}>
          <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px]">주소록</h1>
          <p role="alert" className="m-0 py-12 font-pen text-2xl text-brick">
            주소록을 불러오지 못했어요.
          </p>
        </section>
      ) : (
        <AddressBook initial={addresses} />
      )}

      {summary?.latest && (
        <section className={`${WRAP} pb-24 mobile-down:hidden`}>
          <div className="paper flex flex-wrap items-center justify-between gap-4 px-8 py-7">
            <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />
            <div className="flex flex-col gap-1.5">
              <strong className="font-pen text-[26px] font-normal">내 편지에 들어온 실물 신청 {summary.total}건</strong>
              <span className="text-sm text-ink-2">
                {summary.latest.letterTitle} · {STATUS_SHORT[summary.latest.status] ?? summary.latest.status}
              </span>
            </div>
            <Link href="/letter-box" className="btn btn-blue">
              신청 현황 보기
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
