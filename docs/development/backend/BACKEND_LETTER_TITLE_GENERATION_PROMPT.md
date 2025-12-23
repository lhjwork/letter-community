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
- **이메일**: Nodemailer (선택사항)

---

## 📁 수정할 API

### 1. `POST /api/letters/send` (편지 전송)

**기존 요청 구조:**

```json
{
  "receiverEmail": "friend@example.com",
  "title": "사용자가 입력한 제목",
  "content": "편지 내용",
  "ogTitle": "OG 제목",
  "ogPreviewText": "OG 미리보기"
}
```

**개선된 요청 구조:**

```json
{
  "title": "AI가 생성한 제목",
  "content": "편지 내용",
  "ogTitle": "AI가 생성한 제목",
  "ogPreviewText": "OG 미리보기"
}
```

---

## 🔧 구현 세부사항

### 1. 편지 전송 API 수정

```javascript
// routes/letters.js
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const { title, content, ogTitle, ogPreviewText } = req.body;
    const senderId = req.user.id;

    // 유효성 검사
    if (!title || !content) {
      return res.status(400).json({
        error: "제목과 내용은 필수입니다.",
      });
    }

    // 받는 사람 이메일 처리 로직
    const receiverEmail = await determineReceiverEmail(senderId);

    // 편지 생성
    const letter = new Letter({
      senderId,
      receiverEmail,
      title: title.trim(),
      content: content.trim(),
      ogTitle: ogTitle || title.trim(),
      ogPreviewText: ogPreviewText || content.slice(0, 60) + "...",
      type: "friend",
      status: "sent",
      createdAt: new Date(),
    });

    await letter.save();

    // 이메일 전송 (선택사항)
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === "true") {
      await sendEmailNotification(receiverEmail, letter);
    }

    res.status(201).json({
      message: "편지가 성공적으로 전송되었습니다.",
      data: {
        _id: letter._id,
        title: letter.title,
        receiverEmail: letter.receiverEmail,
      },
    });
  } catch (error) {
    console.error("편지 전송 실패:", error);
    res.status(500).json({
      error: "편지 전송에 실패했습니다.",
    });
  }
});
```

### 2. 받는 사람 이메일 결정 로직

```javascript
// utils/emailHandler.js

/**
 * 받는 사람 이메일을 결정하는 함수
 * @param {string} senderId - 보내는 사람 ID
 * @returns {string} 받는 사람 이메일
 */
async function determineReceiverEmail(senderId) {
  // 옵션 1: 관리자 이메일로 고정
  if (process.env.LETTER_RECEIVER_MODE === "admin") {
    return process.env.ADMIN_EMAIL || "admin@letter-community.com";
  }

  // 옵션 2: 사용자 기본 설정에서 가져오기
  if (process.env.LETTER_RECEIVER_MODE === "user_default") {
    const user = await User.findById(senderId);
    return user.defaultReceiverEmail || process.env.ADMIN_EMAIL;
  }

  // 옵션 3: 랜덤 익명 편지함
  if (process.env.LETTER_RECEIVER_MODE === "anonymous") {
    return generateAnonymousEmail();
  }

  // 기본값: 관리자 이메일
  return process.env.ADMIN_EMAIL || "admin@letter-community.com";
}

/**
 * 익명 편지함 이메일 생성
 * @returns {string} 익명 이메일
 */
function generateAnonymousEmail() {
  const randomId = Math.random().toString(36).substring(2, 8);
  return `anonymous-${randomId}@letter-community.com`;
}
```

### 3. 사용자 모델 확장 (옵션 2 사용 시)

```javascript
// models/User.js
const userSchema = new mongoose.Schema(
  {
    // 기존 필드들...

    // 편지 관련 설정
    letterSettings: {
      defaultReceiverEmail: {
        type: String,
        validate: {
          validator: function (email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          },
          message: "올바른 이메일 형식이 아닙니다.",
        },
      },
      enableEmailNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);
```

### 4. 편지 모델 수정

```javascript
// models/Letter.js
const letterSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverEmail: {
      type: String,
      required: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "올바른 이메일 형식이 아닙니다.",
      },
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
    status: {
      type: String,
      enum: ["draft", "sent", "delivered", "read"],
      default: "sent",
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

    // 이메일 전송 관련
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
  },
  {
    timestamps: true,
  }
);
```

---

## 🔧 환경 변수 설정

```bash
# .env

# 편지 받는 사람 처리 모드
# 'admin' | 'user_default' | 'anonymous'
LETTER_RECEIVER_MODE=admin

# 관리자 이메일 (기본 받는 사람)
ADMIN_EMAIL=admin@letter-community.com

# 이메일 알림 활성화 여부
ENABLE_EMAIL_NOTIFICATIONS=false

# 이메일 서비스 설정 (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 📧 이메일 알림 시스템 (선택사항)

### 1. 이메일 전송 함수

```javascript
// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * 편지 도착 알림 이메일 전송
 * @param {string} receiverEmail - 받는 사람 이메일
 * @param {Object} letter - 편지 객체
 */
