// 배송지 타입 정의
export interface Address {
  _id: string;
  userId: string;
  addressName: string;
  recipientName: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  phone: string;
  tel?: string;
  isDefault: boolean;
  isFromRecent: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  addressName: string;
  recipientName: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  phone: string;
  tel?: string;
  isDefault?: boolean;
}

// 다음 주소 API 타입
export interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
  apartment: string;
}

declare global {
  interface Window {
    daum: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void };
    };
  }
}
