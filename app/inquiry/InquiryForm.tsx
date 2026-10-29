"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { createInquiry, INQUIRY_CATEGORIES, INQUIRY_CONTENT_MAX, INQUIRY_TITLE_MAX, type InquiryCategory } from "@/lib/api";
import { showAlert } from "@/components/ui/AppAlert";
import { CATEGORY_KEY } from "./status";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/** 문의 남기기. 성공하면 비우고 아래 "내 문의" 목록을 새로 불러온다 */
export default function InquiryForm() {
  const t = useTranslations("inquiry");
  const { data: session } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState<InquiryCategory | "">("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.backendToken || submitting) return;
    if (!category) return showAlert(t("form.needCategory"), { tone: "error" });
    if (!title.trim()) return showAlert(t("form.needTitle"), { tone: "error" });
    if (!content.trim()) return showAlert(t("form.needContent"), { tone: "error" });
    setSubmitting(true);
    try {
      await createInquiry({ category, title: title.trim(), content: content.trim() }, session.backendToken);
      setCategory("");
      setTitle("");
      setContent("");
      showAlert(t("form.sent"), { tone: "success" });
      router.refresh();
    } catch (err) {
      showAlert(err instanceof Error ? err.message : t("form.failed"), { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="paper flex flex-col gap-7 p-10 mobile-down:gap-6 mobile-down:px-5 mobile-down:pb-7 mobile-down:pt-8 mobile-down:shadow-none">
      <div className="airmail absolute inset-x-0 top-0 h-2" aria-hidden="true" />

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2.5 p-0 font-pen text-[22px]">{t("form.category")}</legend>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_CATEGORIES.map((c) => (
            <label key={c} className="chip cursor-pointer has-checked:border-ink has-checked:bg-cream has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink">
              <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} className="sr-only" />
              {t(`categories.${CATEGORY_KEY[c]}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2.5">
        <span className="flex items-baseline justify-between font-pen text-[22px]">
          {t("form.title")}
          <span className="font-anton text-xs tracking-[0.1em] text-ink-3">
            {title.length} / {INQUIRY_TITLE_MAX}
          </span>
        </span>
        <input type="text" name="title" value={title} maxLength={INQUIRY_TITLE_MAX} onChange={(e) => setTitle(e.target.value)} className={`field ${FOCUS}`} placeholder={t("form.titlePlaceholder")} />
      </label>

      <label className="flex flex-col gap-2.5">
        <span className="flex items-baseline justify-between font-pen text-[22px]">
          {t("form.content")}
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
          placeholder={t("form.contentPlaceholder")}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4 mobile-down:flex-col-reverse mobile-down:items-stretch">
        <p className="m-0 text-[13px] leading-[1.7] text-ink-3">
          {t("form.email")}
          <a href="mailto:letter-community@naver.com" className="flex min-h-11 items-center text-airblue hover:text-brick">
            <span className="border-b border-current">letter-community@naver.com</span>
          </a>
        </p>
        <button type="submit" disabled={submitting} aria-busy={submitting} className="btn btn-brick min-h-[52px] text-[26px] disabled:opacity-60 mobile-down:min-h-14">
          {submitting ? t("form.submitting") : t("form.submit")}
        </button>
      </div>
    </form>
  );
}
