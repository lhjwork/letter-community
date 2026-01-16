"use client";

import { useState } from "react";

export default function StoryCalendarSection() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // 간단한 달력 데이터 (1월 기준)
  const daysInMonth = 31;
  const firstDayOfWeek = 0; // 일요일 시작
  const weeks = ["일", "월", "화", "수", "목", "금", "토"];

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <section className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">사연을 남겨주세요</h2>
        <p className="text-gray-600 text-sm">원하는 날짜를 선택하여 특별한 사연을 작성해보세요</p>
      </div>

      {/* 달력 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* 월/년 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold">1월 / 2024</h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weeks.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDate(day)}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm
                transition-colors
                ${selectedDate === day ? "bg-[#FF8B7B] text-white font-semibold" : "hover:bg-gray-100 text-gray-700"}
              `}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
