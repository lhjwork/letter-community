# 편지 임시저장 기능 - 관리자 구현 프롬프트

## 🎯 목표

편지 임시저장 기능에 대한 관리자 대시보드 및 관리 도구 구현

## 📋 요구사항

### 핵심 기능

1. **임시저장 통계 대시보드**

   - 전체 임시저장 현황 (일별, 월별)
   - 사용자별 임시저장 통계
   - 발행 전환율 분석

2. **임시저장 관리**

   - 전체 임시저장 목록 조회
   - 임시저장 상세 내용 확인
   - 문제가 있는 임시저장 삭제

3. **사용자 관리**

   - 과도한 임시저장 사용자 모니터링
   - 임시저장 용량 제한 관리
   - 사용자별 임시저장 정책 설정

4. **시스템 관리**
   - 자동 정리 설정 관리
   - 백업 및 복구 기능
   - 성능 모니터링

## 🗂️ 파일 구조

```
admin/
├── components/
│   ├── drafts/
│   │   ├── DraftStatsDashboard.tsx      # 임시저장 통계 대시보드
│   │   ├── DraftManagementTable.tsx     # 임시저장 관리 테이블
│   │   ├── DraftDetailModal.tsx         # 임시저장 상세 모달
│   │   ├── DraftAnalytics.tsx           # 임시저장 분석 차트
│   │   └── DraftCleanupSettings.tsx     # 자동 정리 설정
│   ├── users/
│   │   ├── UserDraftStats.tsx           # 사용자별 임시저장 통계
│   │   └── UserDraftLimits.tsx          # 사용자 제한 설정
│   └── system/
│       ├── SystemHealth.tsx             # 시스템 상태 모니터링
│       └── BackupManager.tsx            # 백업 관리
├── pages/
│   ├── drafts/
│   │   ├── index.tsx                    # 임시저장 관리 메인
│   │   ├── analytics.tsx                # 임시저장 분석
│   │   └── settings.tsx                 # 임시저장 설정
│   └── system/
│       └── maintenance.tsx              # 시스템 유지보수
├── lib/
│   ├── admin-draft-api.ts               # 관리자 임시저장 API
│   ├── draft-analytics.ts               # 임시저장 분석 유틸
│   └── system-monitoring.ts             # 시스템 모니터링 유틸
└── types/
    └── admin-draft.ts                   # 관리자 임시저장 타입
```

## 🔧 구현 세부사항

### 1. 관리자 타입 정의 (types/admin-draft.ts)

