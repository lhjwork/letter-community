# Letter Community

편지로 마음을 전하는 특별한 공간

## 🎯 프로젝트 소개

Letter Community는 웹에서 편지를 작성하고, 링크로 공유하며, 원한다면 실물 편지로도 받을 수 있는 서비스입니다.

### 주요 기능

- 📝 웹 편지 작성 (Tiptap 에디터)
- 🔗 링크 공유 (OG 이미지 자동 생성)
- ✉️ 실물 편지 신청 (우편 배송)
- 🔐 소셜 로그인 (네이버, 카카오, 인스타그램)

---

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd letter-community
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local 파일을 열어서 실제 값으로 수정
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

### 5. 브라우저에서 확인

```
http://localhost:3000
```

---

## 📚 문서

모든 문서는 [`docs/`](docs/) 폴더에 정리되어 있습니다.

### 빠른 링크

- 📖 [전체 문서 인덱스](docs/README.md)
- 🚀 [MVP 구현 가이드](docs/development/MVP_IMPLEMENTATION.md)
- 🌐 [Vercel 배포 가이드](docs/deployment/VERCEL_DEPLOYMENT.md)
- ⚡ [빠른 문제 해결](docs/deployment/QUICK_FIX_CHECKLIST.md)
- 🤖 [AI 자동 분류 가이드](AI_CATEGORY_IMPLEMENTATION_GUIDE.md)

### 카테고리별 문서

- **배포**: Vercel 배포, 환경 변수, 디버깅
- **개발**: MVP 구현, OG 이미지, API 스펙
- **가이드**: 디자인 시스템, 반응형, OAuth

---

## 🛠 기술 스택

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Editor**: Tiptap
- **Auth**: NextAuth.js 5

### Backend

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB
- **ODM**: Mongoose

### Deployment

- **Frontend**: Vercel
- **Backend**: Render
- **Domain**: Vercel Domains

---

## 📁 프로젝트 구조

```
letter-community/
├── app/                      # Next.js App Router
│   ├── (afterLogin)/        # 로그인 후 페이지
│   │   └── write/           # 편지 작성
│   ├── (beforeLogin)/       # 로그인 전 페이지
│   ├── letter/              # 편지 상세
│   │   └── [letterId]/
│   └── api/                 # API Routes
│       ├── auth/            # NextAuth
│       └── og/              # OG 이미지 생성
├── components/              # React 컴포넌트
│   ├── editor/              # Tiptap 에디터
│   ├── shareds/             # 공통 컴포넌트
│   └── ui/                  # UI 컴포넌트
├── lib/                     # 유틸리티
│   └── api.ts               # API 함수
├── docs/                    # 📚 문서
│   ├── deployment/          # 배포 관련
│   ├── development/         # 개발 관련
│   └── guides/              # 가이드
├── public/                  # 정적 파일
├── .env.local               # 환경 변수 (로컬)
└── .env.example             # 환경 변수 예시
```

---

## 🔑 환경 변수

### 필수 환경 변수

```bash
# Auth
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Backend
BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

# OAuth
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
```

자세한 설정 방법은 [Vercel 배포 가이드](docs/deployment/VERCEL_DEPLOYMENT.md)를 참고하세요.

---

## 🎨 주요 기능

### 1. 편지 작성

- Tiptap 에디터로 풍부한 텍스트 편집
- 편지지 스타일 디자인
- 자동 미리보기 텍스트 생성

### 2. 링크 공유

- OG 이미지 자동 생성 (고정 포맷)
- 카카오톡, 페이스북 등에서 미리보기 지원
- 제목 + 미리보기 텍스트 표시

### 3. 실물 편지 신청

- 주소 입력 폼
- 관리자 수기 작성
- 우편 배송 (1-2주 소요)

### 4. 소셜 로그인

- 네이버 로그인
- 카카오 로그인
- 인스타그램 로그인

---

## 🧪 테스트

### 개발 환경 테스트

```bash
# 개발 서버 실행
pnpm dev

# 브라우저에서 테스트
# - http://localhost:3000 (홈)
# - http://localhost:3000/write (편지 작성)
# - http://localhost:3000/letter/[id] (편지 상세)
```

### 배포 환경 테스트

1. Vercel에 배포
2. OAuth 로그인 테스트
3. 편지 작성 및 공유 테스트
4. OG 이미지 미리보기 확인

---

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

자세한 배포 가이드는 [Vercel 배포 가이드](docs/deployment/VERCEL_DEPLOYMENT.md)를 참고하세요.

---

## 🤝 기여하기

### 버그 리포트

1. [GitHub Issues](링크)에서 검색
2. 없으면 새 Issue 생성
3. 재현 방법, 스크린샷 첨부

### 기능 제안

1. [GitHub Discussions](링크)에서 논의
2. 승인되면 Issue 생성
3. Pull Request 제출

### 코드 기여

1. Fork 후 브랜치 생성
2. 코드 작성 및 테스트
3. Pull Request 제출
4. 리뷰 후 병합

---

## 📞 문의

- **이메일**: your-email@example.com
- **GitHub Issues**: [링크]
- **Discord**: [링크]

---

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org) - React 프레임워크
- [Tailwind CSS](https://tailwindcss.com) - CSS 프레임워크
- [Tiptap](https://tiptap.dev) - 에디터
- [NextAuth.js](https://next-auth.js.org) - 인증
- [Vercel](https://vercel.com) - 호스팅

---

**Made with ❤️ by Letter Community Team**
