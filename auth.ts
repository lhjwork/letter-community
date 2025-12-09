import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import Instagram from "next-auth/providers/instagram";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

interface OAuthProfile {
  email?: string;
  name?: string;
  picture?: string;
  profile_image?: string;
  [key: string]: unknown;
}

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
  callbacks: {
    authorized() {
      return true; // 모든 페이지 접근 허용
    },
    async jwt({ token, account, profile, user }) {
      // OAuth 로그인 시 백엔드 API 호출
      if (account && profile) {
        try {
          const oauthProfile = profile as OAuthProfile;

          // 이메일 추출 로직 개선 및 미전달 처리
          const email =
            (profile as any)?.kakao_account?.email || // Kakao
            (profile as any)?.response?.email || // Naver
            oauthProfile.email ||
            user?.email ||
            token.email ||
            "not-provided";

          // 백엔드 API에 OAuth 정보 전달
          const response = await fetch(`${BACKEND_URL}/api/users/oauth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: account.provider,
              providerId: account.providerAccountId,
              email: email,
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
        accessToken: token.accessToken as string,
      };
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
