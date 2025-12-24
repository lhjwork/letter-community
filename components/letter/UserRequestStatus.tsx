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
    const fetchRequestStatus = async () => {
      try {
        const sessionId = localStorage.getItem("letterSessionId");
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

        const response = await fetch(`${BACKEND_URL}/api/cumulative-physical-requests/${requestId}`, {
          headers: {
            "X-Session-ID": sessionId || "",
          },
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setRequest(result.data);
          }
        }
      } catch (error) {
        console.error("신청 상태 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestStatus();
  }, [requestId]);

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
