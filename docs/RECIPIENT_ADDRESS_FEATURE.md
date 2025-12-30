# 편지 수신자 주소 관리 기능

편지에 여러 수신자 주소를 관리할 수 있는 프론트엔드 기능이 구현되었습니다.

## 🎯 구현된 기능

### 1. 편지 생성 시 수신자 주소 추가

- 편지 작성 폼에서 수신자 주소를 미리 등록 가능
- 다중 수신자 지원
- 실시간 유효성 검증

### 2. 수신자 주소 CRUD 관리

- 편지별 수신자 주소 목록 조회
- 수신자 주소 추가/수정/삭제
- 편지 작성자만 관리 가능

### 3. 실물 편지 신청 시 수신자 선택

- 등록된 수신자 목록에서 선택
- 새 주소 직접 입력 옵션
- 기존 주소 정보 자동 완성

### 4. 편지 상세 페이지 통합

- 편지 작성자용 "수신자 관리" 버튼
- 수신자 주소 관리 모달
- 실물 편지 신청 시 수신자 선택 모달

## 📁 파일 구조

```
components/recipient/
├── RecipientAddressForm.tsx      # 수신자 주소 입력 폼
├── RecipientAddressList.tsx      # 수신자 주소 목록 표시
├── RecipientAddressModal.tsx     # 수신자 주소 관리 모달
├── RecipientAddressSection.tsx   # 편지 생성용 수신자 섹션
├── RecipientSelectModal.tsx      # 실물 편지 신청용 수신자 선택
└── index.ts                      # 컴포넌트 인덱스

types/
└── recipient.ts                  # 수신자 주소 타입 정의

lib/
└── recipient-api.ts              # 수신자 주소 API 함수
```

## 🔧 API 엔드포인트

### 수신자 주소 관리

- `GET /api/letters/{letterId}/recipient-addresses` - 수신자 주소 목록 조회
- `POST /api/letters/{letterId}/recipient-addresses` - 수신자 주소 추가
- `PUT /api/letters/{letterId}/recipient-addresses/{addressId}` - 수신자 주소 수정
- `DELETE /api/letters/{letterId}/recipient-addresses/{addressId}` - 수신자 주소 삭제

### 편지 생성 (수신자 주소 포함)

- `POST /api/letters/create` - 편지 생성 시 recipientAddresses 배열 포함

## 📋 데이터 구조

### RecipientAddress

```typescript
interface RecipientAddress {
  _id: string;
  letterId: string;
  name: string; // 수신자 이름 (2-50자)
  phone: string; // 전화번호 (010-XXXX-XXXX)
  zipCode: string; // 우편번호 (5자리)
  address1: string; // 기본 주소 (5-200자)
  address2?: string; // 상세 주소 (200자 이하)
  memo?: string; // 메모 (500자 이하)
  createdAt: string;
  updatedAt: string;
}
```

### RecipientAddressInput

```typescript
interface RecipientAddressInput {
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  memo?: string;
}
```

## 🎨 UI 컴포넌트 사용법

### 1. 편지 생성 폼에서 사용

```tsx
import { RecipientAddressSection } from "@/components/recipient";

function LetterCreateForm() {
  const [recipientAddresses, setRecipientAddresses] = useState<RecipientAddressInput[]>([]);

  return <RecipientAddressSection addresses={recipientAddresses} onChange={setRecipientAddresses} disabled={isSubmitting} />;
}
```

### 2. 수신자 주소 관리 모달

```tsx
import { RecipientAddressModal } from "@/components/recipient";

function LetterDetailPage() {
  const [showModal, setShowModal] = useState(false);

  return <RecipientAddressModal open={showModal} onOpenChange={setShowModal} letterId={letterId} canEdit={isAuthor} />;
}
```

### 3. 실물 편지 신청용 수신자 선택

```tsx
import { RecipientSelectModal } from "@/components/recipient";

function PhysicalLetterRequest() {
  const [showSelect, setShowSelect] = useState(false);

  return (
    <RecipientSelectModal
      open={showSelect}
      onOpenChange={setShowSelect}
      letterId={letterId}
      onSelect={(recipient) => {
        // 선택된 수신자로 폼 미리 채우기
      }}
      onManualInput={() => {
        // 직접 입력 모드
      }}
    />
  );
}
```

## ✅ 유효성 검증 규칙

- **이름**: 2-50자, 한글/영문/공백만 허용
- **전화번호**: 010-XXXX-XXXX 형식, 자동 하이픈 추가
- **우편번호**: 5자리 숫자, 다음 주소 API 연동
- **기본 주소**: 5-200자, 주소 검색 후 자동 입력
- **상세 주소**: 200자 이하 (선택사항)
- **메모**: 500자 이하 (선택사항)

## 🔒 권한 관리

- **편지 작성자**: 수신자 주소 CRUD 모든 권한
- **일반 사용자**: 수신자 주소 목록 조회만 가능 (실물 편지 신청 시)
- **비로그인 사용자**: 직접 입력만 가능

## 🎯 사용자 경험 개선사항

1. **자동 완성**: 기존 주소 정보 재사용
2. **실시간 검증**: 입력 중 즉시 유효성 확인
3. **자동 포맷팅**: 전화번호 하이픈 자동 추가
4. **주소 검색**: 다음 우편번호 API 통합
5. **반응형 디자인**: 모바일 친화적 UI
6. **접근성**: 스크린 리더 지원

## 🚀 향후 개선 계획

1. **주소록 통합**: 사용자 전체 주소록과 연동
2. **주소 검증**: 실제 배송 가능 주소 확인
3. **배송비 계산**: 지역별 배송비 자동 계산
4. **주소 즐겨찾기**: 자주 사용하는 주소 북마크
5. **주소 그룹**: 가족, 친구 등 그룹별 관리

## 🐛 알려진 이슈

현재 알려진 이슈는 없습니다.

## 📞 지원

기능 관련 문의나 버그 리포트는 개발팀에 문의해주세요.
