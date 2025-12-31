# API 요청 형식 정리

## 익명 사용자 실물 편지 신청

### 엔드포인트

```
POST /api/letters/{letterId}/physical-request
```

### 요청 형식

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

### 요청 예시

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

### 필드 설명

#### address 객체

| 필드     | 타입   | 필수 | 설명                                   |
| -------- | ------ | ---- | -------------------------------------- |
| name     | string | O    | 받으실 분의 이름 (2-50자)              |
| phone    | string | O    | 전화번호 (010-XXXX-XXXX 형식)          |
| zipCode  | string | O    | 우편번호 (5자리 숫자)                  |
| address1 | string | O    | 기본 주소 (도로명 또는 지번, 5-200자)  |
| address2 | string | X    | 상세주소 (아파트, 호수 등, 최대 200자) |
| memo     | string | X    | 배송 메모 (최대 500자)                 |

#### sessionId

| 필드      | 타입   | 필수 | 설명                               |
| --------- | ------ | ---- | ---------------------------------- |
| sessionId | string | O    | 클라이언트에서 생성한 고유 세션 ID |

### 응답 형식

#### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "requestId": "string",
    "isDuplicate": boolean,
    "duplicateOf": "string (optional)",
    "trackingInfo": {
      "requestId": "string",
      "statusCheckUrl": "string",
      "message": "string"
    }
  }
}
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "requestId": "req_1767145352162_abc123",
    "isDuplicate": false,
    "trackingInfo": {
      "requestId": "req_1767145352162_abc123",
      "statusCheckUrl": "/letter/69539566ad99d5d0ee5021d4/request/req_1767145352162_abc123",
      "message": "신청이 완료되었습니다."
    }
  }
}
```

#### 중복 신청 응답

```json
{
  "success": true,
  "data": {
    "requestId": "req_1767145352162_abc123",
    "isDuplicate": true,
    "duplicateOf": "req_1767145352161_xyz789",
    "trackingInfo": {
      "requestId": "req_1767145352162_abc123",
      "statusCheckUrl": "/letter/69539566ad99d5d0ee5021d4/request/req_1767145352162_abc123",
      "message": "이미 같은 주소로 신청된 기록이 있습니다."
    }
  }
}
```

### 에러 응답

#### 유효성 검증 실패 (400 Bad Request)

```json
{
  "success": false,
  "error": "유효하지 않은 입력값입니다.",
  "details": {
    "phone": "전화번호 형식이 올바르지 않습니다.",
    "zipCode": "우편번호는 5자리 숫자여야 합니다."
  }
}
```

#### 서버 에러 (500 Internal Server Error)

```json
{
  "success": false,
  "error": "서버 오류가 발생했습니다."
}
```

## 신청 상태 조회

### 엔드포인트

```
GET /api/letters/{letterId}/physical-request/{requestId}
```

### 응답 형식

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

## 프론트엔드 구현

### API 호출 함수

```typescript
// lib/recipient-api.ts
export async function requestPhysicalLetterAnonymous(letterId: string, data: AnonymousPhysicalRequest): Promise<AnonymousPhysicalRequestResponse> {
  const { sessionId, ...addressData } = data;

  return apiRequest<AnonymousPhysicalRequestResponse>(`/api/letters/${letterId}/physical-request`, {
    method: "POST",
    body: JSON.stringify({
      address: addressData,
      sessionId,
    }),
  });
}
```

### 사용 예시

```typescript
// components/letter/AnonymousPhysicalRequestForm.tsx
const response = await requestPhysicalLetterAnonymous(letterId, {
  name: "최우대",
  phone: "010-2568-3766",
  zipCode: "46611",
  address1: "부산 북구 덕천로276번길 60",
  address2: "110동 1704호",
  memo: "한진 행님 항상 존경합니다.",
  sessionId: getOrCreateSessionId(),
});

if (response.success) {
  console.log("신청 ID:", response.data.requestId);
  console.log("중복 여부:", response.data.isDuplicate);
}
```

## 주의사항

### 1. address 객체 구조

- 모든 주소 정보는 `address` 객체 내에 포함되어야 함
- `sessionId`는 `address` 객체 외부에 위치

### 2. 필드 유효성

- **name**: 2-50자, 한글/영문만 허용
- **phone**: `010-XXXX-XXXX` 형식 (하이픈 포함)
- **zipCode**: 5자리 숫자 (하이픈 없음)
- **address1**: 5-200자
- **address2**: 최대 200자 (선택사항)
- **memo**: 최대 500자 (선택사항)

### 3. sessionId

- 클라이언트에서 자동 생성
- 30일 유효기간
- 중복 확인용 식별자

### 4. 중복 확인

- 백엔드에서 `phone` 또는 `sessionId` 기반으로 중복 확인
- 중복 신청 시 `isDuplicate: true` 반환
- 원본 신청 ID는 `duplicateOf` 필드에 포함

## 테스트

### cURL 예시

```bash
curl -X POST http://localhost:3000/api/letters/69539566ad99d5d0ee5021d4/physical-request \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "name": "최우대",
      "phone": "010-2568-3766",
      "zipCode": "46611",
      "address1": "부산 북구 덕천로276번길 60",
      "address2": "110동 1704호",
      "memo": "한진 행님 항상 존경합니다."
    },
    "sessionId": "1767145352162-oqq5hry0j4-yo9yxwjze4"
  }'
```

### Postman 예시

1. **Method**: POST
2. **URL**: `http://localhost:3000/api/letters/69539566ad99d5d0ee5021d4/physical-request`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body** (raw JSON):
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
