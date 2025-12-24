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
      const fetchSummary = async () => {
        setLoading(true);
        try {
          const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
          const response = await fetch(`${BACKEND_URL}/api/letters/${letterId}/cumulative-physical-requests?limit=5`, {
            credentials: "include",
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setSummary(result.data.summary);
            }
          }
        } catch (error) {
          console.error("신청 현황 조회 실패:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSummary();
    }
  }, [letterId, totalRequests]);

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
