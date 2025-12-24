# 📮 프론트엔드 편지 작성자 승인 시스템 구현 프롬프트

## 📋 요구사항

편지 URL에 접속한 사람들이 여러 번 실물 편지를 신청할 수 있고, 편지 작성자가 신청자들을 확인하여 승인해야만 실제 배송이 진행되는 시스템의 프론트엔드를 구현합니다.

## 🎯 구현 목표

- 방문자의 무제한 실물 편지 신청 UI
- 편지 작성자용 신청 관리 대시보드
- 실시간 승인 상태 표시
- 신청자 목록의 편지별 노출

---

## 🛠 프론트엔드 구현 사항

### 1. 편지 상세 페이지 수정

#### LetterDetailClient.tsx 업데이트

```typescript
// app/letter/[letterId]/LetterDetailClient.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { LikeButton } from "@/components/like";
import PostcodeSearch, { PostcodeResult } from "@/components/address/PostcodeSearch";
import PhysicalRequestsList from "@/components/letter/PhysicalRequestsList";
import AuthorRequestsManager from "@/components/letter/AuthorRequestsManager";
import UserRequestsStatus from "@/components/letter/UserRequestsStatus";

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
  createdAt: string;
}

interface LetterDetailClientProps {
  letter: Letter;
  currentUserId?: string; // 로그인한 사용자 ID
}

export default function LetterDetailClient({ letter, currentUserId }: LetterDetailClientProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [isAuthor, setIsAuthor] = useState(false);

  // 편지 작성자 여부 확인
  useEffect(() => {
    setIsAuthor(currentUserId === letter.authorId);
  }, [currentUserId, letter.authorId]);

  // 사용자의 신청 목록 조회
  useEffect(() => {
    fetchUserRequests();
  }, [letter._id]);

  const fetchUserRequests = async () => {
    try {
      const sessionId = getSessionId();
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

      const response = await fetch(`${BACKEND_URL}/api/letters/${letter._id}/physical-requests/my-requests`, {
        headers: {
          "X-Session-ID": sessionId,
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserRequests(result.data.requests || []);
        }
      }
    } catch (error) {
      console.error("사용자 신청 목록 조회 실패:", error);
    }
  };

  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem("letterSessionId");
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem("letterSessionId", sessionId);
    }
    return sessionId;
  }, []);

  const generateSessionId = useCallback(() => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }, []);

  const handleRequestSuccess = () => {
    fetchUserRequests(); // 신청 목록 새로고침
    setShowAddressForm(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 편지 내용 (기존과 동일) */}
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
          {/* 편지지 장식 및 내용 */}
          {/* ... 기존 편지 내용 코드 ... */}
        </div>

        {/* 좋아요 버튼 (기존과 동일) */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full">
            <LikeButton letterId={letter._id} initialLikeCount={0} size="lg" showCount />
            <span className="text-gray-500 text-sm ml-2">좋아요</span>
          </div>
        </div>

        {/* 편지 작성자용 신청 관리 */}
        {isAuthor && <AuthorRequestsManager letterId={letter._id} letterStats={letter.physicalLetterStats} authorSettings={letter.authorSettings} />}

        {/* 공개 신청 현황 */}
        <PhysicalRequestsList letterId={letter._id} stats={letter.physicalLetterStats} allowNewRequests={letter.authorSettings.allowPhysicalRequests} />

        {/* 사용자 신청 현황 */}
        {userRequests.length > 0 && <UserRequestsStatus requests={userRequests} onRefresh={fetchUserRequests} />}

        {/* 실물 편지 신청 CTA */}
        {letter.authorSettings.allowPhysicalRequests && (
          <div className="mt-8 bg-linear-to-r from-pink-50 to-purple-50 rounded-lg p-8 border border-pink-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">이 편지를 실물로 받고 싶으신가요?</h2>

              {/* 승인 메시지 */}
              {letter.authorSettings.requireApprovalMessage && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">📝 작성자 메시지: {letter.authorSettings.requireApprovalMessage}</p>
                </div>
              )}

              <p className="text-gray-600 mb-6">
                손으로 쓴 진짜 편지를 우편으로 받아보세요.
                <br />
                {letter.authorSettings.autoApprove ? "신청 즉시 배송 준비가 시작됩니다." : "편지 작성자의 승인 후 배송이 시작됩니다."}
              </p>

              {/* 신청 통계 표시 */}
              {letter.physicalLetterStats.totalRequests > 0 && (
                <div className="mb-6 p-4 bg-white/70 rounded-lg border border-pink-100">
                  <div className="flex items-center justify-center gap-4 text-pink-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{letter.physicalLetterStats.totalRequests}</div>
                      <div className="text-sm">총 신청</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{letter.physicalLetterStats.approvedRequests}</div>
                      <div className="text-sm">승인됨</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{letter.physicalLetterStats.pendingRequests}</div>
                      <div className="text-sm">대기 중</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 신청 제한 안내 */}
              {letter.authorSettings.maxRequestsPerPerson > 1 && (
                <div className="mb-4 text-sm text-gray-600">
                  1인당 최대 {letter.authorSettings.maxRequestsPerPerson}개까지 신청 가능 (현재 {userRequests.filter((r) => r.status !== "cancelled" && r.status !== "rejected").length}개 신청됨)
                </div>
              )}

              <button
                onClick={() => setShowAddressForm(true)}
                disabled={userRequests.filter((r) => r.status !== "cancelled" && r.status !== "rejected").length >= letter.authorSettings.maxRequestsPerPerson}
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
              <h2 className="text-xl font-bold text-gray-600 mb-2">실물 편지 신청이 중단되었습니다</h2>
              <p className="text-gray-500">편지 작성자가 실물 편지 신청을 허용하지 않습니다.</p>
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
            currentRequests={userRequests.filter((r) => r.status !== "cancelled" && r.status !== "rejected").length}
          />
        )}
      </div>
    </div>
  );
}
```

