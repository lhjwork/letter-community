# 🛠️ Admin 프롬프트 - 광고 관리 시스템

## 📋 요구사항

관리자 대시보드에 **광고 관리** 및 **광고 분석** 페이지를 구현해주세요.

---

## 📁 파일 구조

```
app/
  admin/
    ads/
      page.tsx                    # 광고 목록
      new/page.tsx                # 광고 생성
      [adId]/
        page.tsx                  # 광고 상세/수정
        stats/page.tsx            # 광고 통계
    analytics/
      page.tsx                    # 분석 대시보드 (개요)
      ads/page.tsx                # 광고 분석 대시보드
      qr/page.tsx                 # QR 분석
```

---

## 📦 패키지 설치

```bash
pnpm add recharts date-fns qrcode.react
pnpm add -D @types/qrcode.react
```

---

## 🎨 1단계: 광고 목록 페이지

### 파일: `app/admin/ads/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Ad {
  _id: string;
  name: string;
  slug: string;
  status: "draft" | "active" | "paused" | "expired";
  advertiser: { name: string };
  content: { headline: string };
  campaign: { startDate: string; endDate: string };
  stats: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-800",
};

const statusLabels = {
  draft: "초안",
  active: "활성",
  paused: "일시정지",
  expired: "만료",
};

export default function AdsListPage() {
  const { data: session } = useSession();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [session]);

  const fetchAds = async () => {
    if (!session?.backendToken) return;

    try {
      const res = await fetch("/api/admin/ads", {
        headers: { Authorization: `Bearer ${session.backendToken}` },
      });
      const data = await res.json();
      if (data.success) setAds(data.data);
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📢 광고 관리</h1>
        <Link href="/admin/ads/new">
          <Button>+ 새 광고 만들기</Button>
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">전체 광고</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">활성 광고</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ads.filter((a) => a.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">총 노출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ads
                .reduce((sum, a) => sum + a.stats.impressions, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">총 클릭</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {ads.reduce((sum, a) => sum + a.stats.clicks, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 광고 목록 */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  광고명
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  광고주
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  상태
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  기간
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  노출
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  클릭
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  CTR
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ads.map((ad) => (
                <tr key={ad._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{ad.name}</div>
                    <div className="text-sm text-gray-500">
                      {ad.content.headline}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{ad.advertiser.name}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[ad.status]}>
                      {statusLabels[ad.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(ad.campaign.startDate), "MM/dd", {
                      locale: ko,
                    })}{" "}
                    ~{" "}
                    {format(new Date(ad.campaign.endDate), "MM/dd", {
                      locale: ko,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ad.stats.impressions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ad.stats.clicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ad.stats.ctr.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Link href={`/admin/ads/${ad._id}`}>
                        <Button variant="outline" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Link href={`/admin/ads/${ad._id}/stats`}>
                        <Button variant="outline" size="sm">
                          통계
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ➕ 2단계: 광고 생성 페이지

### 파일: `app/admin/ads/new/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewAdPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    advertiser: {
      name: "",
      logo: "",
      contactEmail: "",
    },
    content: {
      headline: "",
      description: "",
      ctaText: "자세히 보기",
      targetUrl: "",
      theme: "general",
    },
    campaign: {
      name: "",
      startDate: "",
      endDate: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.backendToken) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert("광고가 생성되었습니다!");
        router.push("/admin/ads");
      } else {
        alert(data.error || "생성 실패");
      }
    } catch (error) {
      console.error("Create ad error:", error);
      alert("광고 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">➕ 새 광고 만들기</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                광고명 (내부용)
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="예: 2024 봄 웨딩 프로모션"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 광고주 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>광고주 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">광고주명</label>
              <Input
                value={formData.advertiser.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    advertiser: {
                      ...formData.advertiser,
                      name: e.target.value,
                    },
                  })
                }
                placeholder="예: 플라워카페"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">로고 URL</label>
              <Input
                value={formData.advertiser.logo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    advertiser: {
                      ...formData.advertiser,
                      logo: e.target.value,
                    },
                  })
                }
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                담당자 이메일
              </label>
              <Input
                type="email"
                value={formData.advertiser.contactEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    advertiser: {
                      ...formData.advertiser,
                      contactEmail: e.target.value,
                    },
                  })
                }
                placeholder="contact@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* 광고 콘텐츠 */}
        <Card>
          <CardHeader>
            <CardTitle>광고 콘텐츠</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">헤드라인</label>
              <Input
                value={formData.content.headline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, headline: e.target.value },
                  })
                }
                placeholder="예: 신혼부부 특별 할인 10%!"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">설명</label>
              <Textarea
                value={formData.content.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: {
                      ...formData.content,
                      description: e.target.value,
                    },
                  })
                }
                placeholder="광고 설명을 입력하세요"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                CTA 버튼 텍스트
              </label>
              <Input
                value={formData.content.ctaText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, ctaText: e.target.value },
                  })
                }
                placeholder="예: 혜택 받으러 가기"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">연결 URL</label>
              <Input
                type="url"
                value={formData.content.targetUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, targetUrl: e.target.value },
                  })
                }
                placeholder="https://advertiser.com/promo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">테마</label>
              <Select
                value={formData.content.theme}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    content: { ...formData.content, theme: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">일반</SelectItem>
                  <SelectItem value="wedding">웨딩</SelectItem>
                  <SelectItem value="birthday">생일</SelectItem>
                  <SelectItem value="congratulation">축하</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 캠페인 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>캠페인 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">캠페인명</label>
              <Input
                value={formData.campaign.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    campaign: { ...formData.campaign, name: e.target.value },
                  })
                }
                placeholder="예: spring_wedding_2024"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">시작일</label>
                <Input
                  type="date"
                  value={formData.campaign.startDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      campaign: {
                        ...formData.campaign,
                        startDate: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">종료일</label>
                <Input
                  type="date"
                  value={formData.campaign.endDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      campaign: {
                        ...formData.campaign,
                        endDate: e.target.value,
                      },
                    })
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "생성 중..." : "광고 생성"}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## 📊 3단계: 광고 통계 페이지

