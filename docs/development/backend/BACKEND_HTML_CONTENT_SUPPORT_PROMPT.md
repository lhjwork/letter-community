# 🔧 백엔드 HTML 콘텐츠 지원 개선 프롬프트

## 📋 문제 상황

현재 프론트엔드에서 Tiptap 에디터로 작성된 HTML 형식의 편지 내용이 백엔드로 전송될 때 일반 텍스트로만 처리되어 서식(굵은 글씨, 기울임, 색상, 줄바꿈 등)이 손실되고 있습니다.

## 🎯 해결 목표

- 편지 내용을 HTML 형식으로 저장하고 조회할 수 있도록 백엔드 수정
- 기존 일반 텍스트 데이터와의 호환성 유지
- HTML 콘텐츠 보안 및 검증 추가

---

## 🛠 백엔드 수정 사항

### 1. 데이터베이스 스키마 수정

#### Letter 모델 업데이트

```javascript
// models/Letter.js 또는 해당 스키마 파일

const letterSchema = new mongoose.Schema({
  // 기존 필드들...
  title: { type: String, required: true },

  // HTML 콘텐츠 지원을 위한 필드 수정/추가
  content: {
    type: String,
    required: true,
  }, // HTML 형식 콘텐츠 저장

  contentType: {
    type: String,
    enum: ["text", "html"],
    default: "html",
  }, // 콘텐츠 타입 구분

  plainContent: {
    type: String,
  }, // 검색 및 미리보기용 일반 텍스트 (자동 생성)

  // 기존 필드들...
  ogTitle: String,
  ogPreviewText: String,
  type: { type: String, enum: ["story", "friend"], required: true },
  authorName: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
  // ...
});
```

### 2. HTML 콘텐츠 처리 유틸리티

#### HTML 처리 함수 추가

```javascript
// utils/htmlProcessor.js

const cheerio = require("cheerio"); // HTML 파싱용
const DOMPurify = require("isomorphic-dompurify"); // HTML 보안 처리용

/**
 * HTML 콘텐츠를 안전하게 정제하는 함수
 */
function sanitizeHtmlContent(htmlContent) {
  // 허용할 HTML 태그와 속성 정의
  const allowedTags = ["p", "br", "strong", "em", "u", "span", "ul", "ol", "li", "blockquote", "mark"];

  const allowedAttributes = {
    span: ["style"], // 색상 등 인라인 스타일 허용
    p: ["style"],
    strong: [],
    em: [],
    u: [],
    mark: [],
    ul: [],
    ol: [],
    li: [],
    blockquote: [],
    br: [],
  };

  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: Object.keys(allowedAttributes).reduce((acc, tag) => {
      allowedAttributes[tag].forEach((attr) => acc.push(attr));
      return acc;
    }, []),
  });
}

/**
 * HTML에서 일반 텍스트 추출
 */
function extractPlainText(htmlContent) {
  const $ = cheerio.load(htmlContent);
  return $.text().trim();
}

/**
 * OG 미리보기 텍스트 생성
 */
function generatePreviewText(htmlContent, maxLength = 60) {
  const plainText = extractPlainText(htmlContent);
  return plainText.length > maxLength ? plainText.slice(0, maxLength) + "..." : plainText;
}

module.exports = {
  sanitizeHtmlContent,
  extractPlainText,
  generatePreviewText,
};
```

### 3. API 엔드포인트 수정

#### 편지 생성 API 수정

```javascript
// routes/letters.js 또는 해당 라우터 파일

const { sanitizeHtmlContent, extractPlainText, generatePreviewText } = require("../utils/htmlProcessor");

// POST /api/letters - 편지 생성
router.post("/letters", async (req, res) => {
  try {
    const { title, content, type, ogTitle, authorName, category } = req.body;

    // HTML 콘텐츠 보안 처리
    const sanitizedContent = sanitizeHtmlContent(content);

    // 일반 텍스트 추출 (검색 및 분류용)
    const plainContent = extractPlainText(sanitizedContent);

    // OG 미리보기 텍스트 자동 생성
    const ogPreviewText = generatePreviewText(sanitizedContent);

    const letterData = {
      title: title.trim(),
      content: sanitizedContent, // HTML 형식으로 저장
      contentType: "html",
      plainContent: plainContent, // 검색용 일반 텍스트
      type,
      ogTitle: ogTitle || title.trim(),
      ogPreviewText,
      authorName: authorName?.trim(),
      category,
      // 기타 필드들...
    };

    const letter = new Letter(letterData);
    await letter.save();

    res.status(201).json({
      success: true,
      data: {
        _id: letter._id,
        title: letter.title,
        url: `/letter/${letter._id}`,
        // 기타 응답 데이터...
      },
    });
  } catch (error) {
    console.error("편지 생성 실패:", error);
    res.status(500).json({
      success: false,
      error: "편지 생성에 실패했습니다.",
    });
  }
});
```

#### 편지 조회 API 수정

```javascript
// GET /api/letters/:id - 편지 상세 조회
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

    // 조회수 증가 (선택사항)
    letter.viewCount = (letter.viewCount || 0) + 1;
    await letter.save();

    res.json({
      success: true,
      data: {
        _id: letter._id,
        title: letter.title,
        content: letter.content, // HTML 형식으로 반환
        contentType: letter.contentType || "html",
        plainContent: letter.plainContent, // 필요시 일반 텍스트도 제공
        type: letter.type,
        ogTitle: letter.ogTitle,
        ogPreviewText: letter.ogPreviewText,
        authorName: letter.authorName,
        category: letter.category,
        likeCount: letter.likeCount || 0,
        viewCount: letter.viewCount || 0,
        createdAt: letter.createdAt,
        // 기타 필드들...
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

### 4. 기존 데이터 마이그레이션

#### 기존 텍스트 데이터 처리

```javascript
// scripts/migrateContentType.js