### 2. 편지 작성자용 신청 관리 컴포넌트

#### AuthorRequestsManager.tsx

```typescript
// components/letter/AuthorRequestsManager.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthorRequestsManagerProps {
  letterId: string;
  letterStats: any;
  authorSettings: any;
}

interface PhysicalRequest {
  _id: string;
  recipientInfo: {
    name: string;
    phone: string;
    address1: string;
    address2: string;
    memo?: string;
  };
  cost: {
    totalCost: number;
    shippingCost: number;
    letterCost: number;
  };
  status: string;
  createdAt: string;
  requesterInfo: {
    sessionId: string;
    requestedAt: string;
  };
}

export default function AuthorRequestsManager({ letterId, letterStats, authorSettings }: AuthorRequestsManagerProps) {
  const [requests, setRequests] = useState<PhysicalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<PhysicalRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [letterId, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);

      const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}/physical-requests/author?${params}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRequests(result.data.requests);
        }
      }
    } catch (error) {
      console.error("신청 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: "approve" | "reject", rejectionReason?: string) => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}/physical-requests/${requestId}/approval`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        credentials: "include",
        body: JSON.stringify({ action, rejectionReason }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchRequests(); // 목록 새로고침
          setSelectedRequest(null);
          alert(action === "approve" ? "신청이 승인되었습니다." : "신청이 거절되었습니다.");
        }
      }
    } catch (error) {
      console.error("승인/거절 처리 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "승인 대기", color: "bg-yellow-100 text-yellow-800" },
      approved: { label: "승인됨", color: "bg-green-100 text-green-800" },
      rejected: { label: "거절됨", color: "bg-red-100 text-red-800" },
      writing: { label: "작성 중", color: "bg-blue-100 text-blue-800" },
      sent: { label: "발송됨", color: "bg-purple-100 text-purple-800" },
      delivered: { label: "배송완료", color: "bg-green-100 text-green-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getAuthToken = () => {
    return localStorage.getItem("authToken") || "";
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>실물 편지 신청 관리</span>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              전체 ({letterStats.totalRequests})
            </Button>
            <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
              대기 중 ({letterStats.pendingRequests})
            </Button>
            <Button variant={filter === "approved" ? "default" : "outline"} size="sm" onClick={() => setFilter("approved")}>
              승인됨 ({letterStats.approvedRequests})
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 통계 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{letterStats.totalRequests}</div>
            <div className="text-sm text-gray-600">총 신청</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">{letterStats.pendingRequests}</div>
            <div className="text-sm text-gray-600">승인 대기</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{letterStats.approvedRequests}</div>
            <div className="text-sm text-gray-600">승인됨</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded">
            <div className="text-2xl font-bold text-red-600">{letterStats.rejectedRequests}</div>
            <div className="text-sm text-gray-600">거절됨</div>
          </div>
        </div>

        {/* 신청 목록 */}
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">신청이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{request.recipientInfo.name}</span>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">연락처: {request.recipientInfo.phone}</div>
                    <div className="text-gray-600">
                      주소: {request.recipientInfo.address1} {request.recipientInfo.address2}
                    </div>
                    {request.recipientInfo.memo && <div className="text-gray-600">메모: {request.recipientInfo.memo}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-lg">{request.cost.totalCost.toLocaleString()}원</div>
                    <div className="text-gray-500 text-xs">
                      배송비 {request.cost.shippingCost.toLocaleString()}원 + 편지비 {request.cost.letterCost.toLocaleString()}원
                    </div>
                  </div>
                </div>

                {/* 승인/거절 버튼 */}
                {request.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={() => handleApproval(request._id, "approve")} className="bg-green-600 hover:bg-green-700">
                      승인
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)} className="border-red-300 text-red-600 hover:bg-red-50">
                      거절
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 거절 사유 입력 모달 */}
        {selectedRequest && <RejectionModal request={selectedRequest} onConfirm={(reason) => handleApproval(selectedRequest._id, "reject", reason)} onCancel={() => setSelectedRequest(null)} />}
      </CardContent>
    </Card>
  );
}

