# 🔧 백엔드 AI 프롬프트 - 편지 제목 자동 생성 및 URL 공유 시스템

## 📋 요구사항

Node.js + Express + MongoDB 백엔드에 **편지 제목 자동 생성** 및 **URL 공유 시스템** 기능을 추가해주세요.

---

## 🎯 구현할 기능

### 1. 편지 생성 API 개선

- **받는 사람 이메일 필드 제거** (URL 공유 방식으로 변경)
- **AI 생성된 제목을 프론트엔드에서 받아 처리**
- **고유한 편지 ID 생성 및 URL 접근 가능한 시스템**

### 2. URL 공유 시스템

- **편지별 고유 URL 생성**: `/letter/{letterId}`
- **OG 메타태그 지원**: 카카오톡, 페이스북 등에서 미리보기 제공
- **공개/비공개 설정**: 일반 편지는 링크를 아는 사람만 접근 가능

---

## 🛠 기술 스택

- **백엔드**: Node.js + Express
- **데이터베이스**: MongoDB + Mongoose
- **인증**: JWT
- **URL 생성**: MongoDB ObjectId 기반

---

## 📁 수정할 API

### 1. `POST /api/letters/create` (편지 생성)

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
    "createdAt": "2024-12-18T10:30:00.000Z"
  }
}
```

### 2. `GET /api/letters/:letterId` (편지 조회)

**응답 구조:**

```json
{
  "data": {
    "_id": "674a1b2c3d4e5f6789012345",
    "title": "AI가 생성한 제목",
    "content": "편지 내용",
    "type": "friend",
    "senderId": "674a1b2c3d4e5f6789012340",
    "senderName": "작성자명",
    "ogTitle": "AI가 생성한 제목",
    "ogPreviewText": "OG 미리보기",
    "createdAt": "2024-12-18T10:30:00.000Z",
    "viewCount": 5
  }
}
```

---

## 🔧 구현 세부사항

### 1. 편지 생성 API

```javascript
// routes/letters.js
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

      // AI 메타데이터
      aiMetadata: {
        titleGenerated: type === "friend", // 일반 편지만 AI 생성
        titleGeneratedAt: type === "friend" ? new Date() : null,
        titleGenerationModel: type === "friend" ? "gemini-1.5-flash" : null,
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
```

### 2. 편지 조회 API

```javascript
// routes/letters.js
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
      aiMetadata: letter.aiMetadata,
    };

    res.json({ data: responseData });
  } catch (error) {
    console.error("편지 조회 실패:", error);
    res.status(500).json({
      error: "편지 조회에 실패했습니다.",
    });
  }
});
```

### 3. 편지 모델 수정

```javascript
// models/Letter.js
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

    // AI 생성 관련 메타데이터
    aiMetadata: {
      titleGenerated: {
        type: Boolean,
        default: false,
      },
      titleGeneratedAt: Date,
      titleGenerationModel: String,
    },

    // OG 이미지 관련
    ogTitle: String,
    ogPreviewText: String,

    // 카테고리 (사연용)
    category: {
      type: String,
      enum: ["일상", "연애", "가족", "친구", "직장", "고민", "감사", "응원", "기타"],
      default: "기타",
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 설정
letterSchema.index({ senderId: 1, createdAt: -1 });
letterSchema.index({ type: 1, isPublic: 1, createdAt: -1 });
letterSchema.index({ viewCount: -1 });

module.exports = mongoose.model("Letter", letterSchema);
```

---

## 🎨 OG 메타태그 지원

### 1. 편지 상세 페이지 메타데이터

```javascript
// Next.js app/letter/[letterId]/page.tsx
export async function generateMetadata({ params }) {
  const { letterId } = params;

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/letters/${letterId}`);
    const { data: letter } = await response.json();

    return {
      title: letter.ogTitle || letter.title,
      description: letter.ogPreviewText,
      openGraph: {
        title: letter.ogTitle || letter.title,
        description: letter.ogPreviewText,
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/letter/${letterId}`,
        siteName: "Letter Community",
        images: [
          {
            url: `/api/og/letter/${letterId}`,
            width: 1200,
            height: 630,
            alt: letter.title,
          },
        ],
        locale: "ko_KR",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: letter.ogTitle || letter.title,
        description: letter.ogPreviewText,
        images: [`/api/og/letter/${letterId}`],
      },
    };
  } catch (error) {
    return {
      title: "Letter Community",
      description: "편지로 마음을 전하는 특별한 공간",
    };
  }
}
```

### 2. OG 이미지 생성 API

```javascript
// app/api/og/letter/[letterId]/route.tsx
import { ImageResponse } from "next/og";

