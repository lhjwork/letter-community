import { RecipientAddress, RecipientAddressInput, RecipientListResponse, LetterPhysicalStatusResponse } from "@/types/recipient";
import { apiRequest } from "./api";

// 타입 재export
export type { RecipientAddress, RecipientAddressInput, RecipientListResponse, LetterPhysicalStatusResponse } from "@/types/recipient";

interface RecipientAddressListResponse {
  success: boolean;
  data: RecipientAddress[];
}

interface RecipientResponse {
  success: boolean;
  data: RecipientAddress;
}

// 편지별 실물 편지 발송 상태 조회 (사용자용)
export async function getLetterPhysicalStatus(token: string, letterId: string): Promise<LetterPhysicalStatusResponse> {
  return apiRequest<LetterPhysicalStatusResponse>(`/api/letters/${letterId}/physical-status/user`, {
    method: "GET",
    token,
  });
}

// 편지 작성자용 수신자 목록 조회 (새로 추가된 API)
export async function getLetterRecipients(token: string, letterId: string): Promise<RecipientListResponse> {
  return apiRequest<RecipientListResponse>(`/api/letters/${letterId}/recipients`, {
    method: "GET",
    token,
  });
}

// 편지의 수신자 주소 목록 조회
export async function getRecipientAddresses(token: string, letterId: string): Promise<RecipientAddressListResponse> {
  return apiRequest<RecipientAddressListResponse>(`/api/letters/${letterId}/recipient-addresses`, {
    method: "GET",
    token,
  });
}

// 수신자 주소 추가
export async function createRecipientAddress(token: string, letterId: string, data: RecipientAddressInput): Promise<RecipientResponse> {
  return apiRequest<RecipientResponse>(`/api/letters/${letterId}/recipient-addresses`, {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

// 수신자 주소 수정
export async function updateRecipientAddress(token: string, letterId: string, addressId: string, data: RecipientAddressInput): Promise<RecipientResponse> {
  return apiRequest<RecipientResponse>(`/api/letters/${letterId}/recipient-addresses/${addressId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

// 수신자 주소 삭제
export async function deleteRecipientAddress(token: string, letterId: string, addressId: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/letters/${letterId}/recipient-addresses/${addressId}`, {
    method: "DELETE",
    token,
  });
}

// 수신자 주소 유효성 검증
export function validateRecipientAddress(data: RecipientAddressInput): Record<string, string> {
  const errors: Record<string, string> = {};

  // 이름 검증
  if (!data.name.trim()) {
    errors.name = "이름을 입력해주세요";
  } else if (data.name.length < 2 || data.name.length > 50) {
    errors.name = "이름은 2-50자로 입력해주세요";
  }

  // 전화번호 검증
  if (!data.phone.trim()) {
    errors.phone = "전화번호를 입력해주세요";
  } else if (!/^010-\d{4}-\d{4}$/.test(data.phone)) {
    errors.phone = "전화번호는 010-XXXX-XXXX 형식으로 입력해주세요";
  }

  // 우편번호 검증
  if (!data.zipCode.trim()) {
    errors.zipCode = "우편번호를 입력해주세요";
  } else if (!/^\d{5}$/.test(data.zipCode)) {
    errors.zipCode = "우편번호는 5자리 숫자로 입력해주세요";
  }

  // 주소 검증
  if (!data.address1.trim()) {
    errors.address1 = "주소를 입력해주세요";
  } else if (data.address1.length < 5 || data.address1.length > 200) {
    errors.address1 = "주소는 5-200자로 입력해주세요";
  }

  // 상세주소 검증 (선택사항)
  if (data.address2 && data.address2.length > 200) {
    errors.address2 = "상세주소는 200자 이하로 입력해주세요";
  }

  // 메모 검증 (선택사항)
  if (data.memo && data.memo.length > 500) {
    errors.memo = "메모는 500자 이하로 입력해주세요";
  }

  return errors;
}
