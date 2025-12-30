"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPhysicalRequestStatus } from "@/lib/recipient-api";
import { getPhysicalRequestId, hasPhysicalRequest } from "@/lib/letter-requests";
import { PhysicalRequestStatusResponse } from "@/types/recipient";
import PhysicalRequestStatusBar from "./PhysicalRequestStatusBar";
import PhysicalRequestTrackingCard from "./PhysicalRequestTrackingCard";

interface PhysicalRequestTrackerProps {
  letterId: string;
}

export default function PhysicalRequestTracker({ letterId }: PhysicalRequestTrackerProps) {
  const [trackingData, setTrackingData] = useState<PhysicalRequestStatusResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRequest, setHasRequest] = useState(false);

  // 신청 여부 확인
  useEffect(() => {
    setHasRequest(hasPhysicalRequest(letterId));
  }, [letterId]);

  // 추적 데이터 조회
  const fetchTrackingData = useCallback(async () => {
    const requestId = getPhysicalRequestId(letterId);
    if (!requestId) {
      setError("추적 ID를 찾을 수 없습니다.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getPhysicalRequestStatus(requestId);
      if (response.success) {
        setTrackingData(response.data);
      } else {
        setError("상태 조회에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("추적 데이터 조회 실패:", err);
      if (err.message?.includes("REQUEST_NOT_FOUND")) {
        setError("신청 내역을 찾을 수 없습니다.");
      } else if (err.message?.includes("NO_PHYSICAL_REQUESTS")) {
        setError("실물 편지 신청 내역이 없습니다.");
      } else {
        setError("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [letterId]);

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    if (hasRequest) {
      fetchTrackingData();
    }
  }, [hasRequest, fetchTrackingData]);

  // 신청 내역이 없는 경우
  if (!hasRequest) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center">
          <div className="text-gray-400 mb-4">📭</div>
          <h3 className="font-medium text-gray-600 mb-2">실물 편지 신청 내역이 없습니다</h3>
          <p className="text-sm text-gray-500">이 편지에 대한 실물 편지를 신청하지 않았습니다.</p>
        </CardContent>
      </Card>
    );
  }

  // 로딩 상태
  if (isLoading && !trackingData) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">배송 상태를 조회하고 있습니다...</p>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error && !trackingData) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="py-8 text-center">
          <div className="text-red-600 mb-4">❌</div>
          <h3 className="font-medium text-red-800 mb-2">상태 조회 실패</h3>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <Button onClick={fetchTrackingData} variant="outline" size="sm">
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 추적 데이터 표시
  if (trackingData) {
    return (
      <div className="space-y-6">
        {/* 상태 진행바 */}
        <Card>
          <CardContent className="p-6">
            <PhysicalRequestStatusBar currentStatus={trackingData.status} statusHistory={trackingData.statusHistory} />
          </CardContent>
        </Card>

        {/* 추적 정보 카드 */}
        <PhysicalRequestTrackingCard data={trackingData} onRefresh={fetchTrackingData} isRefreshing={isLoading} />
      </div>
    );
  }

  return null;
}
