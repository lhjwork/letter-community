"use client";

import { useState, useEffect } from "react";
import { getPhysicalRequestStatusAnonymous } from "@/lib/recipient-api";
import { PhysicalRequestStatusResponse } from "@/types/recipient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnonymousPhysicalStatusTrackerProps {
  letterId: string;
  requestId: string;
  onClose?: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  requested: {
    label: "신청됨",
    color: "bg-blue-100 text-blue-800",
    icon: "📝",
  },
  approved: {
    label: "승인됨",
    color: "bg-green-100 text-green-800",
    icon: "✅",
  },
  writing: {
    label: "작성 중",
    color: "bg-purple-100 text-purple-800",
    icon: "✍️",
  },
  sent: {
    label: "발송됨",
    color: "bg-orange-100 text-orange-800",
    icon: "📦",
  },
  delivered: {
    label: "배송 완료",
    color: "bg-green-100 text-green-800",
    icon: "🎉",
  },
};

export default function AnonymousPhysicalStatusTracker({ letterId, requestId, onClose }: AnonymousPhysicalStatusTrackerProps) {
  const [status, setStatus] = useState<PhysicalRequestStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getPhysicalRequestStatusAnonymous(letterId, requestId);
        setStatus(response);
      } catch (err) {
        console.error("상태 조회 실패:", err);
        const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";

        // 404 에러 처리
        if (errorMessage.includes("404")) {
          setError("신청 정보를 찾을 수 없습니다. 신청 ID를 확인해주세요. 백엔드 API가 준비 중일 수 있습니다.");
        } else {
          setError("신청 상태를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();

    // 자동 새로고침 (30초마다)
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchStatus, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [letterId, requestId, autoRefresh]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <span className="ml-3 text-gray-600">상태를 조회 중입니다...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>

            {/* 디버깅 정보 */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md mb-4">
              <p className="text-gray-600 text-xs font-mono">
                <strong>신청 ID:</strong> {requestId}
              </p>
              <p className="text-gray-600 text-xs font-mono">
                <strong>편지 ID:</strong> {letterId}
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
              <p className="text-blue-800 text-xs leading-relaxed">
                💡 <strong>안내:</strong> 백엔드 API가 아직 준비 중일 수 있습니다.
                <br />
                다음 엔드포인트가 필요합니다:
                <br />
                <code className="bg-white px-2 py-1 rounded text-blue-700">GET /api/letters/:letterId/physical-request/:requestId</code>
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                새로고침
              </Button>
              {onClose && (
                <Button onClick={onClose} className="flex-1">
                  닫기
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!status?.data) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center">신청 정보를 찾을 수 없습니다.</p>
            {onClose && (
              <Button onClick={onClose} variant="outline" className="mt-4 w-full">
                닫기
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = status.data;
  const currentStatusInfo = STATUS_LABELS[data.status] || STATUS_LABELS.requested;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>신청 상태 조회</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 편지 정보 */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">편지 정보</h3>
            <p className="text-lg font-semibold text-gray-900">{data.letterTitle}</p>
            <p className="text-xs text-gray-500 mt-1">신청 ID: {data.requestId}</p>
          </div>

          {/* 현재 상태 */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">현재 상태</h3>
            <div className={`inline-block px-4 py-2 rounded-full ${currentStatusInfo.color} font-medium`}>
              {currentStatusInfo.icon} {currentStatusInfo.label}
            </div>
          </div>

          {/* 수신자 정보 (마스킹) */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">수신자 정보</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600">이름:</span> <span className="font-medium">{data.recipientInfo.name}</span>
              </p>
              <p>
                <span className="text-gray-600">주소:</span> <span className="font-medium">{data.recipientInfo.address}</span>
              </p>
            </div>
          </div>

          {/* 상태 이력 */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">상태 이력</h3>
            <div className="space-y-2">
              {data.statusHistory.requested && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">신청:</span>
                  <span className="text-gray-700">{new Date(data.statusHistory.requested).toLocaleString("ko-KR")}</span>
                </div>
              )}
              {data.statusHistory.approved && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">승인:</span>
                  <span className="text-gray-700">{new Date(data.statusHistory.approved).toLocaleString("ko-KR")}</span>
                </div>
              )}
              {data.statusHistory.writing && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">작성:</span>
                  <span className="text-gray-700">{new Date(data.statusHistory.writing).toLocaleString("ko-KR")}</span>
                </div>
              )}
              {data.statusHistory.sent && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">발송:</span>
                  <span className="text-gray-700">{new Date(data.statusHistory.sent).toLocaleString("ko-KR")}</span>
                </div>
              )}
              {data.statusHistory.delivered && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-20">배송:</span>
                  <span className="text-gray-700">{new Date(data.statusHistory.delivered).toLocaleString("ko-KR")}</span>
                </div>
              )}
            </div>
          </div>

          {/* 배송 정보 */}
          {data.trackingInfo.canTrack && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">배송 정보</h3>
              {data.trackingInfo.estimatedDelivery && (
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">예상 배송일:</span> {data.trackingInfo.estimatedDelivery}
                </p>
              )}
            </div>
          )}

          {/* 자동 새로고침 토글 */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700">30초마다 자동 새로고침</span>
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
              새로고침
            </Button>
            {onClose && (
              <Button onClick={onClose} className="flex-1">
                닫기
              </Button>
            )}
          </div>

          {/* 안내 메시지 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-xs leading-relaxed">
              💡 <strong>안내:</strong> 상태는 30초마다 자동으로 새로고침됩니다. 신청 ID를 저장해두시면 언제든 상태를 조회할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
