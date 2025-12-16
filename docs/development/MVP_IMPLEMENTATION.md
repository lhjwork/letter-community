# MVP 구현 완료 - Letter 서비스

## 구현된 기능

### 1. 편지 작성 (`/write`)

- Tiptap 에디터로 편지 작성
- 제목, 본문, 작성자 입력
- 자동 `ogPreviewText` 생성 (본문 앞 60자)
- 작성 완료 후 편지 상세 페이지로 이동

### 2. 편지 상세 페이지 (`/letter/[letterId]`)

- 편지 전문 표시
- 편지지 스타일 디자인 (바인더 구멍, 빨간 선)
- 실물 편지 신청 CTA
- 주소 입력 폼

### 3. OG 이미지 (고정 포맷)

- `/api/og?letterId=xxx` - 고정 템플릿 OG 이미지 생성
- Letter 브랜드 컬러 배경
- 중앙 봉투 일러스트 (💌)
- ogTitle + ogPreviewText 표시
- 사용자 커스터마이징 불가 (MVP)

### 4. 실물 편지 신청

- 주소 입력 폼 (이름, 연락처, 우편번호, 주소)
- `/api/letters/:id/physical-request` POST 요청
- 신청 완료 시 상태 표시

## 제거된 기능 (MVP 범위 외)

- ❌ OG 이미지 커스터마이징 페이지
- ❌ 색상/일러스트/글꼴 선택
- ❌ 실시간 미리보기
- ❌ ColorPicker, IllustrationSelector 컴포넌트

## 백엔드 API 요구사항

### 필수 엔드포인트

#### 1. 편지 등록

```
POST /api/letters
Body: {
  title: string,
  content: string,
  authorName: string,
  ogTitle: string,
  ogPreviewText: string
}
Response: {
  success: boolean,
  data: {
    _id: string,
    ...letter
  }
}
```

#### 2. 편지 조회

```
GET /api/letters/:id
Response: {
  success: boolean,
  data: {
    _id: string,
    type: "story" | "friend",
    content: string,
    ogTitle: string,
    ogPreviewText: string,
    status: string,
    physicalRequested: boolean,
    address?: {...},
    createdAt: string
  }
}
```

#### 3. 실물 편지 신청

```
POST /api/letters/:id/physical-request
Body: {
  address: {
    name: string,
    phone: string,
    zipCode: string,
    address1: string,
    address2: string
  }
}
Response: {
  success: boolean
}
```

## Letter 데이터 모델

```typescript
interface Letter {
  _id: ObjectId;
  type: "story" | "friend";
  senderUserId?: ObjectId;
  receiverEmail?: string;
  content: string;
  ogTitle?: string;
  ogPreviewText: string;
  status:
    | "created"
    | "written"
    | "admin_checked"
    | "web_sent"
    | "physical_requested"
    | "writing_physical"
    | "shipped"
    | "delivered";
  physicalRequested: boolean;
  address?: {
    name: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2: string;
  };
  createdAt: Date;
}
```

## 사용자 플로우

### 웹 편지 작성 → 공유

1. `/write` 페이지에서 편지 작성
2. 제출 시 `ogPreviewText` 자동 생성 (앞 60자)
3. `/letter/:id` 페이지로 리다이렉트
4. 링크 공유 시 OG 이미지 표시

### 실물 편지 신청

1. `/letter/:id` 페이지에서 "실물 편지 신청하기" 버튼 클릭
2. 주소 입력 폼 작성
3. 신청 완료 → `physicalRequested = true`
4. 관리자가 수기 작성 후 우편 발송
5. 1~2주 후 배송 완료

## OG 이미지 미리보기

### 고정 포맷 구성

- 배경: 핑크 그라데이션 (#FFF5F5 → #FFE4E1)
- 상단: "LETTER" 브랜드 로고
- 중앙: 💌 봉투 일러스트 (120px)
- 제목: ogTitle (48px, bold)
- 미리보기: ogPreviewText (28px, 2줄)
- 하단: "편지를 확인하려면 클릭하세요"

### 메타태그 예시

```html
<meta property="og:title" content="당신에게 도착한 편지" />
<meta property="og:description" content="특별한 순간을 담은 편지입니다..." />
<meta property="og:image" content="https://letter.com/api/og?letterId=xxx" />
<meta property="og:type" content="website" />
```

## 환경 변수

### 프론트엔드 (.env.local)

```bash
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

### Vercel 환경 변수

```bash
NEXT_PUBLIC_URL=https://letter-community.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://letter-my-backend.onrender.com
```

## 테스트 시나리오

### 1. 편지 작성 테스트

- [ ] `/write` 페이지 접속
- [ ] 제목, 본문, 작성자 입력
- [ ] "사연 제출하기" 버튼 클릭
- [ ] 편지 상세 페이지로 이동
- [ ] 편지 내용 정상 표시

### 2. OG 이미지 테스트

- [ ] 편지 링크 복사
- [ ] 카카오톡/페이스북에 링크 붙여넣기
- [ ] OG 이미지 미리보기 표시 확인
- [ ] 제목 + 미리보기 텍스트 확인

### 3. 실물 편지 신청 테스트

- [ ] "실물 편지 신청하기" 버튼 클릭
- [ ] 주소 입력 폼 작성
- [ ] "신청하기" 버튼 클릭
- [ ] 신청 완료 메시지 표시
- [ ] 페이지 새로고침 시 신청 완료 상태 유지

## 다음 단계 (MVP 이후)

### Phase 2: 관리자 기능

- [ ] 관리자 대시보드
- [ ] 편지 검수 기능
- [ ] 실물 편지 작성 상태 관리
- [ ] 배송 추적

### Phase 3: 이메일 전송

- [ ] nodemailer 설정
- [ ] 이메일 템플릿
- [ ] 편지 도착 알림

### Phase 4: 고급 기능

- [ ] 편지 목록 페이지
- [ ] 내가 쓴 편지 관리
- [ ] 편지 삭제/수정
- [ ] 댓글 기능

## 파일 구조

```
app/
├── (afterLogin)/
│   └── write/
│       └── page.tsx          # 편지 작성 페이지
├── letter/
│   └── [letterId]/
│       ├── page.tsx          # 편지 상세 (SSR + OG 메타)
│       └── LetterDetailClient.tsx  # 클라이언트 컴포넌트
└── api/
    └── og/
        └── route.tsx         # OG 이미지 생성 API

lib/
└── api.ts                    # API 함수들

components/
└── editor/                   # Tiptap 에디터 컴포넌트
```

## 주의사항

1. **ogPreviewText 자동 생성**: 편지 본문 앞 60자 + "..."
2. **HTML 태그 제거**: 순수 텍스트만 저장
3. **실물 편지 안내**: "1~2주 소요, 우편함 확인"
4. **OG 이미지 캐싱**: Vercel Edge에서 자동 캐싱
5. **환경 변수**: `NEXT_PUBLIC_` 접두사 필수 (클라이언트 접근)

## 배포 체크리스트

- [ ] Vercel 환경 변수 설정
- [ ] 백엔드 API 엔드포인트 구현
- [ ] CORS 설정 (Vercel 도메인 허용)
- [ ] OG 이미지 테스트 (카카오톡, 페이스북)
- [ ] 실물 편지 신청 플로우 테스트
