# 사연 목록 페이지 가이드

## 📄 페이지 개요

사연 목록 페이지는 공개된 사연(type: "story")을 Pinterest 스타일의 Masonry 레이아웃으로 보여주는 페이지입니다.

**경로**: `/stories`

---

## 🎨 UI 구성

### 1. 배너 섹션

- 그라데이션 배경 (coral/red)
- 타이틀: "배너 타이틀"
- 서브타이틀: "Letter, 진심을 전하는 커뮤니티"
- 로고 (우측, 데스크탑만)

### 2. 캐러셀 영역 (추후 구현)

- 높이: 모바일 192px, 데스크탑 256px
- 현재: 더미 영역으로 위치만 표시

### 3. 검색 & 필터 섹션

- **카테고리 필터**: 전체보기, 인기순, 최신순, 오래된순
- **검색바**: 제목/내용/작성자 검색
- **사연 작성 버튼**: `/write` 페이지로 이동

### 4. Masonry 그리드

- **레이아웃**: CSS columns 사용
  - 모바일: 1열
  - 태블릿 (sm): 2열
  - 데스크탑 (lg): 3열
  - 대형 화면 (xl): 4열
- **카드 높이**: 랜덤 (200px, 300px, 400px)
- **카드 구성**:
  - 제목 (최대 2줄)
  - 작성자
  - 본문 미리보기 (최대 4줄)
  - 작성일
  - 화살표 아이콘

---

## 🔧 기술 구현

### 컴포넌트 구조

```tsx
app/stories/page.tsx (Client Component)
├── 배너 섹션
├── 캐러셀 영역 (더미)
├── 검색 & 필터
└── Masonry 그리드
    └── StoryCard (Link)
```

### 상태 관리

```typescript
const [stories, setStories] = useState<Letter[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
const [categoryFilter, setCategoryFilter] = useState("전체보기");
```

### API 호출

```typescript
import { getStories } from "@/lib/api";

const loadStories = async () => {
  try {
    setIsLoading(true);
    const response = await getStories({
      limit: 20,
      search: searchQuery,
      sort: "latest",
    });
    setStories(response.data);
  } catch (error) {
    console.error("사연 목록 로드 실패:", error);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📡 API 연동

### API 함수 (lib/api.ts)

```typescript
export async function getStories(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{
  success: boolean;
  data: Letter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);

  return apiRequest(`/api/letters/stories?${queryParams.toString()}`, {
    method: "GET",
  });
}
```

### 백엔드 API

**Endpoint**: `GET /api/letters/stories`

**Query Parameters**:

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `search`: 검색어
- `sort`: 정렬 방식 (latest, oldest, popular)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "story_id",
      "type": "story",
      "title": "제목",
      "content": "내용",
      "authorName": "작성자",
      "createdAt": "2025-12-17T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## 🎨 Masonry 레이아웃

### CSS Columns 사용

```tsx
<div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
  {stories.map((story, index) => (
    <div
      key={story._id}
      className="break-inside-avoid block mb-4"
      style={{ height: `${200 + (index % 3) * 100}px` }}
    >
      {/* 카드 내용 */}
    </div>
  ))}
</div>
```

### 랜덤 높이 생성

```typescript
// index % 3에 따라 200px, 300px, 400px
height: `${200 + (index % 3) * 100}px`;
```

---

## 🔍 검색 & 필터 기능

### 검색 구현

```typescript
const [searchQuery, setSearchQuery] = useState("");

const handleSearch = async () => {
  const response = await getStories({
    search: searchQuery,
    limit: 20,
  });
  setStories(response.data);
};

// 엔터키 입력 시 검색
<input onKeyPress={(e) => e.key === "Enter" && handleSearch()} />;
```

### 필터 구현

```typescript
const [categoryFilter, setCategoryFilter] = useState("전체보기");

const handleFilterChange = async (filter: string) => {
  setCategoryFilter(filter);

  let sortOption = "latest";
  if (filter === "인기순") sortOption = "popular";
  if (filter === "최신순") sortOption = "latest";
  if (filter === "오래된순") sortOption = "oldest";

  const response = await getStories({
    sort: sortOption,
    limit: 20,
  });
  setStories(response.data);
};
```

---

## 📱 반응형 디자인

### 브레이크포인트

| 화면 크기              | 열 개수 | Tailwind 클래스 |
| ---------------------- | ------- | --------------- |
| 모바일 (0-639px)       | 1열     | `columns-1`     |
| 태블릿 (640-1023px)    | 2열     | `sm:columns-2`  |
| 데스크탑 (1024-1279px) | 3열     | `lg:columns-3`  |
| 대형 화면 (1280px+)    | 4열     | `xl:columns-4`  |

### 모바일 최적화

```tsx
{
  /* 배너 - 모바일에서 로고 숨김 */
}
<div className="hidden md:block">
  <Image src="/icons/letter-logo.svg" />
