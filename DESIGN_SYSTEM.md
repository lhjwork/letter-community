# 디자인 시스템

## 반응형 브레이크포인트

| 디바이스      | 범위         | Tailwind Prefix |
| ------------- | ------------ | --------------- |
| Mobile        | 0 - 639px    | (기본)          |
| Tablet        | 640 - 767px  | `sm:`           |
| Desktop Small | 768 - 1399px | `md:`           |
| Desktop Large | 1400px+      | `xxl:`          |

## 작업 순서

### 1. 디자인 시안 분석

- [ ] 모바일 디자인 확인
- [ ] 태블릿 디자인 확인
- [ ] 데스크톱 디자인 확인

### 2. 코드 작성 (Mobile First)

```tsx
// 1단계: 모바일 스타일 (기본값)
className = "px-4 text-base";

// 2단계: 태블릿 스타일 추가
className = "px-4 text-base md:px-8 md:text-lg";

// 3단계: 데스크톱 스타일 추가
className = "px-4 text-base md:px-8 md:text-lg xxl:px-16 xxl:text-2xl";
```

## 주요 스타일 가이드

### Spacing (여백)

| 용도              | Mobile         | Tablet            | Desktop           |
| ----------------- | -------------- | ----------------- | ----------------- |
| Container Padding | `px-3` (12px)  | `md:px-8` (32px)  | `xxl:px-[52px]`   |
| Section Gap       | `gap-4` (16px) | `md:gap-6` (24px) | `xxl:gap-[120px]` |

### Typography (폰트)

| 용도    | Mobile             | Tablet               | Desktop           |
| ------- | ------------------ | -------------------- | ----------------- |
| Heading | `text-2xl` (24px)  | `md:text-[32px]`     | `xxl:text-[40px]` |
| Body    | `text-base` (16px) | `md:text-xl` (20px)  | `xxl:text-[32px]` |
| Small   | `text-lg` (18px)   | `md:text-2xl` (24px) | `xxl:text-[32px]` |

### Layout

| 용도       | Mobile    | Tablet    | Desktop   |
| ---------- | --------- | --------- | --------- |
| Navigation | 하단 고정 | 상단 표시 | 상단 표시 |
| Grid       | 1열       | 2열       | 3-4열     |

## 개발 팁

### ✅ DO (권장)

```tsx
// 명확한 주석과 함께 작성
<div className="
  /* Mobile: 16px padding */
  px-4

  /* Tablet: 32px padding */
  md:px-8

  /* Desktop: 64px padding */
  xxl:px-16
">
```

### ❌ DON'T (비권장)

```tsx
// 주석 없이 한 줄로 작성
<div className="px-4 md:px-8 xxl:px-16 text-base md:text-xl xxl:text-2xl">
```

## 테스트 체크리스트

개발 완료 후 다음 화면 크기에서 테스트:

- [ ] 375px (iPhone SE)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro)
- [ ] 1400px (Desktop)
- [ ] 1920px (Large Desktop)

## 참고 자료

- Tailwind 브레이크포인트: https://tailwindcss.com/docs/responsive-design
- 커스텀 브레이크포인트: `app/globals.css` 참조
