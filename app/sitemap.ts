import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// ponytail: 공개 고정 페이지만. 편지(/letter/*)는 링크로만 나누는 글이라 넣지 않는다. 안내 글이 생기면 여기에 추가
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/stories", "/notices", "/terms", "/privacy"].flatMap((path) => {
    const languages = { ko: `${BASE}${path}`, en: `${BASE}/en${path}` };
    const changeFrequency = path === "" || path === "/stories" ? "daily" : "monthly";
    const priority = path === "" ? 1 : 0.5;
    return [
      { url: languages.ko, changeFrequency, priority, alternates: { languages } },
      { url: languages.en, changeFrequency, priority, alternates: { languages } },
    ] as const;
  });
}
