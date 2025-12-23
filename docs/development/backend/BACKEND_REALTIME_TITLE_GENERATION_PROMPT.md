# 🔧 백엔드 프롬프트 - 실시간 AI 제목 생성 대응 및 편지 생성 API 구현

## 📋 요구사항

Node.js + Express + MongoDB 백엔드에 **실시간 AI 제목 생성에 대응하는 편지 생성 API**를 구현해주세요.

---

## 🎯 구현할 기능

### 1. 편지 생성 API 구현

- **프론트엔드에서 AI 생성된 제목을 받아 처리**
- **URL 공유 시스템**: 편지별 고유 URL 생성
- **OG 메타태그 지원**: 카카오톡, 페이스북 등에서 미리보기 제공
- **조회수 추적**: 편지 열람 시 조회수 증가

### 2. 기존 API와의 호환성

- **사연 등록 API**: 기존 `POST /api/letters` 유지
- **편지 생성 API**: 새로운 `POST /api/letters/create` 추가
- **편지 조회 API**: `GET /api/letters/:letterId` 개선

---

## 🛠 기술 스택

- **백엔드**: Node.js + Express
- **데이터베이스**: MongoDB + Mongoose
- **인증**: JWT
- **URL 생성**: MongoDB ObjectId 기반

---

## 📁 구현할 API

### 1. `POST /api/letters/create` (편지 생성 - 새로 추가)

**요청 구조:**

```json
{
  "title": "AI가 생성한 제목",
  "content": "편지 내용",
  "type": "friend",
  "ogTitle": "AI가 생성한 제목",
  "ogPreviewText": "OG 미리보기"
}
```

**응답 구조:**

```json
{
  "message": "편지가 성공적으로 생성되었습니다.",
  "data": {
    "_id": "674a1b2c3d4e5f6789012345",
    "title": "AI가 생성한 제목",
    "url": "https://letter-community.com/letter/674a1b2c3d4e5f6789012345",
    "type": "friend",
    "createdAt": "2024-12-18T10:30:00.000Z"
  }
}
```

### 2. `POST /api/letters` (사연 등록 - 기존 유지)

**기존 사연 등록 API는 그대로 유지**하되, 편지 타입 구분 로직 개선

### 3. `GET /api/letters/:letterId` (편지 조회 - 개선)

**조회수 증가 및 메타데이터 포함**

---

## 🔧 구현 세부사항

### 1. 편지 생성 API

```javascript
// routes/letters.js
const express = require("express");
const router = express.Router();
const Letter = require("../models/Letter");
const { authenticateToken } = require("../middleware/auth");

/**
 * 편지 생성 API (URL 공유용)
 * POST /api/letters/create
 */
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { title, content, type, ogTitle, ogPreviewText } = req.body;
    const senderId = req.user.id;

    // 유효성 검사
    if (!title || !content) {
      return res.status(400).json({
        error: "제목과 내용은 필수입니다.",
      });
    }

    if (!["story", "friend"].includes(type)) {
      return res.status(400).json({
        error: "올바른 편지 타입을 선택해주세요.",
      });
    }

    // 편지 생성
    const letter = new Letter({
      senderId,
      title: title.trim(),
      content: content.trim(),
      type,
      ogTitle: ogTitle || title.trim(),
      ogPreviewText: ogPreviewText || content.slice(0, 60) + "...",

      // URL 공유 관련 설정
      isPublic: type === "story", // 사연은 공개, 편지는 비공개
      shareableUrl: true,
      viewCount: 0,

      // AI 메타데이터 (프론트엔드에서 생성된 제목)
      aiMetadata: {
        titleGenerated: type === "friend", // 일반 편지만 AI 생성
        titleGeneratedAt: type === "friend" ? new Date() : null,
        titleGenerationModel: type === "friend" ? "gemini-1.5-flash" : null,
        generatedBy: "frontend", // 프론트엔드에서 생성됨을 표시
      },

      createdAt: new Date(),
    });

    await letter.save();

    // 편지 URL 생성
    const letterUrl = `${process.env.FRONTEND_URL}/letter/${letter._id}`;

    res.status(201).json({
      message: "편지가 성공적으로 생성되었습니다.",
      data: {
        _id: letter._id,
        title: letter.title,
        url: letterUrl,
        type: letter.type,
        createdAt: letter.createdAt,
      },
    });
  } catch (error) {
    console.error("편지 생성 실패:", error);
    res.status(500).json({
      error: "편지 생성에 실패했습니다.",
    });
  }
});

module.exports = router;
```

