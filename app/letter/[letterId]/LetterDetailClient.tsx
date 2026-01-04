"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LikeButton } from "@/components/like";
import PostcodeSearch, {
  PostcodeResult,
} from "@/components/address/PostcodeSearch";
import PhysicalRequestsList from "@/components/letter/PhysicalRequestsList";
import AuthorRequestsManager from "@/components/letter/AuthorRequestsManager";
import UserRequestsStatus from "@/components/letter/UserRequestsStatus";
import RecipientAddressModal from "@/components/recipient/RecipientAddressModal";
import RecipientSelectModal from "@/components/recipient/RecipientSelectModal";
import SimplePhysicalStatus from "@/components/letter/SimplePhysicalStatus";
import { Button } from "@/components/ui/button";
import {
  saveLetterRequest,
  getLetterRequests,
  cleanupOldRequests,
  savePhysicalRequestId,
} from "@/lib/letter-requests";

// 테스트용 광고 배너 컴포넌트
function TestAdBanner({ letterId }: { letterId: string }) {
  const testAds = [
    {
      slug: "test-wedding-promo",
      name: "웨딩 프로모션",
      theme: "wedding",
      emoji: "💒",
    },
    {
      slug: "test-birthday-promo",
      name: "생일 프로모션",
      theme: "birthday",
      emoji: "🎂",
    },
    {
      slug: "test-general-promo",
      name: "일반 프로모션",
      theme: "general",
      emoji: "🎁",
    },
  ];

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="mt-8 p-4 bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-lg">
      <div className="text-center mb-3">
        <span className="text-yellow-600 font-medium text-sm">
          🧪 [개발용] 광고 테스트 배너
        </span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {testAds.map((ad) => (
          <Link
            key={ad.slug}
            href={`/ad/${ad.slug}?letter=${letterId}&utm_source=qr&utm_medium=offline&utm_campaign=test`}
            className="px-4 py-2 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
          >
            {ad.emoji} {ad.name}
          </Link>
        ))}
      </div>
      <p className="text-xs text-yellow-600 text-center mt-2">
        클릭하면 광고 랜딩 페이지로 이동합니다 (실제 QR 스캔 시뮬레이션)
      </p>
    </div>
  );
}

interface Letter {
  _id: string;
  type: "story" | "friend";
  content: string;
  ogTitle?: string;
  status: string;
  authorId: string;
  physicalLetterStats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    completedRequests: number;
  };
  authorSettings: {
    allowPhysicalRequests: boolean;
    autoApprove: boolean;
    maxRequestsPerPerson: number;
    requireApprovalMessage?: string;
  };
  likeCount?: number;
  viewCount?: number;
  createdAt: string;
}

interface LetterDetailClientProps {
  letter: Letter;
  currentUserId?: string;
}

