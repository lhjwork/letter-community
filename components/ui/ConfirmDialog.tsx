"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import V8Dialog, { V8Description, V8Title } from "@/components/ui/V8Dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
}

export default function ConfirmDialog({ open, onOpenChange, title, description, confirmText, cancelText, onConfirm, onCancel, variant = "default" }: ConfirmDialogProps) {
  const t = useTranslations("shared.dialog");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("작업 실행 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    // v8-Modals-1 확인창: 스탬프 "확인"·✕ 는 V8Dialog
    <V8Dialog open={open} onOpenChange={onOpenChange} stamp={t("confirmStamp")} width="max-w-[420px]" described>
      <V8Title className="m-0 mt-2 font-pen text-[30px] font-normal leading-[1.3] mobile-down:mt-0 mobile-down:text-[28px]">{title}</V8Title>
      <V8Description className="m-0 text-sm leading-[1.8] text-ink-2">{description}</V8Description>
      <div className="dlg-actions mt-2">
        <button type="button" onClick={handleCancel} disabled={isLoading} className="btn btn-ink">
          {cancelText ?? t("cancel")}
        </button>
        <button type="button" onClick={handleConfirm} disabled={isLoading} aria-busy={isLoading} className={variant === "destructive" ? "btn btn-brick" : "btn btn-ink"}>
          {isLoading ? t("processing") : (confirmText ?? t("confirm"))}
        </button>
      </div>
    </V8Dialog>
  );
}
