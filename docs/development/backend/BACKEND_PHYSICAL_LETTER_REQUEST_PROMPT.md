# 🏠 백엔드 실물 편지 신청 API 구현 프롬프트

## 📋 문제 상황

현재 프론트엔드에서 실물 편지 신청 요청을 보내는 API 엔드포인트 `POST /api/letters/{letterId}/physical-request`가 구현되지 않아 "Route not found" 오류가 발생하고 있습니다.

**오류 URL**: `https://letter-my-backend.onrender.com/api/letters/694b75482a481c18da78bda2/physical-request`
**오류 응답**: `{"message": "Route not found"}`

## 🎯 구현 목표

- 실물 편지 신청 API 엔드포인트 구현
- 배송 주소 정보 저장 및 관리
- 신청 상태 추적 시스템
- 관리자용 신청 목록 조회 기능

---

## 🛠 백엔드 구현 사항

### 1. 데이터베이스 스키마 수정

#### Letter 모델 업데이트

```javascript
// models/Letter.js

const letterSchema = new mongoose.Schema({
  // 기존 필드들...
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ["story", "friend"], required: true },

  // 실물 편지 관련 필드 추가
  physicalRequested: {
    type: Boolean,
    default: false,
  }, // 실물 편지 신청 여부

  physicalRequestDate: {
    type: Date,
  }, // 신청 날짜

  physicalStatus: {
    type: String,
    enum: ["none", "requested", "processing", "writing", "sent", "delivered", "cancelled"],
    default: "none",
  }, // 실물 편지 처리 상태

  shippingAddress: {
    name: { type: String }, // 받는 분 성함
    phone: { type: String }, // 연락처
    zipCode: { type: String }, // 우편번호
    address1: { type: String }, // 기본 주소
    address2: { type: String }, // 상세 주소
    requestedAt: { type: Date }, // 주소 등록 시간
  },

  physicalNotes: { type: String }, // 관리자 메모

  // 기존 필드들...
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 업데이트 시간 자동 갱신
letterSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
```

### 2. 실물 편지 신청 API 구현

#### POST /api/letters/:letterId/physical-request

```javascript
// routes/letters.js 또는 해당 라우터 파일

const express = require("express");
const router = express.Router();
const Letter = require("../models/Letter");

/**
 * 실물 편지 신청
 * POST /api/letters/:letterId/physical-request
 */
router.post("/letters/:letterId/physical-request", async (req, res) => {
  try {
    const { letterId } = req.params;
    const { address } = req.body;

    // 입력 데이터 검증
    if (!address || !address.name || !address.phone || !address.zipCode || !address.address1) {
      return res.status(400).json({
        success: false,
        error: "필수 주소 정보가 누락되었습니다.",
        required: ["name", "phone", "zipCode", "address1"],
      });
    }

    // 편지 존재 여부 확인
    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({
        success: false,
        error: "편지를 찾을 수 없습니다.",
      });
    }

    // 이미 신청된 편지인지 확인
    if (letter.physicalRequested) {
      return res.status(409).json({
        success: false,
        error: "이미 실물 편지가 신청된 편지입니다.",
        currentStatus: letter.physicalStatus,
      });
    }

    // 연락처 형식 검증 (한국 휴대폰 번호)
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(address.phone.replace(/-/g, ""))) {
      return res.status(400).json({
        success: false,
        error: "올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)",
      });
    }

    // 우편번호 형식 검증 (5자리 숫자)
    const zipCodeRegex = /^[0-9]{5}$/;
    if (!zipCodeRegex.test(address.zipCode)) {
      return res.status(400).json({
        success: false,
        error: "올바른 우편번호 형식이 아닙니다. (5자리 숫자)",
      });
    }

    // 실물 편지 신청 정보 업데이트
    const updatedLetter = await Letter.findByIdAndUpdate(
      letterId,
      {
        physicalRequested: true,
        physicalRequestDate: new Date(),
        physicalStatus: "requested",
        shippingAddress: {
          name: address.name.trim(),
          phone: address.phone.replace(/-/g, "").replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3"), // 하이픈 정규화
          zipCode: address.zipCode,
          address1: address.address1.trim(),
          address2: address.address2?.trim() || "",
          requestedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    // 관리자 알림 (선택사항 - 이메일, 슬랙 등)
    try {
      await notifyAdminNewPhysicalRequest(updatedLetter);
    } catch (notifyError) {
      console.error("관리자 알림 실패:", notifyError);
      // 알림 실패는 전체 요청을 실패시키지 않음
    }

    res.status(200).json({
      success: true,
      message: "실물 편지 신청이 완료되었습니다.",
      data: {
        letterId: updatedLetter._id,
        physicalStatus: updatedLetter.physicalStatus,
        requestDate: updatedLetter.physicalRequestDate,
        shippingAddress: {
          name: updatedLetter.shippingAddress.name,
          phone: updatedLetter.shippingAddress.phone,
          address: `(${updatedLetter.shippingAddress.zipCode}) ${updatedLetter.shippingAddress.address1} ${updatedLetter.shippingAddress.address2}`.trim(),
        },
      },
    });
  } catch (error) {
    console.error("실물 편지 신청 실패:", error);
    res.status(500).json({
      success: false,
      error: "실물 편지 신청 처리 중 오류가 발생했습니다.",
    });
  }
});

/**
 * 관리자 알림 함수 (선택사항)
 */
async function notifyAdminNewPhysicalRequest(letter) {
  // 이메일, 슬랙, 디스코드 등으로 관리자에게 알림
  // 구현 예시:
  console.log(`새로운 실물 편지 신청: ${letter._id}`);
  console.log(`받는 분: ${letter.shippingAddress.name}`);
  console.log(`주소: (${letter.shippingAddress.zipCode}) ${letter.shippingAddress.address1} ${letter.shippingAddress.address2}`);

  // TODO: 실제 알림 시스템 구현
  // - 이메일 발송
  // - 슬랙 메시지
  // - 관리자 대시보드 알림 등
}
```

