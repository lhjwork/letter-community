"use client";

import { useState } from "react";
import { requestPhysicalLetterAnonymous, validateRecipientAddress } from "@/lib/recipient-api";
import { getOrCreateSessionId } from "@/lib/session-id";
import { RecipientAddressInput } from "@/types/recipient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PostcodeSearch, { PostcodeResult } from "@/components/address/PostcodeSearch";

interface AnonymousPhysicalRequestFormProps {
  letterId: string;
  letterTitle: string;
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
}

export default function AnonymousPhysicalRequestForm({ letterId, letterTitle, onSuccess, onCancel }: AnonymousPhysicalRequestFormProps) {
  const [formData, setFormData] = useState<RecipientAddressInput>({
    name: "",
    phone: "",
    zipCode: "",
    address1: "",
    address2: "",
    memo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddressComplete = (data: PostcodeResult) => {
    setFormData((prev) => ({
      ...prev,
      zipCode: data.zipCode,
      address1: data.address,
    }));
    if (errors.zipCode || errors.address1) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.zipCode;
        delete newErrors.address1;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setIsDuplicate(false);

    const validationErrors = validateRecipientAddress(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionId = getOrCreateSessionId();

      const response = await requestPhysicalLetterAnonymous(letterId, {
        ...formData,
        sessionId,
      });

      if (response.success) {
        setIsDuplicate(response.data.isDuplicate);

        if (response.data.isDuplicate) {
          setSuccessMessage(`신청이 완료되었습니다. (중복 신청)\n\n이미 같은 주소로 신청된 기록이 있습니다.\n신청 ID: ${response.data.requestId}`);
        } else {
          setSuccessMessage(`신청이 완료되었습니다!\n\n신청 ID: ${response.data.requestId}\n\n이 ID로 배송 상태를 조회할 수 있습니다.`);
        }

        setFormData({
          name: "",
          phone: "",
          zipCode: "",
          address1: "",
          address2: "",
          memo: "",
        });

        onSuccess?.(response.data.requestId);
      }
    } catch (error) {
      console.error("신청 실패:", error);
      setErrors({
        submit: "신청 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>실물 편지 신청</CardTitle>
          <p className="text-sm text-gray-600 mt-2">{letterTitle}을(를) 실물로 받으시겠어요?</p>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 whitespace-pre-line text-sm">{successMessage}</p>
              {isDuplicate && <p className="text-amber-700 text-xs mt-2">💡 중복 신청으로 처리되었습니다. 기존 신청을 확인해주세요.</p>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="받으실 분의 이름"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                disabled={isSubmitting}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* 전화번호 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="010-0000-0000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                disabled={isSubmitting}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* 우편번호 및 주소 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                우편번호 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.zipCode}
                  readOnly
                  placeholder="우편번호"
                  maxLength={5}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                />
                <PostcodeSearch onComplete={handleAddressComplete} buttonText="주소 검색" className="px-4 py-2" />
              </div>
              {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
            </div>

            {/* 주소 */}
            <div>
              <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
                주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address1"
                name="address1"
                value={formData.address1}
                readOnly
                placeholder="주소 검색 버튼을 클릭하여 주소를 선택해주세요"
                className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none ${errors.address1 ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.address1 && <p className="mt-1 text-sm text-red-600">{errors.address1}</p>}
            </div>

            {/* 상세주소 */}
            <div>
              <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">
                상세주소 (선택)
              </label>
              <input
                type="text"
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                placeholder="아파트, 호수 등"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.address2 ? "border-red-500" : "border-gray-300"}`}
                disabled={isSubmitting}
              />
              {errors.address2 && <p className="mt-1 text-sm text-red-600">{errors.address2}</p>}
            </div>

            {/* 메모 */}
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
                배송 메모 (선택)
              </label>
              <textarea
                id="memo"
                name="memo"
                value={formData.memo}
                onChange={handleInputChange}
                placeholder="배송 시 참고할 사항을 입력해주세요"
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none ${errors.memo ? "border-red-500" : "border-gray-300"}`}
                disabled={isSubmitting}
              />
              {errors.memo && <p className="mt-1 text-sm text-red-600">{errors.memo}</p>}
            </div>

            {/* 제출 에러 */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                  취소
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "신청 중..." : "신청하기"}
              </Button>
            </div>
          </form>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-xs leading-relaxed">
              💌 안내: 입력하신 주소로 실물 편지가 배송됩니다. 정확한 주소를 입력해주세요. 중복된 주소로 신청하신 경우, 백엔드에서 자동으로 감지되어 처리됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
