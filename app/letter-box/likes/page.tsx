import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StoryBrick } from "@/components/stories";
import { getMyLikes } from "@/lib/api";
import { Pager, WRAP } from "../parts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("letterBox.meta"))("likes") };
}

const LIMIT = 12;

/** 우편함 > 마음에 담은 사연. 사연 목록(/stories)과 같은 벽돌 카드 */
export default async function LikesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const t = await getTranslations("letterBox");
  const session = await auth();
  const token = session?.backendToken;
  if (!token) redirect("/");

  const page = Math.max(1, Number((await searchParams).page) || 1);
  const res = await getMyLikes(token, { page, limit: LIMIT }).catch(() => null);

  return (
    <main>
      <section className={`${WRAP} pt-3 mobile-down:pt-1`}>
        <Link href="/letter-box" className="inline-flex min-h-11 items-center font-pen text-xl text-ink-3 hover:text-brick mobile-down:text-lg">
          {t("back")}
        </Link>
      </section>
      <section className={`${WRAP} pb-9 pt-5 mobile-down:pb-6 mobile-down:pt-3`}>
        <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">{t("likes.title")}</h1>
      </section>
      <section className={`${WRAP} flex flex-col gap-3 pb-24 mobile-down:pb-12`}>
        {res === null ? (
          <p role="alert" className="m-0 py-12 font-pen text-2xl text-brick">
            {t("loadFailed")}
          </p>
        ) : res.data.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="m-0 font-pen text-2xl text-ink-2">{t("likes.empty")}</p>
            <Link href="/stories" className="btn btn-ink">
              {t("likes.browse")}
            </Link>
          </div>
        ) : (
          <>
            <div className="[column-gap:28px] [columns:3_300px] mobile-down:columns-1">
              {res.data.map((s, i) => (
                <StoryBrick key={s._id} story={s} index={i} />
              ))}
            </div>
            <Pager page={page} totalPages={res.pagination.totalPages} href={(p) => `/letter-box/likes?page=${p}`} />
          </>
        )}
      </section>
    </main>
  );
}
