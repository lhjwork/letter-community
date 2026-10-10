/** 사연 목록 결과 없음. v8 문구, Pen 24 */
export default function EmptyState({ filtered = false }: { filtered?: boolean }) {
  return (
    <p className="m-0 py-24 text-center font-pen text-2xl text-ink-3 mobile-down:py-16">{filtered ? "이 조건에 맞는 사연이 없어요." : "아직 사연이 없어요."}</p>
  );
}
