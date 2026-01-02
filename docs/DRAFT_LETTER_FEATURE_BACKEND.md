# 편지 임시저장 기능 - 백엔드 구현 프롬프트

## 🎯 목표

편지 작성 중 언제든 임시저장하고, 마이페이지에서 작성 중인 편지를 관리할 수 있는 백엔드 API 구현

## 📋 요구사항

### 핵심 기능

1. **임시저장 (Draft Save)**

   - 편지 작성 중 언제든 수동 저장 가능
   - 제목 없이도 저장 가능 (자동 제목 생성)

2. **임시저장 목록 조회**

   - 사용자별 임시저장된 편지 목록
   - 페이지네이션 지원
   - 최신순 정렬

3. **임시저장 편지 불러오기**

   - 특정 임시저장 편지 상세 조회
   - 편집 모드로 불러오기

4. **임시저장 편지 관리**
   - 임시저장 편지 삭제
   - 임시저장 → 정식 발행
   - 임시저장 편지 수정

## 🗄️ 데이터 모델

### DraftLetter Schema

```javascript
const draftLetterSchema = new mongoose.Schema({
  // 기본 정보
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },

  // 작성자 정보
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  // 편지 내용
  title: {
    type: String,
    default: "", // 빈 제목 허용
    maxlength: 200,
  },

  content: {
    type: String,
    default: "",
    maxlength: 10000,
  },

  // 편지 설정
  type: {
    type: String,
    enum: ["friend", "story"],
    default: "friend",
  },

  category: {
    type: String,
    default: "기타",
  },

  // 자동 제목 (제목이 없을 때 내용 기반 생성)
  autoTitle: {
    type: String,
    default: "",
  },

  // 메타데이터
  wordCount: {
    type: Number,
    default: 0,
  },

  // 수신자 주소 (임시저장 시에도 포함 가능)
  recipientAddresses: [
    {
      name: String,
      phone: String,
      zipCode: String,
      address1: String,
      address2: String,
      memo: String,
    },
  ],

  // 상태 관리
  status: {
    type: String,
    enum: ["draft", "published", "deleted"],
    default: "draft",
    index: true,
  },

  // 저장 정보
  saveCount: {
    type: Number,
    default: 1,
  },

  lastSavedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  // 발행 정보 (draft → published 시)
  publishedAt: {
    type: Date,
    default: null,
  },

  publishedLetterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Letter",
    default: null,
  },

  // 타임스탬프
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 인덱스 설정
draftLetterSchema.index({ authorId: 1, status: 1, lastSavedAt: -1 });
draftLetterSchema.index({ authorId: 1, createdAt: -1 });

// 자동 제목 생성 미들웨어
draftLetterSchema.pre("save", function (next) {
  // 제목이 없고 내용이 있으면 자동 제목 생성
  if (!this.title && this.content) {
    const plainText = this.content.replace(/<[^>]*>/g, ""); // HTML 태그 제거
    this.autoTitle = plainText.substring(0, 30) + (plainText.length > 30 ? "..." : "");
  }

  // 단어 수 계산
  const plainText = this.content.replace(/<[^>]*>/g, "");
  this.wordCount = plainText.length;

  // 업데이트 시간 갱신
  this.updatedAt = new Date();
  this.lastSavedAt = new Date();

  next();
});

module.exports = mongoose.model("DraftLetter", draftLetterSchema);
```

## 🔌 API 엔드포인트

### 1. 임시저장 생성/수정

**POST `/api/drafts`**

```javascript
// 요청 본문
{
  "title": "string (optional)",
  "content": "string",
  "type": "friend|story",
  "category": "string (optional)",
  "recipientAddresses": [
    {
      "name": "string",
      "phone": "string",
      "zipCode": "string",
      "address1": "string",
      "address2": "string (optional)",
      "memo": "string (optional)"
    }
  ]
}

// 응답
{
  "success": true,
  "data": {
    "_id": "draft_id",
    "title": "string",
    "autoTitle": "string",
    "content": "string",
    "type": "friend",
    "category": "기타",
    "wordCount": 150,
    "saveCount": 1,
    "lastSavedAt": "2024-01-01T12:00:00Z",
    "createdAt": "2024-01-01T12:00:00Z"
  },
  "message": "임시저장되었습니다."
}
```

