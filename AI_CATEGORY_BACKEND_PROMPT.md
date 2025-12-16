# 🔧 백엔드 AI 프롬프트 - 사연 자동 분류

## 📋 요구사항

Node.js + Express + MongoDB 백엔드에 **AI 자동 분류 카테고리** 기능을 추가해주세요.

---

## 🎯 구현할 기능

1. Letter 모델에 **category** 및 **aiMetadata** 필드 추가
2. 사연 등록 시 카테고리 저장
3. 사연 목록 조회 시 카테고리 필터링
4. 기존 사연 재분류 스크립트 (선택)

---

## 📊 1단계: Letter 모델 스키마 수정

### 파일: `models/Letter.js` (또는 해당 모델 파일)

```javascript
const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema(
  {
    // 기존 필드들...
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    type: {
      type: String,
      enum: ["story", "friend"],
      required: true,
      default: "story",
      index: true,
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
      trim: true,
    },
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverEmail: {
      type: String,
      trim: true,
    },
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
    address: {
      name: String,
      phone: String,
      zipCode: String,
      address1: String,
      address2: String,
    },

    // 🆕 AI 자동 분류 필드
    category: {
      type: String,
      enum: ["가족", "사랑", "우정", "성장", "위로", "추억", "감사", "기타"],
      default: "기타",
      index: true, // 필터링 성능 향상
    },

    // 🆕 AI 분류 메타데이터
    aiMetadata: {
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0,
      },
      reason: {
        type: String,
        default: "",
      },
      tags: {
        type: [String],
        default: [],
      },
      classifiedAt: {
        type: Date,
      },
      model: {
        type: String,
        default: "gemini-1.5-flash",
      },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 🆕 복합 인덱스 추가 (성능 최적화)
letterSchema.index({ type: 1, category: 1, createdAt: -1 });
letterSchema.index({ type: 1, category: 1 });

module.exports = mongoose.model("Letter", letterSchema);
```

---

## 📝 2단계: 사연 등록 API 수정

### 파일: `routes/letters.js` (또는 해당 라우터 파일)

**기존 POST /api/letters 엔드포인트 수정**:

```javascript
const express = require("express");
const router = express.Router();
const Letter = require("../models/Letter");
const { authenticateToken } = require("../middleware/auth");

/**
 * POST /api/letters
 * 사연/편지 등록 (AI 카테고리 포함)
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      type,
      title,
      content,
      authorName,
      receiverEmail,
      ogTitle,
      ogPreviewText,
      category, // 🆕 프론트엔드에서 AI가 분류한 카테고리
      aiMetadata, // 🆕 AI 메타데이터
    } = req.body;

    const userId = req.user._id;

    // 유효성 검사
    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "필수 필드가 누락되었습니다",
      });
    }

    // 타입별 유효성 검사
    if (type === "story" && !authorName) {
      return res.status(400).json({
        success: false,
        message: "사연 작성자명이 필요합니다",
      });
    }

    if (type === "friend" && !receiverEmail) {
      return res.status(400).json({
        success: false,
        message: "받는 사람 이메일이 필요합니다",
      });
    }

    // Letter 생성
    const letterData = {
      userId,
      type,
      title,
      content,
      ogPreviewText: ogPreviewText || content.slice(0, 60),
      ogTitle: ogTitle || title,
      status: "written",
    };

    // 타입별 필드 추가
    if (type === "story") {
      letterData.authorName = authorName;
      // 🆕 AI 분류 카테고리 추가
      letterData.category = category || "기타";
      letterData.aiMetadata = aiMetadata || {
        confidence: 0,
        reason: "카테고리 미분류",
        tags: [],
        classifiedAt: new Date(),
        model: "none",
      };
    } else if (type === "friend") {
      letterData.senderUserId = userId;
      letterData.receiverEmail = receiverEmail;
    }

    const letter = new Letter(letterData);
    await letter.save();

    res.status(201).json({
      success: true,
      data: letter,
    });
  } catch (error) {
    console.error("편지 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "편지 생성에 실패했습니다",
    });
  }
});

module.exports = router;
```

---

## 🔍 3단계: 사연 목록 API에 카테고리 필터 추가

### 파일: `routes/letters.js`

**GET /api/letters/stories 엔드포인트 수정**:

