import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

type Item = string | { t: string; sub: string[] };
type Article = { title: string; p?: string; defs?: string[]; after?: string; items?: Item[] };

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("legal.terms"))("metaTitle") };
}

// 문구는 messages/<locale>/legal.json 의 terms. 법률 문구라 ICU 해석 없이 t.raw 로 그대로 쓴다
export default function TermsPage() {
  const t = useTranslations("legal");
  const r = (k: string) => t.raw(k) as string;
  const chapters = t.raw("terms.chapters") as { title: string; articles: Article[] }[];
  return (
    <div className="min-h-screen bg-[#FFF9F7]">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        {r("disclaimer") && <p className="text-center text-[#999] text-sm mb-4">{r("disclaimer")}</p>}
        <h1
          className="text-3xl sm:text-4xl text-center mb-2"
          style={{ fontFamily: "NanumJangMiCe" }}
        >
          {r("terms.title")}
        </h1>
        <p className="text-center text-[#999] text-sm mb-10">
          {r("terms.effective")}
        </p>

        <div className="space-y-10 text-[#333] text-sm sm:text-base leading-relaxed">
          {chapters.map((c) => (
            <Chapter key={c.title} title={c.title}>
              {c.articles.map((a) => (
                <Section key={a.title} title={a.title}>
                  {a.p && <p>{a.p}</p>}
                  {a.defs && (
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      {a.defs.map((d) => <li key={d}>{d}</li>)}
                    </ul>
                  )}
                  {a.after && <p className="mt-3">{a.after}</p>}
                  {a.items && (
                    <ol className="list-decimal pl-5 space-y-2">
                      {a.items.map((it) =>
                        typeof it === "string" ? (
                          <li key={it}>{it}</li>
                        ) : (
                          <li key={it.t}>
                            {it.t}
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                              {it.sub.map((x) => <li key={x}>{x}</li>)}
                            </ul>
                          </li>
                        ),
                      )}
                    </ol>
                  )}
                </Section>
              ))}
            </Chapter>
          ))}

          <div className="pt-8 border-t border-[#F0E0DC]">
            <p className="text-[#999] text-xs">
              {r("terms.footer.effective")}
            </p>
            <ul className="mt-2 text-[#999] text-xs space-y-1">
              {(t.raw("terms.footer.history") as string[]).map((h) => <li key={h}>{h}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chapter({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <h2
        className="text-xl sm:text-2xl font-bold text-[#4C261E] pb-2 border-b-2 border-[#FF9883]"
        style={{ fontFamily: "NanumJangMiCe" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-base sm:text-lg font-bold text-[#4C261E] mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}