### 2. 기존 임시저장 수정

**PUT `/api/drafts/:draftId`**

```javascript
// 요청 본문 (위와 동일)
// 응답
{
  "success": true,
  "data": {
    "_id": "draft_id",
    "saveCount": 5, // 저장 횟수 증가
    "lastSavedAt": "2024-01-01T12:05:00Z"
    // ... 기타 필드
  },
  "message": "임시저장이 업데이트되었습니다."
}
```

### 3. 임시저장 목록 조회

**GET `/api/drafts`**

```javascript
// 쿼리 파라미터
// ?page=1&limit=10&sort=latest&type=all

// 응답
{
  "success": true,
  "data": {
    "drafts": [
      {
        "_id": "draft_id",
        "title": "편지 제목",
        "autoTitle": "자동 생성된 제목...",
        "content": "편지 내용 미리보기...", // 첫 100자만
        "type": "friend",
        "category": "감사",
        "wordCount": 245,
        "saveCount": 3,
        "lastSavedAt": "2024-01-01T12:00:00Z",
        "createdAt": "2024-01-01T11:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "stats": {
      "totalDrafts": 25,
      "totalWords": 5420,
      "oldestDraft": "2024-01-01T10:00:00Z"
    }
  }
}
```

### 4. 임시저장 상세 조회

**GET `/api/drafts/:draftId`**

```javascript
// 응답
{
  "success": true,
  "data": {
    "_id": "draft_id",
    "title": "편지 제목",
    "content": "전체 편지 내용...",
    "type": "friend",
    "category": "감사",
    "recipientAddresses": [...],
    "wordCount": 245,
    "saveCount": 3,
    "lastSavedAt": "2024-01-01T12:00:00Z",
    "createdAt": "2024-01-01T11:00:00Z"
  }
}
```

### 5. 임시저장 삭제

**DELETE `/api/drafts/:draftId`**

```javascript
// 응답
{
  "success": true,
  "message": "임시저장된 편지가 삭제되었습니다."
}
```

### 6. 임시저장 → 정식 발행

**POST `/api/drafts/:draftId/publish`**

```javascript
// 요청 본문 (필요시 최종 수정사항)
{
  "title": "string (optional)",
  "content": "string (optional)",
  "type": "friend|story",
  "category": "string (optional)"
}

// 응답
{
  "success": true,
  "data": {
    "letterId": "published_letter_id",
    "url": "https://domain.com/letter/published_letter_id",
    "draftId": "draft_id"
  },
  "message": "편지가 성공적으로 발행되었습니다."
}
```

### 7. 임시저장 통계

**GET `/api/drafts/stats`**

```javascript
// 응답
{
  "success": true,
  "data": {
    "totalDrafts": 25,
    "totalWords": 5420,
    "oldestDraft": "2024-01-01T10:00:00Z",
    "recentActivity": [
      {
        "date": "2024-01-01",
        "saves": 12
      }
    ]
  }
}
```

## 🔧 구현 세부사항

### 1. 컨트롤러 함수

