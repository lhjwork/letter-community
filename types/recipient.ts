// 편지 수신자 주소 타입 정의
export interface RecipientAddress {
  _id: string;
  letterId: string;
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipientAddressInput {
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  memo?: string;
}

// 편지 작성자용 수신자 목록 조회 응답 타입
export interface RecipientListResponse {
  success: boolean;
  data: {
    letterId: string;
    letterTitle: string;
    authorName: string;
    totalRequests: number;
    recipients: RecipientRequest[];
    stats: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      completed: number;
    };
    authorSettings: {
      allowPhysicalRequests: boolean;
      autoApprove: boolean;
      maxRequestsPerPerson: number;
    };
  };
}

export interface RecipientRequest {
  requestId: string;
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  fullAddress: string;
  status: "requested" | "approved" | "rejected" | "writing" | "sent" | "delivered";
  requestedAt: string;
  memo?: string;
  sessionId: string; // 일부만 표시
}

// 편지 생성 시 수신자 주소 포함 타입
export interface LetterWithRecipients {
  title: string;
  content: string;
  type: "friend" | "story";
  category: string;
  recipientAddresses?: RecipientAddressInput[];
}

// 수신자 주소 유효성 검증 규칙
export const RECIPIENT_VALIDATION = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[가-힣a-zA-Z\s]+$/,
  },
  phone: {
    pattern: /^010-\d{4}-\d{4}$/,
  },
  zipCode: {
    pattern: /^\d{5}$/,
  },
  address1: {
    minLength: 5,
    maxLength: 200,
  },
  address2: {
    maxLength: 200,
  },
  memo: {
    maxLength: 500,
  },
} as const;