### 2. 기존 사연 등록 API 개선

```javascript
/**
 * 사연/편지 등록 API (기존 호환성 유지)
 * POST /api/letters
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content, type, authorName, receiverEmail, category, aiMetadata, ogTitle, ogPreviewText } = req.body;
    const senderId = req.user.id;

    // 유효성 검사
    if (!title || !content || !type) {
      return res.status(400).json({
        error: "제목, 내용, 타입은 필수입니다.",
      });
    }

    // 타입별 추가 검증
    if (type === "story" && !authorName) {
      return res.status(400).json({
        error: "사연 작성 시 작성자명은 필수입니다.",
      });
    }

    if (type === "friend" && !receiverEmail) {
      return res.status(400).json({
        error: "편지 전송 시 받는 사람 이메일은 필수입니다.",
      });
    }

    // 편지 생성
    const letterData = {
      senderId,
      title: title.trim(),
      content: content.trim(),
      type,
      ogTitle: ogTitle || title.trim(),
      ogPreviewText: ogPreviewText || content.slice(0, 60) + "...",
      isPublic: type === "story",
      shareableUrl: true,
      viewCount: 0,
      createdAt: new Date(),
    };

    // 타입별 추가 데이터
    if (type === "story") {
      letterData.authorName = authorName.trim();
      letterData.category = category || "기타";
      letterData.aiMetadata = aiMetadata || {};
    } else if (type === "friend") {
      letterData.receiverEmail = receiverEmail.trim();
      letterData.aiMetadata = aiMetadata || {
        titleGenerated: false,
        generatedBy: "user",
      };
    }

    const letter = new Letter(letterData);
    await letter.save();

    res.status(201).json({
      message: `${type === "story" ? "사연" : "편지"}이 성공적으로 등록되었습니다.`,
      data: {
        _id: letter._id,
        title: letter.title,
        type: letter.type,
        createdAt: letter.createdAt,
      },
    });
  } catch (error) {
    console.error("편지 등록 실패:", error);
    res.status(500).json({
      error: "편지 등록에 실패했습니다.",
    });
  }
});
```

### 3. 편지 조회 API 개선

```javascript
/**
 * 편지 조회 API
 * GET /api/letters/:letterId
 */
router.get("/:letterId", async (req, res) => {
  try {
    const { letterId } = req.params;

    // ObjectId 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(letterId)) {
      return res.status(400).json({
        error: "올바르지 않은 편지 ID입니다.",
      });
    }

    const letter = await Letter.findById(letterId).populate("senderId", "name email").lean();

    if (!letter) {
      return res.status(404).json({
        error: "편지를 찾을 수 없습니다.",
      });
    }

    // 조회수 증가 (비동기로 처리)
    Letter.findByIdAndUpdate(letterId, {
      $inc: { viewCount: 1 },
      $set: { lastViewedAt: new Date() },
    }).exec();

    // 응답 데이터 구성
    const responseData = {
      _id: letter._id,
      title: letter.title,
      content: letter.content,
      type: letter.type,
      senderId: letter.senderId._id,
      senderName: letter.senderId.name,
      ogTitle: letter.ogTitle,
      ogPreviewText: letter.ogPreviewText,
      createdAt: letter.createdAt,
      viewCount: letter.viewCount + 1, // 증가된 조회수 반영

      // 타입별 추가 데이터
      ...(letter.type === "story" && {
        authorName: letter.authorName,
        category: letter.category,
        isPublic: letter.isPublic,
      }),

      ...(letter.type === "friend" && {
        receiverEmail: letter.receiverEmail,
        shareableUrl: letter.shareableUrl,
      }),

      // AI 메타데이터
      aiMetadata: letter.aiMetadata,
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("편지 조회 실패:", error);
    res.status(500).json({
      error: "편지 조회에 실패했습니다.",
    });
  }
});
```

