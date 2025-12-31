# 백엔드 API 엔드포인트 구현 확인 요청

## 🔴 현재 문제

프론트엔드에서 익명 사용자 실물 편지 신청 후 상태 조회 API를 호출할 때 **404 Not Found** 에러가 발생합니다.

### 에러 상세 정보

**요청 URL:**

```
GET http://localhost:5001/api/letters/69539566ad99d5d0ee5021d4/physical-request/mjtd99f82pcgilz9r
```

**응답:**

```json
{
  "success": false,
  "error": {
    "message": "Route not found"
  }
}
```

**상태 코드:** 404 Not Found

## ✅ 필요한 백엔드 구현

### 1. 익명 사용자 신청 엔드포인트 (이미 구현됨)

**엔드포인트:**

```
POST /api/letters/:letterId/physical-request
```

**요청 형식:**

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

**응답 형식:**

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

### 2. 신청 상태 조회 엔드포인트 (❌ 구현 필요)

**엔드포인트:**

```
GET /api/letters/:letterId/physical-request/:requestId
```

**설명:**

- 로그인 없이 접근 가능
- 익명 사용자가 신청 ID로 상태를 조회하는 엔드포인트
- 프론트엔드에서 신청 후 상태 조회 페이지로 이동할 때 호출됨

**응답 형식:**

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
      "address": "string (마스킹된 주소)"
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

**에러 응답:**

```json
{
  "success": false,
  "error": "신청을 찾을 수 없습니다."
}
```

## 📋 구현 체크리스트

### 엔드포인트 확인

- [ ] `GET /api/letters/:letterId/physical-request/:requestId` 엔드포인트 구현 여부 확인
- [ ] 라우트가 올바르게 등록되어 있는지 확인
- [ ] 라우트 순서 문제 확인 (더 구체적인 라우트가 먼저 등록되어야 함)

### 데이터 조회

- [ ] 주어진 `requestId`로 신청 정보 조회 가능 여부
- [ ] 신청 정보가 데이터베이스에 저장되어 있는지 확인
- [ ] `requestId` 형식 확인 (예: `mjtd99f82pcgilz9r`)

### 응답 형식

- [ ] 응답이 위의 형식과 일치하는지 확인
- [ ] 필수 필드 모두 포함되어 있는지 확인
- [ ] 상태 코드가 200 OK인지 확인

## 🔍 디버깅 정보

### 프론트엔드 호출 코드

```typescript
// lib/recipient-api.ts
export async function getPhysicalRequestStatusAnonymous(letterId: string, requestId: string): Promise<PhysicalRequestStatusResponse> {
  return apiRequest<PhysicalRequestStatusResponse>(`/api/letters/${letterId}/physical-request/${requestId}`, {
    method: "GET",
  });
}
```

### 호출 시점

1. 사용자가 익명 신청 폼 제출
2. 백엔드에서 신청 완료 후 `requestId` 반환
3. 프론트엔드가 `/letter/[letterId]/request/[requestId]` 페이지로 이동
4. 페이지 로드 시 위 엔드포인트 호출
5. **404 에러 발생** ❌

### 테스트 요청

```bash
curl -X GET http://localhost:5001/api/letters/69539566ad99d5d0ee5021d4/physical-request/mjtd99f82pcgilz9r
```

## 📝 추가 확인 사항

### 1. 라우트 등록 확인

백엔드 라우터 파일에서 다음 라우트가 등록되어 있는지 확인:

```javascript
// 예상되는 라우트 구조
router.get("/api/letters/:letterId/physical-request/:requestId", getPhysicalRequestStatus);
```

### 2. 라우트 순서 문제

만약 다음과 같은 라우트가 있다면 순서를 확인:

```javascript
// ❌ 잘못된 순서 (더 일반적인 라우트가 먼저)
router.get('/api/letters/:letterId/physical-request/user', ...);
router.get('/api/letters/:letterId/physical-request/:requestId', ...);

// ✅ 올바른 순서 (더 구체적인 라우트가 먼저)
router.get('/api/letters/:letterId/physical-request/:requestId', ...);
router.get('/api/letters/:letterId/physical-request/user', ...);
```

### 3. 기존 엔드포인트와의 충돌

기존에 다음 엔드포인트가 있는지 확인:

```
GET /api/letters/physical-requests/:requestId/status
```

만약 있다면, 새로운 엔드포인트와 구분되는지 확인:

```
GET /api/letters/:letterId/physical-request/:requestId  (새로운 엔드포인트)
GET /api/letters/physical-requests/:requestId/status    (기존 엔드포인트)
```

## 🎯 요청 사항

다음 중 하나를 확인해주세요:

1. **엔드포인트 구현 상태 확인**

   - `GET /api/letters/:letterId/physical-request/:requestId` 엔드포인트가 구현되어 있는가?
   - 구현되어 있다면, 라우트가 올바르게 등록되어 있는가?

2. **라우트 등록 확인**

   - 라우터 파일에서 해당 라우트를 찾아 확인
   - 라우트 순서 문제가 있는지 확인

3. **데이터 저장 확인**

   - 신청 후 `requestId`가 데이터베이스에 저장되는가?
   - 저장된 `requestId`로 조회 가능한가?

4. **응답 형식 확인**
   - 응답이 위의 형식과 일치하는가?
   - 필수 필드가 모두 포함되어 있는가?

## 📞 연락처

프론트엔드 구현 완료 상태:

- ✅ 익명 사용자 신청 폼 완성
- ✅ Daum 주소 검색 API 통합
- ✅ SessionId 관리
- ✅ 신청 상태 조회 페이지 완성
- ⏳ 백엔드 API 대기 중

백엔드 구현 필요:

- ✅ POST `/api/letters/:letterId/physical-request` (완료)
- ❌ GET `/api/letters/:letterId/physical-request/:requestId` (필요)
