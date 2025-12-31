# 익명 사용자 실물 편지 신청 기능

## 개요

로그인하지 않은 사용자도 URL 경로를 통해 실물 편지를 신청할 수 있는 기능입니다. 중복 사용자 확인은 백엔드에서 처리합니다.

## 주요 변경사항

### 1. 타입 추가 (`types/recipient.ts`)

```typescript
// 익명 사용자 실물 편지 신청 타입
export interface AnonymousPhysicalRequest {
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  memo?: string;
  sessionId: string;
}

// 익명 사용자 신청 응답 타입
export interface AnonymousPhysicalRequestResponse {
  success: boolean;
  data: {
    requestId: string;
    isDuplicate: boolean;
    duplicateOf?: string;
    trackingInfo: {
      requestId: string;
      statusCheckUrl: string;
      message: string;
    };
  };
}
```

### 2. API 함수 추가 (`lib/recipient-api.ts`)

```typescript
// 익명 사용자 실물 편지 신청
export async function requestPhysicalLetterAnonymous(letterId: string, data: AnonymousPhysicalRequest): Promise<AnonymousPhysicalRequestResponse>;

// 익명 사용자 신청 상태 조회
export async function getPhysicalRequestStatusAnonymous(letterId: string, requestId: string): Promise<PhysicalRequestStatusResponse>;
```

### 3. SessionId 관리 (`lib/session-id.ts`)

로그인하지 않은 사용자를 식별하기 위한 고유 ID 생성 및 관리:

```typescript
// SessionId 조회 (없으면 새로 생성)
export function getOrCreateSessionId(): string;

// SessionId 조회 (없으면 null)
export function getSessionId(): string | null;

// SessionId 삭제
export function clearSessionId(): void;

// SessionId 갱신
export function refreshSessionId(): void;
```

### 4. 컴포넌트 추가

#### `components/letter/AnonymousPhysicalRequestForm.tsx`

- 로그인하지 않은 사용자용 신청 폼
- **Daum 주소 검색 API 통합** (PostcodeSearch 컴포넌트 사용)
- 이름, 전화번호, 주소, 메모 입력
- 중복 신청 감지 및 안내

#### `components/letter/AnonymousPhysicalStatusTracker.tsx`

- 신청 상태 조회 페이지
- 30초마다 자동 새로고침
- 상태 이력 표시

### 5. 라우트 추가

#### `/letter/[letterId]/request`

- 익명 사용자 신청 페이지
- 로그인 없이 접근 가능

#### `/letter/[letterId]/request/[requestId]`

- 신청 상태 조회 페이지
- 로그인 없이 접근 가능

### 6. 미들웨어 수정 (`middleware.ts`)

- `/letter` 경로는 로그인 없이 접근 가능
- 기존 보호된 라우트는 유지

### 7. 편지 상세 페이지 수정 (`app/letter/[letterId]/LetterDetailClient.tsx`)

- 로그인 여부에 따라 다른 신청 방식 제공
- 로그인하지 않은 사용자: 익명 신청 페이지로 이동
- 로그인한 사용자: 기존 방식 사용

## 사용 흐름

### 익명 사용자 신청 흐름

1. 편지 상세 페이지에서 "실물 편지 신청하기" 버튼 클릭
2. 로그인하지 않은 경우 `/letter/[letterId]/request` 페이지로 이동
3. 신청 폼 작성
   - 이름, 전화번호 입력
   - **"주소 검색" 버튼 클릭 → Daum 주소 검색 팝업 열기**
   - **주소 선택 → 우편번호와 주소 자동 입력**
   - 상세주소, 메모 입력 (선택)
4. 신청 폼 제출
5. 백엔드에서 중복 확인 (phone 또는 sessionId 기반)
6. 신청 완료 후 `/letter/[letterId]/request/[requestId]` 페이지로 이동
7. 신청 상태 조회 가능

### 로그인 사용자 신청 흐름

1. 편지 상세 페이지에서 "실물 편지 신청하기" 버튼 클릭
2. 로그인한 경우 기존 방식 사용 (RecipientSelectModal)
3. 주소 선택 또는 새로 입력
4. 신청 완료

## 주소 검색 기능 (Daum API)

### 구현 방식

익명 사용자 신청 폼에서 기존 `PostcodeSearch` 컴포넌트를 재사용하여 Daum 주소 검색 API를 통합했습니다.

### 사용 방법

1. **"주소 검색" 버튼 클릭**

   - Daum 주소 검색 팝업 열기

2. **주소 검색 및 선택**

   - 도로명 주소 또는 지번 주소 검색
   - 원하는 주소 선택

3. **자동 입력**
   - 우편번호 (zipCode) 자동 입력
   - 기본 주소 (address1) 자동 입력
   - 상세주소 (address2)는 사용자가 직접 입력

### 주소 검색 결과

```typescript
interface PostcodeResult {
  zipCode: string; // 우편번호 (5자리)
  address: string; // 도로명 또는 지번 주소
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  bname: string; // 법정동명
  buildingName: string; // 건물명
}
```

### 스크립트 로드

- Daum 주소 검색 스크립트는 자동으로 로드됨
- 전역 상태 관리로 중복 로드 방지
- 로드 실패 시 버튼 비활성화

### API 엔드포인트

#### POST `/api/letters/:letterId/physical-request`

익명 사용자 신청

**요청:**

