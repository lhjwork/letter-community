import { useTranslations } from "next-intl";

/** 사연 목록 결과 없음. v8 문구, Pen 24 */
export default function EmptyState({ filtered = false }: { filtered?: boolean }) {
  const t = useTranslations("shared.stories");
  return (
    <p className="m-0 py-24 text-center font-pen text-2xl text-ink-3 mobile-down:py-16">{filtered ? t("emptyFiltered") : t("empty")}</p>
  );
}
