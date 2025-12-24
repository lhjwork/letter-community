# 📮 프론트엔드 누적 실물 편지 신청 시스템 구현 프롬프트

## 📋 요구사항

편지 URL을 통해 접속한 각 방문자가 개별적으로 실물 편지를 신청할 수 있는 시스템을 구현합니다. 편지 작성자와 방문자 모두 동일한 방식으로 편지를 신청하며, 신청 현황을 누적으로 확인할 수 있어야 합니다.

## 🎯 구현 목표

- 단일 편지 신청 인터페이스 (기존 방식 유지)
- 누적 신청 현황 표시
- 개별 신청자별 상태 추적
- 반응형 디자인 및 사용자 경험 최적화

---

## 🛠 프론트엔드 구현 사항

### 1. 기존 컴포넌트 수정

#### LetterDetailClient.tsx 수정

```typescript
// app/letter/[letterId]/LetterDetailClient.tsx

"use client";

import { useState, useEffect } from "react";
import { LikeButton } from "@/components/like";
import PostcodeSearch, { PostcodeResult } from "@/components/address/PostcodeSearch";
import CumulativePhysicalLetterStatus from "@/components/letter/CumulativePhysicalLetterStatus";

interface Letter {
  _id: string;
  type: "story" | "friend";
  content: string;
  ogTitle?: string;
  status: string;
  physicalRequestCount?: number; // 누적 신청 수
  likeCount?: number;
  viewCount?: number;
  createdAt: string;
}

interface LetterDetailClientProps {
  letter: Letter;
}

export default function LetterDetailClient({ letter }: LetterDetailClientProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [hasUserRequested, setHasUserRequested] = useState(false);
  const [userRequestId, setUserRequestId] = useState<string | null>(null);

  // 사용자의 기존 신청 확인
  useEffect(() => {
    checkUserRequest();
  }, [letter._id]);

  const checkUserRequest = async () => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return;

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const response = await fetch(`${BACKEND_URL}/api/letters/${letter._id}/my-request`, {
        headers: {
          "X-Session-ID": sessionId,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setHasUserRequested(true);
          setUserRequestId(result.data.requestId);
        }
      }
    } catch (error) {
      console.error("사용자 신청 확인 실패:", error);
    }
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem("letterSessionId");
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem("letterSessionId", sessionId);
    }
    return sessionId;
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 편지 내용 (기존과 동일) */}
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
          {/* 편지지 장식 및 내용 (기존 코드 유지) */}
          {/* ... */}
        </div>

        {/* 좋아요 버튼 (기존과 동일) */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full">
            <LikeButton letterId={letter._id} initialLikeCount={letter.likeCount || 0} size="lg" showCount />
            <span className="text-gray-500 text-sm ml-2">좋아요</span>
          </div>
        </div>

        {/* 실물 편지 신청 현황 */}
        <CumulativePhysicalLetterStatus letterId={letter._id} totalRequests={letter.physicalRequestCount || 0} />

        {/* 실물 편지 신청 CTA */}
        {!hasUserRequested && (
          <div className="mt-8 bg-linear-to-r from-pink-50 to-purple-50 rounded-lg p-8 border border-pink-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">이 편지를 실물로 받고 싶으신가요?</h2>
              <p className="text-gray-600 mb-6">
                손으로 쓴 진짜 편지를 우편으로 받아보세요.
                <br />
                배송까지 약 1~2주 소요될 수 있으며, 우편함을 확인해 주세요.
              </p>

              {/* 신청 통계 표시 */}
              {letter.physicalRequestCount && letter.physicalRequestCount > 0 && (
                <div className="mb-6 p-4 bg-white/70 rounded-lg border border-pink-100">
                  <div className="flex items-center justify-center gap-2 text-pink-700">
                    <span className="text-2xl">📮</span>
                    <span className="font-medium">
                      이미 <strong>{letter.physicalRequestCount}명</strong>이 이 편지를 신청했어요!
                    </span>
                  </div>
                </div>
              )}

              <button onClick={() => setShowAddressForm(true)} className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg">
                실물 편지 신청하기 ✉️
              </button>
            </div>
          </div>
        )}

        {/* 사용자가 이미 신청한 경우 */}
        {hasUserRequested && userRequestId && <UserRequestStatus requestId={userRequestId} />}

        {/* 주소 입력 폼 */}
        {showAddressForm && !hasUserRequested && (
          <AddressForm
            letterId={letter._id}
            onClose={() => setShowAddressForm(false)}
            onSuccess={(requestId) => {
              setHasUserRequested(true);
              setUserRequestId(requestId);
              setShowAddressForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
```