// 거절 사유 입력 모달
interface RejectionModalProps {
  request: PhysicalRequest;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

function RejectionModal({ request, onConfirm, onCancel }: RejectionModalProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">신청 거절</h3>
        <p className="text-gray-600 mb-4">{request.recipientInfo.name}님의 신청을 거절하시겠습니까?</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">거절 사유 (선택사항)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="거절 사유를 입력해주세요..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            취소
          </Button>
          <Button onClick={() => onConfirm(reason)} className="flex-1 bg-red-600 hover:bg-red-700">
            거절하기
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 3. 공개 신청 현황 컴포넌트

#### PhysicalRequestsList.tsx

```typescript
// components/letter/PhysicalRequestsList.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PhysicalRequestsListProps {
  letterId: string;
  stats: any;
  allowNewRequests: boolean;
}

interface ApprovedRequest {
  recipientName: string;
  approvedAt: string;
  cost: number;
}

export default function PhysicalRequestsList({ letterId, stats, allowNewRequests }: PhysicalRequestsListProps) {
  const [approvedRequests, setApprovedRequests] = useState<ApprovedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchApprovedRequests();
  }, [letterId]);

  const fetchApprovedRequests = async () => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}/physical-requests/public?limit=${showAll ? 50 : 10}`, {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setApprovedRequests(result.data.approvedRequests);
        }
      }
    } catch (error) {
      console.error("승인된 신청 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (stats.totalRequests === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>실물 편지 신청 현황</span>
          <div className="flex items-center gap-2">
            {allowNewRequests ? (
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">신청 가능</span>
            ) : (
              <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">신청 중단</span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 통계 요약 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
            <div className="text-sm text-gray-600">총 신청</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{stats.approvedRequests}</div>
            <div className="text-sm text-gray-600">승인됨</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
            <div className="text-sm text-gray-600">승인 대기</div>
          </div>
        </div>

        {/* 승인된 신청자 목록 */}
        {loading ? (
          <div className="text-center py-4">로딩 중...</div>
        ) : approvedRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">아직 승인된 신청이 없습니다.</div>
        ) : (
          <div>
            <h4 className="font-medium text-gray-800 mb-3">승인된 신청자 ({stats.approvedRequests}명)</h4>
            <div className="space-y-2">
              {approvedRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800">{request.recipientName}</span>
                    <span className="text-sm text-gray-600">{new Date(request.approvedAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">{request.cost.toLocaleString()}원</span>
                </div>
              ))}
            </div>

            {stats.approvedRequests > 10 && !showAll && (
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setShowAll(true);
                    fetchApprovedRequests();
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  더 보기 ({stats.approvedRequests - 10}명 더)
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 4. 사용자 신청 현황 컴포넌트

#### UserRequestsStatus.tsx

```typescript
// components/letter/UserRequestsStatus.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserRequestsStatusProps {
  requests: any[];
  onRefresh: () => void;
}

export default function UserRequestsStatus({ requests, onRefresh }: UserRequestsStatusProps) {
  const getStatusInfo = (status: string) => {
    const statusConfig = {
      pending: {
        label: "승인 대기",
        color: "bg-yellow-100 text-yellow-800",
        description: "편지 작성자의 승인을 기다리고 있습니다.",
      },
      approved: {
        label: "승인됨",
        color: "bg-green-100 text-green-800",
        description: "승인되었습니다. 편지 작성이 시작됩니다.",
      },
      rejected: {
        label: "거절됨",
        color: "bg-red-100 text-red-800",
        description: "편지 작성자에 의해 거절되었습니다.",
      },
      writing: {
        label: "작성 중",
        color: "bg-blue-100 text-blue-800",
        description: "손글씨로 편지를 작성하고 있습니다.",
      },
      sent: {
        label: "발송됨",
        color: "bg-purple-100 text-purple-800",
        description: "편지가 발송되었습니다.",
      },
      delivered: {
        label: "배송완료",
        color: "bg-green-100 text-green-800",
        description: "편지가 배송 완료되었습니다.",
      },
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>내 신청 현황</span>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            새로고침
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => {
            const statusInfo = getStatusInfo(request.status);

            return (
              <div key={request._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{request.recipientInfo.name}</span>
                    <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                  </div>
                  <span className="font-medium text-blue-600">{request.cost.totalCost.toLocaleString()}원</span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <div>
                    📍 {request.recipientInfo.address1} {request.recipientInfo.address2}
                  </div>
                  <div>📞 {request.recipientInfo.phone}</div>
                  {request.recipientInfo.memo && <div>💬 {request.recipientInfo.memo}</div>}
                </div>

                <div className="text-sm text-gray-500 mb-3">{statusInfo.description}</div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>신청일: {new Date(request.createdAt).toLocaleDateString()}</span>
                  {request.authorApproval?.approvedAt && <span>승인일: {new Date(request.authorApproval.approvedAt).toLocaleDateString()}</span>}
                </div>

                {/* 거절 사유 표시 */}
                {request.status === "rejected" && request.authorApproval?.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <div className="text-red-800 text-sm">
                      <strong>거절 사유:</strong> {request.authorApproval.rejectionReason}
                    </div>
                  </div>
                )}

                {/* 배송 추적 정보 */}
                {request.shipping?.trackingNumber && (
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <div className="text-green-800 text-sm">
                      <strong>배송 추적:</strong> {request.shipping.shippingCompany} - {request.shipping.trackingNumber}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. 수정된 주소 입력 폼

#### AddressForm 업데이트

```typescript
// AddressForm 컴포넌트 수정 (기존 파일 내)

function AddressForm({ letterId, onClose, onSuccess, maxRequests, currentRequests }: { letterId: string; onClose: () => void; onSuccess: () => void; maxRequests: number; currentRequests: number }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    zipCode: "",
    address1: "",
    address2: "",
    memo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 기존 handleAddressComplete, handleSubmit 함수들...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 신청 제한 확인
    if (currentRequests >= maxRequests) {
      alert(`1인당 최대 ${maxRequests}개까지만 신청할 수 있습니다.`);
      return;
    }

    // 기존 유효성 검사...

    setIsSubmitting(true);

    try {
      const sessionId = localStorage.getItem("letterSessionId") || generateSessionId();
      localStorage.setItem("letterSessionId", sessionId);

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}/physical-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId,
        },
        credentials: "include",
        body: JSON.stringify({ address: formData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "신청 실패");
      }

      if (result.success) {
        alert(result.message);
        onSuccess();
      } else {
        throw new Error(result.error || "신청 실패");
      }
    } catch (error) {
      console.error("실물 편지 신청 실패:", error);
      alert(error instanceof Error ? error.message : "신청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 기존 폼 UI에 메모 필드 추가
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold mb-6">배송 주소 입력</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기존 필드들... */}

          {/* 메모 필드 추가 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">메모 (선택사항)</label>
            <input
              type="text"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="생일 축하, 감사 인사 등"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 신청 제한 안내 */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            현재 {currentRequests}/{maxRequests}개 신청됨
            {maxRequests > 1 && <div className="mt-1">여러 개의 주소로 신청할 수 있습니다.</div>}
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
```

---

## 🎨 UI/UX 개선사항

### 1. 사용자 플로우

1. **편지 조회**: URL을 통해 편지 접근
2. **신청 현황 확인**: 다른 사람들의 승인된 신청 확인
3. **무제한 신청**: 여러 주소로 신청 가능 (제한 내에서)
4. **실시간 상태**: 승인/거절 상태 실시간 확인

### 2. 편지 작성자 플로우

1. **신청 관리**: 모든 신청 목록 확인
2. **승인/거절**: 개별 신청 승인 또는 거절
3. **통계 확인**: 신청 현황 및 비용 통계
4. **설정 관리**: 신청 허용 여부 및 제한 설정

### 3. 시각적 피드백

- 상태별 색상 구분 (대기/승인/거절)
- 실시간 통계 업데이트
- 진행 단계별 명확한 안내

---

## 📋 체크리스트

### 구현 완료 체크

- [ ] LetterDetailClient 컴포넌트 수정
- [ ] AuthorRequestsManager 컴포넌트 생성
- [ ] PhysicalRequestsList 컴포넌트 생성
- [ ] UserRequestsStatus 컴포넌트 생성
- [ ] AddressForm 컴포넌트 수정 (메모 필드 추가)
- [ ] 무제한 신청 로직 구현
- [ ] 승인/거절 시스템 구현

### 테스트 완료 체크

- [ ] 방문자 다중 신청 테스트
- [ ] 편지 작성자 승인/거절 테스트
- [ ] 실시간 상태 업데이트 테스트
- [ ] 신청 제한 로직 테스트
- [ ] 모바일 반응형 테스트

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 16-20시간  
**의존성**: 백엔드 승인 시스템 API, 사용자 인증 시스템
