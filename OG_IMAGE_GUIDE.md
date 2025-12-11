# OG 이미지 기능 가이드

## 개요

편지 공유 시 표시되는 OG(Open Graph) 이미지를 자동 생성하거나 사용자가 커스터마이징할 수 있는 기능입니다.

## 구현된 기능

### 1. API Routes

#### `/api/og?letterId=xxx`

- 편지 ID 기반 OG 이미지 자동 생성
- 백엔드에서 편지 정보를 가져와서 이미지 렌더링
- 1200x630px PNG 이미지 반환

#### `/api/og-preview?message=xxx&bgColor=xxx&illustration=xxx&fontSize=xxx`

- 실시간 미리보기용 이미지 생성
- 사용자 입력값으로 즉시 이미지 렌더링
- 커스터마이징 페이지에서 사용

### 2. 페이지

#### `/letter/[letterId]`

- 편지 상세 페이지
- OG 메타태그 자동 삽입 (SSR)
- 커스터마이징 페이지로 이동 버튼

#### `/letter/[letterId]/custom-og`

- OG 이미지 커스터마이징 페이지
- 실시간 미리보기
- 백엔드에 이미지 업로드

### 3. 컴포넌트

#### `ColorPicker`

- 8가지 프리셋 배경색 선택
- 핑크, 라벤더, 스카이, 민트, 피치, 로즈, 라임, 아이보리

#### `IllustrationSelector`

- 10가지 이모지 일러스트 선택
- 💌 💖 🌸 🌹 🎀 ✨ 🌙 ⭐ 🦋 🌈

#### `OgPreviewFrame`

- 실시간 미리보기 렌더링
- 500ms 디바운스 적용
- 1200x630px 비율 유지

#### `UploadToast`

- 업로드 상태 알림
- 성공/실패/로딩 상태 표시
- 3초 후 자동 닫힘

## 백엔드 API 요구사항

### Letter 스키마

```javascript
{
  _id: ObjectId,
  userId: String,
  title: String,
  content: String,
  authorName: String,
  ogPreviewMessage: String,      // 커스텀 메시지
  ogImageType: "auto" | "custom", // 이미지 타입
  ogImageUrl: String,             // 이미지 URL
  ogBgColor: String,              // 배경색
  ogIllustration: String,         // 일러스트 이모지
  ogFontSize: Number,             // 글꼴 크기
  createdAt: Date
}
```

### 필요한 API 엔드포인트

#### `POST /api/og/upload`

- 커스텀 OG 이미지 업로드
- FormData: file, letterId, ogPreviewMessage, style
- Response: `{ success: true, ogImageUrl: "..." }`

#### `PATCH /api/og/auto-generate`

- 자동 생성 이미지 URL 기록
- Body: `{ letterId, ogImageUrl }`
- Response: `{ success: true }`

#### `GET /api/og/:letterId`

- 편지의 OG 이미지 URL 조회
- Response: `{ ogImageUrl: "..." }`

#### `GET /api/letters/:letterId`

- 편지 상세 정보 조회
- Response: `{ data: { ...letter } }`

## 사용 흐름

### 자동 생성

1. 편지 작성 완료
2. `/letter/[letterId]` 페이지 접속
3. OG 메타태그에 `/api/og?letterId=xxx` 자동 설정
4. 공유 시 자동 생성된 이미지 표시

### 커스터마이징

1. 편지 상세 페이지에서 "공유 이미지 커스터마이징" 버튼 클릭
2. `/letter/[letterId]/custom-og` 페이지 이동
3. 메시지, 배경색, 일러스트, 글꼴 크기 설정
4. 실시간 미리보기 확인
5. "저장하기" 버튼 클릭
6. 백엔드에 이미지 업로드
7. 편지 상세 페이지로 리다이렉트

## 환경 변수

```env
# .env.local
NEXT_PUBLIC_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

## 기술 스택

- **@vercel/og**: OG 이미지 생성 (Satori 기반)
- **Edge Runtime**: 빠른 이미지 생성
- **Next.js Metadata API**: SSR OG 메타태그
- **FormData**: 이미지 업로드

## 주의사항

1. Edge Runtime에서는 Node.js API 사용 불가
2. 이미지 생성은 프론트엔드에서 처리
3. 백엔드는 저장/CRUD만 담당
4. OG 이미지는 1200x630px 표준 사이즈
5. 한글 폰트는 Edge Runtime에서 제한적 (기본 sans-serif 사용)

## 개선 가능 사항

- [ ] 한글 웹폰트 지원 (Edge Runtime 제약)
- [ ] 더 많은 일러스트 옵션
- [ ] 텍스트 위치 조절
- [ ] 그라데이션 방향 선택
- [ ] 이미지 템플릿 추가
