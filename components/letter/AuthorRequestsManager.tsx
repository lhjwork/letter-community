"use client";

import { useState, useEffect, useCallback } from "react";
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

  // authorSettings는 향후 자동 승인 기능 등에 활용 예정
  console.log("Author settings:", authorSettings);

  const fetchRequests = useCallback(async () => {
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
  }, [letterId, filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