```typescript
// 관리자용 임시저장 통계 타입
export interface AdminDraftStats {
  overview: {
    totalDrafts: number;
    totalUsers: number;
    totalWords: number;
    publishRate: number; // 발행 전환율
    avgSaveCount: number;
    storageUsed: number; // MB 단위
  };
  trends: {
    daily: Array<{
      date: string;
      drafts: number;
      published: number;
      deleted: number;
    }>;
    monthly: Array<{
      month: string;
      drafts: number;
      published: number;
      users: number;
    }>;
  };
  topUsers: Array<{
    userId: string;
    username: string;
    email: string;
    draftCount: number;
    publishedCount: number;
    totalWords: number;
    lastActivity: string;
  }>;
  categories: Array<{
    category: string;
    count: number;
    publishRate: number;
  }>;
}

// 관리자용 임시저장 목록 타입
export interface AdminDraftList {
  drafts: Array<{
    _id: string;
    authorId: string;
    authorName: string;
    authorEmail: string;
    title: string;
    autoTitle: string;
    content: string; // 전체 내용
    type: "friend" | "story";
    category: string;
    wordCount: number;
    saveCount: number;
    status: "draft" | "published" | "deleted";
    createdAt: string;
    lastSavedAt: string;
    publishedAt?: string;
    publishedLetterId?: string;
    flags: {
      isLongStored: boolean; // 30일 이상
      isLargeContent: boolean; // 5000자 이상
      isInactive: boolean; // 7일 이상 미수정
      hasIssues: boolean; // 문제 있음
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status: string;
    dateRange: string;
    userType: string;
    contentSize: string;
  };
}

// 사용자별 임시저장 통계 타입
export interface UserDraftStats {
  userId: string;
  username: string;
  email: string;
  stats: {
    totalDrafts: number;
    publishedDrafts: number;
    deletedDrafts: number;
    totalWords: number;
    avgWordsPerDraft: number;
    avgSaveCount: number;
    publishRate: number;
    storageUsed: number;
  };
  activity: {
    firstDraft: string;
    lastActivity: string;
    activeDays: number;
    peakHour: number;
  };
  limits: {
    maxDrafts: number;
    maxStorageSize: number; // MB
    currentUsage: {
      drafts: number;
      storage: number;
    };
    isExceeded: boolean;
  };
  recentDrafts: Array<{
    _id: string;
    title: string;
    wordCount: number;
    lastSavedAt: string;
    status: string;
  }>;
}

// 시스템 상태 타입
export interface DraftSystemHealth {
  database: {
    totalSize: number; // MB
    indexSize: number; // MB
    avgQueryTime: number; // ms
    slowQueries: number;
  };
  performance: {
    avgSaveTime: number; // ms
    avgLoadTime: number; // ms
    errorRate: number; // %
    throughput: number; // requests/min
  };
  storage: {
    totalUsed: number; // MB
    totalLimit: number; // MB
    usagePercent: number;
    growthRate: number; // MB/day
  };
  cleanup: {
    lastRun: string;
    itemsDeleted: number;
    spaceFreed: number; // MB
    nextRun: string;
  };
}

// 자동 정리 설정 타입
export interface DraftCleanupConfig {
  enabled: boolean;
  schedule: string; // cron expression
  rules: {
    deleteAfterDays: number;
    maxDraftsPerUser: number;
    maxStoragePerUser: number; // MB
    deleteUnmodifiedDays: number;
  };
  notifications: {
    enabled: boolean;
    email: string;
    slackWebhook?: string;
  };
  dryRun: boolean; // 테스트 모드
}
```

### 2. 관리자 API 함수 (lib/admin-draft-api.ts)

