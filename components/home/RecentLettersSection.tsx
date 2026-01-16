"use client";

export default function RecentLettersSection() {
  // 임시 데이터
  const recentLetters = [
    {
      id: 1,
      icon: "📧",
      title: "부모님 감사 편지",
      preview: "오늘 할 일을 내일로 미루지 말자...",
      date: "2024-01-15",
    },
    {
      id: 2,
      icon: "💌",
      title: "친구에게 보내는 편지",
      preview: "오랜만에 연락하는 친구에게...",
      date: "2024-01-14",
    },
  ];

  return (
    <section className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">오늘 소 모든 편지 받아 보세요</h2>
        <p className="text-gray-600 text-sm">최근에 작성된 편지를 확인해보세요 (최근 2개)</p>
      </div>

      {/* 편지 목록 */}
      <div className="space-y-4">
        {recentLetters.map((letter) => (
          <div key={letter.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{letter.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{letter.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{letter.preview}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{letter.date}</span>
                  <button className="text-sm text-[#FF8B7B] hover:underline">더 보기 →</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-2 pt-4">
        <button className="w-8 h-8 rounded-full bg-[#FF8B7B] text-white flex items-center justify-center text-sm">1</button>
        <button className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm hover:bg-gray-300">2</button>
        <button className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm hover:bg-gray-300">3</button>
      </div>
    </section>
  );
}
