"use client";

import { useEffect, useState } from "react";

interface UploadToastProps {
  show: boolean;
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function UploadToast({ show, message, type, onClose }: UploadToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white transition-all transform ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>{message}</div>;
}