export async function GET(request, { params }) {
  const { letterId } = params;

  try {
    // 편지 데이터 조회
    const response = await fetch(`${process.env.BACKEND_URL}/api/letters/${letterId}`);
    const { data: letter } = await response.json();

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter",
            color: "white",
          }}
        >
          <div style={{ fontSize: 60, fontWeight: "bold", marginBottom: 20 }}>💌</div>
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
              maxWidth: "80%",
            }}
          >
            {letter.title}
          </div>
          <div
            style={{
              fontSize: 24,
              textAlign: "center",
              opacity: 0.8,
              maxWidth: "70%",
            }}
          >
            {letter.ogPreviewText}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 20,
              opacity: 0.7,
            }}
          >
            Letter Community
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    // 기본 OG 이미지 반환
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter",
            color: "white",
          }}
        >
          <div style={{ fontSize: 72, fontWeight: "bold" }}>💌 Letter Community</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
```

---

## 🔒 환경 변수 설정

```bash
# .env

# 프론트엔드 URL
FRONTEND_URL=https://letter-community.com
NEXT_PUBLIC_FRONTEND_URL=https://letter-community.com

# 백엔드 URL
BACKEND_URL=https://api.letter-community.com

# MongoDB
MONGODB_URI=mongodb://localhost:27017/letter-community

# JWT
JWT_SECRET=your-jwt-secret-key
```

---

## 🧪 테스트 시나리오

### 1. 편지 생성 테스트

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

### 2. 편지 조회 테스트

```javascript
// 테스트 요청
GET /api/letters/674a1b2c3d4e5f6789012345
```

**예상 응답:**

```json
{
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
    "viewCount": 1
  }
}
```

### 3. URL 공유 테스트

1. **편지 생성** → URL 받기
2. **카카오톡에 URL 공유** → OG 이미지 미리보기 확인
3. **URL 클릭** → 편지 상세 페이지 접근
4. **조회수 증가** 확인

---

## 🔒 보안 고려사항

### 1. 편지 접근 권한

```javascript
// 편지 타입별 접근 제어
const checkLetterAccess = (letter, userId) => {
  // 사연은 모든 사용자가 접근 가능
  if (letter.type === "story" && letter.isPublic) {
    return true;
  }

  // 일반 편지는 링크를 아는 사람만 접근 가능 (작성자 확인 불필요)
  if (letter.type === "friend" && letter.shareableUrl) {
    return true;
  }

  // 작성자는 항상 접근 가능
  if (letter.senderId.toString() === userId) {
    return true;
  }

  return false;
};
```

### 2. 스팸 방지

```javascript
// 사용자별 편지 생성 제한
const LETTER_LIMIT_PER_DAY = 20;

async function checkLetterLimit(senderId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const letterCount = await Letter.countDocuments({
    senderId,
    createdAt: { $gte: today },
  });

  if (letterCount >= LETTER_LIMIT_PER_DAY) {
    throw new Error("일일 편지 생성 한도를 초과했습니다.");
  }
}
```

### 3. 입력 검증

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

---

## 📋 체크리스트

### 구현 완료 체크

- [ ] `POST /api/letters/create` API 구현
- [ ] `GET /api/letters/:letterId` API 구현
- [ ] `models/Letter.js` 스키마 수정
- [ ] OG 메타태그 지원 구현
- [ ] OG 이미지 생성 API 구현
- [ ] 환경 변수 설정
- [ ] 입력 검증 로직 추가
- [ ] 스팸 방지 로직 추가
- [ ] 접근 권한 제어 구현

### 테스트 완료 체크

- [ ] 편지 생성 API 테스트
- [ ] 편지 조회 API 테스트
- [ ] URL 공유 기능 테스트
- [ ] OG 이미지 생성 테스트
- [ ] 카카오톡 공유 미리보기 테스트
- [ ] 조회수 증가 테스트
- [ ] 입력 검증 테스트
- [ ] 스팸 방지 테스트

---

## 🔗 관련 문서

- [프론트엔드 편지 제목 생성 프롬프트](../../guides/ai/AI_LETTER_TITLE_GENERATION_FRONTEND_PROMPT.md)
- [백엔드 API 명세서](BACKEND_API_SPEC.md)

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 4-5시간  
**의존성**: 프론트엔드 AI 제목 생성 기능과 연동 필요
