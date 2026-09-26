import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import Instagram from "next-auth/providers/instagram";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

interface OAuthProfile {
  email?: string;
  name?: string;
  picture?: string;
  profile_image?: string;
  [key: string]: unknown;
}

// JWT payload의 exp(초)를 읽는다. 검증은 백엔드 몫이라 서명 확인 없이 디코드만 한다.
function tokenExp(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return typeof payload.exp === "number" ? payload.exp : 0;
  } catch {
    return 0;
  }
}

const REFRESH_BEFORE_SEC = 60 * 60; // 만료 1시간 전부터 재발급

export const authConfig = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),
    Instagram({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/",
  },
  trustHost: true,
  callbacks: {
    authorized() {
      return true; // 모든 페이지 접근 허용
    },
    async jwt({ token, account, profile, user, trigger, session }) {
      // 마이페이지에서 닉네임 변경 시 세션 갱신
      if (trigger === "update" && session?.name) {
        token.name = session.name;
        return token;
      }
      // OAuth 로그인 시 백엔드 API 호출
      if (account && profile) {
        try {
          const oauthProfile = profile as OAuthProfile;

          // 이메일 추출 로직 개선 (Kakao 등 중첩된 구조 대응)
          const email =
            (profile as any)?.kakao_account?.email || // Kakao
            (profile as any)?.response?.email || // Naver
            oauthProfile.email ||
            user?.email ||
            token.email;

          // 백엔드 API에 OAuth 정보 전달
          const response = await fetch(`${BACKEND_URL}/api/users/oauth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "",
            },
            body: JSON.stringify({
              provider: account.provider,
              providerId: account.providerAccountId,
              email: email,
              // 카카오는 is_email_verified 제공, 네이버/인스타는 provider 검증 이메일로 간주
              emailVerified: (profile as any)?.kakao_account ? (profile as any).kakao_account.is_email_verified === true : Boolean(email),
              name: oauthProfile.name || token.name,
              image: oauthProfile.picture || oauthProfile.profile_image || token.picture,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              profile: profile,
            }),
          });

          if (!response.ok) {
            console.error("Backend OAuth login failed:", await response.text());
            return token;
          }

          const data = await response.json();

          // 백엔드에서 받은 토큰과 사용자 정보 저장
          return {
            ...token,
            name: data.data.user.name, // 백엔드가 생성한 익명 닉네임 사용
            backendToken: data.data.token,
            userId: data.data.user._id,
            provider: account.provider,
            accessToken: account.access_token,
          };
        } catch (error) {
          console.error("Error calling backend OAuth API:", error);
          return token;
        }
      }

      // 백엔드 토큰 만료 임박 시 재발급. NextAuth 세션은 접속마다 연장되지만
      // 백엔드 JWT는 로그인 시 한 번만 발급되어 어긋나는 문제를 여기서 막는다.
      const backendToken = token.backendToken as string | undefined;
      if (backendToken && token.userId && tokenExp(backendToken) - Date.now() / 1000 < REFRESH_BEFORE_SEC) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/users/token/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "",
            },
            body: JSON.stringify({ userId: token.userId }),
          });
          if (response.ok) {
            const data = await response.json();
            return { ...token, backendToken: data.data.token };
          }
          console.error("Backend token refresh failed:", response.status);
          // 재발급 불가(탈퇴 등)면 토큰을 비워 API가 401을 내고 클라이언트가 로그아웃하게 한다
          return { ...token, backendToken: undefined };
        } catch (error) {
          console.error("Error refreshing backend token:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // 세션에 백엔드 토큰과 사용자 정보 추가
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
          provider: token.provider as string,
        },
        backendToken: token.backendToken as string,
      };
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
