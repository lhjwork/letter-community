"use client";

import { useEffect, useState } from "react";

interface OgPreviewFrameProps {
  message: string;
  bgColor: string;
  illustration: string;
  fontSize: number;
}

export function OgPreviewFrame({ message, bgColor, illustration, fontSize }: OgPreviewFrameProps) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({
      message,
      bgColor,
      illustration,
      fontSize: fontSize.toString(),
    });
    setPreviewUrl(`/api/og-preview?${params.toString()}`);
  }, [message, bgColor, illustration, fontSize]);

  return (
    <div className="w-full aspect-[1.91/1] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt="OG Preview" className="w-full h-full object-cover" />
    </div>
  );
}
