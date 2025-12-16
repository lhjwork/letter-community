# Backend API 명세서

## 필요한 API 엔드포인트

### 1. 내가 쓴 편지 목록 조회

**Endpoint:** `GET /api/letters/my`

**Headers:**

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**설명:**

- 현재 로그인한 사용자가 작성한 편지 목록을 반환
- JWT 토큰으로 사용자 인증
- 작성일 기준 내림차순 정렬

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "letter_id_1",
      "title": "편지 제목",
      "content": "<p>편지 내용 HTML</p>",
      "authorName": "작성자명",
      "ogPreviewMessage": "OG 미리보기 메시지",
      "ogBgColor": "#FFF5F5",
      "ogIllustration": "💌",
      "ogFontSize": 48,
      "ogImageUrl": "https://example.com/og-image.png",
      "ogImageType": "auto",
      "createdAt": "2025-12-11T10:30:00.000Z",
      "updatedAt": "2025-12-11T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**

```json
// 401 Unauthorized - 토큰 없음 또는 유효하지 않음
{
  "success": false,
  "message": "Unauthorized"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "서버 오류가 발생했습니다"
}
```

---

### 2. 편지 삭제

**Endpoint:** `DELETE /api/letters/{letterId}`

**Headers:**

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Parameters:**

- `letterId` (path): 삭제할 편지의 ID

**설명:**

- 현재 로그인한 사용자가 작성한 편지만 삭제 가능
- 다른 사용자의 편지 삭제 시도 시 403 Forbidden 반환

**Response (200 OK):**

```json
{
  "success": true,
  "message": "편지가 삭제되었습니다",
  "data": {
    "_id": "deleted_letter_id"
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized
{
  "success": false,
  "message": "Unauthorized"
}

// 403 Forbidden - 다른 사용자의 편지
{
  "success": false,
  "message": "이 편지를 삭제할 권한이 없습니다"
}

// 404 Not Found
{
  "success": false,
  "message": "편지를 찾을 수 없습니다"
}
```

---

## 구현 가이드 (Express.js 예시)

### 편지 모델 스키마 (Mongoose)

```javascript
const letterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    ogPreviewMessage: {
      type: String,
      default: "",
    },
    ogBgColor: {
      type: String,
      default: "#FFF5F5",
    },
    ogIllustration: {
      type: String,
      default: "💌",
    },
    ogFontSize: {
      type: Number,
      default: 48,
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
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);
```

### 라우터 구현 예시

```javascript
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

// 내가 쓴 편지 목록 조회
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // JWT 토큰에서 추출한 사용자 ID

    const letters = await Letter.find({ userId })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .select("-__v"); // __v 필드 제외

    res.json({
      success: true,
      data: letters,
    });
  } catch (error) {
    console.error("Error fetching user letters:", error);
    res.status(500).json({
      success: false,
      message: "편지 목록을 불러오는데 실패했습니다",
    });
  }
});

// 편지 삭제
router.delete("/:letterId", authenticateToken, async (req, res) => {
  try {
    const { letterId } = req.params;
    const userId = req.user._id;

    const letter = await Letter.findById(letterId);

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "편지를 찾을 수 없습니다",
      });
    }

    // 작성자 확인
    if (letter.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "이 편지를 삭제할 권한이 없습니다",
      });
    }

    await Letter.findByIdAndDelete(letterId);

    res.json({
      success: true,
      message: "편지가 삭제되었습니다",
      data: {
        _id: letterId,
      },
    });
  } catch (error) {
    console.error("Error deleting letter:", error);
    res.status(500).json({
      success: false,
      message: "편지 삭제에 실패했습니다",
    });
  }
});

module.exports = router;
```

### 인증 미들웨어 예시

```javascript
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = user; // user 객체를 request에 추가
    next();
  });
}

module.exports = { authenticateToken };
```

---

## 기존 API 수정 필요사항

### `POST /api/letters` - 편지 생성 시 userId 추가

편지 생성 시 JWT 토큰에서 추출한 `userId`를 편지 문서에 저장해야 합니다:

```javascript
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content, authorName } = req.body;
    const userId = req.user._id; // JWT에서 사용자 ID 추출

    const letter = new Letter({
      userId, // 추가!
      title,
      content,
      authorName,
    });

    await letter.save();

    res.status(201).json({
      success: true,
      data: letter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "편지 생성에 실패했습니다",
    });
  }
});
```

---

## 테스트 방법

### 1. 내가 쓴 편지 목록 조회

```bash
curl -X GET http://localhost:5001/api/letters/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. 편지 삭제

```bash
curl -X DELETE http://localhost:5001/api/letters/LETTER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 주요 확인 사항

1. ✅ JWT 토큰 검증이 올바르게 작동하는지
2. ✅ Letter 모델에 `userId` 필드가 있는지
3. ✅ 편지 생성 시 `userId`가 저장되는지
4. ✅ 다른 사용자의 편지 삭제 시도 시 403 에러 반환되는지
5. ✅ CORS 설정이 프론트엔드 도메인을 허용하는지

---

---

### 3. 공개 사연 목록 조회

**Endpoint:** `GET /api/letters/stories`

**Headers:**

```
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 20, 최대: 100)
- `search` (optional): 검색어 (제목, 내용, 작성자명)
- `sort` (optional): 정렬 방식 (latest, oldest, popular)

**설명:**

- type이 "story"인 공개 사연만 조회
- 인증 불필요 (누구나 조회 가능)
- 페이지네이션, 검색, 정렬 지원

**Response (200 OK):**

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

**Error Responses:**

```json
// 400 Bad Request
{
  "success": false,
  "message": "Invalid page or limit parameter"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "사연 목록을 불러오는데 실패했습니다"
}
```

---

## 환경 변수

```env
JWT_SECRET=your-jwt-secret-key
MONGODB_URI=mongodb://localhost:27017/letter-community
PORT=5001
```

---

## 상세 구현 가이드

사연 목록 API의 상세한 구현 방법은 `BACKEND_STORIES_API_PROMPT.md` 파일을 참고하세요.
