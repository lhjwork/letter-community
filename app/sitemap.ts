import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// ponytail: 공개 고정 페이지만. 편지(/letter/*)는 링크로만 나누는 글이라 넣지 않는다. 안내 글이 생기면 여기에 추가
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/stories", "/notices", "/terms", "/privacy"].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === "" || path === "/stories" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));
}