```json
{
  "address": {
    "name": "string",
    "phone": "string",
    "zipCode": "string",
    "address1": "string",
    "address2": "string (optional)",
    "memo": "string (optional)"
  },
  "sessionId": "string"
}
```

**요청 예시:**

```json
{
  "address": {
    "name": "최우대",
    "phone": "010-2568-3766",
    "zipCode": "46611",
    "address1": "부산 북구 덕천로276번길 60",
    "address2": "110동 1704호",
    "memo": "한진 행님 항상 존경합니다."
  },
  "sessionId": "1767145352162-oqq5hry0j4-yo9yxwjze4"
}
```

**응답:**

```json
{
  "success": true,
  "data": {
    "requestId": "string",
    "isDuplicate": false,
    "trackingInfo": {
      "requestId": "string",
      "statusCheckUrl": "string",
      "message": "string"
    }
  }
}
```

#### GET `/api/letters/:letterId/physical-request/:requestId`

신청 상태 조회

**응답:**

```json
{
  "success": true,
  "data": {
    "requestId": "string",
    "letterId": "string",
    "letterTitle": "string",
    "status": "requested|approved|writing|sent|delivered",
    "recipientInfo": {
      "name": "string",
      "address": "string"
    },
    "statusHistory": {
      "requested": "ISO8601",
      "approved": "ISO8601 (optional)",
      "writing": "ISO8601 (optional)",
      "sent": "ISO8601 (optional)",
      "delivered": "ISO8601 (optional)"
    },
    "trackingInfo": {
      "canTrack": boolean,
      "estimatedDelivery": "string (optional)"
    }
  }
}
```

## 중복 확인 로직

백엔드에서 다음 기준으로 중복을 확인합니다:

1. **전화번호 기반**: 같은 편지에 같은 전화번호로 신청한 기록
2. **SessionId 기반**: 같은 sessionId로 신청한 기록

중복 신청 시:

- `isDuplicate: true` 반환
- `duplicateOf`: 원본 requestId 반환
- 사용자에게 중복 신청임을 안내

## 보안 고려사항

### 프론트엔드

- 입력값 유효성 검증 (이름, 전화번호, 주소)
- SessionId는 localStorage에 30일 유효기간으로 저장
- 개인정보는 로컬에만 저장

### 백엔드

- Rate Limiting (IP 기반)
- 입력값 Sanitization
- 전화번호 마스킹 (상태 조회 시)
- 중복 확인 로직

## 버전 업그레이드 시 체크리스트

1. **API 엔드포인트 확인**

   - POST `/api/letters/:letterId/physical-request` 존재 여부
   - GET `/api/letters/:letterId/physical-request/:requestId` 존재 여부

2. **응답 형식 확인**

   - `isDuplicate` 필드 포함 여부
   - `trackingInfo` 필드 포함 여부

3. **타입 정의 업데이트**

   - `AnonymousPhysicalRequest` 타입 확인
   - `AnonymousPhysicalRequestResponse` 타입 확인

4. **환경 변수 확인**
   - `NEXT_PUBLIC_BACKEND_URL` 설정 여부

## 환경 변수

```env
# .env.local
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

## 파일 구조

```
app/
├── letter/
│   └── [letterId]/
│       ├── request/
│       │   ├── page.tsx
│       │   ├── AnonymousPhysicalRequestFormPage.tsx
│       │   └── [requestId]/
│       │       ├── page.tsx
│       │       └── AnonymousPhysicalStatusTrackerPage.tsx
│       └── LetterDetailClient.tsx (수정)

components/
├── letter/
│   ├── AnonymousPhysicalRequestForm.tsx (신규)
│   └── AnonymousPhysicalStatusTracker.tsx (신규)

lib/
├── recipient-api.ts (수정)
├── session-id.ts (신규)
└── letter-requests.ts (기존)

types/
└── recipient.ts (수정)

middleware.ts (수정)
```

## 테스트 시나리오

### 1. 익명 사용자 신청

- [ ] 로그인하지 않은 상태에서 편지 상세 페이지 접근
- [ ] "실물 편지 신청하기" 버튼 클릭
- [ ] `/letter/[letterId]/request` 페이지로 이동 확인
- [ ] 신청 폼 작성 및 제출
- [ ] 신청 완료 후 상태 조회 페이지로 이동

### 2. 중복 신청 감지

- [ ] 같은 전화번호로 두 번 신청
- [ ] `isDuplicate: true` 응답 확인
- [ ] 사용자에게 중복 신청 안내 표시

### 3. 상태 조회

- [ ] 신청 ID로 상태 조회
- [ ] 30초마다 자동 새로고침 확인
- [ ] 상태 이력 표시 확인

### 4. 로그인 사용자 신청

- [ ] 로그인한 상태에서 편지 상세 페이지 접근
- [ ] "실물 편지 신청하기" 버튼 클릭
- [ ] 기존 방식 (RecipientSelectModal) 사용 확인

## 주의사항

1. **SessionId 관리**

   - SessionId는 30일 유효기간
   - 만료 후 새로운 SessionId 자동 생성
   - 사용자가 localStorage를 삭제하면 새로운 SessionId 생성

2. **중복 확인**

   - 백엔드에서만 처리
   - 프론트엔드는 응답 결과만 표시

3. **개인정보 보호**

   - 상태 조회 시 전화번호는 마스킹됨
   - 주소는 전체 표시 (배송 필요)

4. **라우트 접근**
   - `/letter/[letterId]/request` 경로는 로그인 없이 접근 가능
   - 기존 보호된 라우트는 유지