### 파일: `app/admin/ads/[adId]/stats/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { QRCodeSVG } from "qrcode.react";
import { subDays } from "date-fns";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

interface AdStats {
  ad: { _id: string; name: string; slug: string; status: string };
  summary: {
    impressions: number;
    clicks: number;
    ctr: string;
    uniqueVisitors: number;
    avgDwellTime: number;
  };
  daily: { date: string; impressions: number; clicks: number }[];
  bySource: { _id: string; count: number }[];
  byDevice: { _id: string; count: number }[];
}

export default function AdStatsPage({ params }: { params: { adId: string } }) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  useEffect(() => {
    fetchStats();
  }, [params.adId, dateRange, session]);

  const fetchStats = async () => {
    if (!session?.backendToken) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      });

      const res = await fetch(
        `/api/admin/ads/${params.adId}/stats?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${session.backendToken}` },
        }
      );
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      qr: "QR 코드",
      direct: "직접 접속",
      link: "편지 링크",
      social: "소셜",
      other: "기타",
    };
    return labels[source] || source;
  };

  const getDeviceLabel = (device: string) => {
    const labels: Record<string, string> = {
      mobile: "모바일",
      tablet: "태블릿",
      desktop: "데스크톱",
    };
    return labels[device] || device;
  };

  // QR 코드 URL 생성
  const qrUrl = stats?.ad?.slug
    ? `${process.env.NEXT_PUBLIC_APP_URL || "https://letter.community"}/ad/${
        stats.ad.slug
      }?utm_source=qr&utm_medium=offline`
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) {
    return <div className="p-6">광고를 찾을 수 없습니다</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{stats.ad.name}</h1>
          <p className="text-gray-500">광고 통계</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDateRange({ start: subDays(new Date(), 7), end: new Date() })
            }
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            7일
          </button>
          <button
            onClick={() =>
              setDateRange({ start: subDays(new Date(), 30), end: new Date() })
            }
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            30일
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">노출수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.summary.impressions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">클릭수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.summary.clicks.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.summary.ctr}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">고유 방문자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.summary.uniqueVisitors.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">
              평균 체류시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.summary.avgDwellTime}초
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 일별 추이 */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>일별 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  name="노출"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  name="클릭"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 유입 경로 */}
        <Card>
          <CardHeader>
            <CardTitle>유입 경로</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.bySource.map((s) => ({
                    name: getSourceLabel(s._id),
                    value: s.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {stats.bySource.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 기기별 */}
        <Card>
          <CardHeader>
            <CardTitle>기기별</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={stats.byDevice.map((d) => ({
                  name: getDeviceLabel(d._id),
                  count: d.count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="방문수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* QR 코드 */}
      <Card>
        <CardHeader>
          <CardTitle>📱 QR 코드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-8">
            <div className="p-4 bg-white border rounded-lg">
              <QRCodeSVG value={qrUrl} size={200} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2">QR 코드 URL</h3>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all mb-4">
                {qrUrl}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                이 QR 코드를 실물 편지에 인쇄하세요. 스캔 시 광고 랜딩 페이지로
                이동합니다.
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(qrUrl)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                URL 복사
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔀 4단계: Admin API 프록시

### 파일: `app/api/admin/ads/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.backendToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams.toString();
    const response = await fetch(
      `${BACKEND_URL}/api/ads${searchParams ? "?" + searchParams : ""}`,
      { headers: { Authorization: `Bearer ${session.backendToken}` } }
    );

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.backendToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const response = await fetch(`${BACKEND_URL}/api/ads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.backendToken}`,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
```

### 파일: `app/api/admin/ads/[adId]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.backendToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/ads/${params.adId}`, {
      headers: { Authorization: `Bearer ${session.backendToken}` },
    });

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.backendToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const response = await fetch(`${BACKEND_URL}/api/ads/${params.adId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.backendToken}`,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.backendToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/ads/${params.adId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.backendToken}` },
    });

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
```

### 파일: `app/api/admin/ads/[adId]/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.backendToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams.toString();
    const response = await fetch(
      `${BACKEND_URL}/api/ads/${params.adId}/stats${
        searchParams ? "?" + searchParams : ""
      }`,
      { headers: { Authorization: `Bearer ${session.backendToken}` } }
    );

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
```

---

## ✅ Admin 체크리스트

- [ ] `recharts`, `date-fns`, `qrcode.react` 패키지 설치
- [ ] `app/admin/ads/page.tsx` 생성 (광고 목록)
- [ ] `app/admin/ads/new/page.tsx` 생성 (광고 생성)
- [ ] `app/admin/ads/[adId]/page.tsx` 생성 (광고 수정)
- [ ] `app/admin/ads/[adId]/stats/page.tsx` 생성 (광고 통계)
- [ ] `app/api/admin/ads/` API 프록시 생성
- [ ] 관리자 네비게이션에 광고 메뉴 추가
- [ ] shadcn/ui 컴포넌트 설치 (Card, Button, Input, Select, Badge 등)

---

## 📚 전체 시스템 요약

### 데이터 흐름

```
1. QR 스캔 → Letter 광고 랜딩 페이지 → 노출 추적
2. CTA 클릭 → 클릭 추적 → 광고주 사이트 리다이렉트
3. 페이지 이탈 → 체류 시간 추적
4. Admin 대시보드 → 실시간 통계 확인
```

### 추적 데이터

| 이벤트     | 설명             | 추적 항목           |
| ---------- | ---------------- | ------------------- |
| impression | 광고 페이지 조회 | 기기, 유입경로, UTM |
| click      | CTA 버튼 클릭    | 클릭 대상, 시간     |
| dwell      | 체류 시간        | 초 단위             |

### QR 코드 URL 형식

```
https://letter.community/ad/[adSlug]
  ?utm_source=qr
  &utm_medium=offline
  &utm_campaign=[캠페인명]
  &letter=[편지ID]  (선택)
```

---

**구현 완료 후 테스트해보세요!** 🎉
