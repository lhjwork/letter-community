# OAuth 로그인 구현 가이드

## 개요

이 프로젝트는 Next.js 15 + Auth.js v5를 사용하여 카카오, 네이버, 인스타그램 OAuth 로그인을 구현합니다.
백엔드 Express 서버(`http://localhost:5001`)와 통신하여 사용자 인증을 처리합니다.

## 아키텍처

```
프론트엔드 (Next.js + Auth.js)
    ↓
OAuth Provider (Kakao/Naver/Instagram)
    ↓
Auth.js (토큰 및 프로필 수신)
    ↓
백엔드 API (POST /api/users/oauth/login)
    ↓
JWT 토큰 발급
    ↓
프론트엔드 세션 저장
```

## 파일 구조

```
letter-community/
├── auth.ts                          # Auth.js 설정 (OAuth Providers)
├── middleware.ts                    # Auth.js 미들웨어
├── types/
│   └── next-auth.d.ts              # NextAuth 타입 정의
├── lib/
│   └── api.ts                      # 백엔드 API 호출 유틸리티
├── components/
│   ├── SessionProvider.tsx         # Auth.js 세션 프로바이더
│   └── shareds/
│       ├── Header.tsx              # 헤더 (로그인 버튼, 사용자 메뉴)
│       └── LoginModal.tsx          # 로그인 모달 (OAuth 버튼들)
├── app/
│   ├── layout.tsx                  # SessionProvider 적용
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts        # Auth.js API 핸들러
└── .env.local                      # 환경 변수

```

## 주요 컴포넌트 설명

### 1. `auth.ts` - Auth.js 설정

- **Providers**: 카카오, 네이버, 인스타그램 OAuth Provider 등록
- **JWT Callback**: OAuth 인증 후 백엔드 API 호출
  - OAuth 정보를 `POST /api/users/oauth/login`로 전송
  - 백엔드에서 받은 JWT 토큰을 세션에 저장
- **Session Callback**: 세션에 백엔드 토큰과 사용자 정보 추가

### 2. `components/shareds/LoginModal.tsx` - 로그인 모달

- 카카오, 네이버, 인스타그램 로그인 버튼 제공
- `signIn(provider)` 호출하여 OAuth 플로우 시작
- 각 소셜 서비스의 브랜드 컬러 적용

### 3. `components/shareds/Header.tsx` - 헤더

- 로그인 상태 확인 (`useSession()`)
- 비로그인: "로그인" 버튼 → 모달 오픈
- 로그인: 사용자 이름 표시 + 드롭다운 메뉴
- 로그아웃 기능 (`signOut()`)

### 4. `lib/api.ts` - 백엔드 API 유틸리티

백엔드 API 호출을 위한 유틸리티 함수들:

- `apiRequest()`: 공통 API 호출 함수
- `getCurrentUser()`: 사용자 정보 조회
- `updateUser()`: 사용자 정보 업데이트
- `linkOAuthAccount()`: OAuth 계정 연결
- `unlinkOAuthAccount()`: OAuth 계정 연결 해제

## 환경 변수 설정

`.env.local` 파일 생성:

```env
# Auth.js
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Client IDs & Secrets
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

# Backend API
BACKEND_URL=http://localhost:5001
```

## 백엔드 API 명세

### OAuth 로그인

```http
POST /api/users/oauth/login
Content-Type: application/json

{
  "provider": "kakao" | "naver" | "instagram",
  "providerId": "string",
  "email": "string",
  "name": "string",
  "image": "string",
  "accessToken": "string",
  "refreshToken": "string",
  "profile": object
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "image": "profile-image-url",
      "oauthAccounts": [...]
    },
    "token": "jwt-token"
  },
  "message": "OAuth login successful"
}
```

## 사용 예시

### 1. 로그인 상태 확인

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>로딩 중...</div>;
  }

  if (status === "authenticated") {
    return <div>안녕하세요, {session.user.name}님!</div>;
  }

  return <div>로그인이 필요합니다.</div>;
}
```

### 2. 백엔드 API 호출

```tsx
"use client";
import { useSession } from "next-auth/react";
import { getCurrentUser } from "@/lib/api";

export default function ProfilePage() {
  const { data: session } = useSession();

  const fetchUserData = async () => {
    if (session?.backendToken) {
      try {
        const userData = await getCurrentUser(session.backendToken);
        console.log("사용자 정보:", userData);
      } catch (error) {
        console.error("API 호출 실패:", error);
      }
    }
  };

  return <button onClick={fetchUserData}>내 정보 조회</button>;
}
```

### 3. 로그아웃

```tsx
"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return <button onClick={handleLogout}>로그아웃</button>;
}
```

## 세션 데이터 구조

Auth.js 세션에 저장되는 데이터:

```typescript
{
  user: {
    id: string;              // 백엔드 사용자 ID
    name: string;            // 사용자 이름
    email: string;           // 이메일
    image: string;           // 프로필 이미지
    provider: string;        // OAuth Provider (kakao/naver/instagram)
  },
  backendToken: string;      // 백엔드 JWT 토큰 (API 호출 시 사용)
  accessToken: string;       // OAuth 액세스 토큰
}
```

## 보안 고려사항

1. **AUTH_SECRET**: 강력한 시크릿 키 사용 (`openssl rand -base64 32`)
2. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS 사용
3. **CORS**: 백엔드에서 프론트엔드 도메인만 허용
4. **Token**: 백엔드 JWT 토큰을 HttpOnly 쿠키로 관리 권장 (현재는 세션에 저장)
5. **환경 변수**: `.env.local`은 Git에 커밋하지 않음 (`.gitignore`에 포함됨)

## 트러블슈팅

### 1. 로그인 버튼 클릭 시 아무 반응이 없음

- 백엔드 서버가 `http://localhost:5001`에서 실행 중인지 확인
- 브라우저 콘솔에서 네트워크 에러 확인

### 2. OAuth 인증 후 에러 발생

- OAuth Client ID/Secret이 올바른지 확인
- OAuth 앱 설정에서 Redirect URI 확인: `http://localhost:3000/api/auth/callback/{provider}`

### 3. 백엔드 API 호출 실패

- `session.backendToken`이 존재하는지 확인
- 백엔드 CORS 설정 확인

### 4. 세션이 유지되지 않음

- `AUTH_SECRET` 환경 변수 설정 확인
- 쿠키가 차단되지 않았는지 확인

## 다음 단계

1. **Server Actions**: Next.js Server Actions로 백엔드 API 호출 개선
2. **Token Refresh**: 토큰 만료 시 자동 갱신 로직 추가
3. **Error Handling**: 더 상세한 에러 처리 및 사용자 피드백
4. **로딩 상태**: OAuth 인증 중 로딩 UI 개선
5. **테스트**: OAuth 플로우 E2E 테스트 작성