```javascript
/**
 * GET /api/letters/stories
 * 공개 사연 목록 조회 (카테고리 필터 포함)
 */
router.get("/stories", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const search = req.query.search || "";
    const sort = req.query.sort || "latest";
    const category = req.query.category || ""; // 🆕 카테고리 필터

    // 유효성 검사
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit parameter",
      });
    }

    // 기본 쿼리: type이 "story"인 것만
    const query = { type: "story" };

    // 🆕 카테고리 필터 추가
    if (category && category !== "전체보기") {
      query.category = category;
    }

    // 검색 조건 추가
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { authorName: { $regex: search, $options: "i" } },
      ];
    }

    // 정렬 조건
    let sortOption = {};
    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "popular":
        // TODO: 조회수나 좋아요 수 기준 정렬
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
        .select("-__v -address -receiverEmail") // 민감한 정보 제외
        .lean(),
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
    console.error("사연 목록 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "사연 목록을 불러오는데 실패했습니다",
    });
  }
});
```

---

## 📊 4단계: 카테고리 통계 API 추가 (선택)

### 파일: `routes/letters.js`

```javascript
/**
 * GET /api/letters/categories/stats
 * 카테고리별 사연 개수 통계
 */
router.get("/categories/stats", async (req, res) => {
  try {
    const stats = await Letter.aggregate([
      // type이 "story"인 것만
      { $match: { type: "story" } },

      // 카테고리별 그룹화
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgConfidence: { $avg: "$aiMetadata.confidence" },
        },
      },

      // 정렬 (개수 많은 순)
      { $sort: { count: -1 } },
    ]);

    // 전체 사연 수
    const total = await Letter.countDocuments({ type: "story" });

    res.json({
      success: true,
      data: {
        total,
        categories: stats.map((stat) => ({
          category: stat._id,
          count: stat.count,
          percentage: ((stat.count / total) * 100).toFixed(1),
          avgConfidence: stat.avgConfidence?.toFixed(2) || 0,
        })),
      },
    });
  } catch (error) {
    console.error("카테고리 통계 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "통계 조회에 실패했습니다",
    });
  }
});
```

---

## 🔄 5단계: 기존 사연 재분류 스크립트 (선택)

### 파일: `scripts/reclassifyStories.js`

기존에 등록된 사연들을 AI로 재분류하는 스크립트:

```javascript
const mongoose = require("mongoose");
const Letter = require("../models/Letter");
require("dotenv").config();

// 프론트엔드 AI API 호출 함수
async function classifyStory(title, content) {
  try {
    const response = await fetch("http://localhost:3000/api/ai/categorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else if (result.fallback) {
      return result.fallback;
    }

    return null;
  } catch (error) {
    console.error("AI 분류 실패:", error);
    return null;
  }
}

async function reclassifyAllStories() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB 연결 성공");

    // 카테고리가 없거나 "기타"인 사연만 조회
    const stories = await Letter.find({
      type: "story",
      $or: [
        { category: { $exists: false } },
        { category: "기타" },
        { category: null },
      ],
    });

    console.log(`재분류할 사연: ${stories.length}개`);

    let successCount = 0;
    let failCount = 0;

    for (const story of stories) {
      console.log(`\n처리 중: ${story.title}`);

      // AI 분류
      const aiResult = await classifyStory(story.title, story.content);

      if (aiResult) {
        // DB 업데이트
        story.category = aiResult.category;
        story.aiMetadata = {
          confidence: aiResult.confidence,
          reason: aiResult.reason,
          tags: aiResult.tags || [],
          classifiedAt: new Date(),
          model: "gemini-1.5-flash",
        };

        await story.save();
        console.log(
          `✅ 성공: ${aiResult.category} (신뢰도: ${aiResult.confidence})`
        );
        successCount++;
      } else {
        console.log(`❌ 실패: AI 분류 오류`);
        failCount++;
      }

      // API Rate Limit 방지 (1초 대기)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`\n\n=== 재분류 완료 ===`);
    console.log(`성공: ${successCount}개`);
    console.log(`실패: ${failCount}개`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("재분류 오류:", error);
    process.exit(1);
  }
}

// 스크립트 실행
reclassifyAllStories();
```

**실행 방법**:

```bash
node scripts/reclassifyStories.js
```

