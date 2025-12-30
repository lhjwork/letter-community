"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhysicalRequestStatusResponse } from "@/types/recipient";

interface PhysicalRequestTrackingCardProps {
  data: PhysicalRequestStatusResponse["data"];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function PhysicalRequestTrackingCard({ data, onRefresh, isRefreshing = false }: PhysicalRequestTrackingCardProps) {
  const [copied, setCopied] = useState(false);

  const copyRequestId = async () => {
    try {
      await navigator.clipboard.writeText(data.requestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("복사 실패:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "text-yellow-600 bg-yellow-50";
      case "approved":
        return "text-green-600 bg-green-50";
      case "writing":
        return "text-blue-600 bg-blue-50";
      case "sent":
        return "text-purple-600 bg-purple-50";
      case "delivered":
        return "text-emerald-600 bg-emerald-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "requested":
        return "신청됨";
      case "approved":
        return "승인됨";
      case "writing":
        return "작성 중";
      case "sent":
        return "발송됨";
      case "delivered":
        return "배송완료";
      default:
        return status;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">📮 {data.letterTitle}</CardTitle>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm" disabled={isRefreshing}>
              {isRefreshing ? "새로고침 중..." : "🔄 새로고침"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 현재 상태 */}
        <div className={`p-4 rounded-lg ${getStatusColor(data.status)}`}>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="bg-white/80">
              {getStatusLabel(data.status)}
            </Badge>
            {data.trackingInfo.estimatedDelivery && <div className="text-sm font-medium">예상 배송: {new Date(data.trackingInfo.estimatedDelivery).toLocaleDateString("ko-KR")}</div>}
          </div>
          <p className="text-sm font-medium">현재 상태: {getStatusLabel(data.status)}</p>
        </div>

        {/* 수신자 정보 */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">📍 수신자 정보</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>👤 {data.recipientInfo.name}</div>
            <div>🏠 {data.recipientInfo.address}</div>
          </div>
        </div>

        {/* 추적 ID */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">🔍 추적 ID</h4>
            <Button onClick={copyRequestId} variant="outline" size="sm" className="h-7 text-xs">
              {copied ? "복사됨!" : "복사"}
            </Button>
          </div>
          <div className="text-xs text-blue-700 font-mono break-all">{data.requestId}</div>
          <p className="text-xs text-blue-600 mt-1">이 ID로 언제든지 배송 상태를 확인할 수 있습니다.</p>
        </div>

        {/* 추적 가능 여부 */}
        {data.trackingInfo.canTrack && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-green-700 font-medium">실시간 추적 가능</span>
            </div>
            <p className="text-xs text-green-600 mt-1">배송 상태가 실시간으로 업데이트됩니다.</p>
          </div>
        )}

        {/* 상태 히스토리 요약 */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">📋 진행 상황</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>📝 신청: {new Date(data.statusHistory.requested).toLocaleDateString("ko-KR")}</div>
            {data.statusHistory.approved && <div>✅ 승인: {new Date(data.statusHistory.approved).toLocaleDateString("ko-KR")}</div>}
            {data.statusHistory.writing && <div>✍️ 작성 시작: {new Date(data.statusHistory.writing).toLocaleDateString("ko-KR")}</div>}
            {data.statusHistory.sent && <div>📮 발송: {new Date(data.statusHistory.sent).toLocaleDateString("ko-KR")}</div>}
            {data.statusHistory.delivered && <div>🎉 배송완료: {new Date(data.statusHistory.delivered).toLocaleDateString("ko-KR")}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