```javascript
// controllers/draftController.js

const DraftLetter = require("../models/DraftLetter");
const Letter = require("../models/Letter");

// 임시저장 생성/수정
exports.saveDraft = async (req, res) => {
  try {
    const { title, content, type, category, recipientAddresses } = req.body;
    const authorId = req.user._id;

    // 기존 임시저장 찾기 (같은 내용의 최근 임시저장)
    let existingDraft = null;
    if (req.body.draftId) {
      existingDraft = await DraftLetter.findOne({
        _id: req.body.draftId,
        authorId,
        status: "draft",
      });
    }

    if (existingDraft) {
      // 기존 임시저장 업데이트
      existingDraft.title = title || existingDraft.title;
      existingDraft.content = content || existingDraft.content;
      existingDraft.type = type || existingDraft.type;
      existingDraft.category = category || existingDraft.category;
      existingDraft.recipientAddresses = recipientAddresses || existingDraft.recipientAddresses;
      existingDraft.saveCount += 1;

      await existingDraft.save();

      res.json({
        success: true,
        data: existingDraft,
        message: "임시저장이 업데이트되었습니다.",
      });
    } else {
      // 새 임시저장 생성
      const newDraft = new DraftLetter({
        authorId,
        title: title || "",
        content: content || "",
        type: type || "friend",
        category: category || "기타",
        recipientAddresses: recipientAddresses || [],
      });

      await newDraft.save();

      res.json({
        success: true,
        data: newDraft,
        message: "임시저장되었습니다.",
      });
    }
  } catch (error) {
    console.error("임시저장 실패:", error);
    res.status(500).json({
      success: false,
      error: "임시저장 중 오류가 발생했습니다.",
    });
  }
};

// 임시저장 목록 조회
exports.getDrafts = async (req, res) => {
  try {
    const authorId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || "latest"; // latest, oldest, wordCount
    const type = req.query.type || "all"; // all, friend, story

    // 필터 조건
    const filter = {
      authorId,
      status: "draft",
    };

    if (type !== "all") {
      filter.type = type;
    }

    // 정렬 조건
    let sortOption = { lastSavedAt: -1 }; // 기본: 최신순
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "wordCount") sortOption = { wordCount: -1 };

    // 페이지네이션
    const skip = (page - 1) * limit;

    const [drafts, total] = await Promise.all([
      DraftLetter.find(filter).sort(sortOption).skip(skip).limit(limit).select("title autoTitle content type category wordCount saveCount lastSavedAt createdAt").lean(),
      DraftLetter.countDocuments(filter),
    ]);

    // 내용 미리보기 처리
    const processedDrafts = drafts.map((draft) => ({
      ...draft,
      content: draft.content.replace(/<[^>]*>/g, "").substring(0, 100) + (draft.content.length > 100 ? "..." : ""),
    }));

    // 통계 정보
    const stats = await DraftLetter.aggregate([
      { $match: { authorId, status: "draft" } },
      {
        $group: {
          _id: null,
          totalDrafts: { $sum: 1 },
          totalWords: { $sum: "$wordCount" },
          oldestDraft: { $min: "$createdAt" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        drafts: processedDrafts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        stats: stats[0] || { totalDrafts: 0, totalWords: 0, oldestDraft: null },
      },
    });
  } catch (error) {
    console.error("임시저장 목록 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "임시저장 목록을 불러올 수 없습니다.",
    });
  }
};

// 임시저장 상세 조회
exports.getDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const authorId = req.user._id;

    const draft = await DraftLetter.findOne({
      _id: draftId,
      authorId,
      status: "draft",
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: "임시저장된 편지를 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error("임시저장 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "임시저장된 편지를 불러올 수 없습니다.",
    });
  }
};

// 임시저장 삭제
exports.deleteDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const authorId = req.user._id;

    const result = await DraftLetter.findOneAndUpdate({ _id: draftId, authorId, status: "draft" }, { status: "deleted" }, { new: true });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "임시저장된 편지를 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      message: "임시저장된 편지가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("임시저장 삭제 실패:", error);
    res.status(500).json({
      success: false,
      error: "임시저장 삭제 중 오류가 발생했습니다.",
    });
  }
};

// 임시저장 → 정식 발행
exports.publishDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const { title, content, type, category } = req.body;
    const authorId = req.user._id;

    // 임시저장 조회
    const draft = await DraftLetter.findOne({
      _id: draftId,
      authorId,
      status: "draft",
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: "임시저장된 편지를 찾을 수 없습니다.",
      });
    }

    // 정식 편지 생성
    const publishedLetter = new Letter({
      authorId,
      title: title || draft.title || draft.autoTitle,
      content: content || draft.content,
      type: type || draft.type,
      category: category || draft.category,
      recipientAddresses: draft.recipientAddresses,
      status: "published",
    });

    await publishedLetter.save();

    // 임시저장 상태 업데이트
    draft.status = "published";
    draft.publishedAt = new Date();
    draft.publishedLetterId = publishedLetter._id;
    await draft.save();

    res.json({
      success: true,
      data: {
        letterId: publishedLetter._id,
        url: `${process.env.FRONTEND_URL}/letter/${publishedLetter._id}`,
        draftId: draft._id,
      },
      message: "편지가 성공적으로 발행되었습니다.",
    });
  } catch (error) {
    console.error("편지 발행 실패:", error);
    res.status(500).json({
      success: false,
      error: "편지 발행 중 오류가 발생했습니다.",
    });
  }
};
```

### 2. 라우트 설정

