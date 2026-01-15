# 메인 랜딩 페이지 사연 목록 API 구현 요청

## 개요

메인 랜딩 페이지에 표시할 사연 목록 API를 구현해주세요. 로그인 여부와 관계없이 모든 사용자가 접근 가능해야 하며, 최신 사연 4개를 반환합니다.

## 요구사항

### 1. API 엔드포인트

```
GET /api/letters/stories/featured
```

### 2. 인증

- **인증 불필요** (Public API)
- 로그인하지 않은 사용자도 접근 가능

### 3. 쿼리 파라미터

없음 (고정된 4개의 사연만 반환)

### 4. 응답 형식

#### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "_id": "letter_id_1",
      "title": "사연 제목",
      "content": "사연 내용 (HTML 형식)",
      "authorName": "작성자 닉네임",
      "category": "friendship",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "viewCount": 150,
      "likeCount": 25
    },
    {
      "_id": "letter_id_2",
      "title": "사연 제목 2",
      "content": "사연 내용 2",
      "authorName": "작성자2",
      "category": "love",
      "createdAt": "2024-01-14T15:20:00.000Z",
      "viewCount": 200,
      "likeCount": 30
    }
    // ... 총 4개
  ]
}
```

#### 에러 응답 (500 Internal Server Error)

```json
{
  "success": false,
  "message": "서버 오류가 발생했습니다"
}
```

### 5. 비즈니스 로직

#### 사연 선택 기준

1. **상태**: `status: "approved"` (승인된 사연만)
2. **타입**: `type: "story"` (사연 타입만)
3. **정렬**: `createdAt` 기준 내림차순 (최신순)
4. **개수**: 정확히 4개
5. **공개 여부**: 공개 설정된 사연만 (만약 공개/비공개 필드가 있다면)

#### 반환 필드

- `_id`: 사연 고유 ID
- `title`: 사연 제목 (없으면 null 또는 빈 문자열)
- `content`: 사연 내용 (HTML 형식)
- `authorName`: 작성자 닉네임
- `category`: AI 분류 카테고리 (예: "friendship", "love", "family", "gratitude", "apology", "encouragement", "memory", "other")
- `createdAt`: 작성일시 (ISO 8601 형식)
- `viewCount`: 조회수 (선택사항)
- `likeCount`: 좋아요 수 (선택사항)

#### 데이터가 4개 미만인 경우

- 있는 만큼만 반환 (1~3개도 허용)
- 빈 배열도 허용 (사연이 없는 경우)

### 6. 성능 고려사항

- 메인 페이지에서 자주 호출되므로 **캐싱 권장** (예: 5분)
- 인덱스 설정:
  - `type` + `status` + `createdAt` 복합 인덱스
  - 또는 기존 인덱스 활용

### 7. 기존 API와의 차이점

| 항목         | 기존 `/api/letters/stories`   | 신규 `/api/letters/stories/featured` |
| ------------ | ----------------------------- | ------------------------------------ |
| 인증         | 불필요                        | 불필요                               |
| 페이지네이션 | 있음 (page, limit)            | 없음 (고정 4개)                      |
| 필터링       | 있음 (search, category, sort) | 없음 (최신순 고정)                   |
| 용도         | 사연 목록 페이지              | 메인 랜딩 페이지                     |

## 구현 예시 (참고용)

### MongoDB Query 예시

```javascript
const featuredStories = await Letter.find({
  type: "story",
  status: "approved",
  // isPublic: true, // 공개/비공개 필드가 있다면
})
  .sort({ createdAt: -1 })
  .limit(4)
  .select("_id title content authorName category createdAt viewCount likeCount")
  .lean();
```

### Express Route 예시

```javascript
router.get("/api/letters/stories/featured", async (req, res) => {
  try {
    const stories = await Letter.find({
      type: "story",
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .select(
        "_id title content authorName category createdAt viewCount likeCount"
      )
      .lean();

    res.json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error("Featured stories fetch error:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});
```

## 테스트 케이스

### 1. 정상 케이스

```bash
curl -X GET http://localhost:8000/api/letters/stories/featured
```

**예상 결과**: 최신 사연 4개 반환 (200 OK)

### 2. 사연이 없는 경우

**예상 결과**: 빈 배열 반환

```json
{
  "success": true,
  "data": []
}
```

### 3. 사연이 4개 미만인 경우

**예상 결과**: 있는 만큼만 반환 (예: 2개)

```json
{
  "success": true,
  "data": [
    {
      /* story 1 */
    },
    {
      /* story 2 */
    }
  ]
}
```

## 프론트엔드 연동 정보

### API 호출 위치

- `app/(beforeLogin)/page.tsx` (로그인 전 메인 페이지)
- `app/home/page.tsx` (로그인 후 메인 페이지)

### 사용 방식

서버 컴포넌트에서 직접 호출하여 SSR로 렌더링

```typescript
// 프론트엔드 예시
async function getFeaturedStories() {
  const response = await fetch(`${BACKEND_URL}/api/letters/stories/featured`);
  const result = await response.json();
  return result.data;
}
```

## 추가 요청사항

1. **캐싱**: Redis 또는 메모리 캐싱으로 5분간 캐시 권장
2. **에러 로깅**: 에러 발생 시 상세 로그 기록
3. **모니터링**: 응답 시간 모니터링 (목표: 100ms 이내)

## 완료 체크리스트

- [ ] API 엔드포인트 구현 (`GET /api/letters/stories/featured`)
- [ ] 승인된 사연만 필터링 (`status: "approved"`)
- [ ] 최신순 정렬 (`createdAt` 내림차순)
- [ ] 4개 제한 (`limit: 4`)
- [ ] 필요한 필드만 반환 (select)
- [ ] 에러 핸들링
- [ ] 캐싱 구현 (선택사항)
- [ ] 테스트 완료
- [ ] API 문서 업데이트

## 질문 및 문의

구현 중 궁금한 사항이 있으면 언제든 문의해주세요!