```typescript
import { apiRequest } from "./api";
import { AdminDraftStats, AdminDraftList, UserDraftStats, DraftSystemHealth, DraftCleanupConfig } from "@/types/admin-draft";

// 임시저장 통계 조회
export async function getAdminDraftStats(
  token: string,
  params: {
    period?: "7d" | "30d" | "90d" | "1y";
    includeDeleted?: boolean;
  } = {}
): Promise<{ success: boolean; data: AdminDraftStats }> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });

  return apiRequest(`/api/admin/drafts/stats?${searchParams.toString()}`, {
    method: "GET",
    token,
  });
}

// 관리자용 임시저장 목록 조회
export async function getAdminDraftList(
  token: string,
  params: {
    page?: number;
    limit?: number;
    status?: "all" | "draft" | "published" | "deleted";
    dateRange?: "7d" | "30d" | "90d";
    userType?: "all" | "active" | "inactive" | "heavy";
    contentSize?: "all" | "small" | "medium" | "large";
    search?: string;
    sortBy?: "created" | "modified" | "wordCount" | "saveCount";
    sortOrder?: "asc" | "desc";
  } = {}
): Promise<{ success: boolean; data: AdminDraftList }> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });

  return apiRequest(`/api/admin/drafts?${searchParams.toString()}`, {
    method: "GET",
    token,
  });
}

// 특정 임시저장 상세 조회
export async function getAdminDraftDetail(token: string, draftId: string): Promise<{ success: boolean; data: any }> {
  return apiRequest(`/api/admin/drafts/${draftId}`, {
    method: "GET",
    token,
  });
}

// 임시저장 강제 삭제
export async function forceDeleteDraft(token: string, draftId: string, reason: string): Promise<{ success: boolean }> {
  return apiRequest(`/api/admin/drafts/${draftId}/force-delete`, {
    method: "DELETE",
    token,
    body: JSON.stringify({ reason }),
  });
}

// 사용자별 임시저장 통계 조회
export async function getUserDraftStats(token: string, userId: string): Promise<{ success: boolean; data: UserDraftStats }> {
  return apiRequest(`/api/admin/users/${userId}/draft-stats`, {
    method: "GET",
    token,
  });
}

// 사용자 임시저장 제한 설정
export async function setUserDraftLimits(
  token: string,
  userId: string,
  limits: {
    maxDrafts?: number;
    maxStorageSize?: number;
  }
): Promise<{ success: boolean }> {
  return apiRequest(`/api/admin/users/${userId}/draft-limits`, {
    method: "PUT",
    token,
    body: JSON.stringify(limits),
  });
}

// 시스템 상태 조회
export async function getDraftSystemHealth(token: string): Promise<{ success: boolean; data: DraftSystemHealth }> {
  return apiRequest("/api/admin/drafts/system-health", {
    method: "GET",
    token,
  });
}

// 자동 정리 설정 조회
export async function getDraftCleanupConfig(token: string): Promise<{ success: boolean; data: DraftCleanupConfig }> {
  return apiRequest("/api/admin/drafts/cleanup-config", {
    method: "GET",
    token,
  });
}

// 자동 정리 설정 업데이트
export async function updateDraftCleanupConfig(token: string, config: Partial<DraftCleanupConfig>): Promise<{ success: boolean }> {
  return apiRequest("/api/admin/drafts/cleanup-config", {
    method: "PUT",
    token,
    body: JSON.stringify(config),
  });
}

// 수동 정리 실행
export async function runDraftCleanup(token: string, dryRun: boolean = false): Promise<{ success: boolean; data: { deleted: number; spaceFreed: number } }> {
  return apiRequest("/api/admin/drafts/cleanup/run", {
    method: "POST",
    token,
    body: JSON.stringify({ dryRun }),
  });
}

// 임시저장 백업 생성
export async function createDraftBackup(
  token: string,
  params: {
    includeDeleted?: boolean;
    dateRange?: string;
  }
): Promise<{ success: boolean; data: { backupId: string; downloadUrl: string } }> {
  return apiRequest("/api/admin/drafts/backup", {
    method: "POST",
    token,
    body: JSON.stringify(params),
  });
}

// 임시저장 분석 데이터 조회
export async function getDraftAnalytics(
  token: string,
  params: {
    metric: "usage" | "performance" | "conversion" | "user-behavior";
    period: "7d" | "30d" | "90d";
    groupBy?: "day" | "week" | "month";
  }
): Promise<{ success: boolean; data: any }> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value.toString());
  });

  return apiRequest(`/api/admin/drafts/analytics?${searchParams.toString()}`, {
    method: "GET",
    token,
  });
}
```

