"use client";

import { useState } from "react";
import { LikeButton } from "@/components/like";

interface Letter {
  _id: string;
  type: "story" | "friend";
  content: string;
  ogTitle?: string;
  status: string;
  physicalRequested: boolean;
  likeCount?: number;
  viewCount?: number;
  address?: {
    name: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2: string;
  };
  createdAt: string;
}

interface LetterDetailClientProps {
  letter: Letter;
}

export default function LetterDetailClient({ letter }: LetterDetailClientProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 편지 내용 */}
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-12 relative">
          {/* 편지지 장식 */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-300"></div>
          <div className="absolute left-6 top-8 w-3 h-3 bg-gray-200 rounded-full border border-gray-300"></div>
          <div className="absolute left-6 top-16 w-3 h-3 bg-gray-200 rounded-full border border-gray-300"></div>
          <div className="absolute left-6 top-24 w-3 h-3 bg-gray-200 rounded-full border border-gray-300"></div>

          <div className="pl-8">
            {/* 제목 */}
            {letter.ogTitle && <h1 className="text-3xl font-bold text-gray-800 mb-8">{letter.ogTitle}</h1>}

            {/* 날짜 */}
            <div className="text-sm text-gray-500 mb-8">
              {new Date(letter.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            {/* 편지 본문 */}
            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap" style={{ lineHeight: "2" }}>
              {letter.content}
            </div>

            {/* 좋아요 버튼 */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-center">
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full">
                <LikeButton letterId={letter._id} initialLikeCount={letter.likeCount || 0} size="lg" showCount />
                <span className="text-gray-500 text-sm ml-2">좋아요</span>
              </div>
            </div>

            {/* 서명 */}
            <div className="mt-8 text-right">
              <span className="text-2xl">💌</span>
            </div>
          </div>
        </div>

        {/* 실물 편지 요청 CTA */}
        {!letter.physicalRequested && (
          <div className="mt-8 bg-linear-to-r from-pink-50 to-purple-50 rounded-lg p-8 border border-pink-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">이 편지를 실물로 받고 싶으신가요?</h2>
              <p className="text-gray-600 mb-6">
                손으로 쓴 진짜 편지를 우편으로 받아보세요.
                <br />
                배송까지 약 1~2주 소요될 수 있으며, 우편함을 확인해 주세요.
              </p>
              <button onClick={() => setShowAddressForm(true)} className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg">
                실물 편지 신청하기 ✉️
              </button>
            </div>
          </div>
        )}

        {/* 실물 편지 신청 완료 */}
        {letter.physicalRequested && (
          <div className="mt-8 bg-green-50 rounded-lg p-8 border border-green-200">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">실물 편지 신청 완료</h2>
              <p className="text-gray-600">
                관리자가 손으로 편지를 작성하여 발송할 예정입니다.
                <br />
                배송까지 약 1~2주 소요될 수 있으며, 우편함을 확인해 주세요.
              </p>
              {letter.address && (
                <div className="mt-6 text-left bg-white p-4 rounded border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">배송 주소:</p>
                  <p className="font-medium">{letter.address.name}</p>
                  <p className="text-sm text-gray-600">
                    ({letter.address.zipCode}) {letter.address.address1} {letter.address.address2}
                  </p>
                  <p className="text-sm text-gray-600">{letter.address.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 주소 입력 폼 */}
        {showAddressForm && !letter.physicalRequested && <AddressForm letterId={letter._id} onClose={() => setShowAddressForm(false)} />}
      </div>
    </div>
  );
}

function AddressForm({ letterId, onClose }: { letterId: string; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    zipCode: "",
    address1: "",
    address2: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.zipCode || !formData.address1) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}/physical-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: formData }),
      });

      if (!response.ok) throw new Error("신청 실패");

      alert("실물 편지 신청이 완료되었습니다! 💌");
      window.location.reload();
    } catch (error) {
      console.error("실물 편지 신청 실패:", error);
      alert("신청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold mb-6">배송 주소 입력</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">받는 분 성함 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">연락처 *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-1234-5678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">우편번호 *</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="12345"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">주소 *</label>
            <input
              type="text"
              value={formData.address1}
              onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
              placeholder="서울시 강남구 테헤란로 123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상세 주소</label>
            <input
              type="text"
              value={formData.address2}
              onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
              placeholder="101동 202호"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
            >
              취소
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50">
              {isSubmitting ? "신청 중..." : "신청하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