### 4. 편지 모델 스키마 업데이트

```javascript
// models/Letter.js
const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["story", "friend"],
      required: true,
    },

    // 사연 전용 필드
    authorName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    category: {
      type: String,
      enum: ["일상", "연애", "가족", "친구", "직장", "고민", "감사", "응원", "기타"],
      default: "기타",
    },

    // 편지 전용 필드
    receiverEmail: {
      type: String,
      validate: {
        validator: function (email) {
          return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "올바른 이메일 형식이 아닙니다.",
      },
    },

    // URL 공유 관련
    isPublic: {
      type: Boolean,
      default: false, // 일반 편지는 기본적으로 비공개
    },
    shareableUrl: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
    },

    // AI 생성 관련 메타데이터
    aiMetadata: {
      titleGenerated: {
        type: Boolean,
        default: false,
      },
      titleGeneratedAt: Date,
      titleGenerationModel: String,
      generatedBy: {
        type: String,
        enum: ["frontend", "backend", "user"],
        default: "user",
      },
      // 사연 카테고리 분류용
      confidence: Number,
      reason: String,
      tags: [String],
      classifiedAt: String,
      model: String,
    },

    // OG 이미지 관련
    ogTitle: String,
    ogPreviewText: String,
  },
  {
    timestamps: true,
  }
);

// 인덱스 설정
letterSchema.index({ senderId: 1, createdAt: -1 });
letterSchema.index({ type: 1, isPublic: 1, createdAt: -1 });
letterSchema.index({ viewCount: -1 });
letterSchema.index({ category: 1, type: 1 }); // 사연 카테고리별 조회용

module.exports = mongoose.model("Letter", letterSchema);
```

---

## 🔒 환경 변수 설정

```bash
# .env

# 프론트엔드 URL
FRONTEND_URL=https://letter-community.com

# 백엔드 URL
BACKEND_URL=https://api.letter-community.com

# MongoDB
MONGODB_URI=mongodb://localhost:27017/letter-community

# JWT
JWT_SECRET=your-jwt-secret-key

# 편지 생성 제한 설정
LETTER_LIMIT_PER_DAY=20
STORY_LIMIT_PER_DAY=10
```

---

## 🧪 테스트 시나리오

### 1. 편지 생성 테스트 (새 API)

```javascript
// 테스트 요청
POST /api/letters/create
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "오랜만에 안부 인사드려요",
  "content": "안녕하세요! 오랜만에 연락드려요. 요즘 어떻게 지내시나요?",
  "type": "friend",
  "ogTitle": "오랜만에 안부 인사드려요",
  "ogPreviewText": "안녕하세요! 오랜만에 연락드려요. 요즘 어떻게 지내시나요?..."
}
```

**예상 응답:**

```json
{
  "message": "편지가 성공적으로 생성되었습니다.",
  "data": {
    "_id": "674a1b2c3d4e5f6789012345",
    "title": "오랜만에 안부 인사드려요",
    "url": "https://letter-community.com/letter/674a1b2c3d4e5f6789012345",
    "type": "friend",
    "createdAt": "2024-12-18T10:30:00.000Z"
  }
}
```

### 2. 사연 등록 테스트 (기존 API)

```javascript
// 테스트 요청
POST /api/letters
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "첫 직장 생활 이야기",
  "content": "첫 직장에서의 경험을 공유하고 싶어요...",
  "type": "story",
  "authorName": "신입사원",
  "category": "직장",
  "aiMetadata": {
    "confidence": 0.85,
    "reason": "직장 관련 키워드 다수 포함",
    "tags": ["직장", "신입", "경험"],
    "classifiedAt": "2024-12-18T10:30:00.000Z",
    "model": "keyword-based-frontend"
  }
}
```