### 3. 임시저장 통계 대시보드 (components/drafts/DraftStatsDashboard.tsx)

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAdminDraftStats } from "@/lib/admin-draft-api";
import { AdminDraftStats } from "@/types/admin-draft";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, FileText, Send, HardDrive } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function DraftStatsDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminDraftStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  useEffect(() => {
    if (session?.accessToken) {
      fetchStats();
    }
  }, [session?.accessToken, period]);

  const fetchStats = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const response = await getAdminDraftStats(session.accessToken, { period });
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("통계 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  const formatNumber = (num: number) => num.toLocaleString();
  const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">임시저장 통계</h2>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7일</SelectItem>
            <SelectItem value="30d">30일</SelectItem>
            <SelectItem value="90d">90일</SelectItem>
            <SelectItem value="1y">1년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 임시저장</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.overview.totalDrafts)}</div>
            <p className="text-xs text-muted-foreground">평균 {stats.overview.avgSaveCount.toFixed(1)}회 저장</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.overview.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">임시저장 사용자</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">발행 전환율</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.publishRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs">
              {stats.overview.publishRate > 50 ? <TrendingUp className="h-3 w-3 text-green-500 mr-1" /> : <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
              <span className={stats.overview.publishRate > 50 ? "text-green-500" : "text-red-500"}>{stats.overview.publishRate > 50 ? "양호" : "개선 필요"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">저장소 사용량</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats.overview.storageUsed)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(stats.overview.totalWords)} 총 글자수</p>
          </CardContent>
        </Card>
      </div>

      {/* 트렌드 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>일별 임시저장 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trends.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="drafts" stroke="#8884d8" name="임시저장" />
                <Line type="monotone" dataKey="published" stroke="#82ca9d" name="발행" />
                <Line type="monotone" dataKey="deleted" stroke="#ffc658" name="삭제" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>카테고리별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="개수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 상위 사용자 */}
      <Card>
        <CardHeader>
          <CardTitle>상위 사용자 (임시저장 기준)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topUsers.slice(0, 10).map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatNumber(user.draftCount)}개 임시저장</div>
                  <div className="text-sm text-gray-500">
                    {formatNumber(user.publishedCount)}개 발행 ({((user.publishedCount / user.draftCount) * 100).toFixed(1)}%)
                  </div>
                  <div className="text-xs text-gray-400">{formatNumber(user.totalWords)}자</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. 임시저장 관리 테이블 (components/drafts/DraftManagementTable.tsx)

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAdminDraftList, forceDeleteDraft } from "@/lib/admin-draft-api";
import { AdminDraftList } from "@/types/admin-draft";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Trash2, AlertTriangle, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import DraftDetailModal from "./DraftDetailModal";

