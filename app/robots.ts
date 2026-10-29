import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 로그인 뒤 화면·인쇄용 편지지·API 는 검색에 내보내지 않는다
      disallow: ["/api/", "/admin/", "/write", "/drafts", "/my-page", "/letter-box", "/home", "/inquiry", "/story-update", "/stationery/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
