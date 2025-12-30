"use client";

import { useState, useEffect, useCallback } from "react";
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

  const fetchApprovedRequests = useCallback(async () => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://letter-my-backend.onrender.com";
      const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}/physical-status?limit=${showAll ? 50 : 10}`, {
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
  }, [letterId, showAll]);

  useEffect(() => {
    fetchApprovedRequests();
  }, [fetchApprovedRequests]);

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
