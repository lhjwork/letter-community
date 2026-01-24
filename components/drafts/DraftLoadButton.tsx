"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import DraftLoadModal from "./DraftLoadModal";
import { DraftLetter } from "@/types/draft";

interface DraftLoadButtonProps {
  onLoadDraft: (draft: DraftLetter) => void;
  className?: string;
}

export default function DraftLoadButton({
  onLoadDraft,
  className = "",
}: DraftLoadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLoadDraft = (draft: DraftLetter) => {
    onLoadDraft(draft);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant="outline"
        size="sm"
        className={`flex items-center gap-2 border-[#FF9883] text-[#FF9883] hover:bg-[#FF9883] hover:text-white transition-colors ${className}`}
      >
        <FileText className="w-4 h-4" />
        불러오기
      </Button>

      <DraftLoadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLoadDraft={handleLoadDraft}
      />
    </>
  );
}
