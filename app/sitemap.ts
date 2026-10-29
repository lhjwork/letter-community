import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

const BASE = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// ponytail: 공개 고정 페이지와 안내 글(lib/guides.ts, 한국어만). 편지(/letter/*)는 링크로만 나누는 글이라 넣지 않는다
export default function sitemap(): MetadataRoute.Sitemap {
  const guides = GUIDES.map((g) => ({ url: `${BASE}/guide/${g.slug}`, lastModified: g.date, changeFrequency: "monthly", priority: 0.7 }) as const);
  const pages = ["", "/stories", "/notices", "/terms", "/privacy"].flatMap((path) => {
    const languages = { ko: `${BASE}${path}`, en: `${BASE}/en${path}`, ja: `${BASE}/ja${path}` };
    const changeFrequency = path === "" || path === "/stories" ? "daily" : "monthly";
    const priority = path === "" ? 1 : 0.5;
    return Object.values(languages).map((url) => ({ url, changeFrequency, priority, alternates: { languages } }) as const);
  });
  return [...pages, ...guides];
}
