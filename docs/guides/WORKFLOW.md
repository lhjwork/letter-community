# PC 디자인만 있을 때 작업 가이드

## 상황: PC 디자인만 나온 상태

### 🎯 추천 방법: 합리적 추정 + 주석 (가장 실용적)

```tsx
/**
 * TODO: 모바일 디자인 나오면 수정 필요
 * 현재는 PC 디자인 기준으로 합리적으로 추정
 */
export default function Hero() {
  return (
    <section
      className="
      /* 🔴 TODO: 모바일 디자인 확인 필요 */
      /* 임시: PC의 1/4로 추정 */
      px-4 py-8 text-base
      
      /* 🟡 TODO: 태블릿 디자인 확인 필요 */
      /* 임시: PC의 1/2로 추정 */
      md:px-8 md:py-12 md:text-lg
      
      /* ✅ PC 디자인 확정 */
      xxl:px-16 xxl:py-16 xxl:text-2xl
    "
    >
      <h1
        className="
        /* 🔴 TODO: 모바일 확인 필요 */
        text-3xl
        
        /* 🟡 TODO: 태블릿 확인 필요 */
        md:text-4xl
        
        /* ✅ PC 확정 */
        xxl:text-6xl
      "
      >
        제목
      </h1>
    </section>
  );
}
```

## 추정 공식 (경험적 가이드)

### Spacing (여백)

```
PC 디자인 → 모바일 추정
64px → 16px (1/4)
48px → 12px (1/4)
32px → 8px (1/4)
120px → 16-24px (1/6~1/8)
```

### Typography (폰트)

```
PC 디자인 → 모바일 추정
40px → 24px (0.6배)
32px → 20px (0.6배)
24px → 16px (0.6배)
16px → 14px (0.9배)
```

### Layout (레이아웃)

```
PC 디자인 → 모바일 추정
3열 그리드 → 1열
2열 그리드→ 1열
가로 배치 → 세로 배치
```

## 실전 예제

### 예제 1: Hero Section

```tsx
// PC 디자인: padding 64px, font 48px, 2열 레이아웃
export default function Hero() {
  return (
    <section
      className="
      /* 모바일 추정: padding 16px, font 28px, 1열 */
      px-4 py-8
      
      /* 태블릿 추정: padding 32px, font 36px, 1열 */
      md:px-8 md:py-12
      
      /* PC 확정 */
      xxl:px-16 xxl:py-16
    "
    >
      <div
        className="
        /* 모바일: 1열 */
        flex flex-col gap-4
        
        /* 태블릿: 1열 유지 */
        md:gap-6
        
        /* PC: 2열 */
        xxl:flex-row xxl:gap-12
      "
      >
        <div className="flex-1">
          <h1
            className="
            text-3xl
            md:text-4xl
            xxl:text-5xl
          "
          >
            타이틀
          </h1>
        </div>
        <div className="flex-1">
          <p
            className="
            text-base
            md:text-lg
            xxl:text-xl
          "
          >
            설명
          </p>
        </div>
      </div>
    </section>
  );
}
```

### 예제 2: Card Grid

```tsx
// PC 디자인: 3열 그리드, gap 32px
export default function CardGrid() {
  return (
    <div
      className="
      /* 모바일: 1열, gap 16px */
      grid grid-cols-1 gap-4
      
      /* 태블릿: 2열, gap 24px */
      md:grid-cols-2 md:gap-6
      
      /* PC: 3열, gap 32px */
      xxl:grid-cols-3 xxl:gap-8
    "
    >
      {cards.map((card) => (
        <Card key={card.id} {...card} />
      ))}
    </div>
  );
}
```

### 예제 3: Navigation

```tsx
// PC 디자인: 가로 배치, gap 48px
export default function Navigation() {
  return (
    <nav
      className="
      /* 모바일: 세로 배치, gap 12px */
      flex flex-col gap-3
      
      /* 태블릿: 가로 배치, gap 24px */
      md:flex-row md:gap-6
      
      /* PC: gap 48px */
      xxl:gap-12
    "
    >
      <Link href="/about">About</Link>
      <Link href="/services">Services</Link>
      <Link href="/contact">Contact</Link>
    </nav>
  );
}
```

## 대안: Desktop First로 작업 (나중에 리팩토링)

```tsx
// 방법 A: 일단 PC만 구현
export default function Component() {
  return (
    <div className="px-16 text-2xl">
      {/* PC 디자인만 구현 */}
      {/* 모바일에서는 깨질 수 있음 */}
    </div>
  );
}

// 방법 B: Desktop First 커스텀 variant 사용
export default function Component() {
  return (
    <div
      className="
      /* 기본: PC 디자인 */
      px-16 text-2xl
      
      /* 태블릿 이하: 나중에 추가 */
      tablet-down:px-8 tablet-down:text-xl
      
      /* 모바일: 나중에 추가 */
      mobile-down:px-4 mobile-down:text-base
    "
    >
      {/* content */}
    </div>
  );
}
```

## 모바일 디자인 나온 후 작업

### Step 1: TODO 주석 찾기

```bash
# VS Code에서 검색
🔴 TODO: 모바일
```

### Step 2: 실제 디자인과 비교

```tsx
// Before (추정)
className = "px-4 text-base";

// After (실제 디자인)
className = "px-6 text-lg"; // 디자인 확인 후 수정
```

### Step 3: 주석 업데이트

```tsx
// Before
/* 🔴 TODO: 모바일 디자인 확인 필요 */

// After
/* ✅ 모바일 디자인 확정 (2024-11-28) */
```

## 체크리스트

### PC 디자인만으로 작업 시

- [ ] PC 디자인 정확히 구현
- [ ] 모바일/태블릿은 합리적으로 추정
- [ ] TODO 주석으로 표시
- [ ] 추정 근거 주석으로 남기기

### 모바일 디자인 나온 후

- [ ] TODO 주석 찾기
- [ ] 실제 디자인과 비교
- [ ] 차이점 수정
- [ ] 주석 업데이트 (✅ 확정)

## 팁

1. **과도한 추정은 금물**

   - 확실하지 않으면 PC 디자인만 구현
   - 나중에 추가하는 게 더 안전

2. **주석은 필수**

   - 나중에 본인도 헷갈림
   - 팀원과 공유 필요

3. **디자이너와 소통**

   - "모바일 디자인 언제쯤 나올까요?"
   - "임시로 이렇게 추정했는데 괜찮을까요?"

4. **최소 반응형은 유지**
   - 완전히 깨지지 않도록 기본 반응형은 적용
   - `min-width: 320px` 정도는 고려
