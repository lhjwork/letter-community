# Letter Community 문서

Letter 서비스의 모든 문서를 한곳에서 확인하세요.

## 📚 문서 구조

```
docs/
├── README.md                    # 이 파일 (문서 인덱스)
├── deployment/                  # 배포 관련 문서
│   ├── VERCEL_DEPLOYMENT.md    # Vercel 배포 전체 가이드
│   ├── VERCEL_ENV_FIX.md       # 환경 변수 문제 해결
│   ├── DEBUG_VERCEL.md         # Vercel 디버깅 가이드
│   └── QUICK_FIX_CHECKLIST.md  # 빠른 문제 해결 체크리스트
├── development/                 # 개발 관련 문서
│   ├── backend/                # 백엔드 개발 문서
│   │   ├── BACKEND_API_SPEC.md # 백엔드 API 명세서
│   │   ├── BACKEND_QUICK_PROMPT.md # 백엔드 빠른 개발 프롬프트
│   │   ├── BACKEND_STORIES_API_PROMPT.md # 사연 목록 API 프롬프트
│   │   └── BACKEND_CATEGORY_CHANGE_PROMPT.md # 카테고리 분류 로직 변경 가이드
│   ├── MVP_IMPLEMENTATION.md   # MVP 구현 가이드
│   ├── OG_IMAGE_GUIDE.md       # OG 이미지 시스템 가이드
│   ├── PAGES_GUIDE.md          # 페이지 구조 가이드
│   └── STORIES_PAGE_GUIDE.md   # 사연 목록 페이지 가이드
└── guides/                      # 디자인 & 협업 가이드
    ├── ai/                     # AI 개발 프롬프트
    │   ├── AI_BACKEND_PROMPT.md # AI 백엔드 개발 프롬프트
    │   ├── AI_CATEGORY_BACKEND_PROMPT.md # AI 백엔드 카테고리 분류 프롬프트
    │   ├── AI_CATEGORY_FRONTEND_PROMPT.md # AI 프론트엔드 카테고리 분류 프롬프트
    │   └── AI_CATEGORY_IMPLEMENTATION_GUIDE.md # AI 자동 분류 구현 가이드
    ├── DESIGN_SYSTEM.md        # 디자인 시스템
    ├── WORKFLOW.md             # 개발 워크플로우
    ├── RESPONSIVE_GUIDE.md     # 반응형 디자인 가이드
    └── OAUTH_GUIDE.md          # OAuth 설정 가이드
```

---

## 🚀 빠른 시작

### 처음 시작하는 경우

