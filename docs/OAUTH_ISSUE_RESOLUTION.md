# OAuth 포트 문제 해결 완료

## 🔴 문제 상황

- 네이버 개발자 센터에 3001 포트 콜백 URL 추가함
- 하지만 OAuth 로그인 시 여전히 3000 포트로 리다이렉트됨
- 에러: "localhost:3000/api/auth/callback/naver?code=..."

## 🎯 원인 분석

**환경 변수 설정 문제:**

```env
# .env.local (기존)
NEXTAUTH_URL=http://localhost:3000  ← 3000 포트로 고정
NEXT_PUBLIC_URL=http://localhost:3000
```

NextAuth.js는 `NEXTAUTH_URL` 환경 변수를 사용하여 OAuth 콜백 URL을 생성합니다.
개발자 센터에 3001을 추가해도, 앱에서 3000으로 콜백 URL을 생성하면 3000으로 리다이렉트됩니다.

## ✅ 해결 방법

### 1. 환경 변수 수정

`.env.local` 파일 수정:

```env
# 수정 후
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_URL=http://localhost:3001
```

### 2. 개발자 센터 설정 확인

**네이버 개발자 센터:**

- ✅ `http://localhost:3000/api/auth/callback/naver` (기존)
- ✅ `http://localhost:3001/api/auth/callback/naver` (추가됨)

**카카오 개발자 센터:**

- ✅ `http://localhost:3000/api/auth/callback/kakao`
- ✅ `http://localhost:3001/api/auth/callback/kakao` (추가 필요)

**인스타그램 개발자 센터:**

- ✅ `http://localhost:3000/api/auth/callback/instagram`
- ✅ `http://localhost:3001/api/auth/callback/instagram` (추가 필요)

### 3. 서버 재시작

```bash
# 현재 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev -- -p 3001
```

## 🔄 OAuth 흐름 확인

### 수정 전 (문제 상황)

```
1. 사용자가 네이버 로그인 클릭
2. NextAuth가 네이버로 리다이렉트
   - redirect_uri=http://localhost:3000/api/auth/callback/naver (NEXTAUTH_URL 기반)
3. 네이버에서 인증 후 3000 포트로 콜백
4. 하지만 앱은 3001 포트에서 실행 중
5. 에러 발생 ❌
```

### 수정 후 (정상 동작)

```
1. 사용자가 네이버 로그인 클릭
2. NextAuth가 네이버로 리다이렉트
   - redirect_uri=http://localhost:3001/api/auth/callback/naver (수정된 NEXTAUTH_URL 기반)
3. 네이버에서 인증 후 3001 포트로 콜백
4. 앱이 3001 포트에서 실행 중이므로 정상 처리
5. 로그인 성공 ✅
```

## 📋 테스트 체크리스트

### 환경 변수 확인

- [x] `.env.local`에서 `NEXTAUTH_URL=http://localhost:3001`
- [x] `.env.local`에서 `NEXT_PUBLIC_URL=http://localhost:3001`

### 개발자 센터 확인

- [x] 네이버: `http://localhost:3001/api/auth/callback/naver` 등록됨
- [ ] 카카오: `http://localhost:3001/api/auth/callback/kakao` 등록 필요
- [ ] 인스타그램: `http://localhost:3001/api/auth/callback/instagram` 등록 필요

### 기능 테스트

- [ ] 네이버 로그인 테스트
- [ ] 카카오 로그인 테스트 (콜백 URL 추가 후)
- [ ] 인스타그램 로그인 테스트 (콜백 URL 추가 후)

## 🛠️ 디버깅 방법

### 1. 콜백 URL 확인

브라우저 개발자 도구 → 네트워크 탭에서 OAuth 리다이렉트 URL 확인:

```
https://nid.naver.com/oauth2.0/authorize?
  client_id=ieTN3X_Q2OA28067ZHHW&
  redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2Fcallback%2Fnaver&
  response_type=code&
  state=...
```

`redirect_uri`가 `localhost:3001`을 가리키는지 확인

### 2. 환경 변수 로그

`auth.ts`에 임시 로그 추가:

```typescript
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("Current URL:", process.env.NEXT_PUBLIC_URL);
```

### 3. NextAuth 디버그 모드

`.env.local`에 디버그 모드 추가:

```env
NEXTAUTH_DEBUG=true
```

## 📝 추가 설정 필요

### 카카오 개발자 센터

1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. 앱 선택 → 카카오 로그인 → Redirect URI
3. `http://localhost:3001/api/auth/callback/kakao` 추가

### 인스타그램 개발자 센터

1. [Meta for Developers](https://developers.facebook.com/) 접속
2. 앱 선택 → Instagram Basic Display → Basic Display
3. Valid OAuth Redirect URIs에 `http://localhost:3001/api/auth/callback/instagram` 추가

## 🚀 프로덕션 배포 시

프로덕션 환경에서는 실제 도메인 사용:

```env
# 프로덕션 .env
NEXTAUTH_URL=https://letter-community.vercel.app
NEXT_PUBLIC_URL=https://letter-community.vercel.app
```

각 개발자 센터에 프로덕션 콜백 URL도 등록:

- `https://letter-community.vercel.app/api/auth/callback/naver`
- `https://letter-community.vercel.app/api/auth/callback/kakao`
- `https://letter-community.vercel.app/api/auth/callback/instagram`

## 💡 향후 개선 방안

### 1. 포트 자동 감지

개발 환경에서 포트를 자동으로 감지하도록 설정:

```javascript
// next.config.ts
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NODE_ENV === "development" ? `http://localhost:${process.env.PORT || 3000}` : process.env.NEXTAUTH_URL,
  },
};
```

### 2. 개발 스크립트 개선

`package.json`에 포트별 스크립트 추가:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:3000": "NEXTAUTH_URL=http://localhost:3000 next dev -p 3000",
    "dev:3001": "NEXTAUTH_URL=http://localhost:3001 next dev -p 3001"
  }
}
```

### 3. 환경 변수 검증

앱 시작 시 환경 변수 일치 여부 확인:

```typescript
// lib/env-validator.ts
export function validateEnv() {
  const port = process.env.PORT || "3000";
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  if (nextAuthUrl && !nextAuthUrl.includes(`:${port}`)) {
    console.warn(`⚠️ Port mismatch: NEXTAUTH_URL uses different port than current (${port})`);
  }
}
```

## ✅ 해결 완료

1. ✅ 문제 원인 파악: `NEXTAUTH_URL` 환경 변수 포트 불일치
2. ✅ 환경 변수 수정: 3001 포트로 변경
3. ✅ 가이드 문서 작성: `docs/OAUTH_PORT_SETUP.md`
4. ⏳ 추가 OAuth 제공자 콜백 URL 등록 필요 (카카오, 인스타그램)
5. ⏳ 기능 테스트 필요

이제 서버를 재시작하고 네이버 로그인을 테스트해보세요!