```javascript
// routes/drafts.js
const express = require("express");
const router = express.Router();
const draftController = require("../controllers/draftController");
const authMiddleware = require("../middleware/auth");

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 임시저장 생성/수정
router.post("/", draftController.saveDraft);

// 임시저장 목록 조회
router.get("/", draftController.getDrafts);

// 임시저장 상세 조회
router.get("/:draftId", draftController.getDraft);

// 임시저장 수정
router.put("/:draftId", draftController.updateDraft);

// 임시저장 삭제
router.delete("/:draftId", draftController.deleteDraft);

// 임시저장 → 정식 발행
router.post("/:draftId/publish", draftController.publishDraft);

// 임시저장 통계
router.get("/stats", draftController.getDraftStats);

module.exports = router;
```

### 3. 메인 앱에 라우트 등록

```javascript
// app.js 또는 server.js
const draftRoutes = require("./routes/drafts");

app.use("/api/drafts", draftRoutes);
```

## 🧪 테스트 케이스

### 1. 임시저장 생성 테스트

```javascript
// POST /api/drafts
{
  "title": "",
  "content": "안녕하세요, 이것은 테스트 편지입니다.",
  "type": "friend",
  "category": "인사"
}

// 예상 응답: 201 Created
```

### 2. 자동저장 테스트

```javascript
// 수동 저장 테스트
// PUT /api/drafts/draft_id
{
  "content": "안녕하세요, 이것은 업데이트된 내용입니다."
}

// 예상 응답: saveCount 증가
```

### 3. 목록 조회 테스트

```javascript
// GET /api/drafts?page=1&limit=5&sort=latest
// 예상 응답: 페이지네이션된 임시저장 목록
```

### 4. 발행 테스트

```javascript
// POST /api/drafts/draft_id/publish
{
  "title": "최종 편지 제목"
}

// 예상 응답: 발행된 편지 정보
```

## 🔒 보안 고려사항

### 1. 인증 및 권한

- 모든 API는 로그인 필수
- 본인의 임시저장만 접근 가능
- JWT 토큰 검증

### 2. 데이터 검증

- 내용 길이 제한 (10,000자)
- HTML 태그 필터링
- XSS 방지

### 3. Rate Limiting

- 임시저장 API: 사용자당 분당 20회
- 일반 API: 사용자당 분당 30회

## 📊 성능 최적화

### 1. 데이터베이스 인덱스

```javascript
// 복합 인덱스
{ authorId: 1, status: 1, lastSavedAt: -1 }
{ authorId: 1, createdAt: -1 }
```

### 2. 캐싱 전략

- Redis를 활용한 임시저장 목록 캐싱
- 자주 접근하는 임시저장 내용 캐싱

### 3. 자동 정리 (node-cron 필수)

