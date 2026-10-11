"use client";

import { track } from "@/lib/analytics/ga";
import { showAlert } from "@/components/ui/AppAlert";
import { useState, useEffect, useLayoutEffect, useRef, useCallback, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { createLetter, createStory, getLetter, updateLetter } from "@/lib/api";
import { getDraft } from "@/lib/draft-api";
import { useDraftManualSave } from "@/hooks/useDraftManualSave";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import ShareModal from "@/components/ShareModal";
import type { DraftLetter } from "@/types/draft";

type Kind = "story" | "friend";
type Envelope = "seongsu" | "myeongdong";

const CATEGORIES = ["위로", "가족", "감사", "사랑", "성장", "우정", "추억", "기타"] as const;
const ENVELOPES: { id: Envelope; name: string; src: string }[] = [
  { id: "seongsu", name: "성수", src: "/v8/envelope-seongsu.png" },
  { id: "myeongdong", name: "명동", src: "/v8/envelope-myeongdong.png" },
];
export const CONTENT_MAX = 2000;

/* 편지지 기하. 보드 720×1012 기준, 모두 편지지 폭(cqw) 비율로 두어 358px 에서도 같은 코드 */
const LINES_PER_PAGE = 9;
const PAPER = {
  sheet: 1012 / 7.2, // 140.56cqw
  line: 57.1 / 7.2, // 7.93cqw = 괘선 간격
  padL: 69 / 7.2,
  padR: 70 / 7.2,
  toTop: 215.4 / 7.2,
  bodyTop: 272.2 / 7.2,
  fromLeft: 130 / 7.2,
};
const PAGE_BODY = PAPER.line * LINES_PER_PAGE; // 71.375cqw
const TAIL = PAPER.sheet - PAPER.bodyTop - PAGE_BODY; // From. 줄 + 아래 여백
const cq = (n: number) => `${n.toFixed(4)}cqw`;
const WRAP = "mx-auto w-full max-w-[1180px] px-6 mobile-down:px-4";
const LEGEND = "mb-3 w-full border-b-2 border-ink p-0 font-pen text-[26px] mobile-down:text-2xl";

/** 예전 HTML(TipTap) 편지·임시저장을 textarea 에 넣기 위한 변환. 응답 contentType 이 html 일 때만 부른다 */
function htmlToText(s: string) {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function WriteForm() {
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
  const [envelope, setEnvelope] = useState<Envelope>("seongsu");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [pages, setPages] = useState(1);
  const [lines, setLines] = useState(1);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!draftId || !!editId);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId ?? undefined);
  const [share, setShare] = useState<{ url: string; title: string; to?: string } | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  // 입력 전에 줄 수를 미리 재는 빈 상자(React 가 자식을 관리하지 않으니 textContent 를 바꿔도 된다)
  const probeRef = useRef<HTMLDivElement>(null);
  const lastWarn = useRef(0);
  const lastFit = useRef(""); // 마지막으로 9줄 안에 들었던 본문(한글 조합이 끝났을 때 되돌릴 값)
  const warnFull = () => {
    if (Date.now() - lastWarn.current < 2500) return;
    lastWarn.current = Date.now();
    showAlert(`편지지 한 장은 본문 ${LINES_PER_PAGE}줄까지예요.`, { tone: "error" });
  };
  const countLines = (text: string) => {
    const p = probeRef.current;
    if (!p) return 1;
    p.textContent = text + "\u200b";
    const lineH = parseFloat(getComputedStyle(p).lineHeight) || 1;
    return Math.max(1, Math.round(p.offsetHeight / lineH));
  };

  /* 줄 수 → 장 수. textarea 와 같은 폭·폰트·줄간격의 숨은 mirror div 높이만 읽는다(DOM 을 바꾸지 않으니 리사이즈 루프 없음) */
  const measure = useCallback(() => {
    const m = mirrorRef.current;
    if (!m) return;
    const lineH = parseFloat(getComputedStyle(m).lineHeight) || 1;
    const n = Math.max(1, Math.round(m.offsetHeight / lineH));
    const next = Math.max(1, Math.ceil(n / LINES_PER_PAGE));
    setLines((l) => (l === n ? l : n));
    setPages((p) => (p === next ? p : next));
  }, []);

  useLayoutEffect(measure, [measure, content, kind]);
  // 편지지 폭이 바뀔 때만(높이 변화는 무시) rAF 한 번으로 다시 잰다
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    let width = sheet.clientWidth;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (sheet.clientWidth === width) return;
      width = sheet.clientWidth;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });
    ro.observe(sheet);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [measure, kind]); // 사연 ↔ 마음 편지 전환 때 편지지가 새로 붙는다

  const applyDraft = useCallback((d: DraftLetter) => {
    setTitle(d.title ?? "");
    lastFit.current = (d.contentType === "html" ? htmlToText(d.content ?? "") : (d.content ?? "")).slice(0, CONTENT_MAX);
    setContent(lastFit.current);
    if (d.type === "story" || d.type === "friend") setKind(d.type);
    if (d.category && (CATEGORIES as readonly string[]).includes(d.category)) setCategory(d.category);
    if (d.envelope) setEnvelope(d.envelope);
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
        showAlert("임시저장을 불러올 수 없습니다.", { tone: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [draftId, session?.backendToken, applyDraft]);

  // ?id= 기존 편지 수정
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const { data } = await getLetter(editId);
        setTitle(data.title ?? "");
        lastFit.current = (data.contentType === "html" ? htmlToText(data.content ?? "") : (data.content ?? "")).slice(0, CONTENT_MAX);
        setContent(lastFit.current);
        if (data.type === "story" || data.type === "friend") setKind(data.type);
        if (data.category && (CATEGORIES as readonly string[]).includes(data.category)) setCategory(data.category);
        if (data.envelope) setEnvelope(data.envelope);
        setIsAnonymous(data.isAnonymous ?? false); // 레거시 편지는 실명 작성
        setTo(data.recipientName ?? "");
        setDirty(false);
      } catch (e) {
        console.error("편지 불러오기 실패:", e);
        showAlert("편지를 불러올 수 없습니다.", { tone: "error" });
        router.push("/letter-box");
      } finally {
        setLoading(false);
      }
    })();
  }, [editId, router]);

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

  useBeforeUnload({ when: dirty && (content.length > 10 || title.length > 0), message: kind === "story" ? "쓰던 사연이 저장되지 않았어요. 나갈까요?" : "쓰던 편지가 저장되지 않았어요. 나갈까요?" });

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
    if (!letterTitle) return showAlert("제목을 입력해주세요.", { tone: "error" });
    // 실물 편지지와 같은 한 장(본문 9줄). 예전에 길게 저장된 편지만 여기 걸린다
    if (kind === "friend" && lines > LINES_PER_PAGE) return showAlert(`편지지 한 장은 본문 ${LINES_PER_PAGE}줄까지예요. ${lines - LINES_PER_PAGE}줄을 줄여 주세요.`, { tone: "error" });
    if (!body) return showAlert("내용을 입력해주세요.", { tone: "error" });
    if (body.length > CONTENT_MAX) return showAlert(`내용은 ${CONTENT_MAX}자 이내여야 합니다.`, { tone: "error" });

    const token = session?.backendToken;
    const ogPreviewText = body.slice(0, 60) + (body.length > 60 ? "..." : "");
    const common = { title: letterTitle, content: body, contentType: "text" as const, category, envelope, isAnonymous, recipientName: kind === "story" ? undefined : to.trim() || undefined, ogTitle: letterTitle, ogPreviewText };
    setSubmitting(true);
    try {
      if (editId) {
        await updateLetter(editId, common, token as string);
        setDirty(false);
        track("letter_update", { letter_type: kind, letter_id: editId });
        showAlert(kind === "story" ? "사연을 고쳤어요." : "편지를 고쳤어요.", { tone: "success" });
        router.push(`/letter/${editId}`);
        return;
      }
      if (kind === "story") {
        const result = await createStory({ ...common, authorName: isAnonymous ? "익명" : session?.user?.name || "익명" }, token);
        track("story_create", { letter_type: "story", category, is_public: true, content_length: body.length });
        setDirty(false);
        showAlert("사연을 남겼어요.", { tone: "success" });
        router.push(result?.data?._id ? `/letter/${result.data._id}` : "/stories");
        return;
      }
      const result = await createLetter({ ...common, type: "friend", replyToId: replyTo || undefined }, token);
      track("letter_create", { letter_type: "friend", is_reply: !!replyTo, is_public: false, content_length: body.length });
      setDirty(false);
      setShare({ url: result.data.url, title: result.data.title, to: to.trim() || undefined });
    } catch (err) {
      console.error("등록 실패:", err);
      showAlert(err instanceof Error ? err.message : "등록에 실패했습니다. 다시 시도해주세요.", { tone: "error" });
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
      <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">천천히 써도 괜찮아요</p>
      <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">{isStory ? "사연 남기기" : "편지 쓰기"}</h1>
    </section>
  );

  if (loading)
    return (
      <>
        {header}
        <p className={`${WRAP} pb-24 font-pen text-xl text-ink-3`}>불러오는 중...</p>
      </>
    );

  const fromName = isStory ? (isAnonymous ? "익명" : session?.user?.name || "익명") : isAnonymous ? "익명의 당신" : session?.user?.name || "익명의 당신";
  const bodyHeight = PAGE_BODY * pages;
  const sheetImg = (offset: number): CSSProperties => ({ width: "100%", height: cq(PAPER.sheet), marginTop: offset ? `-${cq(offset)}` : 0, display: "block", maxWidth: "none" });
  const penLine: CSSProperties = { lineHeight: cq(PAPER.line), height: cq(PAPER.line) };

  return (
    <>
      {header}
      <form onSubmit={handleSubmit} className={`${WRAP} write-grid pb-24 mobile-down:pb-0`}>
        {/* 어떤 편지인가요 */}
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0 [grid-area:kind] mobile-down:flex-row mobile-down:gap-2">
          <legend className={`${LEGEND} mobile-down:sr-only`}>어떤 편지인가요</legend>
          {(
            [
              { id: "story", name: "사연 편지", desc: "털어놓으면 레터가 답장을 써요.", mdesc: "레터가 답장을 써요", color: "text-brick", on: "border-2 border-brick", accent: "accent-brick" },
              { id: "friend", name: "마음 편지", desc: "아는 사람에게 링크로 보내요.", mdesc: "아는 사람에게 · 링크로 보내요", color: "text-airblue", on: "border-2 border-airblue", accent: "accent-airblue" },
            ] as const
          ).map((k) => (
            <label
              key={k.id}
              className={`grid cursor-pointer grid-cols-[18px_1fr] items-center gap-x-3 gap-y-1 rounded-[3px] bg-paper p-4 mobile-down:flex-1 mobile-down:gap-x-2 mobile-down:px-3.5 mobile-down:py-3 ${kind === k.id ? k.on : "border-[1.5px] border-rule"} ${editId && kind !== k.id ? "hidden" : ""}`}
            >
              <input type="radio" name="kind" value={k.id} checked={kind === k.id} onChange={() => setKind(k.id)} disabled={!!editId} className={`h-[18px] w-[18px] ${k.accent}`} />
              <span className={`font-pen text-2xl leading-none mobile-down:text-[22px] ${k.color}`}>{k.name}</span>
              <span className="col-start-2 text-sm leading-[1.7] text-ink-2 mobile-down:col-span-2 mobile-down:col-start-1 mobile-down:text-xs mobile-down:leading-[1.6]">
                <span className="mobile-down:hidden">{k.desc}</span>
                <span className="hidden mobile-down:inline">{k.mdesc}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {/* 제목 + 편지지 */}
        <div className="flex flex-col gap-4 [grid-area:paper]">
          <label htmlFor="title" className="flex max-w-[720px] flex-col gap-1">
            <span className="font-pen text-xl text-ink-2">{isStory ? "사연 제목" : "제목"}</span>
            <input
              id="title"
              type="text"
              className="field font-pen text-2xl"
              placeholder={isStory ? "한 줄로 적어 주세요" : "제목을 입력해주세요"}
              maxLength={100}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              required
            />
            <span className="text-[13px] text-ink-3">{isStory ? "사연 목록과 사연 화면에 보여요." : "제목은 목록과 링크에만 보여요."}</span>
          </label>

          {isStory ? (
            <StorySheet
              to="레터"
              from={fromName}
              content={content}
              onChange={(v) => {
                setContent(v);
                setDirty(true);
              }}
            />
          ) : (
            <>
              {/* --baseline-shift: 보드 수치 그대로면 본문 기준선이 괘선에서 6px 떠서(원칙 2~4px) textarea 만 내린다. To./From. 은 정상 */}
              <div ref={sheetRef} className="@container relative w-full max-w-[720px] shadow-[var(--paper-shadow)] [--baseline-shift:3px] mobile-down:[--baseline-shift:-2px]" aria-label="편지지" role="group">
                {/* 편지지 그림: 머리 / 본문 띠(장 수만큼) / 꼬리. 띠를 이어 붙여 괘선이 끊기지 않게 */}
                <div className="overflow-hidden" style={{ height: cq(PAPER.bodyTop) }} aria-hidden="true">
                  <Image src="/v8/letter-paper.png" alt="" width={1024} height={1440} priority style={sheetImg(0)} />
                </div>
                {Array.from({ length: pages }, (_, i) => (
                  <div key={i} className="overflow-hidden" style={{ height: cq(PAGE_BODY) }} aria-hidden="true">
                    <Image src="/v8/letter-paper.png" alt="" width={1024} height={1440} style={sheetImg(PAPER.bodyTop)} />
                  </div>
                ))}
                <div className="overflow-hidden" style={{ height: cq(TAIL) }} aria-hidden="true">
                  <Image src="/v8/letter-paper.png" alt="" width={1024} height={1440} style={sheetImg(PAPER.bodyTop + PAGE_BODY)} />
                </div>

                <label htmlFor="to" className="absolute flex items-baseline gap-2 font-pen text-[26px] text-brick mobile-down:text-xl" style={{ ...penLine, left: cq(PAPER.padL), right: cq(PAPER.padR), top: cq(PAPER.toTop) }}>
                  To.
                  <input
                    id="to"
                    type="text"
                    placeholder="받는 사람 (비우면 모두에게)"
                    maxLength={50}
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setDirty(true);
                    }}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 font-pen text-[26px] text-ink outline-none placeholder:text-ink-3 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink mobile-down:text-xl"
                    style={penLine}
                  />
                </label>
                <label htmlFor="body" className="sr-only">
                  내용
                </label>
                {/* 측정용 mirror: textarea 와 같은 폭·폰트·줄바꿈 규칙 */}
                <div
                  ref={mirrorRef}
                  aria-hidden="true"
                  className="pointer-events-none invisible absolute top-0 whitespace-pre-wrap font-sans text-[19px] [overflow-wrap:break-word] mobile-down:text-base"
                  style={{ left: cq(PAPER.padL), right: cq(PAPER.padR), lineHeight: cq(PAPER.line) }}
                >
                  {content}
                  {"\u200b"}
                </div>
                <div
                  ref={probeRef}
                  aria-hidden="true"
                  className="pointer-events-none invisible absolute top-0 whitespace-pre-wrap font-sans text-[19px] [overflow-wrap:break-word] mobile-down:text-base"
                  style={{ left: cq(PAPER.padL), right: cq(PAPER.padR), lineHeight: cq(PAPER.line) }}
                />
                <textarea
                  id="body"
                  placeholder="여기에 당신의 마음을 담아주세요..."
                  maxLength={CONTENT_MAX}
                  value={content}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDirty(true);
                    // 한글 조합 중에는 막지 않는다(막으면 글자가 깨짐). 조합이 끝나면 onCompositionEnd 에서 판정
                    if ((e.nativeEvent as InputEvent).isComposing) return setContent(v);
                    // 실물 편지지와 똑같이 본문 9줄(To 1 + 본문 9 + From 1 = 11줄)을 넘는 입력은 받지 않는다. 지우는 건 언제나 허용
                    if (v.length > content.length && countLines(v) > LINES_PER_PAGE) return warnFull();
                    lastFit.current = v;
                    setContent(v);
                  }}
                  onCompositionEnd={(e) => {
                    const v = e.currentTarget.value;
                    if (countLines(v) > LINES_PER_PAGE) {
                      setContent(lastFit.current);
                      warnFull();
                    } else lastFit.current = v;
                  }}
                  className="absolute resize-none overflow-hidden border-0 bg-transparent p-0 font-sans text-[19px] text-ink outline-none placeholder:text-ink-3 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink mobile-down:text-base"
                  style={{ left: cq(PAPER.padL), right: cq(PAPER.padR), top: `calc(${cq(PAPER.bodyTop)} + var(--baseline-shift))`, height: cq(bodyHeight), lineHeight: cq(PAPER.line) }}
                  required
                />
                <p className="absolute m-0 text-right font-pen text-[26px] text-ink-2 mobile-down:text-xl" style={{ ...penLine, left: cq(PAPER.fromLeft), right: cq(PAPER.padR), top: cq(PAPER.bodyTop + bodyHeight) }}>
                  From. {fromName}
                </p>
              </div>

              <div className="flex max-w-[720px] flex-wrap items-center justify-end gap-3">
                <span className="flex items-center gap-2.5">
                  <span className={`badge ${lines > LINES_PER_PAGE ? "bg-brick" : "bg-ink"}`}>
                    {Math.min(lines, 99)} / {LINES_PER_PAGE}줄
                  </span>
                  <span className="font-anton text-[13px] tracking-[0.1em] text-ink-3" aria-live="polite">
                    {content.length} / {CONTENT_MAX}
                  </span>
                </span>
              </div>
              <p className="m-0 max-w-[720px] text-sm leading-[1.7] text-ink-2">편지지 한 장, 본문 9줄까지 써요. 실물 편지도 같은 줄로 옮겨 적어요.</p>
            </>
          )}
          {isStory && (
            <div className="flex max-w-[720px] flex-wrap items-center justify-between gap-3">
              <p className="m-0 text-sm leading-[1.7] text-ink-2">길어지면 아래로 이어져요.</p>
              <span className="font-anton text-[13px] tracking-[0.1em] text-ink-3" aria-live="polite">
                {content.length} / {CONTENT_MAX}
              </span>
            </div>
          )}
        </div>

        {/* 마음 · 봉투 · 익명 */}
        <div className="flex flex-col gap-7 [grid-area:side] mobile-down:gap-6">
          <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
            <legend className={LEGEND}>어떤 마음인가요</legend>
            <div className="flex flex-wrap gap-2 mobile-down:flex-nowrap mobile-down:overflow-x-auto mobile-down:pb-1.5 mobile-down:[scrollbar-width:thin]">
              {CATEGORIES.map((c) => (
                <label key={c} className={`chip relative cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-airblue ${category === c ? "chip-on" : ""}`}>
                  <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} className="sr-only" />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>

          {!isStory && (
            <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
              <legend className={LEGEND}>어떤 봉투에 담을까요</legend>
              <div className="flex flex-wrap gap-3 px-0.5 py-1">
                {ENVELOPES.map((env) => (
                  <label key={env.id} className="swatch">
                    <input type="radio" name="envelope" value={env.id} checked={envelope === env.id} onChange={() => setEnvelope(env.id)} className="sr-only" />
                    <span className="pv h-[98px] w-[140px] mobile-down:h-[105px] mobile-down:w-[150px]">
                      <Image src={env.src} alt={`${env.name} 봉투`} width={504} height={352} className="block h-full w-full object-cover" />
                    </span>
                    <span className="nm">{env.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="flex min-h-11 cursor-pointer items-center gap-3 mobile-down:gap-2.5">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-[18px] w-[18px] accent-ink" />
            <span className="text-[15px] text-ink-2 mobile-down:text-sm">익명으로 올려요</span>
          </label>
        </div>

        {/* 버튼. 모바일은 화면 아래 고정 */}
        <div className="mt-2 flex flex-col gap-2.5 [grid-area:act] mobile-down:sticky mobile-down:bottom-0 mobile-down:-mx-4 mobile-down:mt-0 mobile-down:flex-row mobile-down:flex-wrap mobile-down:border-t mobile-down:border-rule mobile-down:bg-cream/95 mobile-down:px-4 mobile-down:pb-5 mobile-down:pt-3">
          {isStory && !editId && <p className="m-0 text-sm leading-[1.7] text-ink-2 mobile-down:order-0 mobile-down:basis-full mobile-down:text-[13px]">레터가 꼭 답장해요. 우편함에서 받아요.</p>}
          <button type="submit" disabled={submitting} className="btn btn-brick min-h-14 text-[28px] disabled:opacity-60 mobile-down:order-3 mobile-down:flex-1">
            {submitting ? (isStory ? "남기는 중…" : "보내는 중...") : editId ? "수정 완료" : isStory ? "사연 남기기" : "편지 보내기"}
          </button>
          <button type="button" onClick={manualSave} disabled={saveState.status === "saving"} className="btn btn-ink disabled:opacity-60 mobile-down:order-1 mobile-down:min-h-14 mobile-down:px-4 mobile-down:text-[22px]">
            {saveState.status === "saving" ? "저장 중..." : "임시저장"}
          </button>
          <p className="m-0 mt-1.5 text-[13px] leading-[1.7] text-ink-3 mobile-down:hidden">
            <Link href="/drafts" className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-brick">
              임시저장 목록
            </Link>
            에서 이어 쓸 수 있어요.
          </p>
        </div>

        <ShareModal isOpen={!!share} onClose={closeShare} letterUrl={share?.url || ""} letterTitle={share?.title || ""} recipientName={share?.to} />
      </form>
    </>
  );
}

/** 사연 쓰기 종이. 사연 상세와 같은 paper·ruled(괘선 36px) 위에 To./본문/From. 이 줄마다 앉는다.
 * 높이는 같은 칸에 겹친 숨은 mirror 가 정하고 textarea 는 그 칸을 채운다(JS 측정 없음) */
function StorySheet({ to, from, content, onChange }: { to: string; from: string; content: string; onChange: (v: string) => void }) {
  return (
    <div className="paper ruled flex w-full max-w-[720px] flex-col px-14 py-[72px] mobile-down:px-5 mobile-down:py-9" role="group" aria-label="사연 종이">
      <p className="m-0 font-pen text-[28px] leading-9 text-brick mobile-down:text-2xl">To. {to}</p>
      <label htmlFor="body" className="sr-only">
        사연
      </label>
      <div className="grid min-h-[324px] [grid-template-areas:'s'] *:[grid-area:s]">
        <div aria-hidden="true" className="invisible whitespace-pre-wrap text-[19px] leading-9 [overflow-wrap:break-word]">
          {content}
          {"\u200b"}
        </div>
        <textarea
          id="body"
          placeholder="털어놓고 싶은 이야기를 적어 주세요."
          maxLength={CONTENT_MAX}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="block h-full w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-sans text-[19px] leading-9 [--mobile-fs:19px] text-ink outline-none [overflow-wrap:break-word] placeholder:text-ink-3 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          required
        />
      </div>
      <p className="m-0 mt-9 self-end font-pen text-[26px] leading-9 text-ink-2 mobile-down:text-2xl">From. {from}</p>
    </div>
  );
}