</div>;

{
  /* 검색 - 모바일에서 세로 배치 */
}
<div className="flex flex-col md:flex-row gap-4">{/* 필터 & 검색 */}</div>;
```

---

## 🎯 사용자 경험 (UX)

### 호버 효과

```tsx
<div className="hover:shadow-xl transition-shadow duration-300 group">
  <h3 className="group-hover:text-primary transition-colors">{story.title}</h3>
  <span className="group-hover:translate-x-1 transition-transform">→</span>
</div>
```

### 로딩 상태

```tsx
{
  isLoading ? (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-400">로딩 중...</p>
    </div>
  ) : (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
      {/* 사연 카드 */}
    </div>
  );
}
```

### 빈 상태

```tsx
{
  stories.length === 0 && !isLoading && (
    <div className="text-center py-16">
      <p className="text-gray-400 text-lg">아직 등록된 사연이 없습니다</p>
      <Link href="/write" className="mt-4 inline-block">
        첫 사연 작성하기
      </Link>
    </div>
  );
}
```

---

## 🚀 성능 최적화

### 1. 이미지 최적화

```tsx
import Image from "next/image";

<Image
  src="/icons/letter-logo.svg"
  alt="Letter"
  width={120}
  height={120}
  priority // 중요한 이미지는 우선 로드
/>;
```

### 2. 무한 스크롤 (추후 구현)

```typescript
const [page, setPage] = useState(1);

const loadMore = async () => {
  const response = await getStories({
    page: page + 1,
    limit: 20,
  });
  setStories([...stories, ...response.data]);
  setPage(page + 1);
};

// Intersection Observer 사용
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    },
    { threshold: 1.0 }
  );

  if (bottomRef.current) {
    observer.observe(bottomRef.current);
  }

  return () => observer.disconnect();
}, [page]);
```

### 3. 디바운싱 (검색)

```typescript
import { useDebounce } from "@/hooks/useDebounce";

const debouncedSearch = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedSearch) {
    handleSearch();
  }
}, [debouncedSearch]);
```

---

## 🐛 문제 해결

### Masonry 레이아웃이 깨지는 경우

1. `break-inside-avoid` 클래스 확인
2. 부모 요소에 `columns-*` 클래스 적용 확인
3. 카드 높이가 고정되어 있는지 확인

### API 호출이 실패하는 경우

1. 백엔드 서버 실행 확인
2. CORS 설정 확인
3. 환경 변수 `NEXT_PUBLIC_BACKEND_URL` 확인
4. 네트워크 탭에서 요청/응답 확인

### 검색이 작동하지 않는 경우

1. 백엔드에서 검색 기능 구현 확인
2. Query 파라미터 전달 확인
3. 한글 인코딩 문제 확인 (encodeURIComponent)

---

## ✅ 체크리스트

### 프론트엔드

- [x] `/stories` 페이지 생성
- [x] Masonry 레이아웃 구현
- [x] 검색 UI 구현 (더미)
- [x] 필터 UI 구현 (더미)
- [x] 캐러셀 영역 위치 잡기 (더미)
- [x] 반응형 디자인 적용
- [x] 호버 효과 추가
- [x] 로딩 상태 처리
- [x] API 함수 작성 (`getStories`)
- [ ] 백엔드 API 연동
- [ ] 검색 기능 연동
- [ ] 필터 기능 연동
- [ ] 무한 스크롤 구현 (선택)
- [ ] 캐러셀 구현 (추후)

### 백엔드

- [ ] `GET /api/letters/stories` 엔드포인트 구현
- [ ] Letter 모델에 `type` 필드 추가
- [ ] 페이지네이션 구현
- [ ] 검색 기능 구현
- [ ] 정렬 기능 구현
- [ ] 인덱스 추가 (성능 최적화)
- [ ] CORS 설정

---

## 📚 관련 문서

- [백엔드 API 프롬프트](../../BACKEND_STORIES_API_PROMPT.md)
- [백엔드 API 스펙](../../BACKEND_API_SPEC.md)
- [페이지 구조 가이드](PAGES_GUIDE.md)
- [MVP 구현 가이드](MVP_IMPLEMENTATION.md)

---

**마지막 업데이트**: 2024년 12월 17일
