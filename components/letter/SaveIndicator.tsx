"use client";

import { DraftSaveState } from "@/types/draft";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

interface SaveIndicatorProps {
  saveState: DraftSaveState;
  className?: string;
}

export default function SaveIndicator({ saveState, className = "" }: SaveIndicatorProps) {
  const getStatusDisplay = () => {
    switch (saveState.status) {
      case "saving":
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: "저장 중...",
          color: "text-blue-600",
        };
      case "saved":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: `저장됨 (${saveState.saveCount}회)`,
          color: "text-green-600",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: "저장 실패",
          color: "text-red-600",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "저장 대기",
          color: "text-gray-500",
        };
    }
  };

  const { icon, text, color } = getStatusDisplay();

  return (
    <div className={`flex items-center gap-2 text-sm ${color} ${className}`}>
      {icon}
      <span>{text}</span>
      {saveState.lastSavedAt && <span className="text-xs text-gray-400">{new Date(saveState.lastSavedAt).toLocaleTimeString()}</span>}
    </div>
  );
}
