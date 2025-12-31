# OAuth 포트 설정 가이드

## 🔍 문제 상황

개발자 센터에 3001 포트를 추가했는데도 OAuth 콜백이 3000 포트로만 전달되는 문제

## 🎯 원인

Next.js의 NextAuth는 `NEXTAUTH_URL` 환경 변수를 사용하여 OAuth 콜백 URL을 결정합니다.

## ✅ 해결 방법

### 1. 환경 변수 수정

`.env.local` 파일에서 포트를 변경:

```env
# 3001 포트 사용 시
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_URL=http://localhost:3001

# 3000 포트 사용 시
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_URL=http://localhost:3000
```

### 2. 개발자 센터 설정 확인

각 OAuth 제공자의 개발자 센터에서 콜백 URL이 올바르게 설정되어 있는지 확인:

#### 네이버 개발자 센터

**Callback URL 설정:**

```
http://localhost:3000/api/auth/callback/naver
http://localhost:3001/api/auth/callback/naver
```

#### 카카오 개발자 센터

**Redirect URI 설정:**

```
http://localhost:3000/api/auth/callback/kakao
http://localhost:3001/api/auth/callback/kakao
```

#### 인스타그램 개발자 센터

**Valid OAuth Redirect URIs:**

```
http://localhost:3000/api/auth/callback/instagram
http://localhost:3001/api/auth/callback/instagram
```

### 3. 서버 재시작

환경 변수 변경 후 개발 서버를 재시작:

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

## 🔄 포트 변경 프로세스

### 3000 → 3001 포트로 변경

1. **환경 변수 수정**

   ```env
   # .env.local
   NEXTAUTH_URL=http://localhost:3001
   NEXT_PUBLIC_URL=http://localhost:3001
   ```

2. **개발자 센터 확인**

   - 네이버: `http://localhost:3001/api/auth/callback/naver` 추가 확인
   - 카카오: `http://localhost:3001/api/auth/callback/kakao` 추가 확인
   - 인스타그램: `http://localhost:3001/api/auth/callback/instagram` 추가 확인

3. **서버 재시작**
   ```bash
   npm run dev -- -p 3001
   ```

### 3001 → 3000 포트로 변경

1. **환경 변수 수정**

   ```env
   # .env.local
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

2. **서버 재시작**
   ```bash
   npm run dev
   ```

## 🛠️ 자동화 스크립트

포트 변경을 자동화하려면 `package.json`에 스크립트 추가:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:3001": "next dev -p 3001",
    "dev:3000": "next dev -p 3000"
  }
}
```

## 🔍 디버깅

### OAuth 콜백 URL 확인

브라우저 개발자 도구에서 네트워크 탭을 열고 OAuth 로그인 시도:

1. OAuth 제공자로 리다이렉트되는 URL 확인
2. `redirect_uri` 파라미터가 올바른 포트를 가리키는지 확인

**예시:**

```
https://nid.naver.com/oauth2.0/authorize?
  client_id=...&
  redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2Fcallback%2Fnaver&
  ...
```

### 환경 변수 확인

개발 서버 콘솔에서 환경 변수 확인:

```javascript
// auth.ts 또는 다른 파일에서
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NEXT_PUBLIC_URL:", process.env.NEXT_PUBLIC_URL);
```

## ⚠️ 주의사항

### 1. 환경 변수 우선순위

Next.js 환경 변수 우선순위:

1. `.env.local` (최우선)
2. `.env.development`
3. `.env`

### 2. 캐시 문제

환경 변수 변경이 적용되지 않으면:

```bash
# Next.js 캐시 삭제
rm -rf .next
npm run dev
```

### 3. 브라우저 캐시

OAuth 로그인 문제가 지속되면 브라우저 캐시 삭제:

- Chrome: 개발자 도구 → Application → Storage → Clear storage
- 또는 시크릿 모드에서 테스트

## 📋 체크리스트

포트 변경 시 확인할 사항:

- [ ] `.env.local`에서 `NEXTAUTH_URL` 변경
- [ ] `.env.local`에서 `NEXT_PUBLIC_URL` 변경
- [ ] 네이버 개발자 센터에 콜백 URL 등록 확인
- [ ] 카카오 개발자 센터에 리다이렉트 URI 등록 확인
- [ ] 인스타그램 개발자 센터에 리다이렉트 URI 등록 확인
- [ ] 개발 서버 재시작
- [ ] OAuth 로그인 테스트
- [ ] 브라우저 개발자 도구에서 콜백 URL 확인

## 🚀 프로덕션 환경

프로덕션 환경에서는 실제 도메인 사용:

```env
# 프로덕션 환경
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_URL=https://your-domain.com
```

개발자 센터에도 프로덕션 콜백 URL 등록:

```
https://your-domain.com/api/auth/callback/naver
https://your-domain.com/api/auth/callback/kakao
https://your-domain.com/api/auth/callback/instagram
```

## 💡 팁

### 다중 포트 개발

여러 포트에서 동시 개발 시:

1. **포트별 환경 파일 생성**

   ```
   .env.local.3000
   .env.local.3001
   ```

2. **스크립트로 환경 파일 복사**

   ```bash
   # 3000 포트용
   cp .env.local.3000 .env.local && npm run dev

   # 3001 포트용
   cp .env.local.3001 .env.local && npm run dev -- -p 3001
   ```

### 환경 변수 검증

개발 시작 시 환경 변수 자동 검증:

```javascript
// lib/env-check.js
function checkEnv() {
  const port = process.env.PORT || "3000";
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  if (nextAuthUrl && !nextAuthUrl.includes(port)) {
    console.warn(`⚠️  NEXTAUTH_URL (${nextAuthUrl}) 포트가 현재 포트 (${port})와 다릅니다.`);
  }
}

checkEnv();
```