async function sendEmailNotification(receiverEmail, letter) {
  const letterUrl = `${process.env.FRONTEND_URL}/letter/${letter._id}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: receiverEmail,
    subject: `💌 새로운 편지가 도착했습니다: ${letter.title}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #e91e63;">💌 새로운 편지가 도착했습니다!</h2>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${letter.title}</h3>
          <p style="color: #666; margin: 0;">${letter.ogPreviewText}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${letterUrl}" 
             style="background: #e91e63; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            편지 읽기
          </a>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Letter Community에서 보낸 편지입니다.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendEmailNotification };
```

---

## 🎯 API 응답 예시

### 성공 응답

```json
{
  "message": "편지가 성공적으로 전송되었습니다.",
  "data": {
    "_id": "674a1b2c3d4e5f6789012345",
    "title": "AI가 생성한 편지 제목",
    "receiverEmail": "admin@letter-community.com"
  }
}
```

### 에러 응답

```json
{
  "error": "제목과 내용은 필수입니다."
}
```

---

## 🧪 테스트 시나리오

### 1. 편지 전송 테스트

```javascript
// 테스트 요청
POST /api/letters/send
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "오랜만에 안부 인사드려요",
  "content": "안녕하세요! 오랜만에 연락드려요. 요즘 어떻게 지내시나요?",
  "ogTitle": "오랜만에 안부 인사드려요",
  "ogPreviewText": "안녕하세요! 오랜만에 연락드려요. 요즘 어떻게 지내시나요?..."
}
```

### 2. 다양한 받는 사람 모드 테스트

**관리자 모드:**

```bash
LETTER_RECEIVER_MODE=admin
ADMIN_EMAIL=admin@letter-community.com
```

**사용자 기본 설정 모드:**

```bash
LETTER_RECEIVER_MODE=user_default
```

**익명 모드:**

```bash
LETTER_RECEIVER_MODE=anonymous
```

---

## 📊 데이터베이스 마이그레이션

### 기존 편지 데이터 마이그레이션

```javascript
// scripts/migrateLetter.js
async function migrateLetter() {
  const letters = await Letter.find({ type: "friend" });

  for (const letter of letters) {
    // AI 메타데이터 추가
    letter.aiMetadata = {
      titleGenerated: false, // 기존 편지는 수동 작성
      titleGeneratedAt: null,
      titleGenerationModel: null,
    };

    await letter.save();
  }

  console.log(`${letters.length}개 편지 마이그레이션 완료`);
}
```

---

## 🔒 보안 고려사항

### 1. 입력 검증

```javascript
const { body, validationResult } = require("express-validator");

const validateLetterSend = [
  body("title").trim().isLength({ min: 1, max: 100 }).withMessage("제목은 1-100자 이내여야 합니다."),

  body("content").trim().isLength({ min: 1, max: 10000 }).withMessage("내용은 1-10000자 이내여야 합니다."),

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
// 사용자별 편지 전송 제한
const LETTER_LIMIT_PER_DAY = 10;

async function checkLetterLimit(senderId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const letterCount = await Letter.countDocuments({
    senderId,
    type: "friend",
    createdAt: { $gte: today },
  });

  if (letterCount >= LETTER_LIMIT_PER_DAY) {
    throw new Error("일일 편지 전송 한도를 초과했습니다.");
  }
}
```

---

## 📋 체크리스트

### 구현 완료 체크

- [ ] `POST /api/letters/send` API 수정
- [ ] `utils/emailHandler.js` 생성
- [ ] `models/Letter.js` 스키마 수정
- [ ] `models/User.js` 스키마 확장 (옵션)
- [ ] 환경 변수 설정
- [ ] 입력 검증 로직 추가
- [ ] 스팸 방지 로직 추가
- [ ] 이메일 서비스 구현 (선택)

### 테스트 완료 체크

- [ ] 편지 전송 API 테스트
- [ ] 다양한 받는 사람 모드 테스트
- [ ] 입력 검증 테스트
- [ ] 스팸 방지 테스트
- [ ] 이메일 전송 테스트 (선택)

---

## 🔗 관련 문서

- [프론트엔드 편지 제목 생성 프롬프트](../../guides/ai/AI_LETTER_TITLE_GENERATION_FRONTEND_PROMPT.md)
- [백엔드 API 명세서](BACKEND_API_SPEC.md)

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 3-4시간  
**의존성**: 프론트엔드 AI 제목 생성 기능과 연동 필요
