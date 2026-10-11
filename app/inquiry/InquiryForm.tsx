"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createInquiry, INQUIRY_CATEGORIES, INQUIRY_CONTENT_MAX, INQUIRY_TITLE_MAX, type InquiryCategory } from "@/lib/api";
import { showAlert } from "@/components/ui/AppAlert";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/** 문의 남기기. 성공하면 비우고 아래 "내 문의" 목록을 새로 불러온다 */
export default function InquiryForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState<InquiryCategory | "">("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.backendToken || submitting) return;
    if (!category) return showAlert("문의 분류를 골라 주세요.", { tone: "error" });
    if (!title.trim()) return showAlert("제목을 적어 주세요.", { tone: "error" });
    if (!content.trim()) return showAlert("문의 내용을 적어 주세요.", { tone: "error" });
    setSubmitting(true);
    try {
      await createInquiry({ category, title: title.trim(), content: content.trim() }, session.backendToken);
      setCategory("");
      setTitle("");
      setContent("");
      showAlert("문의를 남겼어요. 답변은 내 문의에서 볼 수 있어요.", { tone: "success" });
      router.refresh();
    } catch (err) {
      showAlert(err instanceof Error ? err.message : "문의를 남기지 못했어요. 다시 시도해 주세요.", { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="paper flex flex-col gap-7 p-10 mobile-down:gap-6 mobile-down:px-5 mobile-down:pb-7 mobile-down:pt-8 mobile-down:shadow-none">
      <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2.5 p-0 font-pen text-[22px]">분류</legend>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_CATEGORIES.map((c) => (
            <label key={c} className="chip cursor-pointer has-checked:border-ink has-checked:bg-cream has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink">
              <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} className="sr-only" />
              {c}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2.5">
        <span className="flex items-baseline justify-between font-pen text-[22px]">
          제목
          <span className="font-anton text-xs tracking-[0.1em] text-ink-3">
            {title.length} / {INQUIRY_TITLE_MAX}
          </span>
        </span>
        <input type="text" name="title" value={title} maxLength={INQUIRY_TITLE_MAX} onChange={(e) => setTitle(e.target.value)} className={`field ${FOCUS}`} placeholder="어떤 일인지 짧게 적어 주세요" />
      </label>

      <label className="flex flex-col gap-2.5">
        <span className="flex items-baseline justify-between font-pen text-[22px]">
          내용
          <span className="font-anton text-xs tracking-[0.1em] text-ink-3">
            {content.length} / {INQUIRY_CONTENT_MAX}
          </span>
        </span>
        <textarea
          name="content"
          rows={8}
          value={content}
          maxLength={INQUIRY_CONTENT_MAX}
          onChange={(e) => setContent(e.target.value)}
          className={`field resize-y py-3 text-base leading-[1.8] ${FOCUS}`}
          placeholder="언제, 어떤 화면에서 생긴 일인지 적어 주시면 더 빨리 도와드릴 수 있어요."
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4 mobile-down:flex-col-reverse mobile-down:items-stretch">
        <p className="m-0 text-[13px] leading-[1.7] text-ink-3">
          메일로도 받아요
          <a href="mailto:letter-community@naver.com" className="flex min-h-11 items-center text-airblue hover:text-brick">
            <span className="border-b border-current">letter-community@naver.com</span>
          </a>
        </p>
        <button type="submit" disabled={submitting} aria-busy={submitting} className="btn btn-brick min-h-[52px] text-[26px] disabled:opacity-60 mobile-down:min-h-14">
          {submitting ? "남기는 중" : "문의 남기기"}
        </button>
      </div>
    </form>
  );
}
