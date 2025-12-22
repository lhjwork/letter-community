# 백엔드 개발자용 - 좋아요한 사연 통계 API 추가 (선택사항)

## 🎯 현재 상황

좋아요한 사연 기능(`GET /api/users/me/likes`)이 이미 완전히 구현되어 정상 작동하고 있습니다.

## 📋 추가 요청사항 (선택사항)

사용자에게 더 풍부한 정보를 제공하기 위해 **통계 API**를 추가로 구현해주세요.

### 새로운 엔드포인트

**URL**: `GET /api/users/me/likes/stats`
**인증**: Bearer Token 필요

### 응답 형식

```json
{
  "success": true,
  "data": {
    "totalLikes": 25,
    "thisWeek": 3,
    "thisMonth": 12,
    "topCategories": [
      {
        "category": "일상",
        "count": 10
      },
      {
        "category": "연애",
        "count": 8
      },
      {
        "category": "가족",
        "count": 7
      }
    ]
  }
}
```

### 간단한 구현 예시

```javascript
app.get("/api/users/me/likes/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 총 좋아요 수
    const totalLikes = await Like.countDocuments({ userId });

    // 이번 주 좋아요 (지난 7일)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = await Like.countDocuments({
      userId,
      createdAt: { $gte: oneWeekAgo },
    });

    // 이번 달 좋아요 (지난 30일)
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const thisMonth = await Like.countDocuments({
      userId,
      createdAt: { $gte: oneMonthAgo },
    });

    // 상위 카테고리 (선택사항)
    const topCategories = await Like.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: "letters",
          localField: "letterId",
          foreignField: "_id",
          as: "letter",
        },
      },
      { $unwind: "$letter" },
      {
        $group: {
          _id: "$letter.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    res.json({
      success: true,
      data: {
        totalLikes,
        thisWeek,
        thisMonth,
        topCategories: topCategories.map((cat) => ({
          category: cat._id || "기타",
          count: cat.count,
        })),
      },
    });
  } catch (error) {
    console.error("통계 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "통계를 불러오는데 실패했습니다.",
    });
  }
});
```

## ⚡ 우선순위

- **높음**: 현재 기능 유지 (이미 완료)
- **낮음**: 통계 API 추가 (선택사항)

## 🤔 결론

**현재 좋아요한 사연 기능이 완전히 작동하고 있으므로, 추가 작업은 선택사항입니다.**

만약 통계 기능이 필요하다면 위의 간단한 API를 추가해주세요. 그렇지 않다면 현재 상태를 유지하면 됩니다.
