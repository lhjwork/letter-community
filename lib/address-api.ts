import { Address, AddressInput } from "@/types/address";
import { apiRequest } from "./api";

interface AddressListResponse {
  success: boolean;
  data: Address[];
}

interface AddressResponse {
  success: boolean;
  data: Address;
}

// 배송지 목록 조회
export async function getAddresses(token: string): Promise<AddressListResponse> {
  return apiRequest<AddressListResponse>("/api/addresses", {
    method: "GET",
    token,
  });
}

// 최근 배송지 조회
export async function getRecentAddresses(token: string, limit = 20): Promise<AddressListResponse> {
  return apiRequest<AddressListResponse>(`/api/addresses/recent?limit=${limit}`, {
    method: "GET",
    token,
  });
}

// 배송지 상세 조회
export async function getAddress(token: string, id: string): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(`/api/addresses/${id}`, {
    method: "GET",
    token,
  });
}

// 배송지 추가
export async function createAddress(token: string, data: AddressInput): Promise<AddressResponse> {
  return apiRequest<AddressResponse>("/api/addresses", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

// 배송지 수정
export async function updateAddress(token: string, id: string, data: AddressInput): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(`/api/addresses/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

// 배송지 삭제
export async function deleteAddress(token: string, id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/addresses/${id}`, {
    method: "DELETE",
    token,
  });
}

// 기본 배송지 설정
export async function setDefaultAddress(token: string, id: string): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(`/api/addresses/${id}/default`, {
    method: "PUT",
    token,
  });
}

// 최근 배송지를 주소록에 저장
export async function saveRecentToBook(token: string, id: string, addressName?: string): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(`/api/addresses/${id}/save-to-book`, {
    method: "POST",
    token,
    body: JSON.stringify({ addressName }),
  });
}
