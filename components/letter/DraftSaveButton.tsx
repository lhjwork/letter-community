"use client";

import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { DraftSaveState } from "@/types/draft";

interface DraftSaveButtonProps {
  onSave: () => void;
  saveState: DraftSaveState;
  disabled?: boolean;
  className?: string;
}

export default function DraftSaveButton({ onSave, saveState, disabled = false, className = "" }: DraftSaveButtonProps) {
  const isLoading = saveState.status === "saving";

  return (
    <Button onClick={onSave} disabled={disabled || isLoading} variant="outline" size="sm" className={`flex items-center gap-2 ${className}`}>
      <Save className={`w-4 h-4 ${isLoading ? "animate-pulse" : ""}`} />
      {isLoading ? "저장 중..." : "임시저장"}
    </Button>
  );
}
