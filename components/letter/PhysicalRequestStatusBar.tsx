"use client";

import { Badge } from "@/components/ui/badge";

interface StatusStep {
  key: string;
  label: string;
  icon: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: "requested", label: "신청", icon: "📝" },
  { key: "approved", label: "승인", icon: "✅" },
  { key: "writing", label: "작성", icon: "✍️" },
  { key: "sent", label: "발송", icon: "📮" },
  { key: "delivered", label: "배송", icon: "🎉" },
];

interface PhysicalRequestStatusBarProps {
  currentStatus: "requested" | "approved" | "writing" | "sent" | "delivered";
  statusHistory: {
    requested: string;
    approved?: string;
    writing?: string;
    sent?: string;
    delivered?: string;
  };
}

export default function PhysicalRequestStatusBar({ currentStatus, statusHistory }: PhysicalRequestStatusBarProps) {
  const getCurrentStepIndex = () => {
    return STATUS_STEPS.findIndex((step) => step.key === currentStatus);
  };

  const isStepCompleted = (stepIndex: number) => {
    return stepIndex <= getCurrentStepIndex();
  };

  const isStepCurrent = (stepIndex: number) => {
    return stepIndex === getCurrentStepIndex();
  };

  const getStepDate = (stepKey: string) => {
    const date = statusHistory[stepKey as keyof typeof statusHistory];
    return date
      ? new Date(date).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;
  };

  return (
    <div className="w-full">
      {/* 진행바 */}
      <div className="flex items-center justify-between mb-4">
        {STATUS_STEPS.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center flex-1">
            {/* 단계 아이콘 */}
            <div
              className={`
              relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
              ${
                isStepCompleted(index)
                  ? "bg-green-500 border-green-500 text-white"
                  : isStepCurrent(index)
                  ? "bg-blue-500 border-blue-500 text-white animate-pulse"
                  : "bg-gray-100 border-gray-300 text-gray-400"
              }
            `}
            >
              {isStepCompleted(index) && !isStepCurrent(index) ? <span className="text-lg">✓</span> : <span className="text-lg">{step.icon}</span>}
            </div>

            {/* 연결선 */}
            {index < STATUS_STEPS.length - 1 && (
              <div
                className={`
                absolute top-6 left-1/2 w-full h-0.5 -z-10 transition-all duration-300
                ${isStepCompleted(index) ? "bg-green-500" : "bg-gray-300"}
              `}
                style={{
                  transform: "translateX(50%)",
                  width: "calc(100% - 3rem)",
                }}
              />
            )}

            {/* 단계 라벨 */}
            <div className="mt-2 text-center">
              <div
                className={`
                text-sm font-medium transition-colors duration-300
                ${isStepCompleted(index) ? "text-green-600" : isStepCurrent(index) ? "text-blue-600" : "text-gray-400"}
              `}
              >
                {step.label}
              </div>

              {/* 날짜 표시 */}
              {getStepDate(step.key) && <div className="text-xs text-gray-500 mt-1">{getStepDate(step.key)}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* 현재 상태 메시지 */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <Badge variant={isStepCompleted(getCurrentStepIndex()) ? "default" : "secondary"} className="mb-2">
          {STATUS_STEPS[getCurrentStepIndex()]?.label || currentStatus}
        </Badge>
        <p className="text-sm text-gray-600">{getStatusMessage(currentStatus)}</p>
      </div>
    </div>
  );
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "requested":
      return "편지 작성자의 승인을 기다리고 있습니다.";
    case "approved":
      return "승인되었습니다. 편지 작성을 준비 중입니다.";
    case "writing":
      return "편지를 손으로 작성하고 있습니다.";
    case "sent":
      return "편지가 발송되었습니다. 곧 도착할 예정입니다.";
    case "delivered":
      return "편지가 성공적으로 배송되었습니다!";
    default:
      return "상태를 확인하고 있습니다.";
  }
}
