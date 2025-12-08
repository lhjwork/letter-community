This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 필요한 값을 설정하세요:

```bash
cp .env.example .env.local
```

#### 필수 환경 변수:

- `AUTH_SECRET`: Auth.js용 시크릿 키 (생성 명령어: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: 애플리케이션 URL (개발 환경: `http://localhost:3000`)
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`: 카카오 OAuth 앱 정보
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`: 네이버 OAuth 앱 정보
- `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`: 인스타그램 OAuth 앱 정보
- `BACKEND_URL`: 백엔드 API URL (기본값: `http://localhost:5000`)

### 2. 백엔드 서버 실행

백엔드 서버가 `http://localhost:5000`에서 실행되고 있어야 합니다.
백엔드는 Express 기반으로 다음 OAuth 관련 API를 제공해야 합니다:

- `POST /api/users/oauth/login` - OAuth 로그인/회원가입

### 3. 패키지 설치

```bash
pnpm install
```

### 4. 개발 서버 실행

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## OAuth 로그인 기능

이 프로젝트는 Auth.js를 사용하여 소셜 로그인을 지원합니다:

- 카카오 로그인
- 네이버 로그인
- 인스타그램 로그인

### 로그인 플로우:

1. 프론트엔드: 헤더의 "로그인" 버튼 클릭
2. 프론트엔드: 로그인 모달에서 원하는 소셜 로그인 선택
3. Auth.js: 각 OAuth Provider(카카오/네이버/인스타그램)로 리다이렉트
4. OAuth Provider: 사용자 인증 및 승인
5. Auth.js: OAuth Provider로부터 액세스 토큰 및 프로필 정보 수신
6. Auth.js: 백엔드 API (`POST /api/users/oauth/login`)로 OAuth 정보 전달
7. 백엔드: 사용자 조회/생성 후 JWT 토큰 발급
8. Auth.js: 백엔드 토큰을 세션에 저장
9. 프론트엔드: 로그인 완료, 헤더에 사용자 이름 표시

### Backend API 엔드포인트:

백엔드 서버(`http://localhost:5000`)는 다음 API를 제공합니다:

#### OAuth 로그인

```
POST /api/users/oauth/login
Content-Type: application/json

Request Body:
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

Response:
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "email": "string",
      "name": "string",
      "image": "string",
      "oauthAccounts": []
    },
    "token": "jwt-token"
  },
  "message": "OAuth login successful"
}
```

#### 현재 사용자 정보 조회

```
GET /api/users/me
Authorization: Bearer {token}
```

#### 사용자 정보 업데이트

```
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "string",
  "email": "string",
  "image": "string"
}
```

#### OAuth 계정 연결

```
POST /api/users/me/oauth/link
Authorization: Bearer {token}
```

#### OAuth 계정 연결 해제

```
DELETE /api/users/me/oauth/:provider
Authorization: Bearer {token}
```

### 프론트엔드에서 백엔드 API 호출하기

세션에서 백엔드 토큰을 사용하여 API를 호출할 수 있습니다:

```typescript
import { useSession } from "next-auth/react";
import { getCurrentUser, updateUser } from "@/lib/api";

function MyComponent() {
  const { data: session } = useSession();

  const handleGetUserInfo = async () => {
    if (session?.backendToken) {
      const userData = await getCurrentUser(session.backendToken);
      console.log(userData);
    }
  };

  return <button onClick={handleGetUserInfo}>내 정보 조회</button>;
}
```

## Project Structure

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