```javascript
// package.json에 추가 필요: "node-cron": "^3.0.3"
const cron = require("node-cron");

// 1. 매일 새벽 2시 - 오래된 임시저장 정리
cron.schedule("0 2 * * *", async () => {
  console.log("임시저장 자동 정리 시작...");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await DraftLetter.updateMany(
    {
      status: "draft",
      lastSavedAt: { $lt: thirtyDaysAgo },
    },
    { status: "deleted" }
  );

  console.log(`${result.modifiedCount}개의 오래된 임시저장을 정리했습니다.`);

  // 관리자에게 알림 발송
  if (result.modifiedCount > 0) {
    await sendCleanupNotification(result.modifiedCount);
  }
});

// 2. 매주 일요일 새벽 3시 - 비활성 데이터 정리
cron.schedule("0 3 * * 0", async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 7일 이상 수정되지 않은 짧은 임시저장 삭제
  await DraftLetter.updateMany(
    {
      status: "draft",
      lastSavedAt: { $lt: sevenDaysAgo },
      wordCount: { $lt: 50 },
    },
    { status: "deleted" }
  );
});

// 3. 매일 새벽 4시 - DB 최적화 및 물리적 삭제
cron.schedule("0 4 * * *", async () => {
  try {
    // 7일 이상 된 삭제 상태 데이터 완전 제거
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deletedCount = await DraftLetter.deleteMany({
      status: "deleted",
      updatedAt: { $lt: sevenDaysAgo },
    });

    console.log(`${deletedCount.deletedCount}개의 삭제된 임시저장을 완전히 제거했습니다.`);
  } catch (error) {
    console.error("DB 최적화 실패:", error);
  }
});

// 4. 매주 화요일 오전 10시 - 사용자 알림
cron.schedule("0 10 * * 2", async () => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const oldDrafts = await DraftLetter.aggregate([
    {
      $match: {
        status: "draft",
        lastSavedAt: { $lt: fourteenDaysAgo },
        wordCount: { $gt: 100 }, // 100자 이상만
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $group: {
        _id: "$authorId",
        email: { $first: "$author.email" },
        drafts: {
          $push: {
            title: { $ifNull: ["$title", "$autoTitle"] },
            lastSavedAt: "$lastSavedAt",
            wordCount: "$wordCount",
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // 사용자별 알림 이메일 발송
  for (const userDrafts of oldDrafts) {
    await sendDraftReminderEmail(userDrafts.email, userDrafts.drafts);
  }
});

// 5. 매주 토요일 새벽 1시 - 중요 데이터 백업
cron.schedule("0 1 * * 6", async () => {
  const importantDrafts = await DraftLetter.find({
    status: "draft",
    wordCount: { $gt: 1000 }, // 1000자 이상
    saveCount: { $gt: 5 }, // 5회 이상 저장
    lastSavedAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  if (importantDrafts.length > 0) {
    await createDraftBackup(importantDrafts);
    console.log(`${importantDrafts.length}개의 중요 임시저장을 백업했습니다.`);
  }
});

// 알림 함수들
const sendCleanupNotification = async (count) => {
  // 관리자 이메일 발송 로직
  console.log(`관리자 알림: ${count}개 임시저장 정리 완료`);
};

const sendDraftReminderEmail = async (email, drafts) => {
  // 사용자 알림 이메일 발송 로직
  console.log(`사용자 알림 발송: ${email}, ${drafts.length}개 오래된 임시저장`);
};

const createDraftBackup = async (drafts) => {
  // S3 또는 다른 저장소에 백업 로직
  const backupData = {
    timestamp: new Date(),
    count: drafts.length,
    data: drafts,
  };
  // 실제 백업 저장 로직 구현
};
```

## 🚀 배포 전 체크리스트

- [ ] DraftLetter 모델 생성 및 마이그레이션
- [ ] 모든 API 엔드포인트 구현
- [ ] 인증 미들웨어 적용
- [ ] 입력값 검증 및 보안 처리
- [ ] 에러 처리 및 로깅
- [ ] 테스트 케이스 작성 및 실행
- [ ] 성능 테스트 (대용량 데이터)
- [ ] API 문서 작성
- [ ] **node-cron 설치 및 자동 정리 작업 설정**
- [ ] **크론 작업 로그 및 모니터링 설정**
- [ ] **백업 저장소 설정 (S3 등)**
- [ ] **알림 시스템 설정 (이메일, Slack 등)**
- [ ] 모니터링 설정

## 📦 필수 패키지 설치

```bash
npm install node-cron
# 또는
yarn add node-cron
```

## ⚠️ 중요 고려사항

### node-cron 없이 발생할 수 있는 문제:

1. **데이터 폭증**: 임시저장이 무제한 축적되어 DB 용량 급증
2. **성능 저하**: 과도한 데이터로 인한 쿼리 속도 저하
3. **비용 증가**: 클라우드 DB 저장소 비용 급증
4. **사용자 경험 악화**: 느린 로딩 시간과 응답 지연

### 권장 크론 스케줄:

- **매일 새벽 2시**: 오래된 임시저장 정리
- **매주 일요일 새벽 3시**: 비활성 데이터 정리
- **매일 새벽 4시**: DB 최적화 및 물리적 삭제
- **매주 화요일 오전 10시**: 사용자 알림 발송
- **매주 토요일 새벽 1시**: 중요 데이터 백업

## 📝 추가 고려사항

### 1. 버전 관리

- 임시저장 버전 히스토리 (선택사항)
- 변경사항 추적

### 2. 협업 기능 (향후)

- 임시저장 공유
- 댓글 및 피드백

### 3. 백업 및 복구

- 정기적인 임시저장 백업
- 실수 삭제 복구 기능

이 프롬프트를 바탕으로 백엔드 개발을 진행하면 완전한 편지 임시저장 시스템을 구축할 수 있습니다!