### 3. 실물 편지 상태 조회 API

#### GET /api/letters/:letterId/physical-status

```javascript
/**
 * 실물 편지 상태 조회
 * GET /api/letters/:letterId/physical-status
 */
router.get("/letters/:letterId/physical-status", async (req, res) => {
  try {
    const { letterId } = req.params;

    const letter = await Letter.findById(letterId).select("physicalRequested physicalStatus physicalRequestDate shippingAddress physicalNotes");

    if (!letter) {
      return res.status(404).json({
        success: false,
        error: "편지를 찾을 수 없습니다.",
      });
    }

    if (!letter.physicalRequested) {
      return res.status(200).json({
        success: true,
        data: {
          physicalRequested: false,
          status: "none",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        physicalRequested: letter.physicalRequested,
        status: letter.physicalStatus,
        requestDate: letter.physicalRequestDate,
        shippingAddress: letter.shippingAddress,
        notes: letter.physicalNotes,
      },
    });
  } catch (error) {
    console.error("실물 편지 상태 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "상태 조회 중 오류가 발생했습니다.",
    });
  }
});
```

### 4. 관리자용 실물 편지 관리 API

#### GET /api/admin/physical-requests (관리자 전용)

```javascript
/**
 * 실물 편지 신청 목록 조회 (관리자 전용)
 * GET /api/admin/physical-requests
 */
router.get("/admin/physical-requests", authenticateAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { physicalRequested: true };
    if (status && status !== "all") {
      filter.physicalStatus = status;
    }

    const letters = await Letter.find(filter)
      .select("title physicalStatus physicalRequestDate shippingAddress physicalNotes createdAt")
      .sort({ physicalRequestDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Letter.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: letters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("실물 편지 목록 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "목록 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * 실물 편지 상태 업데이트 (관리자 전용)
 * PATCH /api/admin/physical-requests/:letterId
 */
router.patch("/admin/physical-requests/:letterId", authenticateAdmin, async (req, res) => {
  try {
    const { letterId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["requested", "processing", "writing", "sent", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "올바르지 않은 상태값입니다.",
        validStatuses,
      });
    }

    const updatedLetter = await Letter.findByIdAndUpdate(
      letterId,
      {
        physicalStatus: status,
        physicalNotes: notes || "",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedLetter) {
      return res.status(404).json({
        success: false,
        error: "편지를 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      message: "상태가 업데이트되었습니다.",
      data: {
        letterId: updatedLetter._id,
        status: updatedLetter.physicalStatus,
        notes: updatedLetter.physicalNotes,
      },
    });
  } catch (error) {
    console.error("상태 업데이트 실패:", error);
    res.status(500).json({
      success: false,
      error: "상태 업데이트 중 오류가 발생했습니다.",
    });
  }
});

// 관리자 인증 미들웨어 (구현 필요)
function authenticateAdmin(req, res, next) {
  // TODO: 관리자 인증 로직 구현
  // JWT 토큰 검증, 관리자 권한 확인 등
  next();
}
```

