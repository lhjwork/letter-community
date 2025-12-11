"use client";

import { useEffect, useState } from "react";

interface OgPreviewFrameProps {
  message: string;
  bgColor: string;
  illustration: string;
  fontSize: number;
}

export function OgPreviewFrame({
  message,
  bgColor,
  illustration,
  fontSize,
}: OgPreviewFrameProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generatePreview = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          message: message || "당신에게 도착한 편지",
          bgColor,
          illustration,
          fontSize: fontSize.toString(),
        });

        const url = `/api/og-preview?${params.toString()}`;
        setPreviewUrl(url);
      } catch (error) {
        console.error("Preview generation failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      generatePreview();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [message, bgColor, illustration, fontSize]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">미리보기</label>
      <div className="relative w-full aspect-1200/630 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-gray-500">생성 중...</div>
          </div>
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="OG 이미지 미리보기"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <p className="text-xs text-gray-500">
        1200 x 630px (OG 이미지 표준 사이즈)
      </p>
    </div>
  );
}
