import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("legal.privacy"))("metaTitle") };
}

// 문구는 messages/<locale>/legal.json 의 privacy. 법률 문구라 ICU 해석 없이 t.raw 로 그대로 쓴다
export default function PrivacyPage() {
  const t = useTranslations("legal");
  const r = (k: string) => t.raw(k) as string;
  const list = (k: string) => t.raw(k) as string[];
  const B = "font-medium text-[#4C261E]";
  return (
    <div className="min-h-screen bg-[#FFF9F7]">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        {r("disclaimer") && <p className="text-center text-[#999] text-sm mb-4">{r("disclaimer")}</p>}
        <h1
          className="text-3xl sm:text-4xl text-center mb-2"
          style={{ fontFamily: "NanumJangMiCe" }}
        >
          {r("privacy.title")}
        </h1>
        <p className="text-center text-[#999] text-sm mb-10">
          {r("privacy.effective")}
        </p>

        <div className="space-y-10 text-[#333] text-sm sm:text-base leading-relaxed">
          <Intro>{r("privacy.intro")}</Intro>

          <Section title={r("privacy.a1.title")}>
            <p>{r("privacy.a1.p")}</p>
            <div className="mt-3 space-y-3">
              {(t.raw("privacy.a1.subs") as { title: string; body: string }[]).map((x) => (
                <SubSection key={x.title} title={x.title}>
                  {x.body}
                </SubSection>
              ))}
            </div>
          </Section>

          <Section title={r("privacy.a2.title")}>
            <p>{r("privacy.a2.p")}</p>
            <Table head={list("privacy.a2.head")} rows={t.raw("privacy.a2.rows") as string[][]} />
            <p className="mt-2 text-[#555]">{r("privacy.a2.note")}</p>
          </Section>

          <Section title={r("privacy.a3.title")}>
            <p>{r("privacy.a3.p")}</p>
            <Table head={list("privacy.a3.head")} rows={t.raw("privacy.a3.rows") as string[][]} />
          </Section>

          <Section title={r("privacy.a3b.title")}>
            <p>{r("privacy.a3b.p")}</p>
          </Section>

          <Section title={r("privacy.a4.title")}>
            <p>{r("privacy.a4.p")}</p>
            <p className="mt-2 font-medium text-[#4C261E]">{r("privacy.a4.strong")}</p>
          </Section>

          <Section title={r("privacy.a4b.title")}>
            <p>{r("privacy.a4b.p")}</p>
            <Table head={list("privacy.a4b.head")} rows={t.raw("privacy.a4b.rows") as string[][]} />
            <p className="mt-3">{r("privacy.a4b.transferLead")}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {list("privacy.a4b.transfer").map((x) => <li key={x}>{x}</li>)}
            </ul>
          </Section>

          <Section title={r("privacy.a5.title")}>
            <p>{r("privacy.a5.p1")}</p>
            <p className="mt-2">{r("privacy.a5.p2")}</p>
            <div className="mt-3 space-y-2">
              <p className="font-semibold text-[#4C261E]">{r("privacy.a5.procTitle")}</p>
              <p>{r("privacy.a5.proc")}</p>
              <p className="font-semibold text-[#4C261E]">{r("privacy.a5.methodTitle")}</p>
              <ul className="list-disc pl-5 space-y-1">
                {list("privacy.a5.methods").map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          </Section>

          <Section title={r("privacy.a6.title")}>
            <ol className="list-decimal pl-5 space-y-2">
              {list("privacy.a6.items").map((x) => <li key={x}>{x}</li>)}
            </ol>
          </Section>

          <Section title={r("privacy.a7.title")}>
            <p>{r("privacy.a7.p")}</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              {(t.raw("privacy.a7.items") as { title: string; body: string }[]).map((x) => (
                <li key={x.title}>
                  <span className={B}>{x.title}</span>
                  <br />
                  {x.body}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={r("privacy.a8.title")}>
            <p>{r("privacy.a8.p")}</p>
            <div className="mt-3 space-y-2">
              {(t.raw("privacy.a8.items") as { label: string; body: string }[]).map((x) => (
                <p key={x.label}>
                  <span className={B}>{x.label}</span> {x.body}
                </p>
              ))}
              <p>
                <span className={B}>{r("privacy.a8.gaLabel")}</span> {r("privacy.a8.gaBefore")}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline">
                  tools.google.com/dlpage/gaoptout
                </a>
                {r("privacy.a8.gaAfter")}
              </p>
            </div>
          </Section>

          <Section title={r("privacy.a9.title")}>
            <p>{r("privacy.a9.p")}</p>
            <div className="mt-3 bg-white rounded-lg p-4 border border-[#F0E0DC]">
              <p className="font-semibold text-[#4C261E]">{r("privacy.a9.boxTitle")}</p>
              <p className="mt-2">{r("privacy.a9.name")}</p>
              <p>{r("privacy.a9.email")}</p>
            </div>
            <p className="mt-3 text-[#555]">{r("privacy.a9.note")}</p>
          </Section>

          <Section title={r("privacy.a10.title")}>
            <p>{r("privacy.a10.p")}</p>
            <div className="mt-3 bg-white rounded-lg p-4 border border-[#F0E0DC]">
              <p className="font-semibold text-[#4C261E]">{r("privacy.a10.boxTitle")}</p>
              <p className="mt-2">{r("privacy.a10.email")}</p>
            </div>
          </Section>

          <Section title={r("privacy.a11.title")}>
            <p>{r("privacy.a11.p")}</p>
            <div className="mt-3 space-y-3">
              {(t.raw("privacy.a11.orgs") as { name: string; lines: string[] }[]).map((o) => (
                <div key={o.name} className="bg-white rounded-lg p-4 border border-[#F0E0DC] space-y-2">
                  <p className={B}>{o.name}</p>
                  {o.lines.map((l) => (
                    <p key={l} className="text-sm text-[#555]">
                      {l}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </Section>

          <Section title={r("privacy.a12.title")}>
            <p>{r("privacy.a12.p")}</p>
          </Section>

          <div className="pt-8 border-t border-[#F0E0DC]">
            <p className="text-[#999] text-xs">{r("privacy.footer.effective")}</p>
            <ul className="mt-2 text-[#999] text-xs space-y-1">
              {list("privacy.footer.history").map((h) => <li key={h}>{h}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#FFF0EC]">
            {head.map((h) => (
              <th key={h} className="border border-[#F0E0DC] px-3 py-2 text-left text-[#4C261E] font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((c, i) => (
                <td key={i} className={`border border-[#F0E0DC] px-3 py-2${i === 0 ? " font-medium" : ""}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Intro({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg p-5 border border-[#F0E0DC] text-[#555]">
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
      <h2 className="text-base sm:text-lg font-bold text-[#4C261E] mb-3 pb-2 border-b border-[#F0E0DC]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pl-3 border-l-2 border-[#FF9883]">
      <p className="font-medium text-[#4C261E]">{title}</p>
      <p className="mt-1 text-[#555]">{children}</p>
    </div>
  );
}
