"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { RecipientAddressInput } from "@/types/recipient";
import { createLetter } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecipientAddressSection from "@/components/recipient/RecipientAddressSection";

interface LetterCreateFormProps {
  onSuccess?: (letterId: string) => void;
  onCancel?: () => void;
}

export default function LetterCreateForm({ onSuccess, onCancel }: LetterCreateFormProps) {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "friend" as "friend" | "story",
    category: "기타",
  });
  const [recipientAddresses, setRecipientAddresses] = useState<RecipientAddressInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "편지 제목을 입력해주세요";
    }

    if (!formData.content.trim()) {
      newErrors.content = "편지 내용을 입력해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await createLetter(
        {
          title: formData.title,
          content: formData.content,
          type: formData.type,
          category: formData.category,
          recipientAddresses: recipientAddresses.length > 0 ? recipientAddresses : undefined,
        },
        token
      );

      if (response.data._id) {
        onSuccess?.(response.data._id);
      }
    } catch (error) {
      console.error("편지 생성 실패:", error);
      alert("편지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>새 편지 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 편지 기본 정보 */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  편지 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.title ? "border-red-500" : "border-gray-300"}`}
                  placeholder="편지 제목을 입력하세요"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  편지 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none ${errors.content ? "border-red-500" : "border-gray-300"}`}
                  rows={10}
                  placeholder="편지 내용을 입력하세요"
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  편지 유형
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "friend" | "story" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="friend">친구에게</option>
                  <option value="story">사연</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="기타">기타</option>
                  <option value="감사">감사</option>
                  <option value="사과">사과</option>
                  <option value="축하">축하</option>
                  <option value="위로">위로</option>
                  <option value="응원">응원</option>
                </select>
              </div>
            </div>

            {/* 수신자 주소 관리 */}
            <div className="border-t pt-6">
              <RecipientAddressSection addresses={recipientAddresses} onChange={setRecipientAddresses} disabled={isSubmitting} />
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-6 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                  취소
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "편지 작성 중..." : "편지 작성 완료"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
