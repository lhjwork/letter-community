# 백엔드 AI 개발자용 프롬프트 - 사연 목록 API

## 📋 요구사항 개요

Letter 서비스에서 **공개 사연 목록 조회 API**를 구현해주세요.

- **기술 스택**: Node.js, Express, MongoDB, Mongoose
- **인증**: JWT 토큰 (선택적 - 로그인 없이도 조회 가능)
- **기능**: 페이지네이션, 검색, 정렬 지원

---

## 🎯 구현할 API 엔드포인트

### `GET /api/letters/stories`

공개된 사연(type: "story")만 조회하는 API

---

## 📊 데이터 모델

### Letter 스키마 (기존 스키마에 추가 필드)

```javascript
const letterSchema = new mongoose.Schema(
  {
    // 기존 필드들...
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // 🆕 추가 필드
    type: {
      type: String,
      enum: ["story", "friend"],
      required: true,
      default: "story",
      index: true, // 쿼리 성능을 위한 인덱스
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    // 사연(story)일 때 사용
    authorName: {
      type: String,
      trim: true,
    },

    // 편지(friend)일 때 사용
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    receiverEmail: {
      type: String,
      trim: true,
    },

    // OG 이미지 관련
    ogTitle: {
      type: String,
      trim: true,
    },

    ogPreviewText: {
      type: String,
      required: true,
    },

    ogImageUrl: {
      type: String,
      default: "",
    },

    ogImageType: {
      type: String,
      enum: ["auto", "custom"],
      default: "auto",
    },

    // 상태 관리
    status: {
      type: String,
      enum: [
        "created",
        "written",
        "admin_checked",
        "web_sent",
        "physical_requested",
        "writing_physical",
        "shipped",
        "delivered",
      ],
      default: "created",
    },

    physicalRequested: {
      type: Boolean,
      default: false,
    },

    // 실물 편지 주소 (선택적)
    address: {
      name: String,
      phone: String,
      zipCode: String,
      address1: String,
      address2: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 복합 인덱스 추가 (성능 최적화)
letterSchema.index({ type: 1, createdAt: -1 });
letterSchema.index({ type: 1, title: "text", content: "text" }); // 텍스트 검색용
```

---

## 🔧 API 구현 요구사항

### Endpoint: `GET /api/letters/stories`

#### Query Parameters

| 파라미터 | 타입   | 필수 | 기본값 | 설명                               |
| -------- | ------ | ---- | ------ | ---------------------------------- |
| page     | number | ❌   | 1      | 페이지 번호 (1부터 시작)           |
| limit    | number | ❌   | 20     | 페이지당 항목 수 (최대 100)        |
| search   | string | ❌   | -      | 제목 또는 내용 검색 (부분 일치)    |
| sort     | string | ❌   | latest | 정렬 방식: latest, oldest, popular |

#### 요청 예시

```bash
# 기본 조회 (최신순, 20개)
GET /api/letters/stories

# 페이지네이션
GET /api/letters/stories?page=2&limit=10

# 검색
GET /api/letters/stories?search=엄마

# 정렬
GET /api/letters/stories?sort=oldest

# 복합 조건
GET /api/letters/stories?page=1&limit=20&search=사랑&sort=latest
```