const Letter = require("../models/Letter");

async function migrateExistingLetters() {
  try {
    // contentType이 없는 기존 편지들 찾기
    const letters = await Letter.find({
      $or: [{ contentType: { $exists: false } }, { contentType: null }],
    });

    console.log(`마이그레이션할 편지 수: ${letters.length}`);

    for (const letter of letters) {
      // 기존 content가 HTML인지 일반 텍스트인지 판단
      const isHtml = /<[^>]*>/g.test(letter.content);

      if (isHtml) {
        // 이미 HTML 형식인 경우
        letter.contentType = "html";
        letter.plainContent = extractPlainText(letter.content);
      } else {
        // 일반 텍스트인 경우
        letter.contentType = "text";
        letter.plainContent = letter.content;
        // 줄바꿈을 <br>로 변환하여 HTML 형식으로 저장
        letter.content = letter.content.replace(/\n/g, "<br>");
        letter.contentType = "html";
      }

      // OG 미리보기 텍스트가 없으면 생성
      if (!letter.ogPreviewText) {
        letter.ogPreviewText = generatePreviewText(letter.content);
      }

      await letter.save();
    }

    console.log("마이그레이션 완료");
  } catch (error) {
    console.error("마이그레이션 실패:", error);
  }
}

// 실행
migrateExistingLetters();
```

### 5. 검색 기능 개선

#### 텍스트 검색 최적화

```javascript
// 검색 시 plainContent 필드 사용
router.get("/letters/search", async (req, res) => {
  try {
    const { query, category, page = 1, limit = 10 } = req.query;

    const searchConditions = {};

    if (query) {
      // HTML이 아닌 일반 텍스트에서 검색
      searchConditions.$or = [{ title: { $regex: query, $options: "i" } }, { plainContent: { $regex: query, $options: "i" } }];
    }

    if (category) {
      searchConditions.category = category;
    }

    const letters = await Letter.find(searchConditions)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      data: letters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Letter.countDocuments(searchConditions),
      },
    });
  } catch (error) {
    console.error("검색 실패:", error);
    res.status(500).json({
      success: false,
      error: "검색에 실패했습니다.",
    });
  }
});
```

---

## 🔒 보안 고려사항

### 1. HTML 콘텐츠 보안

- **XSS 방지**: DOMPurify를 사용하여 악성 스크립트 제거
- **허용 태그 제한**: 편지 작성에 필요한 태그만 허용
- **인라인 스타일 검증**: 안전한 CSS 속성만 허용

### 2. 콘텐츠 크기 제한

```javascript
// 미들웨어로 콘텐츠 크기 제한
const contentSizeLimit = (req, res, next) => {
  if (req.body.content && req.body.content.length > 50000) {
    // 50KB 제한
    return res.status(400).json({
      success: false,
      error: "편지 내용이 너무 깁니다.",
    });
  }
  next();
};
```

---

## 📦 필요한 패키지 설치

```bash
npm install cheerio isomorphic-dompurify
```

---

## 🧪 테스트 시나리오

### 1. HTML 콘텐츠 저장 테스트

```javascript
// 테스트 데이터
const testContent = `
<p>안녕하세요!</p>
<p><strong>굵은 글씨</strong>와 <em>기울임</em>이 있는 편지입니다.</p>
<p><span style="color: red;">빨간색 텍스트</span>도 있어요.</p>
<ul>
  <li>목록 항목 1</li>
  <li>목록 항목 2</li>
</ul>
`;
```

### 2. 보안 테스트

```javascript
// 악성 스크립트 포함 테스트
const maliciousContent = `
<p>안녕하세요!</p>
<script>alert('XSS');</script>
<p onclick="alert('click')">클릭하지 마세요</p>
`;
// → 스크립트와 이벤트 핸들러가 제거되어야 함
```

---

## 📋 체크리스트

### 구현 완료 체크

- [ ] Letter 모델에 contentType, plainContent 필드 추가
- [ ] HTML 처리 유틸리티 함수 구현
- [ ] 편지 생성 API에서 HTML 콘텐츠 처리
- [ ] 편지 조회 API에서 HTML 콘텐츠 반환
- [ ] 기존 데이터 마이그레이션 스크립트 작성
- [ ] HTML 보안 처리 (DOMPurify) 적용
- [ ] 검색 기능에서 plainContent 사용
- [ ] 콘텐츠 크기 제한 미들웨어 추가

### 테스트 완료 체크

- [ ] HTML 형식 편지 생성 테스트
- [ ] 서식이 포함된 편지 조회 테스트
- [ ] XSS 공격 방어 테스트
- [ ] 기존 텍스트 편지 호환성 테스트
- [ ] 검색 기능 정상 동작 테스트

---

## 🔗 관련 문서

- [프론트엔드 HTML 콘텐츠 전송 개선 프롬프트](../frontend/FRONTEND_HTML_CONTENT_TRANSMISSION_PROMPT.md)
- [편지 서식 지원 구현 가이드](../../guides/LETTER_FORMATTING_IMPLEMENTATION_GUIDE.md)

---

**구현 우선순위**: 높음  
**예상 작업 시간**: 6-8시간  
**의존성**: cheerio, isomorphic-dompurify 패키지 설치 필요