### 3. 편지 조회 테스트

```javascript
// 테스트 요청
GET /api/letters/674a1b2c3d4e5f6789012345
```

**예상 응답:**

```json
{
  "success": true,
  "data": {
    "_id": "674a1b2c3d4e5f6789012345",
    "title": "오랜만에 안부 인사드려요",
    "content": "안녕하세요! 오랜만에 연락드려요...",
    "type": "friend",
    "senderId": "674a1b2c3d4e5f6789012340",
    "senderName": "김철수",
    "ogTitle": "오랜만에 안부 인사드려요",
    "ogPreviewText": "안녕하세요! 오랜만에 연락드려요...",
    "createdAt": "2024-12-18T10:30:00.000Z",
    "viewCount": 1,
    "shareableUrl": true,
    "aiMetadata": {
      "titleGenerated": true,
      "titleGeneratedAt": "2024-12-18T10:30:00.000Z",
      "titleGenerationModel": "gemini-1.5-flash",
      "generatedBy": "frontend"
    }
  }
}
```

---

## 🔒 보안 고려사항

### 1. 입력 검증

```javascript
const { body, validationResult } = require("express-validator");

const validateLetterCreate = [
  body("title").trim().isLength({ min: 1, max: 100 }).withMessage("제목은 1-100자 이내여야 합니다."),

  body("content").trim().isLength({ min: 1, max: 10000 }).withMessage("내용은 1-10000자 이내여야 합니다."),

  body("type").isIn(["story", "friend"]).withMessage("올바른 편지 타입을 선택해주세요."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
      });
    }
    next();
  },
];
```

### 2. 스팸 방지

```javascript
// 사용자별 편지 생성 제한
const LETTER_LIMIT_PER_DAY = process.env.LETTER_LIMIT_PER_DAY || 20;

async function checkLetterLimit(senderId, type) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const letterCount = await Letter.countDocuments({
    senderId,
    type,
    createdAt: { $gte: today },
  });

  const limit = type === "story" ? 10 : 20;

  if (letterCount >= limit) {
    throw new Error(`일일 ${type === "story" ? "사연" : "편지"} 생성 한도를 초과했습니다.`);
  }
}
```

---

## 📋 체크리스트

### 구현 완료 체크

- [ ] `POST /api/letters/create` API 구현
- [ ] `POST /api/letters` API 개선 (기존 호환성 유지)
- [ ] `GET /api/letters/:letterId` API 개선
- [ ] `models/Letter.js` 스키마 업데이트
- [ ] 환경 변수 설정
- [ ] 입력 검증 로직 추가
- [ ] 스팸 방지 로직 추가
- [ ] 조회수 추적 기능 구현

### 테스트 완료 체크

- [ ] 편지 생성 API 테스트 (새 API)
- [ ] 사연 등록 API 테스트 (기존 API)
- [ ] 편지 조회 API 테스트
- [ ] URL 공유 기능 테스트
- [ ] 조회수 증가 테스트
- [ ] 입력 검증 테스트
- [ ] 스팸 방지 테스트

---

## 🔗 관련 문서

- [프론트엔드 실시간 AI 제목 생성](../../guides/ai/AI_LETTER_TITLE_GENERATION_FRONTEND_PROMPT.md)
- [백엔드 URL 공유 시스템](BACKEND_LETTER_URL_SHARING_PROMPT.md)

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 4-5시간  
**의존성**: 프론트엔드 실시간 AI 제목 생성 기능과 연동 필요

---

## 📝 주요 변경사항 요약

1. **새 API 추가**: `POST /api/letters/create` (편지 생성 전용)
2. **기존 API 유지**: `POST /api/letters` (사연/편지 통합, 호환성 유지)
3. **스키마 확장**: AI 메타데이터, 조회수, URL 공유 관련 필드 추가
4. **보안 강화**: 입력 검증, 스팸 방지, 일일 생성 제한
5. **성능 개선**: 인덱스 추가, 비동기 조회수 업데이트
