import type { Metadata, Viewport } from "next";
import { Anton, Nanum_Myeongjo, Nanum_Pen_Script } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { Suspense } from "react";
import { AlertHost } from "@/components/ui/AppAlert";
import LoginPrompt from "@/components/shareds/LoginPrompt";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { OG_IMAGE } from "@/lib/og";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";

const myeongjo = Nanum_Myeongjo({ weight: ["400", "700", "800"], subsets: ["latin"], variable: "--font-myeongjo", display: "swap", preload: false });
const pen = Nanum_Pen_Script({ weight: "400", subsets: ["latin"], variable: "--font-pen", display: "swap", preload: false });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap", preload: false });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.meta");
  // 같은 페이지의 한국어(/x)·영어(/en/x)·일본어(/ja/x) 주소를 검색엔진에 알린다. 하위 페이지가 canonical 을 따로 두면 그쪽이 이긴다
  const h = await headers();
  const path = h.get("x-pathname") ?? "/";
  const at = (l: string) => (l === "ko" ? path : `/${l}${path === "/" ? "" : path}`);
  return {
    alternates: { canonical: at(h.get("x-locale") ?? "ko"), languages: { ko: path, en: at("en"), ja: at("ja"), "x-default": path } },
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
    title: t("title"),
    description: t("description"),
    openGraph: { images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: t("ogAlt") }], type: "website" },
    twitter: { card: "summary_large_image", images: [OG_IMAGE] },
    verification: {
      google: "LRhuIOX7f2AalDx5wB6oEQJ38I9UeGcaFLZj3WeoKgU",
      other: { "naver-site-verification": "4bfed1167a4e5e6ca008bfc0650ea80dbbdc3f99" },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={await getLocale()} className={`${myeongjo.variable} ${pen.variable} ${anton.variable}`}>
      <head>
        <link href="https://hangeul.pstatic.net/hangeul_static/css/NanumJangMiCe.css" rel="stylesheet" />
        {/* 편지지·봉투 SVG(components/stationery)가 폰트명 문자열로 쓴다 */}
        <link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider>
        <SessionProvider>
          <GoogleAnalytics />
          {children}
          <AlertHost />
          <Suspense>
            <LoginPrompt />
          </Suspense>
        </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
