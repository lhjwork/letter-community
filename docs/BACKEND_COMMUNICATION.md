# 백엔드 팀 커뮤니케이션 가이드

## 🔴 현재 상황

프론트엔드에서 익명 사용자 실물 편지 신청 기능을 완전히 구현했으나, 백엔드의 상태 조회 API 엔드포인트가 구현되지 않아 **404 Not Found** 에러가 발생하고 있습니다.

## 📊 진행 상황

### 프론트엔드 ✅ 완료

| 항목             | 상태 | 설명                         |
| ---------------- | ---- | ---------------------------- |
| 익명 신청 폼     | ✅   | Daum 주소 검색 API 통합 완료 |
| SessionId 관리   | ✅   | 클라이언트 자동 생성 및 관리 |
| 신청 API 호출    | ✅   | POST 요청 완성               |
| 상태 조회 페이지 | ✅   | UI 완성, API 대기 중         |
| 자동 새로고침    | ✅   | 30초마다 상태 조회           |

### 백엔드 ⏳ 진행 중

| 항목          | 상태 | 설명                                                              |
| ------------- | ---- | ----------------------------------------------------------------- |
| 신청 생성 API | ✅   | POST `/api/letters/:letterId/physical-request`                    |
| 상태 조회 API | ❌   | GET `/api/letters/:letterId/physical-request/:requestId` **필요** |

## 🎯 필요한 백엔드 구현

### 엔드포인트

```
GET /api/letters/:letterId/physical-request/:requestId
```

### 요청 예시

```bash
GET http://localhost:5001/api/letters/69539566ad99d5d0ee5021d4/physical-request/mjtd99f82pcgilz9r
```

### 응답 예시 (성공)

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

### 응답 예시 (에러)

```json
{
  "success": false,
  "error": "신청을 찾을 수 없습니다."
}
```

## 📋 구현 체크리스트

백엔드 팀이 확인해야 할 사항:

### 1. 라우트 등록 확인

- [ ] `GET /api/letters/:letterId/physical-request/:requestId` 라우트가 등록되어 있는가?
- [ ] 라우트 순서가 올바른가? (더 구체적인 라우트가 먼저)
- [ ] 라우트 파일에서 해당 라우트를 찾을 수 있는가?

### 2. 컨트롤러 함수 확인

- [ ] `getPhysicalRequestStatus` 또는 유사한 함수가 구현되어 있는가?
- [ ] 함수가 올바른 라우트에 연결되어 있는가?
- [ ] 함수가 위의 응답 형식을 반환하는가?

### 3. 데이터베이스 확인

- [ ] `PhysicalRequest` 컬렉션/테이블에 데이터가 저장되는가?
- [ ] `requestId`로 조회 가능한가?
- [ ] 필요한 필드가 모두 저장되는가?

### 4. 테스트

```bash
# 테스트 요청
curl -X GET http://localhost:5001/api/letters/69539566ad99d5d0ee5021d4/physical-request/mjtd99f82pcgilz9r

# 예상 결과: 200 OK + 위의 응답 형식
# 현재 결과: 404 Not Found + "Route not found"
```

## 🔍 문제 진단

### 가능한 원인

1. **라우트가 등록되지 않음**

   - 라우터 파일에서 해당 라우트를 찾을 수 없음
   - 라우트 파일이 메인 앱에 연결되지 않음

2. **라우트 순서 문제**

   - 더 일반적인 라우트가 먼저 등록되어 있음
   - 예: `/api/letters/:letterId/physical-request/user` 가 먼저 등록되면 `:requestId`가 "user"로 인식됨

3. **컨트롤러 함수 미구현**

   - 라우트는 등록되었지만 함수가 구현되지 않음
   - 함수가 다른 이름으로 구현됨

4. **데이터 저장 문제**
   - 신청 생성 시 `requestId`가 저장되지 않음
   - 신청 정보가 데이터베이스에 저장되지 않음

## 📞 커뮤니케이션 방법

### 1. 상세 구현 프롬프트

`docs/BACKEND_IMPLEMENTATION_PROMPT.md` 참고

### 2. 이슈 리포트

`docs/BACKEND_ISSUE_REPORT.md` 참고

### 3. API 요청 형식

`docs/API_REQUEST_FORMAT.md` 참고

## 🚀 다음 단계

### 백엔드 구현 후

1. 엔드포인트 구현
2. 로컬 테스트
3. 응답 형식 확인
4. 프론트엔드에 알림

### 프론트엔드 대응

1. 백엔드 API 확인
2. 통합 테스트
3. 배포

## 📝 참고 자료

### 프론트엔드 구현 파일

- `lib/recipient-api.ts` - API 호출 함수
- `components/letter/AnonymousPhysicalRequestForm.tsx` - 신청 폼
- `components/letter/AnonymousPhysicalStatusTracker.tsx` - 상태 조회 페이지
- `app/letter/[letterId]/request/[requestId]/page.tsx` - 상태 조회 라우트

### 문서

- `docs/ANONYMOUS_PHYSICAL_REQUEST.md` - 전체 구현 가이드
- `docs/API_REQUEST_FORMAT.md` - API 요청/응답 형식
- `docs/DAUM_ADDRESS_INTEGRATION.md` - Daum 주소 검색 API
- `docs/BACKEND_IMPLEMENTATION_PROMPT.md` - 백엔드 구현 프롬프트

## 💬 메시지 템플릿

### 백엔드 팀에 전달할 메시지

```
안녕하세요,

프론트엔드에서 익명 사용자 실물 편지 신청 기능을 완성했습니다.

현재 다음 엔드포인트가 필요합니다:

GET /api/letters/:letterId/physical-request/:requestId

상세한 구현 요구사항은 다음 문서를 참고해주세요:
- docs/BACKEND_IMPLEMENTATION_PROMPT.md
- docs/API_REQUEST_FORMAT.md

테스트 요청:
GET http://localhost:5001/api/letters/69539566ad99d5d0ee5021d4/physical-request/mjtd99f82pcgilz9r

현재 에러:
404 Not Found - "Route not found"

감사합니다!
```

## ✅ 완료 기준

다음 조건을 모두 만족하면 완료:

- [ ] `GET /api/letters/:letterId/physical-request/:requestId` 엔드포인트 구현
- [ ] 응답 형식이 문서와 일치
- [ ] 테스트 요청에서 200 OK 응답
- [ ] 신청 정보가 올바르게 반환됨
- [ ] 에러 처리 구현 (404, 400 등)

## 🎯 최종 목표

프론트엔드와 백엔드가 완벽하게 연동되어 다음 흐름이 정상 작동:

```
1. 사용자가 익명 신청 폼 작성
2. 신청 제출 (POST /api/letters/:letterId/physical-request)
3. 백엔드에서 신청 생성 및 requestId 반환
4. 프론트엔드가 상태 조회 페이지로 이동
5. 상태 조회 API 호출 (GET /api/letters/:letterId/physical-request/:requestId)
6. 신청 상태 표시 및 30초마다 자동 새로고침
```
