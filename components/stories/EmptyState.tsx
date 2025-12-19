"use client";

interface EmptyStateProps {
  onReset: () => void;
}

export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">📭</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">검색 결과가 없습니다</h3>
      <p className="text-gray-500 mb-6">다른 검색어나 카테고리로 다시 시도해보세요</p>
      <button onClick={onReset} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
        필터 초기화
      </button>
    </div>
  );
}
