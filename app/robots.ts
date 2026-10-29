import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// 로그인 뒤 화면·인쇄용 편지지·API 는 검색에 내보내지 않는다(/en 쪽도 같이)
const PRIVATE = ["/api/", "/admin/", "/write", "/drafts", "/my-page", "/letter-box", "/home", "/inquiry", "/story-update", "/stationery/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE.flatMap((p) => [p, `/en${p}`]),
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
