# AI 백엔드 개발 프롬프트

다음 요구사항에 맞는 Express.js + MongoDB 백엔드 API를 구현해주세요.

## 프로젝트 구조

```
backend/
├── server.js
├── package.json
├── .env
├── models/
│   ├── User.js
│   └── Letter.js
├── routes/
│   ├── auth.js
│   └── letters.js
└── middleware/
    └── auth.js
```

## 요구사항

### 1. 서버 설정 (server.js)

Express 서버를 5001 포트에서 실행하고, CORS를 허용하며, MongoDB에 연결해주세요.

```javascript
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/letter-community");

// 라우트 연결
app.use("/api/users", require("./routes/auth"));
app.use("/api/letters", require("./routes/letters"));

app.listen(5001, () => {
  console.log("Server running on port 5001");
});
```

### 2. User 모델 (models/User.js)

OAuth 로그인을 지원하는 사용자 모델을 만들어주세요.

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: String,
    oauthAccounts: [
      {
        provider: {
          type: String,
          enum: ["kakao", "naver", "instagram"],
          required: true,
        },
        providerId: {
          type: String,
          required: true,
        },
        accessToken: String,
        refreshToken: String,
        profile: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// provider와 providerId의 조합은 유니크해야 함
userSchema.index({ "oauthAccounts.provider": 1, "oauthAccounts.providerId": 1 });

module.exports = mongoose.model("User", userSchema);
```

### 3. Letter 모델 (models/Letter.js)

편지 데이터 모델을 만들어주세요. **중요: userId 필드를 반드시 포함**해야 합니다.

```javascript
const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    timestamps: true,
  }
);

module.exports = mongoose.model("Letter", letterSchema);
```

### 4. JWT 인증 미들웨어 (middleware/auth.js)

JWT 토큰을 검증하는 미들웨어를 만들어주세요.

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}

module.exports = { authenticateToken };
```

### 5. OAuth 인증 라우트 (routes/auth.js)

OAuth 로그인 처리를 해주세요.

```javascript
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// OAuth 로그인
router.post("/oauth/login", async (req, res) => {
  try {
    const { provider, providerId, email, name, image, accessToken, refreshToken, profile } = req.body;

    // 기존 사용자 찾기
    let user = await User.findOne({
      "oauthAccounts.provider": provider,
      "oauthAccounts.providerId": providerId,
    });

    if (!user) {
      // 이메일로 기존 사용자 찾기
      user = await User.findOne({ email });

      if (user) {
        // 기존 사용자에 OAuth 계정 추가
        user.oauthAccounts.push({
          provider,
          providerId,
          accessToken,
          refreshToken,
          profile,
        });
      } else {
        // 새 사용자 생성
        user = new User({
          email,
          name,
          image,
          oauthAccounts: [
            {
              provider,
              providerId,
              accessToken,
              refreshToken,
              profile,
            },
          ],
        });
      }

      await user.save();
    } else {
      // 기존 사용자의 정보 업데이트
      if (name) user.name = name;
      if (image) user.image = image;

      // OAuth 토큰 업데이트
      const accountIndex = user.oauthAccounts.findIndex((acc) => acc.provider === provider && acc.providerId === providerId);

      if (accountIndex !== -1) {
        user.oauthAccounts[accountIndex].accessToken = accessToken;
        user.oauthAccounts[accountIndex].refreshToken = refreshToken;
        user.oauthAccounts[accountIndex].profile = profile;
      }

      await user.save();
    }

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "30d" });

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
    });
  } catch (error) {
    console.error("OAuth login error:", error);
    res.status(500).json({
      success: false,
      message: "로그인 처리 중 오류가 발생했습니다",
    });
  }
});

module.exports = router;
```

### 6. 편지 라우트 (routes/letters.js)

**이 부분이 가장 중요합니다!** 다음 API들을 구현해주세요:

```javascript
const express = require("express");
const router = express.Router();
const Letter = require("../models/Letter");
const { authenticateToken } = require("../middleware/auth");

// 편지 생성 (인증 필요)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content, authorName } = req.body;
    const userId = req.user._id; // JWT에서 추출한 사용자 ID

    const letter = new Letter({
      userId, // 반드시 userId 저장!
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
    console.error("Error creating letter:", error);
    res.status(500).json({
      success: false,
      message: "편지 생성에 실패했습니다",
    });
  }
});

// 편지 상세 조회 (인증 불필요 - 공개)
router.get("/:letterId", async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.letterId);

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "편지를 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      data: letter,
    });
  } catch (error) {
    console.error("Error fetching letter:", error);
    res.status(500).json({
      success: false,
      message: "편지 조회에 실패했습니다",
    });
  }
});

// 내가 쓴 편지 목록 조회 (인증 필요)
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const letters = await Letter.find({ userId })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .select("-__v");

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

// 편지 삭제 (인증 필요, 본인만 가능)
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

### 7. package.json

```json
{
  "name": "letter-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 8. .env 파일

```env
MONGODB_URI=mongodb://localhost:27017/letter-community
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5001
```

## 중요 체크리스트

- ✅ Letter 모델에 `userId` 필드가 있어야 함
- ✅ POST /api/letters 에서 `userId`를 저장해야 함
- ✅ GET /api/letters/my 라우트가 **반드시 `/my`가 먼저** 와야 함 (아니면 `:letterId`와 충돌)
- ✅ JWT 토큰 검증이 정상 작동해야 함
- ✅ 5001 포트에서 실행
- ✅ CORS가 모든 origin 허용 (`cors()`)

## 실행 방법

```bash
# 패키지 설치
npm install

# MongoDB 실행 (별도 터미널)
mongod

# 서버 실행
npm run dev
```

## 테스트 방법

서버가 정상 실행되면 다음 URL로 테스트:

- http://localhost:5001/api/letters/my (인증 필요)
- http://localhost:5001/api/letters/{letterId} (공개)

위 내용을 그대로 구현해주세요. 특히 **라우트 순서**(GET /my가 GET /:letterId보다 먼저)와 **userId 저장**이 중요합니다!