---

## 🗄️ 6단계: 데이터베이스 마이그레이션

### 기존 데이터에 기본값 설정

```javascript
// scripts/migrateCategories.js
const mongoose = require("mongoose");
const Letter = require("../models/Letter");
require("dotenv").config();

async function migrateCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB 연결 성공");

    // category 필드가 없는 모든 사연에 "기타" 설정
    const result = await Letter.updateMany(
      {
        type: "story",
        category: { $exists: false },
      },
      {
        $set: {
          category: "기타",
          aiMetadata: {
            confidence: 0,
            reason: "마이그레이션 기본값",
            tags: [],
            classifiedAt: new Date(),
            model: "none",
          },
        },
      }
    );

    console.log(`${result.modifiedCount}개 사연 업데이트 완료`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("마이그레이션 오류:", error);
    process.exit(1);
  }
}

migrateCategories();
```

**실행 방법**:

```bash
node scripts/migrateCategories.js
```

---

## ✅ 체크리스트

백엔드 구현 시 다음 사항을 확인하세요:

- [ ] Letter 모델에 `category` 필드 추가
- [ ] Letter 모델에 `aiMetadata` 필드 추가
- [ ] 복합 인덱스 추가 (`type`, `category`, `createdAt`)
- [ ] POST /api/letters 수정 (카테고리 저장)
- [ ] GET /api/letters/stories 수정 (카테고리 필터)
- [ ] GET /api/letters/categories/stats 추가 (선택)
- [ ] 기존 데이터 마이그레이션 스크립트 실행
- [ ] 기존 사연 재분류 스크립트 실행 (선택)
- [ ] API 테스트 완료

---

## 🧪 테스트 방법

### 1. 사연 등록 테스트 (카테고리 포함)

```bash
curl -X POST http://localhost:5001/api/letters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "story",
    "title": "엄마에게",
    "content": "엄마, 항상 고마워요...",
    "authorName": "딸",
    "ogPreviewText": "엄마, 항상 고마워요...",
    "category": "가족",
    "aiMetadata": {
      "confidence": 0.95,
      "reason": "가족에 대한 감사 표현",
      "tags": ["엄마", "감사", "사랑"],
      "classifiedAt": "2025-12-17T10:00:00.000Z",
      "model": "gemini-1.5-flash"
    }
  }'
```

### 2. 카테고리 필터 테스트

```bash
# 가족 카테고리만 조회
curl "http://localhost:5001/api/letters/stories?category=가족"

# 사랑 카테고리만 조회
curl "http://localhost:5001/api/letters/stories?category=사랑"

# 전체 조회
curl "http://localhost:5001/api/letters/stories?category=전체보기"
```

### 3. 카테고리 통계 조회

```bash
curl http://localhost:5001/api/letters/categories/stats
```

**예상 응답**:

```json
{
  "success": true,
  "data": {
    "total": 100,
    "categories": [
      {
        "category": "가족",
        "count": 35,
        "percentage": "35.0",
        "avgConfidence": "0.87"
      },
      {
        "category": "사랑",
        "count": 28,
        "percentage": "28.0",
        "avgConfidence": "0.82"
      }
    ]
  }
}
```

---

## 🔒 보안 고려사항

1. **민감 정보 제외**: `address`, `receiverEmail` 등은 응답에서 제외
2. **입력 검증**: 카테고리 값이 enum에 포함되는지 확인
3. **인덱스 최적화**: 카테고리 필터링 성능 향상

---

## 📊 성능 최적화

### 1. 복합 인덱스 추가

```javascript
letterSchema.index({ type: 1, category: 1, createdAt: -1 });
```

### 2. Lean 쿼리 사용

```javascript
Letter.find(query).lean(); // Mongoose 문서 대신 순수 객체 반환
```

### 3. 필드 선택

```javascript
.select("-__v -address -receiverEmail"); // 불필요한 필드 제외
```

---

## 📚 참고 문서

- [Mongoose 스키마](https://mongoosejs.com/docs/guide.html)
- [MongoDB 인덱스](https://www.mongodb.com/docs/manual/indexes/)
- [Express 라우팅](https://expressjs.com/en/guide/routing.html)

---

**구현 완료 후 프론트엔드에 알려주세요!** 🎉
