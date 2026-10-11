"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function ConfirmDialog({ open, onOpenChange, title, description, confirmText = "확인", cancelText = "취소", onConfirm, onCancel, variant = "default" }: ConfirmDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* v8 종이 모달(v8-Modals-1 확인창): 띠·괘선 없는 종이, 펜체 제목, .btn 버튼 */}
      <DialogContent showCloseButton={false} className="paper max-w-[460px] gap-4 rounded-none border-rule bg-paper px-9 pb-8 pt-10 shadow-[var(--paper-shadow)] mobile-down:px-6">
        <div className="airmail absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
        <DialogHeader className="gap-2 text-left">
          <DialogTitle className="m-0 font-pen text-[30px] font-normal leading-[1.3]">{title}</DialogTitle>
          <DialogDescription className="text-[15px] leading-[1.8] text-ink-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2.5">
          <button type="button" onClick={handleCancel} disabled={isLoading} className="btn btn-ink">
            {cancelText}
          </button>
          <button type="button" onClick={handleConfirm} disabled={isLoading} aria-busy={isLoading} className={variant === "destructive" ? "btn btn-brick" : "btn btn-ink"}>
            {isLoading ? "처리하는 중" : confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
