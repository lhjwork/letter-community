# 백엔드 API 수정 요구사항

## 개요

프론트엔드의 `/my-page` 화면을 `/stories` 페이지처럼 인피니티 스크롤과 카드 레이아웃으로 변경하기 위해 백엔드 API 수정이 필요합니다.

## 수정 대상 API

### 1. GET `/api/letters/my` - 내 편지 목록 조회 API

**현재 상태**: 페이지네이션 미지원 (전체 편지 목록 반환)
**수정 요구사항**: 페이지네이션 지원 추가

#### 요청 파라미터 (Query Parameters)

```
- page: number (선택, 기본값: 1) - 페이지 번호
- limit: number (선택, 기본값: 20) - 페이지당 항목 수
```

#### 응답 형식

```json
{
  "success": true,
  "data": [
    {
      "_id": "편지ID",
      "title": "편지 제목",
      "content": "편지 내용",
      "authorName": "작성자명",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "type": "story" | "friend",
      "category": "카테고리",
      "ogPreviewMessage": "OG 미리보기 메시지",
      "ogBgColor": "OG 배경색",
      "ogIllustration": "OG 일러스트",
      "ogFontSize": 16
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 구현 예시 (Node.js/Express + MongoDB)

```javascript
// GET /api/letters/my
app.get("/api/letters/my", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // 페이지네이션 계산
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 총 개수 조회
    const total = await Letter.countDocuments({
      userId: userId,
      type: { $in: ["story", "friend"] },
    });

    // 편지 목록 조회 (페이지네이션 적용)
    const letters = await Letter.find({
      userId: userId,
      type: { $in: ["story", "friend"] },
    })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 페이지네이션 메타데이터 계산
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: letters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("내 편지 목록 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "편지 목록을 불러오는데 실패했습니다.",
    });
  }
});
```

## 기존 API와의 호환성

### 기존 호출 방식

```javascript
GET / api / letters / my;
```

### 새로운 호출 방식 (하위 호환성 유지)

```javascript
GET /api/letters/my                    // 기본값: page=1, limit=20
GET /api/letters/my?page=1&limit=20    // 명시적 파라미터
GET /api/letters/my?page=2&limit=10    // 2페이지, 10개씩
```

## 주요 변경사항

1. **페이지네이션 지원**: `page`, `limit` 쿼리 파라미터 추가
2. **응답 구조 변경**: `pagination` 객체 추가
3. **정렬 기준**: `createdAt` 기준 내림차순 (최신순)
4. **하위 호환성**: 기존 파라미터 없는 호출도 지원 (기본값 적용)

## 테스트 케이스

### 1. 기본 호출 (첫 페이지)

```bash
GET /api/letters/my
Authorization: Bearer {token}
```

### 2. 특정 페이지 호출

```bash
GET /api/letters/my?page=2&limit=10
Authorization: Bearer {token}
```

### 3. 빈 결과 처리

```bash
GET /api/letters/my?page=999
Authorization: Bearer {token}

# 응답
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 999,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": false,
    "hasPrevPage": true
  }
}
```

## 에러 처리

### 잘못된 파라미터

```javascript
// page나 limit이 음수이거나 0인 경우
if (parseInt(page) < 1 || parseInt(limit) < 1) {
  return res.status(400).json({
    success: false,
    message: "page와 limit은 1 이상의 값이어야 합니다.",
  });
}

// limit이 너무 큰 경우 (선택사항)
if (parseInt(limit) > 100) {
  return res.status(400).json({
    success: false,
    message: "limit은 100을 초과할 수 없습니다.",
  });
}
```

## 성능 고려사항

1. **인덱스 확인**: `userId`와 `createdAt` 필드에 복합 인덱스 생성 권장

   ```javascript
   // MongoDB 인덱스 생성 예시
   db.letters.createIndex({ userId: 1, createdAt: -1 });
   ```

2. **쿼리 최적화**: `lean()` 사용으로 성능 향상
3. **캐싱**: 필요시 Redis 등을 활용한 캐싱 고려

## 배포 시 주의사항

1. **기존 프론트엔드 호환성**: 기존 코드가 새로운 응답 구조를 처리할 수 있는지 확인
2. **점진적 배포**: 백엔드 먼저 배포 후 프론트엔드 배포 권장
3. **모니터링**: API 응답 시간 및 에러율 모니터링

## 완료 확인 체크리스트

- [ ] 페이지네이션 파라미터 처리 구현
- [ ] 응답 구조에 pagination 객체 추가
- [ ] 기존 호출 방식 하위 호환성 확인
- [ ] 에러 처리 구현
- [ ] 인덱스 생성 (성능 최적화)
- [ ] 단위 테스트 작성
- [ ] API 문서 업데