#### 응답 형식 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "_id": "story_id_1",
      "type": "story",
      "title": "엄마에게 보내는 편지",
      "content": "엄마, 항상 고마워요...",
      "authorName": "딸",
      "ogTitle": "엄마에게 보내는 편지",
      "ogPreviewText": "엄마, 항상 고마워요. 말로 표현하지 못했지만...",
      "ogImageUrl": "https://example.com/og/story_id_1.png",
      "ogImageType": "auto",
      "status": "written",
      "createdAt": "2025-12-17T10:30:00.000Z",
      "updatedAt": "2025-12-17T10:30:00.000Z"
    },
    {
      "_id": "story_id_2",
      "type": "story",
      "title": "첫사랑에게",
      "content": "오랜만이야. 잘 지내고 있니?...",
      "authorName": "익명",
      "ogTitle": "첫사랑에게",
      "ogPreviewText": "오랜만이야. 잘 지내고 있니? 나는 요즘...",
      "ogImageUrl": "https://example.com/og/story_id_2.png",
      "ogImageType": "auto",
      "status": "written",
      "createdAt": "2025-12-17T09:15:00.000Z",
      "updatedAt": "2025-12-17T09:15:00.000Z"
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

#### 에러 응답

```json
// 400 Bad Request - 잘못된 파라미터
{
  "success": false,
  "message": "Invalid page or limit parameter"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "서버 오류가 발생했습니다"
}
```

---

## 💻 구현 코드 예시

### 라우터 구현 (routes/letters.js)

```javascript
const express = require("express");
const router = express.Router();
const Letter = require("../models/Letter");

/**
 * GET /api/letters/stories
 * 공개 사연 목록 조회
 */
router.get("/stories", async (req, res) => {
  try {
    // Query 파라미터 파싱
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // 최대 100개
    const search = req.query.search || "";
    const sort = req.query.sort || "latest";

    // 유효성 검사
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit parameter",
      });
    }

    // 기본 쿼리: type이 "story"인 것만
    const query = { type: "story" };

    // 검색 조건 추가
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } }, // 대소문자 무시
        { content: { $regex: search, $options: "i" } },
        { authorName: { $regex: search, $options: "i" } },
      ];
    }

    // 정렬 조건
    let sortOption = {};
    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 }; // 최신순
        break;
      case "oldest":
        sortOption = { createdAt: 1 }; // 오래된순
        break;
      case "popular":
        // TODO: 조회수나 좋아요 수 기준 정렬 (추후 구현)
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    // 데이터 조회
    const [stories, total] = await Promise.all([
      Letter.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select("-__v -address") // 민감한 정보 제외
        .lean(), // 성능 최적화
      Letter.countDocuments(query),
    ]);

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 응답
    res.json({
      success: true,
      data: stories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({
      success: false,
      message: "사연 목록을 불러오는데 실패했습니다",
    });
  }
});

module.exports = router;
```

### 라우터 등록 (app.js 또는 server.js)

```javascript
const express = require("express");
const app = express();
const letterRoutes = require("./routes/letters");

// 미들웨어
app.use(express.json());

// 라우터 등록
app.use("/api/letters", letterRoutes);

// 서버 시작
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🧪 테스트 방법

### 1. 기본 조회

```bash
curl -X GET "http://localhost:5001/api/letters/stories" \
  -H "Content-Type: application/json"
```

### 2. 페이지네이션

```bash
curl -X GET "http://localhost:5001/api/letters/stories?page=2&limit=10" \
  -H "Content-Type: application/json"
```

### 3. 검색

```bash
curl -X GET "http://localhost:5001/api/letters/stories?search=엄마" \
  -H "Content-Type: application/json"
```

### 4. 정렬

```bash
curl -X GET "http://localhost:5001/api/letters/stories?sort=oldest" \
  -H "Content-Type: application/json"
```

### 5. 복합 조건

```bash
curl -X GET "http://localhost:5001/api/letters/stories?page=1&limit=20&search=사랑&sort=latest" \
  -H "Content-Type: application/json"
```

---

## ✅ 체크리스트

구현 시 다음 사항을 확인해주세요:

- [ ] Letter 모델에 `type` 필드 추가 (enum: ["story", "friend"])
- [ ] `type` 필드에 인덱스 추가 (성능 최적화)
- [ ] `GET /api/letters/stories` 엔드포인트 구현
- [ ] Query 파라미터 파싱 (page, limit, search, sort)
- [ ] type이 "story"인 것만 필터링
- [ ] 검색 기능 구현 (title, content, authorName)
- [ ] 정렬 기능 구현 (latest, oldest, popular)
- [ ] 페이지네이션 구현
- [ ] 민감한 정보 제외 (address, \_\_v)
- [ ] 에러 핸들링
- [ ] CORS 설정 (프론트엔드 도메인 허용)
- [ ] 테스트 완료

---

## 🔒 보안 고려사항

1. **민감한 정보 제외**: `address`, `receiverEmail` 등은 응답에서 제외
2. **Rate Limiting**: 과도한 요청 방지 (선택적)
3. **Input Validation**: Query 파라미터 검증
4. **SQL Injection 방지**: Mongoose를 사용하므로 기본적으로 방지됨

---

## 🚀 성능 최적화

1. **인덱스 추가**:

   ```javascript
   letterSchema.index({ type: 1, createdAt: -1 });
   ```

2. **Lean 쿼리 사용**:

   ```javascript
   .lean() // Mongoose 문서 대신 순수 객체 반환
   ```

3. **필드 선택**:

   ```javascript
   .select("-__v -address") // 불필요한 필드 제외
   ```

4. **병렬 쿼리**:
   ```javascript
   await Promise.all([Letter.find(query), Letter.countDocuments(query)]);
   ```

---

## 📝 추가 구현 사항 (선택적)

### 1. 조회수 기능

```javascript
// Letter 스키마에 추가
viewCount: {
  type: Number,
  default: 0,
  index: true,
}

// 사연 상세 조회 시 조회수 증가
router.get("/:letterId", async (req, res) => {
  const letter = await Letter.findByIdAndUpdate(
    req.params.letterId,
    { $inc: { viewCount: 1 } },
    { new: true }
  );
  res.json({ success: true, data: letter });
});
```

### 2. 좋아요 기능

```javascript
// Letter 스키마에 추가
likeCount: {
  type: Number,
  default: 0,
  index: true,
}

likes: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
}]
```

### 3. 인기순 정렬

```javascript
case "popular":
  sortOption = {
    viewCount: -1,
    likeCount: -1,
    createdAt: -1
  };
  break;
```

---

## 🌐 CORS 설정

프론트엔드에서 API 호출이 가능하도록 CORS 설정:

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:3000", // 로컬 개발
      "https://your-frontend-domain.vercel.app", // 프로덕션
    ],
    credentials: true,
  })
);
```

---

## 📚 참고 문서

- [Mongoose 쿼리 문서](https://mongoosejs.com/docs/queries.html)
- [MongoDB 인덱스](https://www.mongodb.com/docs/manual/indexes/)
- [Express 라우팅](https://expressjs.com/en/guide/routing.html)

---

**구현 완료 후 프론트엔드에 알려주세요!** 🎉
