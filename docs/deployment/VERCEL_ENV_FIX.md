# Vercel 환경 변수 수정 가이드

## 문제 상황

편지 작성 시 `http://localhost:5001/api/letters`로 요청이 가는 문제

## 원인

클라이언트 사이드에서 `BACKEND_URL` 환경 변수에 접근할 수 없음
→ Next.js에서 클라이언트가 접근하려면 `NEXT_PUBLIC_` 접두사 필요

## 해결 방법

### 1. Vercel 환경 변수 추가 (필수!)

Vercel 대시보드 → Settings → Environment Variables에서:

#### 기존 변수 확인

- ✅ `BACKEND_URL` = `https://letter-my-backend.onrender.com`

#### 새로 추가할 변수 (중요!)

```
Name: NEXT_PUBLIC_BACKEND_URL
Value: https://letter-my-backend.onrender.com
Environment: Production, Preview, Development (모두 체크)
```

**주의사항:**

- ❌ 끝에 `/` 붙이지 마세요: `https://letter-my-backend.onrender.com/` (X)
- ✅ 올바른 형식: `https://letter-my-backend.onrender.com` (O)

### 2. 재배포 (필수!)

환경 변수 추가 후:

1. Vercel 대시보드 → **Deployments** 탭
2. 최신 배포 클릭
3. **⋯ (점 3개)** → **Redeploy** 클릭
4. "Redeploy" 버튼 다시 클릭

### 3. 배포 완료 대기

- 배포 상태가 "Ready"가 될 때까지 1-2분 대기

### 4. 테스트

1. 사이트 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R로 캐시 삭제)
2. 편지 작성 시도
3. 개발자 도구(F12) → Network 탭에서 요청 URL 확인
   - ✅ `https://letter-my-backend.onrender.com/api/letters` (성공!)
   - ❌ `http://localhost:5001/api/letters` (실패)

## 전체 환경 변수 체크리스트

Vercel에 다음 환경 변수들이 모두 설정되어 있어야 합니다:

```bash
# Auth 관련
AUTH_SECRET=letter-community-jin-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-project.vercel.app

# OAuth 제공자
NAVER_CLIENT_ID=ieTN3X_Q2OA28067ZHHW
NAVER_CLIENT_SECRET=TdAbFUrSEA
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
INSTAGRAM_CLIENT_ID=1163605409316642
INSTAGRAM_CLIENT_SECRET=cbf4ed5325bd52f84cde0663ce21890d

# Backend API (중요!)
BACKEND_URL=https://letter-my-backend.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://letter-my-backend.onrender.com  ← 이것 추가!
```

## 왜 NEXT*PUBLIC* 접두사가 필요한가?

### Next.js 환경 변수 규칙:

1. **서버 사이드만**: `process.env.BACKEND_URL`

   - API Routes, getServerSideProps, getStaticProps에서만 접근 가능
   - 브라우저에서는 `undefined`

2. **클라이언트 + 서버**: `process.env.NEXT_PUBLIC_BACKEND_URL`
   - 브라우저(클라이언트)에서도 접근 가능
   - 빌드 시 코드에 직접 삽입됨

### 우리 코드에서:

```typescript
// lib/api.ts - 클라이언트에서 fetch 호출
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
```

이 코드는 브라우저에서 실행되므로 `NEXT_PUBLIC_` 접두사가 필요합니다!

## 로컬 개발 환경도 업데이트

`.env.local` 파일에도 추가하세요:

```bash
# 기존
BACKEND_URL=http://localhost:5001

# 추가
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

## 문제 해결 확인

### 성공 시:

- 편지 작성 후 "편지가 성공적으로 등록되었습니다! 💌" 메시지
- Network 탭에서 `https://letter-my-backend.onrender.com/api/letters` 요청 확인
- 응답 상태 코드 201 Created

### 여전히 실패 시:

1. Vercel 환경 변수에 `NEXT_PUBLIC_BACKEND_URL` 추가했는지 확인
2. 재배포 했는지 확인
3. 브라우저 캐시 삭제 (Ctrl+Shift+R)
4. 시크릿 모드로 테스트

## 추가 참고

- [Next.js 환경 변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel 환경 변수 가이드](https://vercel.com/docs/environment-variables)
