# 백엔드 API 구현 프롬프트

## 🎯 목표

익명 사용자 실물 편지 신청 후 상태 조회 API 엔드포인트 구현

## 📋 구현 요구사항

### 엔드포인트

```
GET /api/letters/:letterId/physical-request/:requestId
```

### 기능

- 로그인 없이 접근 가능
- 신청 ID로 신청 상태 조회
- 신청자 정보 반환 (마스킹된 주소)
- 상태 이력 반환

### 요청 파라미터

| 파라미터  | 타입   | 위치 | 설명    |
| --------- | ------ | ---- | ------- |
| letterId  | string | URL  | 편지 ID |
| requestId | string | URL  | 신청 ID |

### 응답 형식 (성공 - 200 OK)

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

### 응답 형식 (에러 - 404 Not Found)

```json
{
  "success": false,
  "error": "신청을 찾을 수 없습니다."
}
```

### 응답 형식 (에러 - 400 Bad Request)

```json
{
  "success": false,
  "error": "유효하지 않은 요청입니다."
}
```

## 🔍 구현 상세

### 1. 라우트 등록

```javascript
// routes/letters.js 또는 해당 라우터 파일
router.get("/api/letters/:letterId/physical-request/:requestId", getPhysicalRequestStatus);
```

**주의사항:**

- 더 구체적인 라우트가 더 일반적인 라우트보다 먼저 등록되어야 함
- 예: `/api/letters/:letterId/physical-request/:requestId` 가 `/api/letters/:letterId/physical-request/user` 보다 먼저 등록

### 2. 컨트롤러 함수 구현

```javascript
async function getPhysicalRequestStatus(req, res) {
  try {
    const { letterId, requestId } = req.params;

    // 1. 입력값 검증
    if (!letterId || !requestId) {
      return res.status(400).json({
        success: false,
        error: "유효하지 않은 요청입니다.",
      });
    }

    // 2. 신청 정보 조회
    const request = await PhysicalRequest.findOne({
      letterId,
      requestId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "신청을 찾을 수 없습니다.",
      });
    }

    // 3. 편지 정보 조회 (제목 포함)
    const letter = await Letter.findById(letterId);

    // 4. 응답 데이터 구성
    const response = {
      success: true,
      data: {
        requestId: request.requestId,
        letterId: request.letterId,
        letterTitle: letter?.title || "편지",
        status: request.status,
        recipientInfo: {
          name: request.requesterInfo.name,
          address: request.requesterInfo.address1 + (request.requesterInfo.address2 ? ` ${request.requesterInfo.address2}` : ""),
        },
        statusHistory: {
          requested: request.createdAt,
          approved: request.approvedAt || null,
          writing: request.writingStartedAt || null,
          sent: request.sentAt || null,
          delivered: request.deliveredAt || null,
        },
        trackingInfo: {
          canTrack: request.status !== "requested",
          estimatedDelivery: request.estimatedDelivery || null,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("신청 상태 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "서버 오류가 발생했습니다.",
    });
  }
}
```

### 3. 데이터 모델 확인

PhysicalRequest 스키마에 다음 필드가 있는지 확인:

```javascript
{
  requestId: String (unique),
  letterId: ObjectId,
  requesterInfo: {
    name: String,
    phone: String,
    zipCode: String,
    address1: String,
    address2: String (optional),
    memo: String (optional)
  },
  status: String,
  createdAt: Date,
  approvedAt: Date (optional),
  writingStartedAt: Date (optional),
  sentAt: Date (optional),
  deliveredAt: Date (optional),
  estimatedDelivery: String (optional)
}
```

## 🧪 테스트 케이스

### 테스트 1: 정상 조회

**요청:**

```bash
curl -X GET http://localhost:5001/api/letters/69539566ad99d5d0ee5021d4/physical-request/mjtd99f82pcgilz9r
```

**예상 응답:**

```json
{
  "success": true,
  "data": {
    "requestId": "mjtd99f82pcgilz9r",
    "letterId": "69539566ad99d5d0ee5021d4",
    "letterTitle": "편지 제목",
    "status": "requested",
    "recipientInfo": {
      "name": "최우대",
      "address": "부산 북구 덕천로276번길 60 110동 1704호"
    },
    "statusHistory": {
      "requested": "2024-12-31T12:00:00Z",
      "approved": null,
      "writing": null,
      "sent": null,
      "delivered": null
    },
    "trackingInfo": {
      "canTrack": false,
      "estimatedDelivery": null
    }
  }
}
```

### 테스트 2: 신청 없음 (404)

**요청:**

```bash
curl -X GET http://localhost:5001/api/letters/69539566ad99d5d0ee5021d4/physical-request/invalid_id
```

**예상 응답:**

```json
{
  "success": false,
  "error": "신청을 찾을 수 없습니다."
}
```

### 테스트 3: 잘못된 파라미터 (400)

**요청:**

```bash
curl -X GET http://localhost:5001/api/letters//physical-request/
```

**예상 응답:**

```json
{
  "success": false,
  "error": "유효하지 않은 요청입니다."
}
```

## 📝 구현 체크리스트

- [ ] 라우트 등록 (`GET /api/letters/:letterId/physical-request/:requestId`)
- [ ] 컨트롤러 함수 구현
- [ ] 입력값 검증
- [ ] 데이터베이스 조회
- [ ] 응답 형식 확인
- [ ] 에러 처리
- [ ] 테스트 케이스 실행
- [ ] 라우트 순서 확인 (더 구체적인 라우트가 먼저)

## 🔗 관련 엔드포인트

### 이미 구현된 엔드포인트

```
POST /api/letters/:letterId/physical-request
```

신청 생성 시 반환되는 `requestId`를 사용하여 이 엔드포인트 호출

### 기존 엔드포인트 (호환성 유지)

```
GET /api/letters/physical-requests/:requestId/status
```

기존 엔드포인트와 구분되는지 확인

## 💡 주의사항

### 1. 라우트 순서

```javascript
// ❌ 잘못된 순서
router.get('/api/letters/:letterId/physical-request/user', ...);
router.get('/api/letters/:letterId/physical-request/:requestId', ...);

// ✅ 올바른 순서
router.get('/api/letters/:letterId/physical-request/:requestId', ...);
router.get('/api/letters/:letterId/physical-request/user', ...);
```

### 2. 데이터 형식

- `requestId`: 신청 생성 시 생성된 고유 ID
- `status`: "requested", "approved", "writing", "sent", "delivered" 중 하나
- `statusHistory`: 각 상태의 타임스탬프 (해당 상태가 없으면 null)

### 3. 응답 필드

- `recipientInfo.address`: 전체 주소 (마스킹 불필요, 배송 필요)
- `trackingInfo.canTrack`: status가 "requested"가 아니면 true
- `estimatedDelivery`: 배송 예정일 (있으면 포함, 없으면 null)

## 🚀 배포 전 확인

- [ ] 로컬 환경에서 테스트 완료
- [ ] 모든 테스트 케이스 통과
- [ ] 에러 처리 확인
- [ ] 라우트 순서 확인
- [ ] 데이터베이스 연결 확인
- [ ] 응답 형식 확인

## 📞 문의

프론트엔드 상태:

- 신청 폼: ✅ 완성
- 상태 조회 페이지: ✅ 완성
- API 호출: ✅ 준비 완료

백엔드 필요:

- 이 엔드포인트 구현 필요
