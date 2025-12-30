"use client";

import { useState, useCallback } from "react";
import { RecipientAddressInput } from "@/types/recipient";
import { validateRecipientAddress } from "@/lib/recipient-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PostcodeSearch, { PostcodeResult } from "@/components/address/PostcodeSearch";

interface RecipientAddressFormProps {
  value: RecipientAddressInput;
  onChange: (data: RecipientAddressInput) => void;
  onCancel: () => void;
  onSave: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export default function RecipientAddressForm({ value, onChange, onCancel, onSave, isLoading = false, errors = {} }: RecipientAddressFormProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(
    (field: keyof RecipientAddressInput, fieldValue: string) => {
      onChange({ ...value, [field]: fieldValue });
      // 필드 변경 시 해당 필드의 에러 제거
      if (localErrors[field]) {
        setLocalErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [value, onChange, localErrors]
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let phoneValue = e.target.value.replace(/[^\d]/g, "");

      // 010으로 시작하지 않으면 010 추가
      if (phoneValue.length > 0 && !phoneValue.startsWith("010")) {
        phoneValue = "010" + phoneValue;
      }

      // 자동 하이픈 추가
      if (phoneValue.length > 3 && phoneValue.length <= 7) {
        phoneValue = phoneValue.slice(0, 3) + "-" + phoneValue.slice(3);
      } else if (phoneValue.length > 7) {
        phoneValue = phoneValue.slice(0, 3) + "-" + phoneValue.slice(3, 7) + "-" + phoneValue.slice(7, 11);
      }

      updateField("phone", phoneValue);
    },
    [updateField]
  );

  const handlePostcodeComplete = useCallback(
    (data: PostcodeResult) => {
      onChange({
        ...value,
        zipCode: data.zipCode,
        address1: data.address,
      });
    },
    [value, onChange]
  );

  const handleSave = useCallback(() => {
    const validationErrors = validateRecipientAddress(value);
    if (Object.keys(validationErrors).length > 0) {
      setLocalErrors(validationErrors);
      return;
    }
    setLocalErrors({});
    onSave();
  }, [value, onSave]);

  const allErrors = { ...localErrors, ...errors };

  return (
    <Card>
      <CardHeader>
        <CardTitle>수신자 정보 입력</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={value.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="수신자 이름을 입력하세요"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${allErrors.name ? "border-red-500" : "border-gray-300"}`}
            maxLength={50}
          />
          {allErrors.name && <p className="mt-1 text-sm text-red-600">{allErrors.name}</p>}
        </div>

        {/* 전화번호 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={value.phone}
            onChange={handlePhoneChange}
            placeholder="010-1234-5678"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${allErrors.phone ? "border-red-500" : "border-gray-300"}`}
            maxLength={13}
          />
          {allErrors.phone && <p className="mt-1 text-sm text-red-600">{allErrors.phone}</p>}
        </div>

        {/* 우편번호 및 주소 검색 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            우편번호 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={value.zipCode}
              onChange={(e) => updateField("zipCode", e.target.value)}
              placeholder="12345"
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${allErrors.zipCode ? "border-red-500" : "border-gray-300"}`}
              maxLength={5}
              readOnly
            />
            <PostcodeSearch onComplete={handlePostcodeComplete} buttonText="주소검색" />
          </div>
          {allErrors.zipCode && <p className="mt-1 text-sm text-red-600">{allErrors.zipCode}</p>}
        </div>

        {/* 주소 */}
        <div>
          <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
            주소 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address1"
            value={value.address1}
            onChange={(e) => updateField("address1", e.target.value)}
            placeholder="주소를 검색해주세요"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${allErrors.address1 ? "border-red-500" : "border-gray-300"}`}
            maxLength={200}
            readOnly
          />
          {allErrors.address1 && <p className="mt-1 text-sm text-red-600">{allErrors.address1}</p>}
        </div>

        {/* 상세주소 */}
        <div>
          <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">
            상세주소
          </label>
          <input
            type="text"
            id="address2"
            value={value.address2 || ""}
            onChange={(e) => updateField("address2", e.target.value)}
            placeholder="동, 호수 등 상세주소를 입력하세요"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${allErrors.address2 ? "border-red-500" : "border-gray-300"}`}
            maxLength={200}
          />
          {allErrors.address2 && <p className="mt-1 text-sm text-red-600">{allErrors.address2}</p>}
        </div>

        {/* 메모 */}
        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
            메모
          </label>
          <textarea
            id="memo"
            value={value.memo || ""}
            onChange={(e) => updateField("memo", e.target.value)}
            placeholder="수신자에 대한 메모를 입력하세요 (예: 친구, 가족 등)"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none ${allErrors.memo ? "border-red-500" : "border-gray-300"}`}
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            {allErrors.memo && <p className="text-sm text-red-600">{allErrors.memo}</p>}
            <p className="text-sm text-gray-500 ml-auto">{(value.memo || "").length}/500</p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
            취소
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="flex-1">
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
