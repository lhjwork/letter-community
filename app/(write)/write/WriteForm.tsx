"use client";

import { track } from "@/lib/analytics/ga";
import { showAlert } from "@/components/ui/AppAlert";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { createLetter, createStory, getLetter, updateLetter } from "@/lib/api";
import { getDraft } from "@/lib/draft-api";
import { useDraftManualSave } from "@/hooks/useDraftManualSave";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import ShareModal from "@/components/ShareModal";
import LetterPages, { LINES_PER_PAGE } from "@/components/LetterPages";
import { htmlToText } from "@/lib/letterText";
import type { DraftLetter } from "@/types/draft";

type Kind = "story" | "friend";
type Envelope = "seongsu" | "myeongdong" | "letter";

const CATEGORIES = ["위로", "가족", "감사", "사랑", "성장", "우정", "추억", "기타"] as const;
// 값은 DB 에 그대로 저장되는 한국어. 화면 이름만 번역 키로 바꾼다
const CATEGORY_KEY: Record<(typeof CATEGORIES)[number], string> = { 위로: "comfort", 가족: "family", 감사: "thanks", 사랑: "love", 성장: "growth", 우정: "friendship", 추억: "memories", 기타: "other" };
// soon: 실물 봉투 제작 중이라 아직 고를 수 없다
const ENVELOPES: { id: Envelope; src: string; soon?: boolean }[] = [
  { id: "letter", src: "/v8/envelope-letter-logo.png" },
  { id: "seongsu", src: "/v8/envelope-seongsu.png", soon: true },
  { id: "myeongdong", src: "/v8/envelope-myeongdong.png", soon: true },
];
export const CONTENT_MAX = 2000;

const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";
const LEGEND = "mb-3 w-full border-b-2 border-ink p-0 font-pen text-[26px] mobile-down:text-2xl";

