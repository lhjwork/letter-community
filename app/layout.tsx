import type { Metadata, Viewport } from "next";
import { Anton, Nanum_Myeongjo, Nanum_Pen_Script } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { AlertHost } from "@/components/ui/AppAlert";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const myeongjo = Nanum_Myeongjo({ weight: ["400", "700", "800"], subsets: ["latin"], variable: "--font-myeongjo", display: "swap" });
const pen = Nanum_Pen_Script({ weight: "400", subsets: ["latin"], variable: "--font-pen", display: "swap", preload: false });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap", preload: false });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Letter Community",
  description: "사연을 공유하는 커뮤니티",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${myeongjo.variable} ${pen.variable} ${anton.variable}`}>
      <head>
        <link href="https://hangeul.pstatic.net/hangeul_static/css/NanumJangMiCe.css" rel="stylesheet" />
        {/* 편지지·봉투 SVG(components/stationery)가 폰트명 문자열로 쓴다 */}
        <link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <SessionProvider>
          <GoogleAnalytics />
          {children}
          <AlertHost />
        </SessionProvider>
      </body>
    </html>
  );
}