export default function DraftManagementTable() {
  const { data: session } = useSession();
  const [data, setData] = useState<AdminDraftList | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "30d",
    userType: "all",
    contentSize: "all",
    search: "",
    sortBy: "modified",
    sortOrder: "desc",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (session?.accessToken) {
      fetchDrafts();
    }
  }, [session?.accessToken, filters, page]);

  const fetchDrafts = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const response = await getAdminDraftList(session.accessToken, {
        page,
        limit: 20,
        ...filters,
      });
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("임시저장 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!session?.accessToken) return;
    if (!confirm("정말 이 임시저장을 삭제하시겠습니까?")) return;

    const reason = prompt("삭제 사유를 입력해주세요:");
    if (!reason) return;

    try {
      await forceDeleteDraft(session.accessToken, draftId, reason);
      fetchDrafts();
      alert("임시저장이 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">임시저장</Badge>;
      case "published":
        return <Badge variant="default">발행됨</Badge>;
      case "deleted":
        return <Badge variant="destructive">삭제됨</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFlagBadges = (flags: any) => {
    const badges = [];
    if (flags.isLongStored)
      badges.push(
        <Badge key="long" variant="outline" className="text-orange-600">
          장기보관
        </Badge>
      );
    if (flags.isLargeContent)
      badges.push(
        <Badge key="large" variant="outline" className="text-blue-600">
          대용량
        </Badge>
      );
    if (flags.isInactive)
      badges.push(
        <Badge key="inactive" variant="outline" className="text-gray-600">
          비활성
        </Badge>
      );
    if (flags.hasIssues)
      badges.push(
        <Badge key="issues" variant="destructive">
          문제
        </Badge>
      );
    return badges;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="draft">임시저장</SelectItem>
            <SelectItem value="published">발행됨</SelectItem>
            <SelectItem value="deleted">삭제됨</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.dateRange} onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="기간" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7일</SelectItem>
            <SelectItem value="30d">30일</SelectItem>
            <SelectItem value="90d">90일</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.userType} onValueChange={(value) => setFilters((prev) => ({ ...prev, userType: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="사용자" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">비활성</SelectItem>
            <SelectItem value="heavy">헤비유저</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.contentSize} onValueChange={(value) => setFilters((prev) => ({ ...prev, contentSize: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="크기" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="small">소형</SelectItem>
            <SelectItem value="medium">중형</SelectItem>
            <SelectItem value="large">대형</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">생성일</SelectItem>
            <SelectItem value="modified">수정일</SelectItem>
            <SelectItem value="wordCount">글자수</SelectItem>
            <SelectItem value="saveCount">저장횟수</SelectItem>
          </SelectContent>
        </Select>

        <Input placeholder="검색..." value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
      </div>

      {/* 테이블 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>글자수</TableHead>
              <TableHead>저장횟수</TableHead>
              <TableHead>마지막 수정</TableHead>
              <TableHead>플래그</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.drafts.map((draft) => (
              <TableRow key={draft._id}>
                <TableCell>
                  <div>
                    <div className="font-medium line-clamp-1">{draft.title || draft.autoTitle || "제목 없음"}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{draft.content.replace(/<[^>]*>/g, "").substring(0, 50)}...</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{draft.authorName}</div>
                    <div className="text-sm text-gray-500">{draft.authorEmail}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(draft.status)}</TableCell>
                <TableCell>{draft.wordCount.toLocaleString()}자</TableCell>
                <TableCell>{draft.saveCount}회</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(draft.lastSavedAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">{getFlagBadges(draft.flags)}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDraft(draft._id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {draft.status === "draft" && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDraft(draft._id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            이전
          </Button>
          <span className="flex items-center px-4 text-sm">
            {page} / {data.pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === data.pagination.totalPages} onClick={() => setPage(page + 1)}>
            다음
          </Button>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedDraft && <DraftDetailModal draftId={selectedDraft} onClose={() => setSelectedDraft(null)} />}
    </div>
  );
}
```

### 5. 자동 정리 설정 컴포넌트 (components/drafts/DraftCleanupSettings.tsx)

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getDraftCleanupConfig, updateDraftCleanupConfig, runDraftCleanup } from "@/lib/admin-draft-api";
import { DraftCleanupConfig } from "@/types/admin-draft";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Play, TestTube } from "lucide-react";

export default function DraftCleanupSettings() {
  const { data: session } = useSession();
  const [config, setConfig] = useState<DraftCleanupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      fetchConfig();
    }
  }, [session?.accessToken]);

  const fetchConfig = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const response = await getDraftCleanupConfig(session.accessToken);
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error("설정 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.accessToken || !config) return;

    setSaving(true);
    try {
      await updateDraftCleanupConfig(session.accessToken, config);
      alert("설정이 저장되었습니다.");
    } catch (error) {
      console.error("설정 저장 실패:", error);
      alert("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleRunCleanup = async (dryRun: boolean = false) => {
    if (!session?.accessToken) return;
    if (!dryRun && !confirm("정말 정리를 실행하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.")) return;

    setRunning(true);
    try {
      const response = await runDraftCleanup(session.accessToken, dryRun);
      if (response.success) {
        const { deleted, spaceFreed } = response.data;
        alert(`${dryRun ? "테스트 " : ""}정리 완료!\n삭제된 항목: ${deleted}개\n확보된 공간: ${(spaceFreed / 1024 / 1024).toFixed(1)} MB`);
      }
    } catch (error) {
      console.error("정리 실행 실패:", error);
      alert("정리 실행 중 오류가 발생했습니다.");
    } finally {
      setRunning(false);
    }
  };

  if (loading || !config) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>자동 정리 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 설정 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="enabled" checked={config.enabled} onCheckedChange={(checked) => setConfig((prev) => (prev ? { ...prev, enabled: checked } : null))} />
              <Label htmlFor="enabled">자동 정리 활성화</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule">실행 스케줄 (Cron)</Label>
                <Input id="schedule" value={config.schedule} onChange={(e) => setConfig((prev) => (prev ? { ...prev, schedule: e.target.value } : null))} placeholder="0 2 * * *" />
                <p className="text-xs text-gray-500 mt-1">매일 새벽 2시: 0 2 * * *</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="dryRun" checked={config.dryRun} onCheckedChange={(checked) => setConfig((prev) => (prev ? { ...prev, dryRun: checked } : null))} />
                <Label htmlFor="dryRun">테스트 모드 (실제 삭제 안함)</Label>
              </div>
            </div>
          </div>

          {/* 정리 규칙 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">정리 규칙</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deleteAfterDays">보관 기간 (일)</Label>
                <Input
                  id="deleteAfterDays"
                  type="number"
                  value={config.rules.deleteAfterDays}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            rules: { ...prev.rules, deleteAfterDays: parseInt(e.target.value) },
                          }
                        : null
                    )
                  }
                />
                <p className="text-xs text-gray-500 mt-1">이 기간 후 자동 삭제</p>
              </div>

              <div>
                <Label htmlFor="deleteUnmodifiedDays">비활성 기간 (일)</Label>
                <Input
                  id="deleteUnmodifiedDays"
                  type="number"
                  value={config.rules.deleteUnmodifiedDays}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            rules: { ...prev.rules, deleteUnmodifiedDays: parseInt(e.target.value) },
                          }
                        : null
                    )
                  }
                />
                <p className="text-xs text-gray-500 mt-1">수정되지 않은 기간</p>
              </div>

              <div>
                <Label htmlFor="maxDraftsPerUser">사용자당 최대 임시저장</Label>
                <Input
                  id="maxDraftsPerUser"
                  type="number"
                  value={config.rules.maxDraftsPerUser}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            rules: { ...prev.rules, maxDraftsPerUser: parseInt(e.target.value) },
                          }
                        : null
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="maxStoragePerUser">사용자당 최대 용량 (MB)</Label>
                <Input
                  id="maxStoragePerUser"
                  type="number"
                  value={config.rules.maxStoragePerUser}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            rules: { ...prev.rules, maxStoragePerUser: parseInt(e.target.value) },
                          }
                        : null
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">알림 설정</h3>

            <div className="flex items-center space-x-2">
              <Switch
                id="notificationsEnabled"
                checked={config.notifications.enabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          notifications: { ...prev.notifications, enabled: checked },
                        }
                      : null
                  )
                }
              />
              <Label htmlFor="notificationsEnabled">알림 활성화</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">알림 이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.notifications.email}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            notifications: { ...prev.notifications, email: e.target.value },
                          }
                        : null
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="slackWebhook">Slack 웹훅 URL (선택)</Label>
                <Input
                  id="slackWebhook"
                  value={config.notifications.slackWebhook || ""}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            notifications: { ...prev.notifications, slackWebhook: e.target.value },
                          }
                        : null
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : "설정 저장"}
            </Button>

            <Button variant="outline" onClick={() => handleRunCleanup(true)} disabled={running} className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              {running ? "실행 중..." : "테스트 실행"}
            </Button>

            <Button variant="destructive" onClick={() => handleRunCleanup(false)} disabled={running} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              {running ? "실행 중..." : "정리 실행"}
            </Button>
          </div>

          {/* 경고 */}
          <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">주의사항</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>정리 실행 시 삭제된 데이터는 복구할 수 없습니다.</li>
                <li>테스트 모드를 먼저 실행하여 삭제될 항목을 확인하세요.</li>
                <li>스케줄 변경 시 서버 재시작이 필요할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. 시스템 상태 모니터링 (components/system/SystemHealth.tsx)

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getDraftSystemHealth } from "@/lib/admin-draft-api";
import { DraftSystemHealth } from "@/types/admin-draft";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Database, Zap, HardDrive, Trash2, AlertTriangle, CheckCircle } from "lucide-react";

export default function SystemHealth() {
  const { data: session } = useSession();
  const [health, setHealth] = useState<DraftSystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetchHealth();
      const interval = setInterval(fetchHealth, 30000); // 30초마다 갱신
      return () => clearInterval(interval);
    }
  }, [session?.accessToken]);

  const fetchHealth = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await getDraftSystemHealth(session.accessToken);
      if (response.success) {
        setHealth(response.data);
      }
    } catch (error) {
      console.error("시스템 상태 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return { status: "critical", color: "text-red-600", bg: "bg-red-50" };
    if (value >= thresholds.warning) return { status: "warning", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { status: "healthy", color: "text-green-600", bg: "bg-green-50" };
  };

  if (loading || !health) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  const formatTime = (ms: number) => `${ms.toFixed(1)}ms`;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">시스템 상태</h2>

      {/* 데이터베이스 상태 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">데이터베이스</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{formatBytes(health.database.totalSize)}</div>
              <p className="text-xs text-muted-foreground">총 크기</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatBytes(health.database.indexSize)}</div>
              <p className="text-xs text-muted-foreground">인덱스 크기</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatTime(health.database.avgQueryTime)}</div>
              <p className="text-xs text-muted-foreground">평균 쿼리 시간</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{health.database.slowQueries}</div>
              <p className="text-xs text-muted-foreground">느린 쿼리</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 성능 지표 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">성능</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{formatTime(health.performance.avgSaveTime)}</div>
              <p className="text-xs text-muted-foreground">평균 저장 시간</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatTime(health.performance.avgLoadTime)}</div>
              <p className="text-xs text-muted-foreground">평균 로드 시간</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{health.performance.errorRate.toFixed(2)}%</div>
                {health.performance.errorRate > 5 ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
              <p className="text-xs text-muted-foreground">오류율</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{health.performance.throughput.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">처리량 (req/min)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 저장소 사용량 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">저장소</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>사용량</span>
                <span>{health.storage.usagePercent.toFixed(1)}%</span>
              </div>
              <Progress value={health.storage.usagePercent} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatBytes(health.storage.totalUsed)}</span>
                <span>{formatBytes(health.storage.totalLimit)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-bold">{formatBytes(health.storage.growthRate)}/일</div>
                <p className="text-xs text-muted-foreground">증가율</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {health.storage.usagePercent > 80 ? (
                    <Badge variant="destructive">위험</Badge>
                  ) : health.storage.usagePercent > 60 ? (
                    <Badge variant="outline" className="text-yellow-600">
                      주의
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600">
                      양호
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">상태</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 자동 정리 상태 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">자동 정리</CardTitle>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">마지막 실행</div>
              <div className="font-medium">{new Date(health.cleanup.lastRun).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">삭제된 항목</div>
              <div className="font-medium">{health.cleanup.itemsDeleted.toLocaleString()}개</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">확보된 공간</div>
              <div className="font-medium">{formatBytes(health.cleanup.spaceFreed)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">다음 실행</div>
              <div className="font-medium">{new Date(health.cleanup.nextRun).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🔒 보안 고려사항

### 1. 관리자 권한 검증

- 모든 관리자 API에 관리자 권한 확인
- 역할 기반 접근 제어 (RBAC)
- 감사 로그 기록

### 2. 데이터 보호

- 민감한 사용자 정보 마스킹
- 임시저장 내용 접근 제한
- 삭제 작업 승인 프로세스

### 3. 시스템 보안

- API Rate Limiting
- SQL Injection 방지
- XSS 방지

## 📊 모니터링 및 알림

### 1. 실시간 모니터링

- 시스템 리소스 사용량
- API 응답 시간
- 오류율 추적

### 2. 알림 시스템

- 임계치 초과 시 알림
- 시스템 장애 알림
- 정기 리포트 발송

## 🧪 테스트 시나리오

### 1. 관리자 기능 테스트

- 통계 데이터 정확성
- 필터링 및 검색 기능
- 삭제 및 관리 작업

### 2. 성능 테스트

- 대용량 데이터 처리
- 동시 접속자 처리
- 메모리 사용량 최적화

### 3. 보안 테스트

- 권한 검증
- 데이터 접근 제어
- 입력값 검증

## 🚀 배포 전 체크리스트

- [ ] 모든 관리자 컴포넌트 구현
- [ ] 권한 검증 시스템 구축
- [ ] 통계 및 분석 기능 검증
- [ ] 자동 정리 시스템 테스트
- [ ] 모니터링 대시보드 구축
- [ ] 알림 시스템 설정
- [ ] 보안 검증 완료
- [ ] 성능 최적화 적용
- [ ] 문서화 완료

이 프롬프트를 바탕으로 관리자 개발을 진행하면 완전한 편지 임시저장 관리 시스템을 구축할 수 있습니다!
