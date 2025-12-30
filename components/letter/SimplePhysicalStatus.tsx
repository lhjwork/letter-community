"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSimplePhysicalStatus } from "@/lib/recipient-api";
import { SimplePhysicalStatusResponse } from "@/types/recipient";

interface SimplePhysicalStatusProps {
  letterId: string;
}

export default function SimplePhysicalStatus({ letterId }: SimplePhysicalStatusProps) {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [statusData, setStatusData] = useState<SimplePhysicalStatusResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 상태 조회
  const fetchStatus = useCallback(async () => {
    if (!token || !letterId) return;

    try {
      setIsLoading(true);
      const response = await getSimplePhysicalStatus(token, letterId);
      if (response.success) {
        setStatusData(response.data);
      }
    } catch (error) {
      console.error("상태 조회 실패:", error);
      // 에러 시 조용히 숨김 처리
      setStatusData(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, letterId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // 신청하지 않은 경우 또는 로딩 중이면 표시하지 않음
  if (isLoading || !statusData || !statusData.hasRequest) {
    return null;
  }

  const { currentStatus } = statusData;
  if (!currentStatus) return null;

  // 상태별 스타일 설정
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "requested":
        return {
          bgColor: "bg-yellow-50 border-yellow-200",
          textColor: "text-yellow-800",
          badgeColor: "bg-yellow-100 text-yellow-800",
          icon: "⏳",
        };
      case "approved":
        return {
          bgColor: "bg-green-50 border-green-200",
          textColor: "text-green-800",
          badgeColor: "bg-green-100 text-green-800",
          icon: "✅",
        };
      case "writing":
        return {
          bgColor: "bg-blue-50 border-blue-200",
          textColor: "text-blue-800",
          badgeColor: "bg-blue-100 text-blue-800",
          icon: "✍️",
        };
      case "sent":
        return {
          bgColor: "bg-purple-50 border-purple-200",
          textColor: "text-purple-800",
          badgeColor: "bg-purple-100 text-purple-800",
          icon: "📮",
        };
      case "delivered":
        return {
          bgColor: "bg-emerald-50 border-emerald-200",
          textColor: "text-emerald-800",
          badgeColor: "bg-emerald-100 text-emerald-800",
          icon: "🎉",
        };
      default:
        return {
          bgColor: "bg-gray-50 border-gray-200",
          textColor: "text-gray-800",
          badgeColor: "bg-gray-100 text-gray-800",
          icon: "📮",
        };
    }
  };

  const style = getStatusStyle(currentStatus.status);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEstimatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8">
      <Card className={`${style.bgColor} border-2 transition-all duration-300 hover:shadow-md`}>
        <CardContent className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${style.textColor} flex items-center gap-2`}>📮 실물 편지 상태</h3>
          </div>

          {/* 현재 상태 */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{style.icon}</span>
              <Badge className={`${style.badgeColor} font-medium`}>{currentStatus.statusLabel}</Badge>
            </div>
            <p className={`${style.textColor} text-base font-medium`}>{currentStatus.statusMessage}</p>
          </div>

          {/* 상세 정보 */}
          <div className={`text-sm ${style.textColor} space-y-1`}>
            <div>마지막 업데이트: {formatDate(currentStatus.lastUpdated)}</div>
            {currentStatus.estimatedDelivery && <div className="font-medium">예상 배송: {formatEstimatedDate(currentStatus.estimatedDelivery)}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