### 5. 편지 조회 API 수정

#### 기존 GET /api/letters/:id 수정

```javascript
// 기존 편지 조회 API에 실물 편지 정보 추가
router.get("/letters/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const letter = await Letter.findById(id);
    if (!letter) {
      return res.status(404).json({
        success: false,
        error: "편지를 찾을 수 없습니다.",
      });
    }

    // 조회수 증가
    letter.viewCount = (letter.viewCount || 0) + 1;
    await letter.save();

    res.json({
      success: true,
      data: {
        _id: letter._id,
        title: letter.title,
        content: letter.content,
        type: letter.type,
        ogTitle: letter.ogTitle,
        ogPreviewText: letter.ogPreviewText,
        authorName: letter.authorName,
        category: letter.category,
        likeCount: letter.likeCount || 0,
        viewCount: letter.viewCount || 0,

        // 실물 편지 정보 추가
        physicalRequested: letter.physicalRequested || false,
        physicalStatus: letter.physicalStatus || "none",
        address: letter.physicalRequested ? letter.shippingAddress : null,

        createdAt: letter.createdAt,
      },
    });
  } catch (error) {
    console.error("편지 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "편지 조회에 실패했습니다.",
    });
  }
});
```

---

## 🔒 보안 고려사항

### 1. 입력 데이터 검증

- 주소 정보 필수 필드 검증
- 연락처 형식 검증 (한국 휴대폰 번호)
- 우편번호 형식 검증 (5자리 숫자)
- XSS 방지를 위한 HTML 태그 제거

### 2. 중복 신청 방지

- 동일 편지에 대한 중복 신청 차단
- 신청 상태 확인 후 처리

### 3. 개인정보 보호

- 배송 주소 정보 암호화 저장 (선택사항)
- 관리자만 전체 주소 정보 조회 가능
- 일반 사용자는 자신의 신청 상태만 조회

---

## 🧪 테스트 시나리오

### 1. 정상 신청 테스트

```javascript
// POST /api/letters/694b75482a481c18da78bda2/physical-request
{
  "address": {
    "name": "홍길동",
    "phone": "010-1234-5678",
    "zipCode": "12345",
    "address1": "서울시 강남구 테헤란로 123",
    "address2": "101동 202호"
  }
}

// 예상 응답
{
  "success": true,
  "message": "실물 편지 신청이 완료되었습니다.",
  "data": {
    "letterId": "694b75482a481c18da78bda2",
    "physicalStatus": "requested",
    "requestDate": "2024-12-24T10:30:00.000Z",
    "shippingAddress": {
      "name": "홍길동",
      "phone": "010-1234-5678",
      "address": "(12345) 서울시 강남구 테헤란로 123 101동 202호"
    }
  }
}
```

### 2. 중복 신청 테스트

```javascript
// 이미 신청된 편지에 재신청 시
{
  "success": false,
  "error": "이미 실물 편지가 신청된 편지입니다.",
  "currentStatus": "requested"
}
```

### 3. 유효성 검사 테스트

```javascript
// 필수 정보 누락 시
{
  "success": false,
  "error": "필수 주소 정보가 누락되었습니다.",
  "required": ["name", "phone", "zipCode", "address1"]
}
```

---

## 📋 체크리스트

### 구현 완료 체크

- [ ] Letter 모델에 실물 편지 관련 필드 추가
- [ ] POST /api/letters/:letterId/physical-request API 구현
- [ ] GET /api/letters/:letterId/physical-status API 구현
- [ ] 기존 편지 조회 API에 실물 편지 정보 추가
- [ ] 입력 데이터 검증 로직 구현
- [ ] 중복 신청 방지 로직 구현
- [ ] 관리자용 API 구현 (선택사항)
- [ ] 관리자 알림 시스템 구현 (선택사항)

### 테스트 완료 체크

- [ ] 정상 신청 플로우 테스트
- [ ] 중복 신청 방지 테스트
- [ ] 입력 데이터 검증 테스트
- [ ] 존재하지 않는 편지 ID 테스트
- [ ] 상태 조회 API 테스트

---

## 🔗 관련 문서

- [프론트엔드 Daum 주소 API 개선 프롬프트](../frontend/FRONTEND_DAUM_ADDRESS_API_PROMPT.md)
- [실물 편지 관리 시스템 가이드](../../guides/PHYSICAL_LETTER_MANAGEMENT_GUIDE.md)

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 4-6시간  
**의존성**: Letter 모델 스키마 업데이트 필요
