# 📮 관리자 누적 실물 편지 관리 시스템 구현 프롬프트

## 📋 요구사항

편지별로 누적되는 실물 편지 신청을 효율적으로 관리할 수 있는 관리자 대시보드를 구현합니다. 개별 신청자별 상태 관리, 배송 추적, 통계 분석 기능을 제공해야 합니다.

## 🎯 구현 목표

- 편지별 누적 신청 관리
- 개별 신청 상태 추적 및 업데이트
- 배송 관리 및 추적 시스템
- 통계 및 분석 대시보드

---

## 🛠 관리자 시스템 구현 사항

### 1. 대시보드 메인 화면

#### PhysicalLetterDashboard.tsx

```typescript
// components/admin/PhysicalLetterDashboard.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalRevenue: number;
  popularLetters: Array<{
    letterId: string;
    title: string;
    requestCount: number;
    totalRevenue: number;
  }>;
  recentRequests: Array<{
    id: string;
    letterId: string;
    letterTitle: string;
    recipientName: string;
    status: string;
    cost: number;
    createdAt: string;
  }>;
}

export default function PhysicalLetterDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d"); // 7d, 30d, 90d

  useEffect(() => {
    fetchDashboardStats();
  }, [dateRange]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/physical-letters/dashboard?range=${dateRange}`, {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error("대시보드 데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: "신청됨", variant: "secondary" as const },
      confirmed: { label: "확인됨", variant: "default" as const },
      writing: { label: "작성 중", variant: "outline" as const },
      sent: { label: "발송됨", variant: "default" as const },
      delivered: { label: "배송완료", variant: "default" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">실물 편지 관리</h1>
        <div className="flex gap-2">
          <Button variant={dateRange === "7d" ? "default" : "outline"} onClick={() => setDateRange("7d")}>
            7일
          </Button>
          <Button variant={dateRange === "30d" ? "default" : "outline"} onClick={() => setDateRange("30d")}>
            30일
          </Button>
          <Button variant={dateRange === "90d" ? "default" : "outline"} onClick={() => setDateRange("90d")}>
            90일
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">총 신청</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">대기 중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">완료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">총 수익</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalRevenue.toLocaleString()}원</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 인기 편지 */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>인기 편지</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.popularLetters.map((letter, index) => (
                  <div key={letter.letterId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</div>
                      <div>
                        <div className="font-medium">{letter.title}</div>
                        <div className="text-sm text-gray-600">{letter.requestCount}건 신청</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{letter.totalRevenue.toLocaleString()}원</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 최근 신청 */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>최근 신청</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{request.letterTitle}</div>
                      <div className="text-sm text-gray-600">
                        {request.recipientName} • {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(request.status)}
                      <div className="text-sm text-gray-600 mt-1">{request.cost.toLocaleString()}원</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getAdminToken(): string {
  // 실제 구현에서는 인증 토큰을 반환
  return localStorage.getItem("adminToken") || "";
}
```

### 2. 신청 목록 관리

#### PhysicalLetterRequestList.tsx

```typescript
// components/admin/PhysicalLetterRequestList.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PhysicalRequest {
  id: string;
  letterId: string;
  letterTitle: string;
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
  shipping?: {
    trackingNumber?: string;
    shippingCompany?: string;
  };
}

export default function PhysicalLetterRequestList() {
  const [requests, setRequests] = useState<PhysicalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
  });
  const [selectedRequest, setSelectedRequest] = useState<PhysicalRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: "20",
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/admin/physical-requests?${params}`, {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setRequests(result.data.requests);
      }
    } catch (error) {
      console.error("신청 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, trackingInfo?: any) => {
    try {
      const response = await fetch(`/api/admin/physical-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          status,
          ...trackingInfo,
        }),
      });

      if (response.ok) {
        fetchRequests(); // 목록 새로고침
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: "신청됨", className: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "확인됨", className: "bg-blue-100 text-blue-800" },
      writing: { label: "작성 중", className: "bg-purple-100 text-purple-800" },
      sent: { label: "발송됨", className: "bg-green-100 text-green-800" },
      delivered: { label: "배송완료", className: "bg-green-100 text-green-800" },
      cancelled: { label: "취소됨", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.requested;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 및 필터 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">신청 목록 관리</h1>
        <Button onClick={() => fetchRequests()}>새로고침</Button>
      </div>

      {/* 필터 */}
      <div className="flex gap-4">
        <Input placeholder="편지 제목 또는 수신자명 검색" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="max-w-xs" />
        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">전체</SelectItem>
            <SelectItem value="requested">신청됨</SelectItem>
            <SelectItem value="confirmed">확인됨</SelectItem>
            <SelectItem value="writing">작성 중</SelectItem>
            <SelectItem value="sent">발송됨</SelectItem>
            <SelectItem value="delivered">배송완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 신청 목록 */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">편지</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">수신자</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">주소</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">비용</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">신청일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{request.letterTitle}</div>
                    <div className="text-sm text-gray-600">ID: {request.letterId.slice(-8)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{request.recipientInfo.name}</div>
                    <div className="text-sm text-gray-600">{request.recipientInfo.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {request.recipientInfo.address1}
                      <br />
                      {request.recipientInfo.address2}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{request.cost.totalCost.toLocaleString()}원</div>
                    <div className="text-sm text-gray-600">배송: {request.cost.shippingCost.toLocaleString()}원</div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                  <td className="px-4 py-3 text-sm">{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}>
                      관리
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 관리 모달 */}
      {selectedRequest && <RequestManagementModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onUpdate={updateRequestStatus} />}
    </div>
  );
}
```

### 3. 개별 신청 관리 모달

#### RequestManagementModal.tsx

```typescript
// components/admin/RequestManagementModal.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface RequestManagementModalProps {
  request: PhysicalRequest;
  onClose: () => void;
  onUpdate: (requestId: string, status: string, trackingInfo?: any) => void;
}

