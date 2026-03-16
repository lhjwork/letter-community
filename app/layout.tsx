import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
    <html lang="ko">
      <head>
        <link href="https://hangeul.pstatic.net/hangeul_static/css/NanumJangMiCe.css" rel="stylesheet" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <SessionProvider>
          <div className="mx-auto max-w-[1920px] overflow-x-hidden">{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