export default function WriteForm() {
  const t = useTranslations("write");
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const replyTo = searchParams.get("replyTo");
  const editId = searchParams.get("id");

  const [kind, setKind] = useState<Kind>(searchParams.get("kind") === "story" ? "story" : "friend");
  const [title, setTitle] = useState("");
  const [to, setTo] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("위로");
  const [envelope, setEnvelope] = useState<Envelope>("letter");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [pages, setPages] = useState(1);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!draftId || !!editId);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId ?? undefined);
  const [share, setShare] = useState<{ url: string; title: string; to?: string } | null>(null);

  const applyDraft = useCallback((d: DraftLetter) => {
    setTitle(d.title ?? "");
    setContent((d.contentType === "html" ? htmlToText(d.content ?? "") : (d.content ?? "")).slice(0, CONTENT_MAX));
    if (d.type === "story" || d.type === "friend") setKind(d.type);
    if (d.category && (CATEGORIES as readonly string[]).includes(d.category)) setCategory(d.category);
    if (d.envelope && !ENVELOPES.find((e) => e.id === d.envelope)?.soon) setEnvelope(d.envelope);
    if (typeof d.isAnonymous === "boolean") setIsAnonymous(d.isAnonymous);
    setTo(d.recipientName ?? "");
    setCurrentDraftId(d._id);
    setDirty(false);
  }, []);

  // ?draftId= 임시저장 불러오기
  useEffect(() => {
    if (!draftId || !session?.backendToken) return;
    (async () => {
      try {
        const res = await getDraft(session.backendToken as string, draftId);
        if (res.success) applyDraft(res.data);
      } catch (e) {
        console.error("임시저장 불러오기 실패:", e);
        showAlert(t("form.errors.draftLoad"), { tone: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [draftId, session?.backendToken, applyDraft, t]);

  // ?id= 기존 편지 수정
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const { data } = await getLetter(editId);
        setTitle(data.title ?? "");
        setContent((data.contentType === "html" ? htmlToText(data.content ?? "") : (data.content ?? "")).slice(0, CONTENT_MAX));
        if (data.type === "story" || data.type === "friend") setKind(data.type);
        if (data.category && (CATEGORIES as readonly string[]).includes(data.category)) setCategory(data.category);
        if (data.envelope && !ENVELOPES.find((e) => e.id === data.envelope)?.soon) setEnvelope(data.envelope);
        setIsAnonymous(data.isAnonymous ?? false); // 레거시 편지는 실명 작성
        setTo(data.recipientName ?? "");
        setDirty(false);
      } catch (e) {
        console.error("편지 불러오기 실패:", e);
        showAlert(t("form.errors.letterLoad"), { tone: "error" });
        router.push("/letter-box");
      } finally {
        setLoading(false);
      }
    })();
  }, [editId, router, t]);

  const { saveState, manualSave } = useDraftManualSave({
    content,
    contentType: "text",
    title,
    type: kind,
    category,
    envelope,
    isAnonymous,
    recipientName: kind === "story" ? undefined : to, // 사연은 늘 "To. 레터"
    draftId: currentDraftId,
    onSave: (id) => {
      setCurrentDraftId(id);
      setDirty(false);
    },
    onError: (msg) => showAlert(msg, { tone: "error" }),
  });

  useBeforeUnload({ when: dirty && (content.length > 10 || title.length > 0), message: kind === "story" ? t("form.leaveStory") : t("form.leaveFriend") });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        manualSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [manualSave]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = content.trim();
    const letterTitle = title.trim();
    if (!letterTitle) return showAlert(t("form.errors.titleRequired"), { tone: "error" });
    if (!body) return showAlert(t("form.errors.contentRequired"), { tone: "error" });
    if (body.length > CONTENT_MAX) return showAlert(t("form.errors.contentMax", { max: CONTENT_MAX }), { tone: "error" });

    const token = session?.backendToken;
    const ogPreviewText = body.slice(0, 60) + (body.length > 60 ? "..." : "");
    const common = { title: letterTitle, content: body, contentType: "text" as const, category, envelope, isAnonymous, recipientName: kind === "story" ? undefined : to.trim() || undefined, ogTitle: letterTitle, ogPreviewText };
    setSubmitting(true);
    try {
      if (editId) {
        await updateLetter(editId, common, token as string);
        setDirty(false);
        track("letter_update", { letter_type: kind, letter_id: editId });
        showAlert(kind === "story" ? t("form.done.editStory") : t("form.done.editFriend"), { tone: "success" });
        router.push(`/letter/${editId}`);
        return;
      }
      if (kind === "story") {
        const result = await createStory({ ...common, authorName: isAnonymous ? "익명" : session?.user?.name || "익명" }, token);
        track("story_create", { letter_type: "story", category, is_public: true, content_length: body.length });
        setDirty(false);
        showAlert(t("form.done.story"), { tone: "success" });
        router.push(result?.data?._id ? `/letter/${result.data._id}` : "/stories");
        return;
      }
      const result = await createLetter({ ...common, type: "friend", replyToId: replyTo || undefined }, token);
      track("letter_create", { letter_type: "friend", is_reply: !!replyTo, is_public: false, content_length: body.length });
      setDirty(false);
      setShare({ url: result.data.url, title: result.data.title, to: to.trim() || undefined });
    } catch (err) {
      console.error("등록 실패:", err);
      showAlert(err instanceof Error ? err.message : t("form.errors.submit"), { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const closeShare = () => {
    setShare(null);
    router.push(replyTo ? `/letter/${replyTo}` : "/");
  };

  const isStory = kind === "story";
  const header = (
    <section className={`${WRAP} flex flex-col gap-3 pb-10 pt-5 mobile-down:gap-2 mobile-down:pb-6 mobile-down:pt-3`}>
      <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">{t("form.eyebrow")}</p>
      <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">{isStory ? t("form.titleStory") : t("form.titleFriend")}</h1>
    </section>
  );

  if (loading)
    return (
      <>
        {header}
        <p className={`${WRAP} pb-24 font-pen text-xl text-ink-3`}>{t("loading")}</p>
      </>
    );

  const anon = isStory ? t("form.fromAnonymousStory") : t("form.fromAnonymousFriend");
  const fromName = isAnonymous ? anon : session?.user?.name || anon;

  return (
    <>
      {header}
      <form onSubmit={handleSubmit} className={`${WRAP} write-grid pb-24 mobile-down:pb-0`}>
        {/* 어떤 편지인가요 */}
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0 [grid-area:kind] mobile-down:flex-row mobile-down:gap-2">
          <legend className={`${LEGEND} mobile-down:sr-only`}>{t("form.kindLegend")}</legend>
          {(
            [
              { id: "story", color: "text-brick", on: "border-2 border-brick", accent: "accent-brick" },
              { id: "friend", color: "text-airblue", on: "border-2 border-airblue", accent: "accent-airblue" },
            ] as const
          ).map((k) => (
            <label
              key={k.id}
              className={`grid cursor-pointer grid-cols-[18px_1fr] items-center gap-x-3 gap-y-1 rounded-[3px] bg-paper p-4 mobile-down:flex-1 mobile-down:gap-x-2 mobile-down:px-3.5 mobile-down:py-3 ${kind === k.id ? k.on : "border-[1.5px] border-rule"} ${editId && kind !== k.id ? "hidden" : ""}`}
            >
              <input type="radio" name="kind" value={k.id} checked={kind === k.id} onChange={() => setKind(k.id)} disabled={!!editId} className={`h-[18px] w-[18px] ${k.accent}`} />
              <span className={`font-pen text-2xl leading-none mobile-down:text-[22px] ${k.color}`}>{t(`form.kind.${k.id}.name`)}</span>
              <span className="col-start-2 text-sm leading-[1.7] text-ink-2 mobile-down:col-span-2 mobile-down:col-start-1 mobile-down:text-xs mobile-down:leading-[1.6]">
                <span className="mobile-down:hidden">{t(`form.kind.${k.id}.desc`)}</span>
                <span className="hidden mobile-down:inline">{t(`form.kind.${k.id}.mdesc`)}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {/* 제목 + 편지지 */}
        <div className="flex flex-col gap-4 [grid-area:paper]">
          <label htmlFor="title" className="flex max-w-[720px] flex-col gap-1">
            <span className="font-pen text-xl text-ink-2">{isStory ? t("form.titleLabelStory") : t("form.titleLabelFriend")}</span>
            <input
              id="title"
              type="text"
              className="field font-pen text-2xl"
              placeholder={isStory ? t("form.titlePlaceholderStory") : t("form.titlePlaceholderFriend")}
              maxLength={100}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              required
            />
            <span className="text-[13px] text-ink-3">{isStory ? t("form.titleHintStory") : t("form.titleHintFriend")}</span>
          </label>

          <label htmlFor="body" className="sr-only">
            {isStory ? t("form.bodyLabelStory") : t("form.bodyLabelFriend")}
          </label>
          <LetterPages
            label={isStory ? t("form.paperLabelStory") : t("form.paperLabelFriend")}
            to={
              isStory ? (
                t("form.toLetter")
              ) : (
                <label htmlFor="to" className="flex min-w-0 flex-1 items-baseline gap-2">
                  To.
                  <input
                    id="to"
                    type="text"
                    autoComplete="off"
                    placeholder={t("form.toPlaceholder")}
                    maxLength={50}
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setDirty(true);
                    }}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 font-pen text-[26px] leading-[inherit] text-ink outline-none placeholder:text-ink-3 mobile-down:text-xl"
                  />
                </label>
              )
            }
            from={`From. ${fromName}`}
            text={content}
            onPages={setPages}
            edit={{
              id: "body",
              placeholder: isStory ? t("form.bodyPlaceholderStory") : t("form.bodyPlaceholderFriend"),
              maxLength: CONTENT_MAX,
              onChange: (v) => {
                setContent(v);
                setDirty(true);
              },
            }}
          />
          <div className="flex max-w-[720px] flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-sm leading-[1.7] text-ink-2">{t("form.pageHint", { lines: LINES_PER_PAGE })}</p>
            <span className="flex items-center gap-2.5">
              <span className="badge bg-ink">{t("form.pages", { count: pages })}</span>
              <span className="font-anton text-[13px] tracking-[0.1em] text-ink-3" aria-live="polite">
                {content.length} / {CONTENT_MAX}
              </span>
            </span>
          </div>
        </div>

        {/* 마음 · 봉투 · 익명 */}
        <div className="flex flex-col gap-7 [grid-area:side] mobile-down:gap-6">
          <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
            <legend className={LEGEND}>{t("form.categoryLegend")}</legend>
            <div className="flex flex-wrap gap-2 mobile-down:flex-nowrap mobile-down:overflow-x-auto mobile-down:pb-1.5 mobile-down:[scrollbar-width:thin]">
              {CATEGORIES.map((c) => (
                <label key={c} className={`chip relative cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-airblue ${category === c ? "chip-on" : ""}`}>
                  <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} className="sr-only" />
                  {t(`form.category.${CATEGORY_KEY[c]}`)}
                </label>
              ))}
            </div>
          </fieldset>

          {!isStory && (
            <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
              <legend className={LEGEND}>{t("form.envelopeLegend")}</legend>
              <div className="flex flex-wrap gap-3 px-0.5 py-1">
                {ENVELOPES.map((env) => (
                  <label key={env.id} className={`swatch ${env.soon ? "cursor-not-allowed" : ""}`}>
                    <input type="radio" name="envelope" value={env.id} checked={envelope === env.id} disabled={env.soon} onChange={() => setEnvelope(env.id)} className="sr-only" />
                    <span className="pv h-[98px] w-[140px] mobile-down:h-[105px] mobile-down:w-[150px]">
                      <Image src={env.src} alt={t("form.envelopeAlt", { name: t(`form.envelope.${env.id}`) })} width={504} height={352} className={`block h-full w-full object-cover ${env.soon ? "opacity-40 grayscale" : ""}`} />
                      {env.soon && <span className="badge absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink">{t("form.envelopeSoon")}</span>}
                    </span>
                    <span className={`nm ${env.soon ? "text-ink-3!" : ""}`}>{t(`form.envelope.${env.id}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="flex min-h-11 cursor-pointer items-center gap-3 mobile-down:gap-2.5">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-[18px] w-[18px] accent-ink" />
            <span className="text-[15px] text-ink-2 mobile-down:text-sm">{t("form.anonymous")}</span>
          </label>
        </div>

        {/* 버튼. 모바일은 화면 아래 고정 */}
        <div className="mt-2 flex flex-col gap-2.5 [grid-area:act] mobile-down:sticky mobile-down:bottom-0 mobile-down:-mx-4 mobile-down:mt-0 mobile-down:flex-row mobile-down:flex-wrap mobile-down:border-t mobile-down:border-rule mobile-down:bg-cream/95 mobile-down:px-4 mobile-down:pb-5 mobile-down:pt-3">
          {isStory && !editId && <p className="m-0 text-sm leading-[1.7] text-ink-2 mobile-down:order-0 mobile-down:basis-full mobile-down:text-[13px]">{t("form.storyNote")}</p>}
          <button type="submit" disabled={submitting} className="btn btn-brick min-h-14 text-[28px] disabled:opacity-60 mobile-down:order-3 mobile-down:flex-1">
            {submitting ? (isStory ? t("form.submittingStory") : t("form.submittingFriend")) : editId ? t("form.submitEdit") : isStory ? t("form.submitStory") : t("form.submitFriend")}
          </button>
          <button type="button" onClick={manualSave} disabled={saveState.status === "saving"} className="btn btn-ink disabled:opacity-60 mobile-down:order-1 mobile-down:min-h-14 mobile-down:px-4 mobile-down:text-[22px]">
            {saveState.status === "saving" ? t("form.saving") : t("form.saveDraft")}
          </button>
          <p className="m-0 mt-1.5 text-[13px] leading-[1.7] text-ink-3 mobile-down:hidden">
            {t.rich("form.draftsHint", {
              link: (chunks) => (
                <Link href="/drafts" className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-brick">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>

        <ShareModal isOpen={!!share} onClose={closeShare} letterUrl={share?.url || ""} letterTitle={share?.title || ""} recipientName={share?.to} />
      </form>
    </>
  );
}
