# 🚀 백엔드 개발자 빠른 프롬프트

## 📋 요청 사항

**공개 사연 목록 조회 API**를 구현해주세요.

---

## 🎯 구현할 API

### `GET /api/letters/stories`

**Query Parameters**:

- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 20, 최대: 100)
- `search` (optional): 검색어 (제목, 내용, 작성자명)
- `sort` (optional): 정렬 (latest, oldest, popular)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "story_id",
      "type": "story",
      "title": "제목",
      "content": "내용",
      "authorName": "작성자",
      "ogTitle": "OG 제목",
      "ogPreviewText": "미리보기 텍스트",
      "createdAt": "2025-12-17T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 📊 필요한 스키마 수정

### Letter 모델에 `type` 필드 추가

```javascript
type: {
  type: String,
  enum: ["story", "friend"],
  required: true,
  default: "story",
  index: true, // 성능을 위한 인덱스
}
```

---

## 🔧 구현 요구사항

1. **필터링**: `type: "story"`인 것만 조회
2. **검색**: title, content, authorName에서 검색
3. **정렬**:
   - `latest`: 최신순 (createdAt: -1)
   - `oldest`: 오래된순 (createdAt: 1)
   - `popular`: 인기순 (추후 구현)
4. **페이지네이션**: skip/limit 사용
5. **보안**: address, receiverEmail 등 민감 정보 제외
6. **인증**: 불필요 (누구나 조회 가능)

---

## 📝 구현 예시 코드

```javascript
router.get("/stories", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const search = req.query.search || "";
    const sort = req.query.sort || "latest";

    // 기본 쿼리
    const query = { type: "story" };

    // 검색 조건
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { authorName: { $regex: search, $options: "i" } },
      ];
    }

    // 정렬
    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    // 페이지네이션
    const skip = (page - 1) * limit;

    // 데이터 조회
    const [stories, total] = await Promise.all([
      Letter.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select("-__v -address -receiverEmail")
        .lean(),
      Letter.countDocuments(query),
    ]);

    // 응답
    res.json({
      success: true,
      data: stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "사연 목록을 불러오는데 실패했습니다",
    });
  }
});
```

---

## ✅ 체크리스트

- [ ] Letter 모델에 `type` 필드 추가
- [ ] `type` 필드에 인덱스 추가
- [ ] `GET /api/letters/stories` 엔드포인트 구현
- [ ] 검색 기능 구현
- [ ] 정렬 기능 구현
- [ ] 페이지네이션 구현
- [ ] 민감 정보 제외
- [ ] CORS 설정 확인
- [ ] 테스트 완료

---

## 🧪 테스트

```bash
# 기본 조회
curl http://localhost:5001/api/letters/stories

# 검색
curl "http://localhost:5001/api/letters/stories?search=엄마"

# 페이지네이션
curl "http://localhost:5001/api/letters/stories?page=2&limit=10"

# 정렬
curl "http://localhost:5001/api/letters/stories?sort=oldest"
```

---

## 📚 상세 문서

더 자세한 내용은 `BACKEND_STORIES_API_PROMPT.md` 파일을 참고하세요.

---

**구현 완료 후 프론트엔드에 알려주세요!** 🎉
