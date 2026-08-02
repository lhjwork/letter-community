"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { LikeButton } from "@/components/like";
import PostcodeSearch, {
  PostcodeResult,
} from "@/components/address/PostcodeSearch";
import UserRequestsStatus from "@/components/letter/UserRequestsStatus";
import RecipientAddressModal from "@/components/recipient/RecipientAddressModal";
import RecipientSelectModal from "@/components/recipient/RecipientSelectModal";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/home";
import { useIsAuthor } from "@/hooks/useIsAuthor";
import EnvelopeAnimation from "@/components/effects/EnvelopeAnimation";
import TypewriterText from "@/components/effects/TypewriterText";
import {
  saveLetterRequest,
  getLetterRequests,
  cleanupOldRequests,
  savePhysicalRequestId,
} from "@/lib/letter-requests";
import { isLetterSaved, toggleSaveLetter } from "@/lib/saved-letters";
import { fadeInUp, staggerContainer, staggerItem, springs } from "@/lib/animations/config";

interface Letter {
  _id: string;
  type: "story" | "friend";
  content: string;
  ogTitle?: string;
  status: string;
  authorId: string;
  senderId?: string; // 백엔드에서 실제로 사용하는 필드
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
}

export default function LetterDetailClient({
  letter,
}: LetterDetailClientProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [showRecipientSelect, setShowRecipientSelect] = useState(false);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const router = useRouter();
  const { data: session } = useSession();

  // 작성자 여부 확인 훅 사용
  const { isAuthor } = useIsAuthor(letter);

  // 편지 보관 상태 (클라이언트에서만 확인)
  const [isSaved, setIsSaved] = useState(() => {
    if (typeof window !== "undefined") {
      return isLetterSaved(letter._id);
    }
    return false;
  });

  // 편지 보관하기 핸들러
  const handleSaveLetter = useCallback(() => {
    const contentText = letter.content.replace(/<[^>]*>/g, "");
    const saved = toggleSaveLetter({
      letterId: letter._id,
      title: letter.ogTitle || "제목 없는 편지",
      contentPreview: contentText.slice(0, 100),
    });
    setIsSaved(saved);
  }, [letter._id, letter.ogTitle, letter.content]);

  // 정적 배너 데이터
  const bannerSlides = [
    {
      id: 1,
      image: "/images/mainbanner/banner-1.png",
      alt: "배너 1",
    },
  ];

  const letterId = letter._id;

  // 사용자 신청 목록 조회 함수 (localStorage 기반)
  const loadUserRequests = useCallback(async () => {
    try {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://letter-my-backend.onrender.com";

      // localStorage에서 편지별 신청 정보 조회
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
            },
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

        // localStorage에서 편지별 신청 정보 조회
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
              },
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
    [loadUserRequests, letterId],
  );

  // 현재 활성 신청 개수 계산
  const activeRequestCount = useMemo(() => {
    return userRequests.filter(
      (r) => r.status !== "cancelled" && r.status !== "rejected",
    ).length;
  }, [userRequests]);

  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  // 스크롤 연동 그림자 + 플로팅 버튼
  const letterPaperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: letterPaperRef,
    offset: ["start end", "end start"],
  });
  const paperShadow = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [
      "0 2px 8px rgba(255,152,131,0.05), 0 1px 4px rgba(0,0,0,0.03)",
      "0 4px 20px rgba(255,152,131,0.1), 0 2px 8px rgba(0,0,0,0.05)",
      "0 8px 32px rgba(255,152,131,0.15), 0 4px 12px rgba(0,0,0,0.08)",
      "0 4px 20px rgba(255,152,131,0.1), 0 2px 8px rgba(0,0,0,0.05)",
      "0 2px 8px rgba(255,152,131,0.05), 0 1px 4px rgba(0,0,0,0.03)",
    ],
  );

  // 플로팅 버튼 표시 (스크롤 30% 이상)
  const [showFloating, setShowFloating] = useState(false);
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      setShowFloating(v > 0.15 && v < 0.85);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFEFE" }}>
      {/* 베너 */}
      {bannerSlides.length > 0 && (
        <div className="container mx-auto px-4 sm:px-8 lg:px-20 py-6 sm:py-12">
          <HeroBanner bannerSlides={bannerSlides} />
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 뒤로가기 버튼 */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-[#FF9883] border-[#FF9883] hover:bg-orange-50 px-6 py-2 rounded-lg"
          >
            <span>← 뒤로가기</span>
          </Button>
        </motion.div>

        {/* To. 수신자 표시 - 타자기 효과 */}
        {!isAuthor && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2
              className="text-[#757575] text-2xl sm:text-4xl lg:text-[48px]"
              style={{
                fontFamily: "'Nanum JangMiCe', cursive",
                fontWeight: 400,
                lineHeight: "1.15",
              }}
            >
              {envelopeOpened ? (
                "To. 당신에게 도착한 편지"
              ) : (
                <TypewriterText
                  text="To. 당신에게 도착한 편지"
                  speed={60}
                  as="span"
                />
              )}
            </h2>
          </motion.div>
        )}

        {/* 봉투 애니메이션 → 편지 내용 */}
        <EnvelopeAnimation onOpen={() => setEnvelopeOpened(true)}>
          {/* 사연 제목 필드 */}
          {letter.ogTitle && (
            <motion.div
              className="mb-4 rounded-lg border px-7 py-[18px]"
              style={{
                backgroundColor: "#FEFEFE",
                borderColor: "#C4C4C4",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span
                className="text-[#424242] text-base sm:text-xl"
                style={{
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 500,
                  lineHeight: "1.19",
                }}
              >
                {letter.ogTitle}
              </span>
            </motion.div>
          )}

          {/* 편지 내용 - 종이 텍스처 강화 */}
          <motion.div
            ref={letterPaperRef}
            className="rounded-lg border overflow-hidden relative flex flex-col mb-12"
            style={{
              backgroundColor: "#FEFEFE",
              borderColor: "#C4C4C4",
              boxShadow: paperShadow,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.gentle, delay: 0.2 }}
          >
            {/* 편지지 장식 - 모바일에서 숨김 */}
            <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-0.5 bg-red-300 z-10 pointer-events-none"></div>
            <div className="hidden sm:block absolute left-6 top-[60px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 top-[100px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 top-[140px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 top-[180px] w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 bottom-28 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 bottom-20 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 bottom-12 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>
            <div className="hidden sm:block absolute left-6 bottom-4 w-3 h-3 bg-gray-200 rounded-full border border-gray-300 z-10"></div>

            {/* 종이 텍스처 오버레이 */}
            <div
              className="absolute inset-0 pointer-events-none z-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
              }}
            />

            {/* 편지지 내용 영역 */}
            <div
              className="pl-4 sm:pl-16 pr-4 sm:pr-8 py-6 sm:py-12 min-h-[400px] sm:min-h-[800px] relative"
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
              <motion.div
                className="mb-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="text-right text-sm text-gray-500 mb-2"
                  variants={staggerItem}
                >
                  {new Date(letter.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </motion.div>
                <motion.div
                  className="text-left text-base text-gray-700 mb-4"
                  variants={staggerItem}
                >
                  To Someone Special
                </motion.div>

                {/* 제목 */}
                {letter.ogTitle && (
                  <motion.div className="mb-6" variants={staggerItem}>
                    <h1
                      className="text-xl font-semibold text-gray-800"
                      style={{
                        fontFamily: "'Noto Sans KR', sans-serif",
                        lineHeight: "28px",
                      }}
                    >
                      {letter.ogTitle}
                    </h1>
                  </motion.div>
                )}
              </motion.div>

              {/* 편지 본문 */}
              <motion.div
                className="relative z-10 mb-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div
                  className="letter-content text-base sm:text-xl"
                  style={{
                    fontFamily: "Pretendard, sans-serif",
                    lineHeight: "28px",
                    color: "#424242",
                  }}
                  dangerouslySetInnerHTML={{ __html: letter.content }}
                />
              </motion.div>

              {/* 편지 마무리 - From 닉네임 + 💌 아이콘 */}
              <motion.div
                className="mt-12 flex justify-end items-center pb-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <span
                  style={{
                    fontFamily: "Pretendard, sans-serif",
                    fontSize: "20px",
                    lineHeight: "1.19",
                    color: "#424242",
                    textAlign: "right",
                  }}
                >
                  From. Letter
                </span>
                <motion.span
                  className="ml-2 text-2xl"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...springs.bouncy, delay: 1.0 }}
                >
                  💌
                </motion.span>
              </motion.div>
            </div>
          </motion.div>

          {/* 좋아요 섹션 */}
          <motion.section
            className="mb-12 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full">
              <LikeButton
                letterId={letter._id}
                initialLikeCount={letter.likeCount || 0}
                size="lg"
                showCount
              />
            </div>
          </motion.section>

          {/* CTA 버튼 섹션 */}
          {!isAuthor && (
            <motion.div
              className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mb-8 sm:mb-12"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* 편지 보관하기 버튼 */}
              <motion.div variants={staggerItem}>
                <Button
                  onClick={handleSaveLetter}
                  className={`w-full sm:w-44 lg:w-56 h-12 sm:h-16 rounded-lg transition-colors font-semibold text-base sm:text-lg lg:text-2xl leading-5 ${
                    isSaved
                      ? "bg-[#FF9883] text-white border-2 border-[#FF9883] hover:bg-[#ff8a70]"
                      : "bg-white text-[#FF9883] border-2 border-[#FF9883] hover:bg-orange-50"
                  }`}
                  style={{ fontFamily: "Pretendard" }}
                >
                  {isSaved ? "보관됨 ✓" : "편지 보관하기"}
                </Button>
              </motion.div>

              {/* 편지 답장하기 버튼 */}
              <motion.div variants={staggerItem}>
                <Button
                  onClick={() => router.push("/write")}
                  className="w-full sm:w-44 lg:w-56 h-12 sm:h-16 bg-[#FF7F65] text-white rounded-lg hover:bg-[#ff6b4d] transition-colors font-semibold text-base sm:text-lg lg:text-2xl leading-5"
                  style={{ fontFamily: "Pretendard" }}
                >
                  편지 답장하기
                </Button>
              </motion.div>

              {/* 실물 편지 신청하기 버튼 */}
              {letter.authorSettings.allowPhysicalRequests && (
                <motion.div variants={staggerItem}>
                  <Button
                    onClick={() => {
                      if (!session) {
                        router.push(`/letter/${letter._id}/request`);
                      } else {
                        setShowRecipientSelect(true);
                      }
                    }}
                    disabled={
                      !!session &&
                      activeRequestCount >=
                        letter.authorSettings.maxRequestsPerPerson
                    }
                    className="w-full sm:w-44 lg:w-56 h-12 sm:h-16 bg-[#FF9883] text-white rounded-lg hover:bg-[#ff8a70] transition-colors font-semibold text-base sm:text-lg lg:text-2xl leading-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "Pretendard" }}
                  >
                    실물 편지 신청 ✉️
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </EnvelopeAnimation>

        {/* 편지 작성자용 섹션 */}
        {isAuthor && (
          <div className="mt-12">
            <div className="w-full h-px bg-[#C4C4C4]"></div>

            {/* 링크 공유 섹션 */}
            <div className="rounded-lg p-4 sm:p-12">
              <h2
                className="mb-4 sm:mb-8 text-2xl sm:text-4xl lg:text-[48px]"
                style={{
                  color: "#757575",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                링크를 통해 편지를 공유해주세요
              </h2>

              {/* 링크 복사 영역 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 sm:mb-12">
                <div className="flex-1 bg-white rounded-lg border border-gray-300 h-12 sm:h-16">
                  <input
                    type="text"
                    value={`https://letter-community.vercel.app/letter/69d3600b6433643e74d5174`}
                    readOnly
                    className="w-full h-full px-4 border-none outline-none text-gray-600 bg-transparent text-base rounded-lg"
                  />
                </div>
                <Button
                  onClick={() => {
                    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/letter/${letter._id}`;
                    navigator.clipboard.writeText(url);
                    alert("링크가 복사되었습니다!");
                  }}
                  className="px-6 sm:px-8 h-12 sm:h-16 bg-white rounded-lg hover:bg-[#FF9883] cursor-pointer transition-colors font-medium text-sm sm:text-base border border-[#FF9883]"
                  style={{ color: "#FF9883" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#FF9883";
                  }}
                >
                  링크 복사하기
                </Button>
              </div>

              {/* 네비게이션 버튼들 */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
                <Button
                  onClick={() => router.push("/letter-box")}
                  variant="outline"
                  className="w-full sm:w-44 lg:w-56 h-12 sm:h-16 border-2 border-gray-300 hover:bg-gray-50 rounded-lg bg-white text-[#757575] text-center text-base sm:text-lg lg:text-2xl font-semibold leading-5"
                  style={{ fontFamily: "Pretendard" }}
                >
                  마이페이지 이동
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  className="flex w-full sm:w-44 lg:w-56 h-12 sm:h-16 px-6 py-2 justify-center items-center gap-2.5 rounded-lg bg-[#FF9883] text-white hover:bg-orange-600 transition-colors text-base sm:text-lg lg:text-2xl font-semibold leading-5"
                  style={{ fontFamily: "Pretendard" }}
                >
                  메인페이지 이동
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 수신자용 신청 현황 - 작성자가 아닌 경우만 표시 */}
        {!isAuthor && userRequests.length > 0 && (
          <UserRequestsStatus
            requests={userRequests}
            onRefresh={loadUserRequests}
          />
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
      </main>

      {/* 플로팅 액션 버튼 */}
      {!isAuthor && (
        <AnimatePresence>
          {showFloating && (
            <motion.div
              className="fixed bottom-6 right-6 z-40 flex flex-col gap-2"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.button
                onClick={handleSaveLetter}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg transition-colors ${
                  isSaved
                    ? "bg-[#FF9883] text-white"
                    : "bg-white text-[#FF9883] border border-[#FF9883]"
                }`}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                title="편지 보관"
              >
                {isSaved ? "✓" : "♡"}
              </motion.button>
              <motion.button
                onClick={() => router.push("/write")}
                className="w-12 h-12 rounded-full bg-[#FF7F65] text-white shadow-lg flex items-center justify-center text-lg"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                title="편지 답장"
              >
                ✎
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
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
        },
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
            `${result.message}\n\n추적 ID: ${result.data.trackingInfo.requestId}\n${result.data.trackingInfo.message}`,
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
          : "신청에 실패했습니다. 다시 시도해주세요.",
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