export default function RequestManagementModal({ request, onClose, onUpdate }: RequestManagementModalProps) {
  const [status, setStatus] = useState(request.status);
  const [trackingNumber, setTrackingNumber] = useState(request.shipping?.trackingNumber || "");
  const [shippingCompany, setShippingCompany] = useState(request.shipping?.shippingCompany || "");
  const [adminNote, setAdminNote] = useState("");

  const handleUpdate = () => {
    const trackingInfo: any = {};

    if (trackingNumber) trackingInfo.trackingNumber = trackingNumber;
    if (shippingCompany) trackingInfo.shippingCompany = shippingCompany;
    if (adminNote) trackingInfo.adminNote = adminNote;

    onUpdate(request.id, status, trackingInfo);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">신청 관리</h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* 신청 정보 */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">편지 제목</label>
                <div className="p-2 bg-gray-50 rounded">{request.letterTitle}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">수신자</label>
                <div className="p-2 bg-gray-50 rounded">{request.recipientInfo.name}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">배송 주소</label>
              <div className="p-2 bg-gray-50 rounded">
                {request.recipientInfo.address1} {request.recipientInfo.address2}
                <br />
                연락처: {request.recipientInfo.phone}
              </div>
            </div>

            {request.recipientInfo.memo && (
              <div>
                <label className="block text-sm font-medium mb-1">메모</label>
                <div className="p-2 bg-gray-50 rounded">{request.recipientInfo.memo}</div>
              </div>
            )}
          </div>

          {/* 상태 관리 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">상태 변경</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested">신청됨</SelectItem>
                  <SelectItem value="confirmed">확인됨</SelectItem>
                  <SelectItem value="writing">작성 중</SelectItem>
                  <SelectItem value="sent">발송됨</SelectItem>
                  <SelectItem value="delivered">배송완료</SelectItem>
                  <SelectItem value="cancelled">취소됨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 배송 정보 (발송됨 상태일 때) */}
            {status === "sent" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">택배사</label>
                  <Select value={shippingCompany} onValueChange={setShippingCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="택배사 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cj">CJ대한통운</SelectItem>
                      <SelectItem value="lotte">롯데택배</SelectItem>
                      <SelectItem value="hanjin">한진택배</SelectItem>
                      <SelectItem value="post">우체국택배</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">운송장 번호</label>
                  <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="운송장 번호 입력" />
                </div>
              </div>
            )}

            {/* 관리자 메모 */}
            <div>
              <label className="block text-sm font-medium mb-2">관리자 메모</label>
              <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="관리자 메모를 입력하세요" rows={3} />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              업데이트
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4. 통계 및 분석

#### PhysicalLetterAnalytics.tsx

```typescript
// components/admin/PhysicalLetterAnalytics.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  dailyStats: Array<{
    date: string;
    requests: number;
    revenue: number;
  }>;
  regionStats: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  averageProcessingTime: number;
  topPerformingLetters: Array<{
    letterId: string;
    title: string;
    requestCount: number;
    conversionRate: number;
  }>;
}

export default function PhysicalLetterAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/physical-letters/analytics", {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error("분석 데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">분석 데이터 로딩 중...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">실물 편지 분석</h1>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 지역별 통계 */}
          <Card>
            <CardHeader>
              <CardTitle>지역별 신청 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.regionStats.map((region) => (
                  <div key={region.region} className="flex items-center justify-between">
                    <span>{region.region}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${region.percentage}%` }} />
                      </div>
                      <span className="text-sm text-gray-600">
                        {region.count}건 ({region.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 상태별 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>처리 상태 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.statusDistribution.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <span>{getStatusLabel(status.status)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${status.percentage}%` }} />
                      </div>
                      <span className="text-sm text-gray-600">
                        {status.count}건 ({status.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 인기 편지 */}
          <Card>
            <CardHeader>
              <CardTitle>인기 편지 TOP 10</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topPerformingLetters.map((letter, index) => (
                  <div key={letter.letterId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</div>
                      <div>
                        <div className="font-medium">{letter.title}</div>
                        <div className="text-sm text-gray-600">전환율: {letter.conversionRate}%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{letter.requestCount}건</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 처리 시간 */}
          <Card>
            <CardHeader>
              <CardTitle>평균 처리 시간</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{analytics.averageProcessingTime}일</div>
                <div className="text-gray-600">신청부터 발송까지</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels = {
    requested: "신청됨",
    confirmed: "확인됨",
    writing: "작성 중",
    sent: "발송됨",
    delivered: "배송완료",
    cancelled: "취소됨",
  };
  return labels[status as keyof typeof labels] || status;
}
```

---

## 🔧 관리자 인증 및 권한

### 1. 관리자 인증 미들웨어

```typescript
// middleware/adminAuth.ts

export function authenticateAdmin(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "인증이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
  }
}
```

### 2. 권한 레벨 관리

```typescript
// 권한 레벨 정의
enum AdminRole {
  VIEWER = "viewer", // 조회만 가능
  OPERATOR = "operator", // 상태 변경 가능
  ADMIN = "admin", // 모든 권한
}

// 권한 확인 함수
function checkPermission(requiredRole: AdminRole) {
  return (req: any, res: any, next: any) => {
    const userRole = req.admin.role;

    const roleHierarchy = {
      [AdminRole.VIEWER]: 1,
      [AdminRole.OPERATOR]: 2,
      [AdminRole.ADMIN]: 3,
    };

    if (roleHierarchy[userRole] >= roleHierarchy[requiredRole]) {
      next();
    } else {
      res.status(403).json({ error: "권한이 부족합니다." });
    }
  };
}
```

---

## 📊 성능 최적화

### 1. 데이터베이스 인덱싱

- 편지 ID + 상태별 복합 인덱스
- 생성일 기준 인덱스
- 지역별 통계를 위한 우편번호 인덱스

### 2. 캐싱 전략

- 대시보드 통계 데이터 Redis 캐싱
- 인기 편지 목록 캐싱
- 실시간 업데이트를 위한 캐시 무효화

### 3. 페이지네이션

- 대용량 데이터 처리를 위한 커서 기반 페이지네이션
- 무한 스크롤 지원

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 20-24시간  
**의존성**: 관리자 인증 시스템, 백엔드 API 구현
