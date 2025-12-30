// RequestId 기반 실물 편지 추적 관리 유틸리티

interface LetterRequest {
  requestId: string;
  letterId: string;
  timestamp: number;
}

/**
 * 편지의 RequestId 저장 (새로운 방식)
 */
export function savePhysicalRequestId(letterId: string, requestId: string): void {
  try {
    localStorage.setItem(`physicalRequest_${letterId}`, requestId);

    // 기존 방식도 유지 (호환성)
    saveLetterRequest(letterId, requestId);
  } catch (error) {
    console.error("RequestId 저장 실패:", error);
  }
}

/**
 * 편지의 RequestId 조회 (새로운 방식)
 */
export function getPhysicalRequestId(letterId: string): string | null {
  try {
    return localStorage.getItem(`physicalRequest_${letterId}`);
  } catch (error) {
    console.error("RequestId 조회 실패:", error);
    return null;
  }
}

/**
 * 편지의 RequestId 삭제 (새로운 방식)
 */
export function removePhysicalRequestId(letterId: string): void {
  try {
    localStorage.removeItem(`physicalRequest_${letterId}`);
  } catch (error) {
    console.error("RequestId 삭제 실패:", error);
  }
}

/**
 * 편지별 신청 여부 확인 (새로운 방식)
 */
export function hasPhysicalRequest(letterId: string): boolean {
  return getPhysicalRequestId(letterId) !== null;
}

/**
 * 특정 편지의 사용자 신청 목록 조회 (기존 방식 유지)
 */
export function getLetterRequests(letterId: string): LetterRequest[] {
  try {
    const requests = localStorage.getItem(`letterRequests_${letterId}`);
    return requests ? JSON.parse(requests) : [];
  } catch (error) {
    console.error("편지 신청 목록 조회 실패:", error);
    return [];
  }
}

/**
 * 편지 신청 정보 저장
 */
export function saveLetterRequest(letterId: string, requestId: string): void {
  try {
    const requests = getLetterRequests(letterId);
    const newRequest: LetterRequest = {
      requestId,
      letterId,
      timestamp: Date.now(),
    };

    // 중복 방지
    if (!requests.find((r) => r.requestId === requestId)) {
      requests.push(newRequest);
      localStorage.setItem(`letterRequests_${letterId}`, JSON.stringify(requests));
    }

    // 전역 목록에도 추가 (기존 호환성)
    const globalRequests = JSON.parse(localStorage.getItem("userRequests") || "[]");
    if (!globalRequests.includes(requestId)) {
      globalRequests.push(requestId);
      localStorage.setItem("userRequests", JSON.stringify(globalRequests));
    }
  } catch (error) {
    console.error("편지 신청 정보 저장 실패:", error);
  }
}

/**
 * 편지 신청 정보 삭제
 */
export function removeLetterRequest(letterId: string, requestId: string): void {
  try {
    const requests = getLetterRequests(letterId);
    const filteredRequests = requests.filter((r) => r.requestId !== requestId);
    localStorage.setItem(`letterRequests_${letterId}`, JSON.stringify(filteredRequests));

    // 전역 목록에서도 제거
    const globalRequests = JSON.parse(localStorage.getItem("userRequests") || "[]");
    const filteredGlobalRequests = globalRequests.filter((id: string) => id !== requestId);
    localStorage.setItem("userRequests", JSON.stringify(filteredGlobalRequests));
  } catch (error) {
    console.error("편지 신청 정보 삭제 실패:", error);
  }
}

/**
 * 모든 편지 신청 정보 정리 (30일 이상 된 것들 삭제)
 */
export function cleanupOldRequests(): void {
  try {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // localStorage의 모든 키를 확인
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("letterRequests_")) {
        const requests = JSON.parse(localStorage.getItem(key) || "[]");
        const filteredRequests = requests.filter((r: LetterRequest) => r.timestamp > thirtyDaysAgo);

        if (filteredRequests.length === 0) {
          localStorage.removeItem(key);
        } else if (filteredRequests.length !== requests.length) {
          localStorage.setItem(key, JSON.stringify(filteredRequests));
        }
      }
    }
  } catch (error) {
    console.error("오래된 신청 정보 정리 실패:", error);
  }
}

/**
 * 편지별 신청 상태 확인
 */
export function hasLetterRequests(letterId: string): boolean {
  const requests = getLetterRequests(letterId);
  return requests.length > 0;
}

/**
 * 편지별 신청 개수 조회
 */
export function getLetterRequestCount(letterId: string): number {
  const requests = getLetterRequests(letterId);
  return requests.length;
}
