# 백엔드 개발자용 - 좋아요한 사연 통계 API 구현 프롬프트

## 🎯 목표

사용자의 좋아요한 사연에 대한 통계 정보를 제공하는 API를 구현하여, 프론트엔드에서 더 풍부한 사용자 경험을 제공할 수 있도록 합니다.

## 📋 구현 요구사항

### 1. 새로운 API 엔드포인트 생성

**엔드포인트**: `GET /api/users/me/likes/stats`
**인증**: Bearer Token 필요
**설명**: 현재 사용자의 좋아요 통계 정보를 반환

### 2. 응답 데이터 구조

```json
{
  "success": true,
  "data": {
    "totalLikes": 25,
    "categories": [
      {
        "category": "일상",
        "count": 10,
        "percentage": "40%"
      },
      {
        "category": "연애",
        "count": 8,
        "percentage": "32%"
      },
      {
        "category": "가족",
        "count": 7,
        "percentage": "28%"
      }
    ],
    "recentActivity": {
      "thisWeek": 3,
      "thisMonth": 12
    }
  }
}
```

### 3. 구현해야 할 통계 항목

1. **총 좋아요 수** (`totalLikes`)

   - 사용자가 좋아요를 누른 총 사연 개수

2. **카테고리별 분포** (`categories`)

   - 각 카테고리별 좋아요 개수
   - 전체 대비 퍼센티지
   - 개수 기준 내림차순 정렬

3. **최근 활동** (`recentActivity`)
   - 이번 주 좋아요 개수 (지난 7일)
   - 이번 달 좋아요 개수 (지난 30일)

## 🔧 구현 가이드

### MongoDB Aggregation 예시

```javascript
// GET /api/users/me/likes/stats
app.get("/api/users/me/likes/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. 총 좋아요 수 조회
    const totalLikes = await Like.countDocuments({
      userId: new ObjectId(userId),
    });

    // 2. 카테고리별 통계 집계
    const categoryStats = await Like.aggregate([
      {
        $match: { userId: new ObjectId(userId) },
      },
      {
        $lookup: {
          from: "letters",
          localField: "letterId",
          foreignField: "_id",
          as: "letter",
        },
      },
      {
        $unwind: "$letter",
      },
      {
        $group: {
          _id: "$letter.category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10, // 상위 10개 카테고리만
      },
    ]);

    // 3. 퍼센티지 계산
    const categories = categoryStats.map((stat) => ({
      category: stat._id || "기타",
      count: stat.count,
      percentage: totalLikes > 0 ? `${Math.round((stat.count / totalLikes) * 100)}%` : "0%",
    }));

    // 4. 최근 활동 통계
    const now = new Date();

    // 이번 주 (지난 7일)
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 이번 달 (지난 30일)
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const [thisWeek, thisMonth] = await Promise.all([
      Like.countDocuments({
        userId: new ObjectId(userId),
        createdAt: { $gte: oneWeekAgo },
      }),
      Like.countDocuments({
        userId: new ObjectId(userId),
        createdAt: { $gte: oneMonthAgo },
      }),
    ]);

    // 5. 응답 반환
    res.json({
      success: true,
      data: {
        totalLikes,
        categories,
        recentActivity: {
          thisWeek,
          thisMonth,
        },
      },
    });
  } catch (error) {
    console.error("좋아요 통계 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "통계를 불러오는데 실패했습니다.",
    });
  }
});
```

## 🗃️ 데이터베이스 스키마 확인

### 필요한 컬렉션들

1. **likes** 컬렉션

   ```javascript
   {
     _id: ObjectId,
     userId: ObjectId,      // 좋아요를 누른 사용자
     letterId: ObjectId,    // 좋아요한 사연/편지
     createdAt: Date,       // 좋아요 누른 시간
     updatedAt: Date
   }
   ```

2. **letters** 컬렉션 (사연)
   ```javascript
   {
     _id: ObjectId,
     type: "story",         // 사연 타입
     category: String,      // 카테고리 (일상, 연애, 가족 등)
     title: String,
     content: String,
     // ... 기타 필드들
   }
   ```

### 인덱스 최적화

성능 향상을 위해 다음 인덱스들을 생성하세요:

```javascript
// likes 컬렉션 인덱스
db.likes.createIndex({ userId: 1, createdAt: -1 });
db.likes.createIndex({ userId: 1, letterId: 1 }, { unique: true });

// letters 컬렉션 인덱스
db.letters.createIndex({ category: 1 });
db.letters.createIndex({ type: 1, category: 1 });
```

## 🧪 테스트 케이스

### 1. 정상 케이스

```bash
GET /api/users/me/likes/stats
Authorization: Bearer {valid_token}

# 예상 응답: 200 OK with stats data
```

### 2. 좋아요가 없는 사용자

```bash
GET /api/users/me/likes/stats
Authorization: Bearer {token_with_no_likes}

# 예상 응답:
{
  "success": true,
  "data": {
    "totalLikes": 0,
    "categories": [],
    "recentActivity": {
      "thisWeek": 0,
      "thisMonth": 0
    }
  }
}
```

### 3. 인증 실패

```bash
GET /api/users/me/likes/stats
# Authorization 헤더 없음

# 예상 응답: 401 Unauthorized
```

## 🚀 성능 고려사항

1. **캐싱 전략**

   - Redis를 사용한 통계 데이터 캐싱 (TTL: 5분)
   - 사용자별 캐시 키: `user_likes_stats:{userId}`

2. **쿼리 최적화**

   - Aggregation pipeline 최적화
   - 필요한 인덱스 생성
   - 불필요한 필드 제외 (`$project` 사용)

3. **에러 처리**
   - MongoDB 연결 실패 처리
   - 잘못된 사용자 ID 처리
   - 타임아웃 처리

## 📝 완료 체크리스트

- [ ] `/api/users/me/likes/stats` 엔드포인트 구현
- [ ] 총 좋아요 수 계산 로직 구현
- [ ] 카테고리별 통계 집계 로직 구현
- [ ] 퍼센티지 계산 로직 구현
- [ ] 최근 활동 통계 (주간/월간) 구현
- [ ] 에러 처리 및 예외 상황 대응
- [ ] 인덱스 생성 (성능 최적화)
- [ ] 단위 테스트 작성
- [ ] API 문서 업데이트
- [ ] 캐싱 구현 (선택사항)

## 🔍 추가 고려사항

1. **확장성**: 향후 더 많은 통계 항목 추가 가능하도록 구조 설계
2. **보안**: 사용자 인증 및 권한 확인 철저히
3. **모니터링**: API 응답 시간 및 에러율 모니터링 설정
4. **문서화**: Swagger/OpenAPI 문서 업데이트
