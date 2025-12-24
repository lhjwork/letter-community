# 📮 백엔드 편지 작성자 승인 시스템 구현 프롬프트

## 📋 요구사항

편지 URL에 접속한 사람들이 여러 번 실물 편지를 신청할 수 있고, 편지 작성자가 신청자들을 확인하여 승인해야만 실제 배송이 진행되는 시스템을 구현합니다.

## 🎯 구현 목표

- 방문자의 무제한 실물 편지 신청 허용
- 편지 작성자의 신청자 목록 조회 및 승인 시스템
- 승인된 신청만 배송 진행
- 신청자 정보의 편지별 노출 관리

---

## 🛠 백엔드 구현 사항

### 1. 데이터베이스 스키마

#### PhysicalLetterRequest 모델

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

  // 승인 및 상태 관리
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "writing", "sent", "delivered", "cancelled"],
    default: "pending",
  },

  // 작성자 승인 정보
  authorApproval: {
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 편지 작성자
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
  },

  // 배송 정보 (승인 후에만 사용)
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
      createdBy: { type: String },
    },
  ],

  // 타임스탬프
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 인덱스 설정
physicalLetterRequestSchema.index({ letterId: 1, status: 1 });
physicalLetterRequestSchema.index({ "authorApproval.isApproved": 1 });
physicalLetterRequestSchema.index({ createdAt: -1 });
```

#### Letter 모델 업데이트

```javascript
const letterSchema = new mongoose.Schema({
  // 기존 필드들...
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ["story", "friend"], required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // 실물 편지 관련 통계
  physicalLetterStats: {
    totalRequests: { type: Number, default: 0 }, // 총 신청 수
    pendingRequests: { type: Number, default: 0 }, // 대기 중인 신청
    approvedRequests: { type: Number, default: 0 }, // 승인된 신청
    rejectedRequests: { type: Number, default: 0 }, // 거절된 신청
    completedRequests: { type: Number, default: 0 }, // 배송 완료된 신청
  },

  // 작성자 설정
  authorSettings: {
    allowPhysicalRequests: { type: Boolean, default: true }, // 실물 편지 신청 허용 여부
    autoApprove: { type: Boolean, default: false }, // 자동 승인 여부
    maxRequestsPerPerson: { type: Number, default: 5 }, // 1인당 최대 신청 수
    requireApprovalMessage: { type: String }, // 승인 요청 메시지
  },

  // 타임스탬프
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### 2. API 엔드포인트

#### 2.1 실물 편지 신청 API (무제한 허용)

```javascript
// POST /api/letters/:letterId/physical-requests
router.post("/letters/:letterId/physical-requests", async (req, res) => {
  try {
    const { letterId } = req.params;
    const { address } = req.body;

    // 세션 ID 생성 (없으면 새로 생성)
    const sessionId = req.session?.id || generateSessionId();

    // 편지 존재 확인
    const letter = await Letter.findById(letterId).populate("authorId");
    if (!letter) {
      return res.status(404).json({ error: "편지를 찾을 수 없습니다." });
    }

    // 실물 편지 신청 허용 여부 확인
    if (!letter.authorSettings.allowPhysicalRequests) {
      return res.status(403).json({ error: "이 편지는 실물 편지 신청이 허용되지 않습니다." });
    }

    // 1인당 최대 신청 수 확인
    const existingRequests = await PhysicalLetterRequest.countDocuments({
      letterId,
      "requesterInfo.sessionId": sessionId,
      status: { $nin: ["cancelled", "rejected"] },
    });

    if (existingRequests >= letter.authorSettings.maxRequestsPerPerson) {
      return res.status(400).json({
        error: `1인당 최대 ${letter.authorSettings.maxRequestsPerPerson}개까지만 신청할 수 있습니다.`,
      });
    }

    // 요청자 정보 수집
    const requesterInfo = {
      sessionId,
      userAgent: req.get("User-Agent"),
      ipAddress: hashIP(req.ip),
      requestedAt: new Date(),
    };

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
      status: letter.authorSettings.autoApprove ? "approved" : "pending",
      authorApproval: {
        isApproved: letter.authorSettings.autoApprove,
        approvedAt: letter.authorSettings.autoApprove ? new Date() : null,
        approvedBy: letter.authorSettings.autoApprove ? letter.authorId : null,
      },
    });

    await physicalRequest.save();

    // 편지 통계 업데이트
    const updateFields = {
      "physicalLetterStats.totalRequests": 1,
    };

    if (letter.authorSettings.autoApprove) {
      updateFields["physicalLetterStats.approvedRequests"] = 1;
    } else {
      updateFields["physicalLetterStats.pendingRequests"] = 1;
    }

    await Letter.findByIdAndUpdate(letterId, { $inc: updateFields });

    // 편지 작성자에게 알림 (자동 승인이 아닌 경우)
    if (!letter.authorSettings.autoApprove) {
      await sendNotificationToAuthor(letter.authorId, {
        type: "physical_letter_request",
        letterId,
        letterTitle: letter.title,
        requesterName: address.name,
        requestId: physicalRequest._id,
      });
    }

    res.status(201).json({
      success: true,
      message: letter.authorSettings.autoApprove ? "실물 편지 신청이 자동 승인되었습니다." : "실물 편지 신청이 완료되었습니다. 편지 작성자의 승인을 기다려주세요.",
      data: {
        requestId: physicalRequest._id,
        cost: totalCost,
        status: physicalRequest.status,
        needsApproval: !letter.authorSettings.autoApprove,
      },
    });
  } catch (error) {
    console.error("실물 편지 신청 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

#### 2.2 편지 작성자용 신청 목록 조회 API

```javascript
// GET /api/letters/:letterId/physical-requests/author
router.get("/letters/:letterId/physical-requests/author", authenticateUser, async (req, res) => {
  try {
    const { letterId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // 편지 소유권 확인
    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({ error: "편지를 찾을 수 없습니다." });
    }

    if (letter.authorId.toString() !== userId) {
      return res.status(403).json({ error: "편지 작성자만 접근할 수 있습니다." });
    }

    // 필터 조건 설정
    const filter = { letterId };
    if (status) {
      filter.status = status;
    }

    // 페이지네이션 설정
    const skip = (page - 1) * limit;

    // 신청 목록 조회
    const requests = await PhysicalLetterRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select("-requesterInfo.ipAddress"); // IP 주소 제외

    // 총 개수 및 통계
    const totalRequests = await PhysicalLetterRequest.countDocuments(filter);

    // 상태별 통계
    const statusStats = await PhysicalLetterRequest.aggregate([{ $match: { letterId: new mongoose.Types.ObjectId(letterId) } }, { $group: { _id: "$status", count: { $sum: 1 } } }]);

    const statusCounts = statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // 총 예상 비용 (승인된 것만)
    const approvedCostResult = await PhysicalLetterRequest.aggregate([
      {
        $match: {
          letterId: new mongoose.Types.ObjectId(letterId),
          "authorApproval.isApproved": true,
        },
      },
      { $group: { _id: null, totalCost: { $sum: "$cost.totalCost" } } },
    ]);

    const totalApprovedCost = approvedCostResult[0]?.totalCost || 0;

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
          totalApprovedCost,
          letterSettings: letter.authorSettings,
        },
      },
    });
  } catch (error) {
    console.error("작성자 신청 목록 조회 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

#### 2.3 편지 작성자용 신청 승인/거절 API

```javascript
// PATCH /api/letters/:letterId/physical-requests/:requestId/approval
router.patch("/letters/:letterId/physical-requests/:requestId/approval", authenticateUser, async (req, res) => {
  try {
    const { letterId, requestId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'
    const userId = req.user.id;

    // 편지 소유권 확인
    const letter = await Letter.findById(letterId);
    if (!letter || letter.authorId.toString() !== userId) {
      return res.status(403).json({ error: "편지 작성자만 접근할 수 있습니다." });
    }

    // 신청 확인
    const request = await PhysicalLetterRequest.findById(requestId);
    if (!request || request.letterId.toString() !== letterId) {
      return res.status(404).json({ error: "신청을 찾을 수 없습니다." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "이미 처리된 신청입니다." });
    }

    // 승인/거절 처리
    const updateData = { updatedAt: new Date() };
    let statusUpdate = {};

    if (action === "approve") {
      updateData.status = "approved";
      updateData["authorApproval.isApproved"] = true;
      updateData["authorApproval.approvedAt"] = new Date();
      updateData["authorApproval.approvedBy"] = userId;

      statusUpdate = {
        $inc: {
          "physicalLetterStats.pendingRequests": -1,
          "physicalLetterStats.approvedRequests": 1,
        },
      };

      // 신청자에게 승인 알림
      await sendNotificationToRequester(request.requesterInfo.sessionId, {
        type: "request_approved",
        letterId,
        letterTitle: letter.title,
        requestId,
      });
    } else if (action === "reject") {
      updateData.status = "rejected";
      updateData["authorApproval.rejectedAt"] = new Date();
      updateData["authorApproval.rejectionReason"] = rejectionReason || "작성자에 의해 거절됨";

      statusUpdate = {
        $inc: {
          "physicalLetterStats.pendingRequests": -1,
          "physicalLetterStats.rejectedRequests": 1,
        },
      };

      // 신청자에게 거절 알림
      await sendNotificationToRequester(request.requesterInfo.sessionId, {
        type: "request_rejected",
        letterId,
        letterTitle: letter.title,
        requestId,
        reason: rejectionReason,
      });
    } else {
      return res.status(400).json({ error: "유효하지 않은 액션입니다." });
    }

    // 신청 상태 업데이트
    const updatedRequest = await PhysicalLetterRequest.findByIdAndUpdate(requestId, updateData, { new: true });

    // 편지 통계 업데이트
    await Letter.findByIdAndUpdate(letterId, statusUpdate);

    res.json({
      success: true,
      message: action === "approve" ? "신청이 승인되었습니다." : "신청이 거절되었습니다.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("신청 승인/거절 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

#### 2.4 편지별 공개 신청 현황 조회 API

```javascript
// GET /api/letters/:letterId/physical-requests/public
router.get("/letters/:letterId/physical-requests/public", async (req, res) => {
  try {
    const { letterId } = req.params;
    const { limit = 10 } = req.query;

    // 편지 존재 확인
    const letter = await Letter.findById(letterId);
    if (!letter) {
      return res.status(404).json({ error: "편지를 찾을 수 없습니다." });
    }

    // 승인된 신청만 공개 (개인정보 제외)
    const approvedRequests = await PhysicalLetterRequest.find({
      letterId,
      "authorApproval.isApproved": true,
    })
      .sort({ "authorApproval.approvedAt": -1 })
      .limit(parseInt(limit))
      .select("recipientInfo.name authorApproval.approvedAt cost.totalCost");

    // 통계 정보
    const stats = await PhysicalLetterRequest.aggregate([
      { $match: { letterId: new mongoose.Types.ObjectId(letterId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalCost: { $sum: "$cost.totalCost" },
        },
      },
    ]);

    const summary = {
      totalRequests: letter.physicalLetterStats.totalRequests,
      approvedRequests: letter.physicalLetterStats.approvedRequests,
      pendingRequests: letter.physicalLetterStats.pendingRequests,
      allowNewRequests: letter.authorSettings.allowPhysicalRequests,
    };

    res.json({
      success: true,
      data: {
        approvedRequests: approvedRequests.map((req) => ({
          recipientName: req.recipientInfo.name.charAt(0) + "***", // 이름 마스킹
          approvedAt: req.authorApproval.approvedAt,
          cost: req.cost.totalCost,
        })),
        summary,
      },
    });
  } catch (error) {
    console.error("공개 신청 현황 조회 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

### 3. 유틸리티 함수

#### 3.1 알림 시스템

```javascript
// 편지 작성자에게 알림
async function sendNotificationToAuthor(authorId, notificationData) {
  try {
    // 실시간 알림 (WebSocket/SSE)
    await sendRealTimeNotification(authorId, notificationData);

    // 이메일 알림 (선택사항)
    const author = await User.findById(authorId);
    if (author && author.emailNotifications) {
      await sendEmailNotification(author.email, {
        subject: `새로운 실물 편지 신청: ${notificationData.letterTitle}`,
        template: "physical_letter_request",
        data: notificationData,
      });
    }
  } catch (error) {
    console.error("작성자 알림 전송 실패:", error);
  }
}

// 신청자에게 알림 (세션 기반)
async function sendNotificationToRequester(sessionId, notificationData) {
  try {
    // 세션 기반 실시간 알림
    await sendSessionNotification(sessionId, notificationData);
  } catch (error) {
    console.error("신청자 알림 전송 실패:", error);
  }
}
```

#### 3.2 편지 작성자 설정 관리

```javascript
// PATCH /api/letters/:letterId/settings
router.patch("/letters/:letterId/settings", authenticateUser, async (req, res) => {
  try {
    const { letterId } = req.params;
    const { authorSettings } = req.body;
    const userId = req.user.id;

    // 편지 소유권 확인
    const letter = await Letter.findById(letterId);
    if (!letter || letter.authorId.toString() !== userId) {
      return res.status(403).json({ error: "편지 작성자만 접근할 수 있습니다." });
    }

    // 설정 업데이트
    const updatedLetter = await Letter.findByIdAndUpdate(
      letterId,
      {
        authorSettings: {
          ...letter.authorSettings,
          ...authorSettings,
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "설정이 업데이트되었습니다.",
      data: updatedLetter.authorSettings,
    });
  } catch (error) {
    console.error("편지 설정 업데이트 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

---

## 📊 통계 및 분석

### 1. 편지별 신청 분석

```javascript
// GET /api/admin/analytics/physical-requests
router.get("/admin/analytics/physical-requests", authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchCondition = {};
    if (startDate || endDate) {
      matchCondition.createdAt = {};
      if (startDate) matchCondition.createdAt.$gte = new Date(startDate);
      if (endDate) matchCondition.createdAt.$lte = new Date(endDate);
    }

    const analytics = await PhysicalLetterRequest.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            letterId: "$letterId",
            status: "$status",
          },
          count: { $sum: 1 },
          totalCost: { $sum: "$cost.totalCost" },
        },
      },
      {
        $lookup: {
          from: "letters",
          localField: "_id.letterId",
          foreignField: "_id",
          as: "letter",
        },
      },
      { $unwind: "$letter" },
      {
        $group: {
          _id: "$_id.letterId",
          letterTitle: { $first: "$letter.title" },
          authorId: { $first: "$letter.authorId" },
          statusBreakdown: {
            $push: {
              status: "$_id.status",
              count: "$count",
              totalCost: "$totalCost",
            },
          },
          totalRequests: { $sum: "$count" },
          totalRevenue: { $sum: "$totalCost" },
        },
      },
      { $sort: { totalRequests: -1 } },
    ]);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("신청 분석 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});
```

---

## 🔒 보안 고려사항

### 1. 개인정보 보호

- 신청자 IP 주소 해시 처리
- 공개 API에서 개인정보 마스킹
- 편지 작성자만 상세 정보 접근 가능

### 2. 스팸 방지

- 1인당 최대 신청 수 제한
- Rate limiting 적용
- 의심스러운 패턴 감지

### 3. 권한 관리

- 편지 작성자 인증 필수
- 세션 기반 신청자 식별
- 관리자 권한 분리

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 24-30시간  
**의존성**: 사용자 인증 시스템, 알림 시스템, 관리자 대시보드