export default function LetterDetailClient({
  letter,
  currentUserId,
}: LetterDetailClientProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [showRecipientSelect, setShowRecipientSelect] = useState(false);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const router = useRouter();
  const { data: session } = useSession();

  const isAuthor = currentUserId === letter.authorId;
  const letterId = letter._id;

  // 사용자 신청 목록 조회 함수
  const loadUserRequests = useCallback(async () => {
    try {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://letter-my-backend.onrender.com";

      // 현재 편지에 대한 사용자 신청 목록을 직접 조회
      const response = await fetch(
        `${BACKEND_URL}/api/letters/${letterId}/physical-request/user`,
        {
          credentials: "include",
          cache: "no-cache",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserRequests(result.data.requests || []);
          return;
        }
      }

      // API가 없는 경우 localStorage에서 편지별 신청 정보 조회
      const letterRequests = getLetterRequests(letterId);
      const requests = [];

      for (const letterRequest of letterRequests) {
        try {
          const statusResponse = await fetch(
            `${BACKEND_URL}/api/letters/physical-requests/${letterRequest.requestId}/status`,
            {
              credentials: "include",
              cache: "no-cache",
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            }
          );

          if (statusResponse.ok) {
            const statusResult = await statusResponse.json();
            if (
              statusResult.success &&
              statusResult.data.letterId === letterId
            ) {
              requests.push(statusResult.data);
            }
          }
        } catch (error) {
          console.error(`신청 ${letterRequest.requestId} 조회 실패:`, error);
        }
      }

      setUserRequests(requests);
    } catch (error) {
      console.error("사용자 신청 목록 조회 실패:", error);
      setUserRequests([]);
    }
  }, [letterId]);

  // 컴포넌트 마운트 시 한 번만 정리 작업 수행
  useEffect(() => {
    cleanupOldRequests();
  }, []);

  // 편지 ID가 변경될 때 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://letter-my-backend.onrender.com";

        // 현재 편지에 대한 사용자 신청 목록을 직접 조회
        const response = await fetch(
          `${BACKEND_URL}/api/letters/${letterId}/physical-request/user`,
          {
            credentials: "include",
            cache: "no-cache",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserRequests(result.data.requests || []);
            return;
          }
        }

        // API가 없는 경우 localStorage에서 편지별 신청 정보 조회
        const letterRequests = getLetterRequests(letterId);
        const requests = [];

        for (const letterRequest of letterRequests) {
          try {
            const statusResponse = await fetch(
              `${BACKEND_URL}/api/letters/physical-request/${letterRequest.requestId}/status`,
              {
                credentials: "include",
                cache: "no-cache",
                headers: {
                  "Cache-Control": "no-cache, no-store, must-revalidate",
                  Pragma: "no-cache",
                  Expires: "0",
                },
              }
            );

            if (statusResponse.ok) {
              const statusResult = await statusResponse.json();
              if (
                statusResult.success &&
                statusResult.data.letterId === letterId
              ) {
                requests.push(statusResult.data);
              }
            }
          } catch (error) {
            console.error(`신청 ${letterRequest.requestId} 조회 실패:`, error);
          }
        }

        setUserRequests(requests);
      } catch (error) {
        console.error("사용자 신청 목록 조회 실패:", error);
        setUserRequests([]);
      }
    };

    fetchData();
  }, [letterId]);

  const handleRequestSuccess = useCallback(
    (requestId?: string) => {
      if (requestId) {
        // RequestId 기반 저장 (호환성)
        savePhysicalRequestId(letterId, requestId);
      }
      loadUserRequests();
      setShowAddressForm(false);
    },
    [loadUserRequests, letterId]
  );

  // 현재 활성 신청 개수 계산
  const activeRequestCount = useMemo(() => {
    return userRequests.filter(
      (r) => r.status !== "cancelled" && r.status !== "rejected"
    ).length;
  }, [userRequests]);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 편지 내용 */}
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
          {/* 편지지 장식 */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-300 z-10 pointer-events-none"></div>
          <div className="absolute left-6 top-[60px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 top-[100px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 top-[140px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 top-[180px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 bottom-28 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 bottom-20 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 bottom-12 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
          <div className="absolute left-6 bottom-4 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>

          {/* 편지지 내용 영역 */}
          <div
            className="pl-16 pr-8 py-12 min-h-[800px] relative"
            style={{
              backgroundImage: `repeating-linear-gradient(
                transparent,
                transparent 27px,
                #e5e7eb 27px,
                #e5e7eb 28px
              )`,
              backgroundSize: "100% 28px",
              backgroundAttachment: "local",
            }}
          >
            {/* 편지 헤더 */}
            <div className="mb-8">
              <div className="text-right text-sm text-gray-500 mb-2">
                {new Date(letter.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-left text-base text-gray-700 mb-4">
                To Someone Special
              </div>

              {/* 제목 */}
              {letter.ogTitle && (
                <div className="mb-6">
                  <h1
                    className="text-xl font-semibold text-gray-800"
                    style={{
                      fontFamily: "'Noto Sans KR', sans-serif",
                      lineHeight: "28px",
                    }}
                  >
                    {letter.ogTitle}
                  </h1>
                </div>
              )}
            </div>

            {/* 편지 본문 */}
            <div className="relative z-10 mb-20">
              <div
                className="letter-content text-gray-800"
                style={{
                  fontFamily: "'Noto Sans KR', sans-serif",
                  fontSize: "16px",
                  lineHeight: "28px",
                }}
                dangerouslySetInnerHTML={{ __html: letter.content }}
              />
            </div>

            {/* 편지 마무리 */}
            <div className="mt-12 flex justify-end items-center pb-8">
              <span className="text-gray-600">From. Letter</span>
              <span className="ml-2 text-2xl">💌</span>
            </div>
          </div>
        </div>

        {/* 좋아요 버튼 */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full">
            <LikeButton
              letterId={letter._id}
              initialLikeCount={letter.likeCount || 0}
              size="lg"
              showCount
            />
            <span className="text-gray-500 text-sm ml-2">좋아요</span>
          </div>
        </div>

        {/* 간단한 실물 편지 상태 표시 */}
        <SimplePhysicalStatus letterId={letter._id} />

        {/* 편지 작성자용 신청 관리 */}
        {isAuthor && (
          <div className="mt-8 space-y-4">
            <AuthorRequestsManager
              letterId={letter._id}
              letterStats={letter.physicalLetterStats}
              authorSettings={letter.authorSettings}
            />

            {/* 수신자 주소 관리 버튼 */}
            <div className="flex justify-center">
              <Button
                onClick={() => setShowRecipientModal(true)}
                variant="outline"
                className="px-6 py-3"
              >
                📮 수신자 주소 관리
              </Button>
            </div>
          </div>
        )}

        {/* 공개 신청 현황 */}
        <PhysicalRequestsList
          letterId={letter._id}
          stats={letter.physicalLetterStats}
          allowNewRequests={letter.authorSettings.allowPhysicalRequests}
        />

        {/* 사용자 신청 현황 - 기존 방식 (호환성 유지) */}
        {userRequests.length > 0 && (
          <UserRequestsStatus
            requests={userRequests}
            onRefresh={loadUserRequests}
          />
        )}

        {/* 실물 편지 신청 CTA */}
        {letter.authorSettings.allowPhysicalRequests && (
          <div className="mt-8 bg-linear-to-r from-pink-50 to-purple-50 rounded-lg p-8 border border-pink-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                이 편지를 실물로 받고 싶으신가요?
              </h2>

              {/* 승인 메시지 */}
              {letter.authorSettings.requireApprovalMessage && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    📝 작성자 메시지:{" "}
                    {letter.authorSettings.requireApprovalMessage}
                  </p>
                </div>
              )}

              <p className="text-gray-600 mb-6">
                손으로 쓴 진짜 편지를 우편으로 받아보세요.
                <br />
                {letter.authorSettings.autoApprove
                  ? "신청 즉시 배송 준비가 시작됩니다."
                  : "편지 작성자의 승인 후 배송이 시작됩니다."}
              </p>

              {/* 신청 통계 표시 */}
              {letter.physicalLetterStats.totalRequests > 0 && (
                <div className="mb-6 p-4 bg-white/70 rounded-lg border border-pink-100">
                  <div className="flex items-center justify-center gap-4 text-pink-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {letter.physicalLetterStats.totalRequests}
                      </div>
                      <div className="text-sm">총 신청</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {letter.physicalLetterStats.approvedRequests}
                      </div>
                      <div className="text-sm">승인됨</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {letter.physicalLetterStats.pendingRequests}
                      </div>
                      <div className="text-sm">대기 중</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 신청 제한 안내 */}
              {letter.authorSettings.maxRequestsPerPerson > 1 && (
                <div className="mb-4 text-sm text-gray-600">
                  1인당 최대 {letter.authorSettings.maxRequestsPerPerson}개까지
                  신청 가능 (현재 {activeRequestCount}개 신청됨)
                </div>
              )}

              <button
                onClick={() => {
                  // 로그인하지 않은 사용자는 익명 신청 페이지로 이동
                  if (!session) {
                    router.push(`/letter/${letter._id}/request`);
                  } else {
                    // 로그인한 사용자는 기존 방식 사용
                    setShowRecipientSelect(true);
                  }
                }}
                disabled={
                  !!session &&
                  activeRequestCount >=
                    letter.authorSettings.maxRequestsPerPerson
                }
                className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                실물 편지 신청하기 ✉️
              </button>
            </div>
          </div>
        )}

        {/* 신청 불가 안내 */}
        {!letter.authorSettings.allowPhysicalRequests && (
          <div className="mt-8 bg-gray-50 rounded-lg p-8 border border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-4">📪</div>
              <h2 className="text-xl font-bold text-gray-600 mb-2">
                실물 편지 신청이 중단되었습니다
              </h2>
              <p className="text-gray-500">
                편지 작성자가 실물 편지 신청을 허용하지 않습니다.
              </p>
            </div>
          </div>
        )}

        {/* 주소 입력 폼 */}
        {showAddressForm && (
          <AddressForm
            letterId={letter._id}
            onClose={() => setShowAddressForm(false)}
            onSuccess={handleRequestSuccess}
            maxRequests={letter.authorSettings.maxRequestsPerPerson}
            currentRequests={activeRequestCount}
          />
        )}

        {/* 수신자 주소 관리 모달 */}
        <RecipientAddressModal
          open={showRecipientModal}
          onOpenChange={setShowRecipientModal}
          letterId={letter._id}
          canEdit={isAuthor}
          isAuthor={isAuthor}
        />

        {/* 수신자 선택 모달 */}
        <RecipientSelectModal
          open={showRecipientSelect}
          onOpenChange={setShowRecipientSelect}
          letterId={letter._id}
          onSelect={() => {
            setShowAddressForm(true);
          }}
          onManualInput={() => {
            setShowAddressForm(true);
          }}
        />

        {/* 테스트용 광고 배너 (개발 환경에서만 표시) */}
        <TestAdBanner letterId={letter._id} />
      </div>
    </div>
  );
}

function AddressForm({
  letterId,
  onClose,
  onSuccess,
  maxRequests,
  currentRequests,
}: {
  letterId: string;
  onClose: () => void;
  onSuccess: (requestId?: string) => void;
  maxRequests: number;
  currentRequests: number;
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    zipCode: "",
    address1: "",
    address2: "",
    memo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddressComplete = (data: PostcodeResult) => {
    setFormData((prev) => ({
      ...prev,
      zipCode: data.zipCode,
      address1: data.address,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentRequests >= maxRequests) {
      alert(`1인당 최대 ${maxRequests}개까지만 신청할 수 있습니다.`);
      return;
    }

    if (
      !formData.name ||
      !formData.phone ||
      !formData.zipCode ||
      !formData.address1
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    const phoneNumbers = formData.phone.replace(/[^\d]/g, "");
    const phoneRegex = /^01[0-9][0-9]{3,4}[0-9]{4}$/;
    if (!phoneRegex.test(phoneNumbers)) {
      alert("올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)");
      return;
    }

    setIsSubmitting(true);

    try {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://letter-my-backend.onrender.com";
      const response = await fetch(
        `${BACKEND_URL}/api/letters/${letterId}/physical-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ address: formData }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "신청 실패");
      }

      if (result.success) {
        // 새로운 RequestId 기반 저장
        savePhysicalRequestId(letterId, result.data.requestId);

        // 기존 방식도 유지 (호환성)
        saveLetterRequest(letterId, result.data.requestId);

        // 추적 정보 표시
        if (result.data.trackingInfo) {
          alert(
            `${result.message}\n\n추적 ID: ${result.data.trackingInfo.requestId}\n${result.data.trackingInfo.message}`
          );
        } else {
          alert(result.message);
        }

        onSuccess(result.data.requestId);
      } else {
        throw new Error(result.error || "신청 실패");
      }
    } catch (error) {
      console.error("실물 편지 신청 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "신청에 실패했습니다. 다시 시도해주세요."
      );
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 분 성함 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처 *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const numbers = e.target.value.replace(/[^\d]/g, "");
                let formatted = numbers;
                if (numbers.length >= 3) {
                  formatted = numbers.slice(0, 3) + "-" + numbers.slice(3);
                }
                if (numbers.length >= 7) {
                  formatted =
                    numbers.slice(0, 3) +
                    "-" +
                    numbers.slice(3, 7) +
                    "-" +
                    numbers.slice(7, 11);
                }
                setFormData({ ...formData, phone: formatted });
              }}
              placeholder="010-1234-5678"
              maxLength={13}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 *
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.zipCode}
                  readOnly
                  placeholder="우편번호"
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                />
                <PostcodeSearch
                  onComplete={handleAddressComplete}
                  buttonText="우편번호 찾기"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                />
              </div>
              <input
                type="text"
                value={formData.address1}
                readOnly
                placeholder="기본 주소 (우편번호 검색 후 자동 입력됩니다)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
              />
              <input
                type="text"
                value={formData.address2}
                onChange={(e) =>
                  setFormData({ ...formData, address2: e.target.value })
                }
                placeholder="상세 주소 (동, 호수 등)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모 (선택사항)
            </label>
            <input
              type="text"
              value={formData.memo}
              onChange={(e) =>
                setFormData({ ...formData, memo: e.target.value })
              }
              placeholder="생일 축하, 감사 인사 등"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            현재 {currentRequests}/{maxRequests}개 신청됨
            {maxRequests > 1 && (
              <div className="mt-1">여러 개의 주소로 신청할 수 있습니다.</div>
            )}
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
            <button
              type="submit"
              disabled={isSubmitting || currentRequests >= maxRequests}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? "신청 중..." : "신청하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
