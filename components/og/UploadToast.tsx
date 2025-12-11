"use client";

import { useEffect } from "react";

interface UploadToastProps {
  show: boolean;
  message: string;
  type: "success" | "error" | "loading";
  onClose: () => void;
}

export function UploadToast({
  show,
  message,
  type,
  onClose,
}: UploadToastProps) {
  useEffect(() => {
    if (show && type !== "loading") {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, type, onClose]);

  if (!show) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    loading: "bg-blue-500",
  }[type];

  const icon = {
    success: "✓",
    error: "✕",
    loading: "⏳",
  }[type];

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}
      >
        <span className="text-xl">{icon}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
