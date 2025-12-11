"use client";

import { useState, use } from "react";
import { ColorPicker } from "@/components/og/ColorPicker";
import { IllustrationSelector } from "@/components/og/IllustrationSelector";
import { OgPreviewFrame } from "@/components/og/OgPreviewFrame";
import { UploadToast } from "@/components/og/UploadToast";
import { Button } from "@/components/ui/button";

export default function CustomOgPage({ params }: { params: Promise<{ letterId: string }> }) {
  const { letterId } = use(params);
  const [message, setMessage] = useState("특별한 순간을 편지로 남겨보세요");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [illustration, setIllustration] = useState("default");
  const [fontSize, setFontSize] = useState(48);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. 미리보기 이미지를 Blob으로 가져오기
      const params = new URLSearchParams({
        message,
        bgColor,
        illustration,
        fontSize: fontSize.toString(),
      });
      const previewRes = await fetch(`/api/og-preview?${params.toString()}`);
      const blob = await previewRes.blob();

      // 2. Blob을 Base64로 변환 (또는 FormData로 전송)
      // 여기서는 요구사항대로 Base64로 변환하여 전송하는 예시
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;

        // 3. 백엔드에 업로드
        // 실제 백엔드 엔드포인트가 없으므로 여기서는 성공했다고 가정하고 로그만 출력
        console.log("Uploading to backend...", { letterId, base64data });

        // const uploadRes = await fetch('/api/og/upload', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ letterId, image: base64data }),
        // });

        // if (!uploadRes.ok) throw new Error('Upload failed');

        setToast({ show: true, message: "OG 이미지가 저장되었습니다!", type: "success" });
      };
    } catch (error) {
      console.error(error);
      setToast({ show: true, message: "저장에 실패했습니다.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">편지 미리보기 카드 꾸미기</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-8">
            {/* 미리보기 영역 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">미리보기</h2>
              <OgPreviewFrame message={message} bgColor={bgColor} illustration={illustration} fontSize={fontSize} />
            </div>

            {/* 편집 컨트롤 영역 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메시지 입력</label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="공유될 때 보여질 메시지를 입력하세요"
                  maxLength={40}
                />
                <div className="text-right text-xs text-gray-500 mt-1">{message.length}/40</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">배경 색상</label>
                <ColorPicker selectedColor={bgColor} onColorChange={setBgColor} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">일러스트 선택</label>
                <IllustrationSelector selectedIllustration={illustration} onIllustrationChange={setIllustration} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">글자 크기: {fontSize}px</label>
                <input
                  type="range"
                  min="24"
                  max="72"
                  step="4"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? "저장 중..." : "이미지 저장하기"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <UploadToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}
