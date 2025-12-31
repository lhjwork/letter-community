# Daum 주소 검색 API 통합 가이드

## 개요

익명 사용자 실물 편지 신청 폼에 Daum 주소 검색 API를 통합했습니다. 사용자가 "주소 검색" 버튼을 클릭하면 Daum 주소 검색 팝업이 열리고, 주소를 선택하면 우편번호와 주소가 자동으로 입력됩니다.

## 구현 방식

### 기존 컴포넌트 재사용

`components/address/PostcodeSearch.tsx` 컴포넌트를 재사용하여 Daum 주소 검색 기능을 통합했습니다.

```typescript
import PostcodeSearch, { PostcodeResult } from "@/components/address/PostcodeSearch";
```

### 주소 검색 결과 처리

```typescript
const handleAddressComplete = (data: PostcodeResult) => {
  setFormData((prev) => ({
    ...prev,
    zipCode: data.zipCode, // 우편번호 (5자리)
    address1: data.address, // 도로명 또는 지번 주소
  }));
};
```

## UI 구조

### 우편번호 입력 필드

```
┌─────────────────────────────────────┐
│ 우편번호 *                          │
├─────────────────────────────────────┤
│ [우편번호 입력] [주소 검색 버튼]    │
└─────────────────────────────────────┘
```

- 우편번호 필드: `readOnly` (사용자 직접 입력 불가)
- 주소 검색 버튼: Daum 주소 검색 팝업 열기

### 주소 입력 필드

```
┌─────────────────────────────────────┐
│ 주소 *                              │
├─────────────────────────────────────┤
│ [주소 입력 (자동 입력)]             │
└─────────────────────────────────────┘
```

- 주소 필드: `readOnly` (자동 입력만 가능)
- 플레이스홀더: "주소 검색 버튼을 클릭하여 주소를 선택해주세요"

### 상세주소 입력 필드

```
┌─────────────────────────────────────┐
│ 상세주소 (선택)                     │
├─────────────────────────────────────┤
│ [상세주소 입력 (사용자 입력)]       │
└─────────────────────────────────────┘
```

- 상세주소 필드: 사용자가 직접 입력 (아파트, 호수 등)

## 사용 흐름

### 1단계: 주소 검색 버튼 클릭

```
사용자가 "주소 검색" 버튼 클릭
    ↓
PostcodeSearch 컴포넌트의 handleClick 실행
    ↓
Daum 주소 검색 팝업 열기
```

### 2단계: 주소 선택

```
Daum 주소 검색 팝업에서 주소 검색
    ↓
원하는 주소 선택
    ↓
PostcodeResult 객체 반환
```

### 3단계: 자동 입력

```
handleAddressComplete 함수 실행
    ↓
zipCode: data.zipCode (우편번호)
address1: data.address (도로명 또는 지번 주소)
    ↓
폼 데이터 업데이트
    ↓
에러 메시지 제거
```

## PostcodeResult 타입

```typescript
export interface PostcodeResult {
  zipCode: string; // 우편번호 (5자리)
  address: string; // 도로명 또는 지번 주소
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  bname: string; // 법정동명
  buildingName: string; // 건물명
}
```

## 스크립트 로드 관리

### 자동 로드

- Daum 주소 검색 스크립트는 PostcodeSearch 컴포넌트에서 자동으로 로드됨
- 스크립트 URL: `//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js`

### 상태 관리

```typescript
type ScriptStatus = "idle" | "loading" | "ready" | "error";

// idle: 초기 상태
// loading: 스크립트 로드 중
// ready: 스크립트 로드 완료
// error: 스크립트 로드 실패
```

### 중복 로드 방지

- 전역 상태 관리로 중복 로드 방지
- 이미 로드된 경우 즉시 `ready` 상태로 변경

### 로드 실패 처리

- 로드 실패 시 버튼 비활성화
- 사용자에게 "로드 실패" 메시지 표시

## 에러 처리

### 유효성 검증

```typescript
const validationErrors = validateRecipientAddress(formData);

// 검증 항목:
// - zipCode: 5자리 숫자
// - address1: 5-200자
// - name: 2-50자
// - phone: 010-XXXX-XXXX 형식
```

### 주소 검색 후 에러 제거

```typescript
if (errors.zipCode || errors.address1) {
  setErrors((prev) => {
    const newErrors = { ...prev };
    delete newErrors.zipCode;
    delete newErrors.address1;
    return newErrors;
  });
}
```

## 모바일 반응형

### 우편번호 필드 레이아웃

```css
/* 데스크톱 */
display: flex;
gap: 0.5rem;

/* 모바일 */
@media (max-width: 640px) {
  flex-direction: column;
}
```

- 우편번호 입력 필드: `flex-1` (남은 공간 차지)
- 주소 검색 버튼: 고정 너비

## 테스트 시나리오

### 1. 주소 검색 기능

- [ ] "주소 검색" 버튼 클릭
- [ ] Daum 주소 검색 팝업 열기 확인
- [ ] 주소 검색 및 선택
- [ ] 우편번호 자동 입력 확인
- [ ] 주소 자동 입력 확인

### 2. 에러 처리

- [ ] 주소 검색 전 제출 시도 → 에러 메시지 표시
- [ ] 주소 검색 후 에러 메시지 제거 확인

### 3. 모바일 테스트

- [ ] 모바일 화면에서 주소 검색 버튼 클릭
- [ ] 팝업 표시 및 주소 선택 확인
- [ ] 자동 입력 확인

### 4. 브라우저 호환성

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 주의사항

### 1. 스크립트 로드 시간

- 첫 로드 시 약 1-2초 소요
- 이후 캐시에서 로드되어 빠름

### 2. 팝업 차단

- 일부 브라우저에서 팝업 차단 가능
- 사용자에게 팝업 허용 안내 필요

### 3. 주소 형식

- 도로명 주소 우선 사용
- 도로명 주소 없을 경우 지번 주소 사용

### 4. 우편번호 형식

- 5자리 숫자 (예: 12345)
- 하이픈 없음

## 참고 자료

- [Daum 주소 검색 API 문서](https://postcode.map.daum.net/guide)
- [PostcodeSearch 컴포넌트](../components/address/PostcodeSearch.tsx)
- [익명 사용자 신청 폼](../components/letter/AnonymousPhysicalRequestForm.tsx)
