# 📮 백엔드 누적 실물 편지 신청 시스템 구현 프롬프트

## 📋 요구사항

편지 URL을 통해 접속한 각 방문자가 개별적으로 실물 편지를 신청할 수 있는 누적 시스템을 구현합니다. 편지 작성자와 방문자 모두 동일한 방식으로 편지를 신청할 수 있어야 합니다.

## 🎯 구현 목표

- 방문자별 개별 편지 신청 시스템
- 누적 신청 현황 관리
- 신청자별 상태 추적
- 관리자 대시보드 연동

---

## 🛠 백엔드 구현 사항

### 1. 데이터베이스 스키마

#### PhysicalLetterRequest 모델 수정

```javascript
const physicalLetterRequestSchema = new mongoose.Schema({
  // 기본 정보
  letterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Letter",
    required: true,
    index: true,
  },

  // 신청자 정보 (익명 가능)
  requesterInfo: {
    sessionId: { type: String, required: true }, // 세션 기반 식별
    userAgent: { type: String }, // 브라우저 정보
    ipAddress: { type: String }, // IP 주소 (해시 처리)
    requestedAt: { type: Date, default: Date.now },
  },

  // 수신자 정보
  recipientInfo: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true },
    address1: { type: String, required: true, trim: true },
    address2: { type: String, trim: true },
    memo: { type: String, trim: true },
  },

  // 비용 정보
  cost: {
    shippingCost: { type: Number, required: true },
    letterCost: { type: Number, default: 2000 },
    totalCost: { type: Number, required: true },
  },

  // 상태 관리
  status: {
    type: String,
    enum: ["requested", "confirmed", "writing", "sent", "delivered", "failed", "cancelled"],
    default: "requested",
  },

  // 배송 정보
  shipping: {
    trackingNumber: { type: String },
    shippingCompany: { type: String },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
  },

  // 관리자 메모
  adminNotes: [
    {
      note: { type: String },
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: String }, // 관리자 ID
    },
  ],

  // 타임스탬프
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 인덱스 설정
physicalLetterRequestSchema.index({ letterId: 1, "requesterInfo.sessionId": 1 });
physicalLetterRequestSchema.index({ status: 1 });
physicalLetterRequestSchema.index({ createdAt: -1 });
```

### 2. API 엔드포인트

#### 2.1 개별 편지 신청 API