1. [개발 환경 설정](#개발-환경-설정)
2. [MVP 구현 가이드](development/MVP_IMPLEMENTATION.md)
3. [Vercel 배포](deployment/VERCEL_DEPLOYMENT.md)

### 문제 해결이 필요한 경우

1. [빠른 문제 해결 체크리스트](deployment/QUICK_FIX_CHECKLIST.md)
2. [Vercel 디버깅 가이드](deployment/DEBUG_VERCEL.md)
3. [환경 변수 문제 해결](deployment/VERCEL_ENV_FIX.md)

---

## 📖 카테고리별 문서

### 1️⃣ 배포 (Deployment)

#### [Vercel 배포 가이드](deployment/VERCEL_DEPLOYMENT.md)

- Vercel 환경 변수 설정
- OAuth 제공자 설정 (네이버, 카카오, 인스타그램)
- 배포 체크리스트
- 일반적인 문제 해결

**언제 읽어야 하나요?**

- 처음 Vercel에 배포할 때
- OAuth 로그인이 안 될 때
- 환경 변수 설정이 필요할 때

---

#### [환경 변수 문제 해결](deployment/VERCEL_ENV_FIX.md)

- `NEXT_PUBLIC_BACKEND_URL` 설정
- 클라이언트 vs 서버 환경 변수
- localhost 요청 문제 해결

**언제 읽어야 하나요?**

- API 요청이 localhost로 가는 경우
- 환경 변수가 적용되지 않을 때

---

#### [Vercel 디버깅 가이드](deployment/DEBUG_VERCEL.md)

- 빌드 로그 확인
- 런타임 환경 변수 확인
- 강제 재빌드 방법

**언제 읽어야 하나요?**

- 배포 후에도 문제가 해결되지 않을 때
- 환경 변수가 제대로 적용되었는지 확인할 때

---

#### [빠른 문제 해결 체크리스트](deployment/QUICK_FIX_CHECKLIST.md)

- 5-10분 안에 해결하는 체크리스트
- 네이버 OAuth 설정
- Vercel 환경 변수 설정
- 단계별 확인 사항

**언제 읽어야 하나요?**

- 급하게 문제를 해결해야 할 때
- 체계적으로 문제를 진단하고 싶을 때

---

### 2️⃣ 개발 (Development)

#### 백엔드 개발 문서

##### [백엔드 API 명세서](development/backend/BACKEND_API_SPEC.md)

- 필요한 API 엔드포인트 정의
- 요청/응답 스펙
- 인증 방식

**언제 읽어야 하나요?**

- 백엔드 API를 구현할 때
- 프론트엔드에서 API를 연동할 때

---

##### [백엔드 빠른 개발 프롬프트](development/backend/BACKEND_QUICK_PROMPT.md)

- 공개 사연 목록 조회 API 구현 가이드
- 빠른 개발을 위한 프롬프트

**언제 읽어야 하나요?**

- 백엔드 개발자가 빠르게 API를 구현해야 할 때

---

##### [사연 목록 API 프롬프트](development/backend/BACKEND_STORIES_API_PROMPT.md)

- 사연 목록 조회 API 상세 구현 가이드
- 페이지네이션, 검색, 정렬 기능 포함

**언제 읽어야 하나요?**

- 사연 목록 API를 구현할 때
- 검색 및 필터 기능을 추가할 때

---

##### [카테고리 분류 로직 변경 가이드](development/backend/BACKEND_CATEGORY_CHANGE_PROMPT.md)

- AI API에서 프론트엔드 키워드 기반 분류로 변경
- 비용 최적화를 위한 로직 변경

**언제 읽어야 하나요?**

- 카테고리 분류 로직을 변경할 때
- 비용 최적화가 필요할 때

---

#### 프론트엔드 개발 문서

#### [MVP 구현 가이드](development/MVP_IMPLEMENTATION.md)

- 전체 기능 개요
- 백엔드 API 스펙
- 데이터 모델
- 사용자 플로우
- 테스트 시나리오

**언제 읽어야 하나요?**

- 프로젝트 전체 구조를 이해하고 싶을 때
- 백엔드 API를 구현할 때
- 새로운 기능을 추가할 때

---

#### [OG 이미지 시스템 가이드](development/OG_IMAGE_GUIDE.md)

- OG 이미지 생성 원리
- 고정 포맷 디자인
- API 사용법
- 메타태그 설정

**언제 읽어야 하나요?**

- OG 이미지 시스템을 이해하고 싶을 때
- 카카오톡/페이스북 공유 기능을 테스트할 때

---

#### [페이지 구조 가이드](development/PAGES_GUIDE.md)

- 통합 작성 페이지 (`/write`)
- 사연 vs 편지 타입 구분
- Select 컴포넌트 사용법
- API 함수 사용법

**언제 읽어야 하나요?**

- 편지/사연 작성 기능을 이해하고 싶을 때
- 새로운 작성 타입을 추가할 때

---

#### [사연 목록 페이지 가이드](development/STORIES_PAGE_GUIDE.md)

- Masonry 레이아웃 구현
- 검색 & 필터 기능
- API 연동 방법
- 반응형 디자인

**언제 읽어야 하나요?**

- 사연 목록 페이지를 이해하고 싶을 때
- 백엔드 API를 연동할 때
- Masonry 레이아웃을 수정할 때

---

### 3️⃣ 가이드 (Guides)

#### AI 개발 프롬프트

##### [AI 백엔드 개발 프롬프트](guides/ai/AI_BACKEND_PROMPT.md)

- Express.js + MongoDB 백엔드 API 구현 가이드
- 프로젝트 구조 및 기본 설정

**언제 읽어야 하나요?**

- AI를 활용해 백엔드를 빠르게 구현할 때

---

##### [AI 백엔드 카테고리 분류 프롬프트](guides/ai/AI_CATEGORY_BACKEND_PROMPT.md)

- Node.js + Express + MongoDB에 AI 자동 분류 기능 추가
- 백엔드 AI 분류 로직 구현

**언제 읽어야 하나요?**

- 백엔드에 AI 카테고리 분류 기능을 추가할 때

---

##### [AI 프론트엔드 카테고리 분류 프롬프트](guides/ai/AI_CATEGORY_FRONTEND_PROMPT.md)

- Next.js + Vercel AI SDK + Google Gemini 구현
- 프론트엔드 AI 분류 기능

**언제 읽어야 하나요?**

- 프론트엔드에 AI 카테고리 분류 기능을 추가할 때

---

##### [AI 자동 분류 구현 가이드](guides/ai/AI_CATEGORY_IMPLEMENTATION_GUIDE.md)

- Vercel AI SDK + Google Gemini 전체 구현 가이드
- 백엔드와 프론트엔드 통합 구현

**언제 읽어야 하나요?**

- AI 자동 분류 기능을 처음부터 구현할 때
- 전체적인 구현 흐름을 이해하고 싶을 때

---

#### 디자인 & 협업 가이드

#### [디자인 시스템](guides/DESIGN_SYSTEM.md)

- 색상 팔레트
- 타이포그래피
- 간격 시스템
- 컴포넌트 스타일

**언제 읽어야 하나요?**

- 새로운 UI 컴포넌트를 만들 때
- 디자인 일관성을 유지하고 싶을 때

---

#### [개발 워크플로우](guides/WORKFLOW.md)

- Git 브랜치 전략
- 코드 리뷰 프로세스
- 배포 프로세스

**언제 읽어야 하나요?**

- 팀 협업 규칙을 정할 때
- 개발 프로세스를 개선하고 싶을 때

---

#### [반응형 디자인 가이드](guides/RESPONSIVE_GUIDE.md)

- 브레이크포인트 정의
- Mobile First vs Desktop First
- Tailwind CSS 반응형 클래스
- 실전 예제

**언제 읽어야 하나요?**

- 반응형 UI를 구현할 때
- PC 디자인만 있고 모바일 디자인이 없을 때

---

#### [OAuth 설정 가이드](guides/OAUTH_GUIDE.md)

- 네이버 로그인 설정
- 카카오 로그인 설정
- 인스타그램 로그인 설정
- NextAuth 설정

**언제 읽어야 하나요?**

- OAuth 로그인을 처음 설정할 때
- 새로운 OAuth 제공자를 추가할 때

---

## 🛠 개발 환경 설정

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

## 🔑 필수 환경 변수

### 로컬 개발 (.env.local)

```bash
# Auth
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Backend
BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

# OAuth (실제 값으로 교체)
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

### Vercel 배포

```bash
# Auth
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app

# Backend
BACKEND_URL=https://your-backend.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com

# OAuth (실제 값으로 교체)
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

---

## 📝 주요 기능

### ✅ 구현 완료

- [x] 네이버/카카오/인스타그램 OAuth 로그인
- [x] 통합 작성 페이지 (사연/편지)
- [x] Tiptap 에디터
- [x] 편지 상세 페이지
- [x] OG 이미지 자동 생성 (고정 포맷)
- [x] 실물 편지 신청 폼
- [x] 사연 목록 페이지 (Masonry 레이아웃)
- [x] 반응형 디자인

### 🚧 개발 예정

- [ ] 사연 목록 백엔드 API 연동
- [ ] 검색 & 필터 기능 연동
- [ ] 무한 스크롤
- [ ] 캐러셀 구현
- [ ] 관리자 대시보드
- [ ] 편지 검수 기능
- [ ] 이메일 전송
- [ ] 배송 추적

---

## 🤝 기여하기

### 문서 개선

문서에 오타나 개선할 점이 있다면:

1. 해당 문서 파일 수정
2. Pull Request 생성
3. 리뷰 후 병합

### 새 문서 추가

1. 적절한 카테고리 폴더에 `.md` 파일 생성
2. 이 README.md에 링크 추가
3. Pull Request 생성

---

## 📞 도움이 필요하신가요?

### 문서에서 답을 찾을 수 없다면:

1. [GitHub Issues](링크) 에서 검색
2. 새로운 Issue 생성
3. 팀 채널에 문의

### 긴급한 문제:

1. [빠른 문제 해결 체크리스트](deployment/QUICK_FIX_CHECKLIST.md) 확인
2. [Vercel 디버깅 가이드](deployment/DEBUG_VERCEL.md) 참고

---

## 📚 외부 참고 자료

### Next.js

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Next.js 환경 변수](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

### NextAuth

- [NextAuth.js 공식 문서](https://next-auth.js.org)
- [NextAuth 배포 가이드](https://next-auth.js.org/deployment)

### Vercel

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel 환경 변수](https://vercel.com/docs/environment-variables)

### OAuth 제공자

- [네이버 로그인 API](https://developers.naver.com/docs/login/api/)
- [카카오 로그인 API](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Meta for Developers](https://developers.facebook.com)

---

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](../LICENSE) 하에 배포됩니다.

---

**마지막 업데이트:** 2024년 12월 18일
