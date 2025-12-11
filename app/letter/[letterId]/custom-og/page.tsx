"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ColorPicker } from "@/components/og/ColorPicker";
import { IllustrationSelector } from "@/components/og/IllustrationSelector";
import { OgPreviewFrame } from "@/components/og/OgPreviewFrame";
import { UploadToast } from "@/components/og/UploadToast";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function CustomOgPage() {
  const params = useParams();
  const letterId = params.letterId as string;
  const router = useRouter();

  const [message, setMessage] = useState("당신에게 도착한 편지");
  const [bgColor, setBgColor] = useState("#FFF5F5");
  const [illustration, setIllustration] = useState("💌");
  const [fontSize, setFontSize] = useState(48);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "loading";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const handleSave = async () => {
    setToast({ show: true, message: "OG 이미지 생성 중...", type: "loading" });

    try {
      // 1. 미리보기 이미지를 Blob으로 가져오기
      const params = new URLSearchParams({
        message,
        bgColor,
        illustration,
        fontSize: fontSize.toString(),
      });

      const imageResponse = await fetch(`/api/og-preview?${params.toString()}`);
      if (!imageResponse.ok) throw new Error("이미지 생성 실패");

      const imageBlob = await imageResponse.blob();

      // 2. FormData로 백엔드에 업로드
      const formData = new FormData();
      formData.append("file", imageBlob, `og-${letterId}.png`);
      formData.append("letterId", letterId);
      formData.append("ogPreviewMessage", message);
      formData.append(
        "style",
        JSON.stringify({
          bgColor,
          illustration,
          fontSize,
        })
      );

      const uploadResponse = await fetch(`${BACKEND_URL}/api/og/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("업로드 실패");

      const result = await uploadResponse.json();

      setToast({
        show: true,
        message: "OG 이미지가 저장되었습니다! 💌",
        type: "success",
      });

      // 3초 후 편지 상세 페이지로 이동
      setTimeout(() => {
        router.push(`/letter/${letterId}`);
      }, 2000);
    } catch (error) {
      console.error("OG 이미지 저장 실패:", error);
      setToast({
        show: true,
        message: error instanceof Error ? error.message : "저장에 실패했습니다",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            OG 이미지 커스터마이징
          </h1>
          <p className="text-lg text-muted-foreground">
            공유 시 표시될 이미지를 꾸며보세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 왼쪽: 설정 패널 */}
          <div className="space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            {/* 메시지 입력 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                메시지 (한 줄)
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="당신에게 도착한 편지"
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500">{message.length}/50자</p>
            </div>

            {/* 배경색 선택 */}
            <ColorPicker value={bgColor} onChange={setBgColor} />

            {/* 일러스트 선택 */}
            <IllustrationSelector
              value={illustration}
              onChange={setIllustration}
            />

            {/* 글꼴 크기 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                글꼴 크기: {fontSize}px
              </label>
              <input
                type="range"
                min="32"
                max="72"
                step="4"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                저장하기
              </button>
            </div>
          </div>

          {/* 오른쪽: 미리보기 */}
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <OgPreviewFrame
              message={message}
              bgColor={bgColor}
              illustration={illustration}
              fontSize={fontSize}
            />
          </div>
        </div>
      </div>

      {/* 토스트 알림 */}
      <UploadToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
