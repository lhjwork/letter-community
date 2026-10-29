import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// 우선 Report-Only 로 위반만 관찰. 콘솔에 위반이 없으면 Content-Security-Policy 로 승격
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://t1.daumcdn.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://hangeul.pstatic.net",
  "font-src 'self' data: https://fonts.gstatic.com https://hangeul.pstatic.net",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  // isomorphic-dompurify → jsdom 을 서버 번들에 넣으면 dev(webpack)에서 default-stylesheet.css ENOENT 로 500. 외부 패키지로 둔다
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  poweredByHeader: false,
  // reactCompiler: true, // Disabled due to HMR infinite loop issues

  // Add empty turbopack config to silence the warning
  turbopack: {},

  // /en/x 는 같은 페이지 /x 를 영어로(언어는 proxy.ts 가 x-locale 로 정한다)
  async rewrites() {
    return [
      { source: "/en", destination: "/" },
      { source: "/en/:path*", destination: "/:path*" },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default createNextIntlPlugin()(nextConfig);