### 2. 새로운 컴포넌트 생성

#### CumulativePhysicalLetterStatus.tsx

```typescript
// components/letter/CumulativePhysicalLetterStatus.tsx

"use client";

import { useState, useEffect } from "react";

interface CumulativePhysicalLetterStatusProps {
  letterId: string;
  totalRequests: number;
}

interface RequestSummary {
  totalRequests: number;
  statusCounts: {
    [key: string]: number;
  };
  totalCost: number;
  recentRequests: Array<{
    id: string;
    recipientInfo: {
      name: string;
    };
    status: string;
    createdAt: string;
  }>;
}

export default function CumulativePhysicalLetterStatus({ letterId, totalRequests }: CumulativePhysicalLetterStatusProps) {
  const [summary, setSummary] = useState<RequestSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (totalRequests > 0) {
      fetchSummary();
    }
  }, [letterId, totalRequests]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}/physical-requests?limit=5`);

      if (response.ok) {
        const result = await response.json();
        setSummary(result.data.summary);
      }
    } catch (error) {
      console.error("신청 현황 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: "신청됨", color: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "확인됨", color: "bg-blue-100 text-blue-800" },
      writing: { label: "작성 중", color: "bg-purple-100 text-purple-800" },
      sent: { label: "발송됨", color: "bg-green-100 text-green-800" },
      delivered: { label: "배송완료", color: "bg-green-100 text-green-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  if (totalRequests === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">실물 편지 신청 현황</h3>
        <button onClick={() => setShowDetails(!showDetails)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          {showDetails ? "간단히 보기" : "자세히 보기"}
        </button>
      </div>

      {/* 기본 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">{totalRequests}</div>
          <div className="text-sm text-gray-600">총 신청</div>
        </div>

        {summary && (
          <>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{summary.statusCounts.delivered || 0}</div>
              <div className="text-sm text-gray-600">배송완료</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{summary.statusCounts.writing || 0}</div>
              <div className="text-sm text-gray-600">작성 중</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-600">{summary.totalCost?.toLocaleString() || 0}원</div>
              <div className="text-sm text-gray-600">총 비용</div>
            </div>
          </>
        )}
      </div>

      {/* 상세 정보 */}
      {showDetails && summary && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-3">최근 신청 현황</h4>
          <div className="space-y-2">
            {summary.recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">{request.recipientInfo.name.charAt(0)}***</span>
                  <span className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                {getStatusBadge(request.status)}
              </div>
            ))}
          </div>

          {totalRequests > 5 && (
            <div className="text-center mt-3">
              <span className="text-sm text-gray-500">외 {totalRequests - 5}명의 신청이 더 있습니다</span>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      )}
    </div>
  );
}
```

#### UserRequestStatus.tsx

```typescript
// components/letter/UserRequestStatus.tsx

"use client";

import { useState, useEffect } from "react";

interface UserRequestStatusProps {
  requestId: string;
}

interface UserRequest {
  id: string;
  status: string;
  recipientInfo: {
    name: string;
    phone: string;
    address1: string;
    address2: string;
  };
  cost: {
    totalCost: number;
  };
  createdAt: string;
  shipping?: {
    trackingNumber?: string;
    shippingCompany?: string;
  };
}

export default function UserRequestStatus({ requestId }: UserRequestStatusProps) {
  const [request, setRequest] = useState<UserRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestStatus();
  }, [requestId]);

  const fetchRequestStatus = async () => {
    try {
      const sessionId = localStorage.getItem("letterSessionId");
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

      const response = await fetch(`${BACKEND_URL}/api/physical-requests/${requestId}`, {
        headers: {
          "X-Session-ID": sessionId || "",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRequest(result.data);
      }
    } catch (error) {
      console.error("신청 상태 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      requested: {
        label: "신청 완료",
        color: "bg-yellow-100 text-yellow-800",
        description: "관리자가 확인 중입니다.",
      },
      confirmed: {
        label: "확인 완료",
        color: "bg-blue-100 text-blue-800",
        description: "편지 작성을 준비 중입니다.",
      },
      writing: {
        label: "작성 중",
        color: "bg-purple-100 text-purple-800",
        description: "손글씨로 편지를 작성하고 있습니다.",
      },
      sent: {
        label: "발송 완료",
        color: "bg-green-100 text-green-800",
        description: "편지가 발송되었습니다.",
      },
      delivered: {
        label: "배송 완료",
        color: "bg-green-100 text-green-800",
        description: "편지가 배송 완료되었습니다.",
      },
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
  };

  if (loading) {
    return (
      <div className="mt-8 bg-green-50 rounded-lg p-8 border border-green-200">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const statusInfo = getStatusInfo(request.status);

  return (
    <div className="mt-8 bg-green-50 rounded-lg p-8 border border-green-200">
      <div className="text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">실물 편지 신청 완료</h2>

        {/* 상태 표시 */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
          <p className="text-gray-600 mt-2">{statusInfo.description}</p>
        </div>

        {/* 배송 정보 */}
        <div className="mt-6 text-left bg-white p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">배송 정보:</p>
          <p className="font-medium">{request.recipientInfo.name}</p>
          <p className="text-sm text-gray-600">
            {request.recipientInfo.address1} {request.recipientInfo.address2}
          </p>
          <p className="text-sm text-gray-600">{request.recipientInfo.phone}</p>

          <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <span className="text-sm text-gray-600">신청일: {new Date(request.createdAt).toLocaleDateString()}</span>
            <span className="font-medium text-blue-600">{request.cost.totalCost.toLocaleString()}원</span>
          </div>

          {/* 배송 추적 정보 */}
          {request.shipping?.trackingNumber && (
            <div className="mt-3 p-3 bg-green-50 rounded">
              <div className="text-green-800 font-medium">배송 추적</div>
              <div className="text-sm">
                {request.shipping.shippingCompany}: {request.shipping.trackingNumber}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 3. AddressForm 컴포넌트 수정

```typescript
// AddressForm 컴포넌트 수정 (기존 파일 내)

function AddressForm({
  letterId,
  onClose,
  onSuccess
}: {
  letterId: string;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    zipCode: "",
    address1: "",
    address2: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daum 주소 검색 완료 핸들러 (기존과 동일)
  const handleAddressComplete = (data: PostcodeResult) => {
    setFormData((prev) => ({
      ...prev,
      zipCode: data.zipCode,
      address1: data.address,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.zipCode || !formData.address1) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // 연락처 형식 검증
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(formData.phone.replace(/-/g, ""))) {
      alert("올바른 휴대폰 번호 형식을 입력해주세요. (예: 010-1234-5678)");
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionId = localStorage.getItem("letterSessionId") || generateSessionId();
      localStorage.setItem("letterSessionId", sessionId);

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}/physical-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId,
        },
        body: JSON.stringify({ address: formData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "신청 실패");
      }

      alert("실물 편지 신청이 완료되었습니다! 💌\n\n배송까지 약 1~2주 소요될 수 있으며, 우편함을 확인해 주세요.");
      onSuccess(result.data.requestId);

    } catch (error) {
      console.error("실물 편지 신청 실패:", error);
      alert(error instanceof Error ? error.message : "신청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  // 폼 UI는 기존과 동일
  return (
    // ... 기존 폼 UI 코드
  );
}
```

---

## 🎨 UI/UX 개선사항

### 1. 사용자 플로우

1. **편지 조회**: URL을 통해 편지 접근
2. **신청 현황 확인**: 다른 사람들의 신청 현황 확인
3. **개별 신청**: 본인의 주소로 편지 신청
4. **상태 추적**: 신청 후 배송 상태 실시간 확인

### 2. 시각적 피드백

- 신청 수에 따른 인기도 표시
- 실시간 상태 업데이트
- 진행 단계별 시각적 표현

### 3. 접근성

- 키보드 네비게이션 지원
- 스크린 리더 호환
- 명확한 상태 메시지

---

## 📋 체크리스트

### 구현 완료 체크

- [ ] LetterDetailClient 컴포넌트 수정
- [ ] CumulativePhysicalLetterStatus 컴포넌트 생성
- [ ] UserRequestStatus 컴포넌트 생성
- [ ] AddressForm 컴포넌트 수정 (세션 ID 연동)
- [ ] 세션 기반 사용자 식별 구현
- [ ] 누적 통계 표시 기능 구현

### 테스트 완료 체크

- [ ] 신규 사용자 편지 신청 테스트
- [ ] 기존 신청자 상태 확인 테스트
- [ ] 누적 통계 표시 테스트
- [ ] 모바일 반응형 테스트

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 8-12시간  
**의존성**: 백엔드 누적 신청 API 구현 필요
