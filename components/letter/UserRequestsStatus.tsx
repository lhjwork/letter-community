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