```javascript
// POST /api/letters/:letterId/physical-request
router.post("/letters/:letterId/physical-request", async (req, res) => {
  try {
    const { letterId } = req.params;
    const { address } = req.body;

    // 세션 ID 생성 (없으면 새로 생성)
    const sessionId = req.session?.id || generateSessionId();

    // 요청자 정보 수집
    const requesterInfo = {
      sessionId,
      userAgent: req.get("User-Agent"),
      ipAddress: hashIP(req.ip), // IP 해시 처리
      requestedAt: new Date(),
    };

    // 편지 존재 확인
    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({ error: "편지를 찾을 수 없습니다." });
    }

    // 주소 유효성 검사
    const validationError = validateAddress(address);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // 비용 계산
    const shippingCost = calculateShippingCost(address.zipCode);
    const letterCost = 2000;
    const totalCost = shippingCost + letterCost;

    // 실물 편지 요청 생성
    const physicalRequest = new PhysicalLetterRequest({
      letterId,
      requesterInfo,
      recipientInfo: {
        name: address.name.trim(),
        phone: address.phone.trim(),
        zipCode: address.zipCode,
        address1: address.address1.trim(),
        address2: address.address2?.trim() || "",
        memo: address.memo?.trim() || "",
      },
      cost: {
        shippingCost,
        letterCost,
        totalCost,
      },
      status: "requested",
    });

    await physicalRequest.save();

    // 편지 통계 업데이트
    await Letter.findByIdAndUpdate(letterId, {
      $inc: { physicalRequestCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: "실물 편지 신청이 완료되었습니다.",
      data: {
        requestId: physicalRequest._id,
        cost: totalCost,
        status: "requested",
      },
    });
  } catch (error) {
    console.error("실물 편지 신청 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

#### 2.2 편지별 신청 현황 조회 API

```javascript
// GET /api/letters/:letterId/physical-requests
router.get("/letters/:letterId/physical-requests", async (req, res) => {
  try {
    const { letterId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // 편지 존재 확인
    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({ error: "편지를 찾을 수 없습니다." });
    }

    // 필터 조건 설정
    const filter = { letterId };
    if (status) {
      filter.status = status;
    }

    // 페이지네이션 설정
    const skip = (page - 1) * limit;

    // 신청 목록 조회
    const requests = await PhysicalLetterRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select("-requesterInfo.ipAddress -adminNotes"); // 민감 정보 제외

    // 총 개수 및 통계
    const totalRequests = await PhysicalLetterRequest.countDocuments(filter);

    // 상태별 통계
    const statusStats = await PhysicalLetterRequest.aggregate([{ $match: { letterId: new mongoose.Types.ObjectId(letterId) } }, { $group: { _id: "$status", count: { $sum: 1 } } }]);

    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // 총 비용 계산
    const totalCostResult = await PhysicalLetterRequest.aggregate([{ $match: { letterId: new mongoose.Types.ObjectId(letterId) } }, { $group: { _id: null, totalCost: { $sum: "$cost.totalCost" } } }]);

    const totalCost = totalCostResult[0]?.totalCost || 0;

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / limit),
          totalRequests,
          hasNext: skip + requests.length < totalRequests,
          hasPrev: page > 1,
        },
        summary: {
          totalRequests,
          statusCounts,
          totalCost,
        },
      },
    });
  } catch (error) {
    console.error("신청 현황 조회 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

#### 2.3 개별 신청 상태 조회 API

```javascript
// GET /api/physical-requests/:requestId
router.get("/physical-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const sessionId = req.session?.id;

    const request = await PhysicalLetterRequest.findById(requestId).populate("letterId", "ogTitle content").select("-adminNotes"); // 관리자 메모 제외

    if (!request) {
      return res.status(404).json({ error: "신청을 찾을 수 없습니다." });
    }

    // 세션 검증 (본인 신청만 조회 가능)
    if (request.requesterInfo.sessionId !== sessionId) {
      return res.status(403).json({ error: "접근 권한이 없습니다." });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("신청 상태 조회 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

### 3. 유틸리티 함수

#### 3.1 배송비 계산

```javascript
function calculateShippingCost(zipCode) {
  const seoulGyeonggi = ["01", "02", "03", "04", "05", "06", "07", "08", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];
  const prefix = zipCode.substring(0, 2);
  return seoulGyeonggi.includes(prefix) ? 3000 : 3500;
}
```

#### 3.2 주소 유효성 검사

```javascript
function validateAddress(address) {
  if (!address.name?.trim()) {
    return "받는 분 성함을 입력해주세요.";
  }

  if (!address.phone?.trim()) {
    return "연락처를 입력해주세요.";
  }

  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  if (!phoneRegex.test(address.phone.replace(/-/g, ""))) {
    return "올바른 휴대폰 번호 형식을 입력해주세요.";
  }

  if (!address.zipCode || !address.address1?.trim()) {
    return "주소를 입력해주세요.";
  }

  return null;
}
```

#### 3.3 세션 ID 생성

```javascript
function generateSessionId() {
  return crypto.randomBytes(16).toString("hex");
}
```

#### 3.4 IP 해시 처리

```javascript
function hashIP(ip) {
  return crypto
    .createHash("sha256")
    .update(ip + process.env.IP_SALT)
    .digest("hex");
}
```

### 4. 관리자 API

#### 4.1 전체 신청 관리 API

```javascript
// GET /api/admin/physical-requests
router.get("/admin/physical-requests", authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, letterId, startDate, endDate } = req.query;

    // 필터 조건 설정
    const filter = {};
    if (status) filter.status = status;
    if (letterId) filter.letterId = letterId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const requests = await PhysicalLetterRequest.find(filter).populate("letterId", "ogTitle type").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    const totalRequests = await PhysicalLetterRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / limit),
          totalRequests,
        },
      },
    });
  } catch (error) {
    console.error("관리자 신청 목록 조회 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

#### 4.2 신청 상태 업데이트 API

```javascript
// PATCH /api/admin/physical-requests/:requestId
router.patch("/admin/physical-requests/:requestId", authenticateAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, trackingNumber, shippingCompany, adminNote } = req.body;

    const updateData = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;

      if (status === "sent" && trackingNumber && shippingCompany) {
        updateData["shipping.trackingNumber"] = trackingNumber;
        updateData["shipping.shippingCompany"] = shippingCompany;
        updateData["shipping.sentAt"] = new Date();
      }

      if (status === "delivered") {
        updateData["shipping.deliveredAt"] = new Date();
      }
    }

    if (adminNote) {
      updateData.$push = {
        adminNotes: {
          note: adminNote,
          createdAt: new Date(),
          createdBy: req.admin.id,
        },
      };
    }

    const request = await PhysicalLetterRequest.findByIdAndUpdate(requestId, updateData, { new: true }).populate("letterId", "ogTitle");

    if (!request) {
      return res.status(404).json({ error: "신청을 찾을 수 없습니다." });
    }

    res.json({
      success: true,
      message: "신청 상태가 업데이트되었습니다.",
      data: request,
    });
  } catch (error) {
    console.error("신청 상태 업데이트 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

---

## 📊 통계 및 분석

### 1. 편지별 인기도 분석

```javascript
// GET /api/admin/analytics/popular-letters
router.get("/admin/analytics/popular-letters", authenticateAdmin, async (req, res) => {
  try {
    const popularLetters = await PhysicalLetterRequest.aggregate([
      {
        $group: {
          _id: "$letterId",
          requestCount: { $sum: 1 },
          totalRevenue: { $sum: "$cost.totalCost" },
          avgCost: { $avg: "$cost.totalCost" },
        },
      },
      { $sort: { requestCount: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "letters",
          localField: "_id",
          foreignField: "_id",
          as: "letter",
        },
      },
      { $unwind: "$letter" },
      {
        $project: {
          letterId: "$_id",
          title: "$letter.ogTitle",
          type: "$letter.type",
          requestCount: 1,
          totalRevenue: 1,
          avgCost: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: popularLetters,
    });
  } catch (error) {
    console.error("인기 편지 분석 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

---

## 🔒 보안 고려사항

### 1. 개인정보 보호

- IP 주소 해시 처리
- 민감한 정보 API 응답에서 제외
- 세션 기반 접근 제어

### 2. 스팸 방지

- 동일 세션에서 과도한 신청 제한
- Rate limiting 적용
- 의심스러운 패턴 감지

### 3. 데이터 무결성

- 트랜잭션 처리
- 유효성 검사 강화
- 에러 로깅 및 모니터링

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 16-20시간  
**의존성**: 세션 관리, 관리자 인증 시스템
