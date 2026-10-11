// 배송지 타입 정의
export interface Address {
  _id: string;
  userId: string;
  addressName: string;
  recipientName: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  /** 연락처는 선택 */
  phone?: string;
  tel?: string;
  isDefault: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  /** 비우면 서버가 받는 분 이름으로 채운다 */
  addressName?: string;
  recipientName: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  phone?: string;
  tel?: string;
  isDefault?: boolean;
}

// 다음 주소 API 타입
export interface DaumPostcodeData {
  zonecode: string; // 우편번호
  address: string; // 기본 주소
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  bname: string; // 법정동명
  buildingName: string; // 건물명
  apartment: string; // 공동주택 여부
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void };
    };
  }
}
