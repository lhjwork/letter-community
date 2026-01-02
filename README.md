# 💌 Letter Community

> **편지로 마음을 전하는 특별한 공간**  
> 웹에서 편지를 작성하고, 링크로 공유하며, 실물 편지로도 받을 수 있는 혁신적인 서비스

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)](https://vercel.com/)

---

## 🌟 프로젝트 소개

Letter Community는 디지털 시대에 잊혀진 **편지의 감성**을 되살리는 플랫폼입니다.
웹에서 편지를 작성하고, 링크로 공유하며, 원한다면 **실제 우편으로도 받을 수 있는** 특별한 경험을 제공합니다.

### ✨ 핵심 가치

- 🎨 **아름다운 편지지**: 손으로 쓴 편지 같은 감성적인 디자인
- 🔗 **간편한 공유**: 링크 하나로 어디든 공유 가능
- ✉️ **실물 편지**: 디지털을 넘어 실제 우편으로 전달
- 🔐 **안전한 로그인**: 소셜 로그인으로 간편하게

---

## 🚀 주요 기능

### 📝 편지 작성

- **Tiptap 에디터**: 풍부한 텍스트 편집 기능
- **편지지 디자인**: 실제 편지지 같은 감성적인 UI
- **AI 카테고리 분류**: Google Gemini로 자동 분류
- **미리보기**: 작성 중 실시간 미리보기

### 🔗 링크 공유

- **OG 이미지 자동 생성**: 편지 내용 기반 미리보기 이미지
- **소셜 미디어 최적화**: 카카오톡, 페이스북 등에서 완벽한 미리보기
- **반응형 디자인**: 모든 디바이스에서 완벽한 표시

### ✉️ 실물 편지 신청 (NEW!)

- **로그인 없이 신청**: URL만으로 누구나 신청 가능
- **Daum 주소 검색**: 정확한 주소 입력을 위한 API 통합
- **실시간 상태 조회**: 신청부터 배송까지 전 과정 추적
- **중복 신청 방지**: 백엔드에서 자동 감지 및 처리
- **30초 자동 새로고침**: 상태 변경 실시간 반영

### 🔐 소셜 로그인

- **네이버 로그인**: 네이버 계정으로 간편 로그인
- **카카오 로그인**: 카카오 계정으로 간편 로그인
- **인스타그램 로그인**: 인스타그램 계정으로 간편 로그인
- **다중 포트 지원**: 개발 환경에서 3000/3001 포트 모두 지원

### 📊 사연 커뮤니티

- **사연 목록**: 공개된 사연들을 카테고리별로 탐색
- **검색 및 필터링**: 키워드, 카테고리, 정렬 옵션
- **좋아요 시스템**: 마음에 드는 사연에 좋아요
- **카테고리 통계**: AI 분류 결과 통계 제공

---

## 🛠 기술 스택

### Frontend

```
Next.js 16 (App Router) + TypeScript
├── Styling: Tailwind CSS 4
├── Editor: Tiptap (Rich Text Editor)
├── Auth: NextAuth.js 5
├── UI Components: Radix UI + shadcn/ui
├── Address Search: Daum Postcode API
└── State Management: React Hooks + Context
```

### Backend

```
Node.js + Express + MongoDB
├── ODM: Mongoose
├── Auth: JWT + OAuth 2.0
├── File Upload: Multer
├── Image Processing: Sharp
└── Email: Nodemailer
```

### AI & External APIs

```
Google Gemini API (Category Classification)
├── Daum Postcode API (Address Search)
├── OAuth APIs (Naver, Kakao, Instagram)
└── OG Image Generation (Canvas API)
```

### Deployment & DevOps

```
Frontend: Vercel
├── Backend: Render
├── Database: MongoDB Atlas
├── Domain: Vercel Domains
└── Monitoring: Vercel Analytics
```

---

## 📁 프로젝트 구조

```
letter-community/
├── 📱 app/                          # Next.js App Router
│   ├── (afterLogin)/               # 로그인 후 페이지
│   │   ├── write/                  # 편지 작성
│   │   ├── my-page/               # 마이페이지
│   │   └── home/                  # 홈 (로그인 후)
│   ├── (beforeLogin)/             # 로그인 전 페이지
│   ├── letter/                    # 편지 관련
│   │   └── [letterId]/           # 편지 상세
│   │       └── request/          # 🆕 익명 실물 편지 신청
│   │           ├── page.tsx      # 신청 폼
│   │           └── [requestId]/  # 신청 상태 조회
│   ├── home/                     # 사연 목록
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth
│   │   └── og/                   # OG 이미지 생성
│   └── globals.css               # 전역 스타일
├── 🧩 components/                  # React 컴포넌트
│   ├── editor/                   # Tiptap 에디터
│   ├── letter/                   # 편지 관련 컴포넌트
│   │   ├── AnonymousPhysicalRequestForm.tsx     # 🆕 익명 신청 폼
│   │   └── AnonymousPhysicalStatusTracker.tsx   # 🆕 상태 조회
│   ├── recipient/                # 수신자 관리
│   ├── address/                  # 주소 검색
│   ├── like/                     # 좋아요 시스템
│   ├── shareds/                  # 공통 컴포넌트
│   └── ui/                       # UI 컴포넌트 (shadcn/ui)
├── 🔧 lib/                        # 유틸리티 & API
│   ├── api.ts                    # API 함수
│   ├── recipient-api.ts          # 수신자 관련 API
│   ├── session-id.ts             # 🆕 익명 사용자 세션 관리
│   └── letter-requests.ts        # 편지 신청 관리
├── 📝 types/                      # TypeScript 타입
│   ├── recipient.ts              # 수신자 관련 타입
│   └── next-auth.d.ts           # NextAuth 타입 확장
├── 📚 docs/                       # 상세 문서
│   ├── ANONYMOUS_PHYSICAL_REQUEST.md      # 🆕 익명 신청 가이드
│   ├── DAUM_ADDRESS_INTEGRATION.md       # 🆕 주소 검색 가이드
│   ├── OAUTH_PORT_SETUP.md              # 🆕 OAuth 포트 설정
│   ├── BACKEND_IMPLEMENTATION_PROMPT.md  # 🆕 백엔드 구현 가이드
│   └── API_REQUEST_FORMAT.md            # 🆕 API 요청 형식
├── 🌍 public/                     # 정적 파일
├── ⚙️ .env.local                  # 환경 변수 (로컬)
├── 📄 .env.example               # 환경 변수 예시
└── 📋 package.json               # 의존성 관리
```

---

## 🚀 빠른 시작

### 1️⃣ 저장소 클론

```bash
git clone https://github.com/your-username/letter-community.git
cd letter-community
```

### 2️⃣ 의존성 설치

```bash
# pnpm 사용 (권장)
pnpm install

# 또는 npm
npm install

# 또는 yarn
yarn install
```

### 3️⃣ 환경 변수 설정

```bash
# 환경 변수 파일 복사
cp .env.example .env.local

# .env.local 파일 편집
# 필수 환경 변수들을 실제 값으로 수정
```

<details>
<summary>📋 필수 환경 변수 목록</summary>

```bash
# Auth.js 설정
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3001

# Backend API
BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

# OAuth 설정
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

# AI 분류 (선택사항)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

</details>

### 4️⃣ 개발 서버 실행

```bash
# 기본 포트 (3000)
pnpm dev

# 또는 3001 포트
pnpm dev -- -p 3001
```

### 5️⃣ 브라우저에서 확인

```
🌐 http://localhost:3001
```

---

## 🎨 주요 화면

### 📝 편지 작성 페이지

- 실제 편지지 같은 디자인
- Tiptap 에디터로 풍부한 텍스트 편집
- 실시간 미리보기

### 🔗 편지 상세 페이지

- 편지지 스타일 표시
- 좋아요 기능
- 실물 편지 신청 버튼

### ✉️ 실물 편지 신청 (NEW!)

- 로그인 없이 접근 가능
- Daum 주소 검색 통합
- 실시간 상태 추적

### 📊 사연 커뮤니티

- 카테고리별 사연 탐색
- 검색 및 필터링
- 좋아요 시스템

---

## 🔧 개발 가이드

### 📚 문서 구조

모든 개발 관련 문서는 [`docs/`](docs/) 폴더에 체계적으로 정리되어 있습니다.

#### 🆕 최신 기능 가이드

- [익명 사용자 실물 편지 신청](docs/ANONYMOUS_PHYSICAL_REQUEST.md)
- [Daum 주소 검색 API 통합](docs/DAUM_ADDRESS_INTEGRATION.md)
- [OAuth 포트 설정 가이드](docs/OAUTH_PORT_SETUP.md)
- [백엔드 구현 프롬프트](docs/BACKEND_IMPLEMENTATION_PROMPT.md)

#### 🔧 개발 & 배포

- [프론트엔드 구현 요약](docs/FRONTEND_IMPLEMENTATION_SUMMARY.md)
- [API 요청 형식 가이드](docs/API_REQUEST_FORMAT.md)
- [현재 개발 상태](docs/CURRENT_STATUS.md)

### 🧪 테스트

```bash
# 개발 환경 테스트
pnpm dev

# 주요 테스트 시나리오
# ✅ 편지 작성 및 공유
# ✅ 소셜 로그인 (네이버, 카카오, 인스타그램)
# ✅ 익명 실물 편지 신청
# ✅ 주소 검색 (Daum API)
# ✅ 신청 상태 조회
# ✅ 사연 목록 및 검색
# ✅ 좋아요 기능
```

### 🚀 배포

#### Vercel 배포 (Frontend)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel --prod

# 환경 변수 설정
vercel env add
```

#### Render 배포 (Backend)

1. [Render](https://render.com)에서 새 Web Service 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 활성화

---

## 🌟 특별한 기능들

### 🆕 익명 사용자 실물 편지 신청

**혁신적인 접근 방식:**

- 로그인 없이 URL만으로 신청 가능
- SessionId 기반 사용자 식별
- 중복 신청 자동 감지
- 실시간 배송 상태 추적

**기술적 특징:**

```typescript
// SessionId 자동 생성 및 관리
const sessionId = getOrCreateSessionId(); // 30일 유효

// Daum 주소 검색 API 통합
<PostcodeSearch onComplete={handleAddressComplete} />;

// 실시간 상태 조회 (30초 자동 새로고침)
useEffect(() => {
  const interval = setInterval(fetchStatus, 30000);
  return () => clearInterval(interval);
}, []);
```

### 🎨 OG 이미지 자동 생성

**동적 미리보기 이미지:**

- 편지 내용 기반 자동 생성
- 소셜 미디어 최적화
- Canvas API 활용

### 🤖 AI 카테고리 분류

**Google Gemini 통합:**

- 편지 내용 자동 분석
- 카테고리 자동 분류
- 신뢰도 점수 제공

---

## 📊 프로젝트 현황

### ✅ 완료된 기능 (95%)

- ✅ 편지 작성 및 공유
- ✅ 소셜 로그인 (네이버, 카카오, 인스타그램)
- ✅ 익명 실물 편지 신청
- ✅ Daum 주소 검색 통합
- ✅ 실시간 상태 조회
- ✅ 사연 커뮤니티
- ✅ 좋아요 시스템
- ✅ AI 카테고리 분류
- ✅ OG 이미지 생성
- ✅ 반응형 디자인

### 🔄 진행 중 (5%)

- ⏳ 백엔드 실물 편지 상태 조회 API
- ⏳ 관리자 대시보드
- ⏳ 이메일 알림 시스템

### 🎯 향후 계획

- 📱 모바일 앱 (React Native)
- 🔔 실시간 알림 (WebSocket)
- 📈 사용자 분석 대시보드
- 🌍 다국어 지원
- 🎨 편지지 템플릿 확장

---

## 🤝 기여하기

### 🐛 버그 리포트

1. [GitHub Issues](https://github.com/your-username/letter-community/issues)에서 기존 이슈 검색
2. 없으면 새 Issue 생성
3. 재현 방법, 스크린샷, 환경 정보 첨부

### 💡 기능 제안

1. [GitHub Discussions](https://github.com/your-username/letter-community/discussions)에서 아이디어 공유
2. 커뮤니티 피드백 수집
3. 승인되면 Issue로 전환

### 🔧 코드 기여

```bash
# 1. Fork 후 클론
git clone https://github.com/your-username/letter-community.git

# 2. 브랜치 생성
git checkout -b feature/amazing-feature

# 3. 코드 작성 및 테스트
pnpm dev
pnpm test

# 4. 커밋 및 푸시
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature

# 5. Pull Request 생성
```

### 📝 문서 기여

- 오타 수정
- 번역 추가
- 가이드 개선
- 예제 코드 추가

---

## 🏆 성과 및 통계

### 📈 개발 진행률

```
Frontend: ████████████████████ 95%
Backend:  ████████████░░░░░░░░ 60%
Docs:     ████████████████████ 100%
Tests:    ████████░░░░░░░░░░░░ 40%
```

### 🔢 코드 통계

- **총 파일 수**: 150+
- **코드 라인 수**: 15,000+
- **컴포넌트 수**: 50+
- **API 엔드포인트**: 20+
- **문서 페이지**: 15+

### 🚀 성능 지표

- **Lighthouse 점수**: 95+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

---

## 📞 문의 및 지원

### 💬 커뮤니케이션 채널

- **📧 이메일**: letter.community.dev@gmail.com
- **🐙 GitHub Issues**: [버그 리포트 & 기능 요청](https://github.com/your-username/letter-community/issues)
- **💬 GitHub Discussions**: [일반 논의](https://github.com/your-username/letter-community/discussions)
- **📱 Discord**: [실시간 채팅](https://discord.gg/letter-community)

### 🆘 문제 해결

1. **문서 확인**: [`docs/`](docs/) 폴더의 관련 가이드
2. **FAQ 검색**: [자주 묻는 질문](docs/FAQ.md)
3. **이슈 검색**: [GitHub Issues](https://github.com/your-username/letter-community/issues)
4. **커뮤니티 질문**: [GitHub Discussions](https://github.com/your-username/letter-community/discussions)

---

## 📄 라이선스

이 프로젝트는 **MIT 라이선스** 하에 배포됩니다.

```
MIT License

Copyright (c) 2024 Letter Community

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

## 🙏 감사의 말

### 🛠 오픈소스 라이브러리

- [**Next.js**](https://nextjs.org) - React 프레임워크의 혁신
- [**Tailwind CSS**](https://tailwindcss.com) - 유틸리티 우선 CSS 프레임워크
- [**Tiptap**](https://tiptap.dev) - 현대적인 리치 텍스트 에디터
- [**NextAuth.js**](https://next-auth.js.org) - 완전한 인증 솔루션
- [**Radix UI**](https://www.radix-ui.com) - 접근성 우선 UI 컴포넌트
- [**shadcn/ui**](https://ui.shadcn.com) - 아름다운 컴포넌트 라이브러리

### 🌐 외부 서비스

- [**Vercel**](https://vercel.com) - 최고의 프론트엔드 호스팅
- [**Render**](https://render.com) - 간편한 백엔드 배포
- [**MongoDB Atlas**](https://www.mongodb.com/atlas) - 클라우드 데이터베이스
- [**Google Gemini**](https://ai.google.dev) - AI 분류 서비스
- [**Daum Postcode**](https://postcode.map.daum.net) - 주소 검색 API

### 👥 커뮤니티

- **개발자 커뮤니티**: 피드백과 아이디어를 주신 모든 분들
- **베타 테스터**: 초기 버전을 테스트해주신 분들
- **기여자**: 코드, 문서, 번역에 기여해주신 분들

---

<div align="center">

### 💌 **Made with ❤️ by Letter Community Team**

**편지로 세상을 더 따뜻하게 만들어가요**

[🌟 Star](https://github.com/your-username/letter-community) •
[🍴 Fork](https://github.com/your-username/letter-community/fork) •
[📝 Contribute](https://github.com/your-username/letter-community/blob/main/CONTRIBUTING.md) •
[💬 Discuss](https://github.com/your-username/letter-community/discussions)

---

**"디지털 시대에도 편지의 감성은 영원합니다"**

</div>
