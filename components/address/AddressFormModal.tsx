"use client";

import { useState, useCallback } from "react";
import { Address, AddressInput } from "@/types/address";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PostcodeSearch from "./PostcodeSearch";

interface AddressFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddressInput) => Promise<void>;
  editAddress?: Address | null;
  isLoading?: boolean;
}

const emptyFormData: AddressInput = {
  addressName: "",
  recipientName: "",
  zipCode: "",
  address: "",
  addressDetail: "",
  phone: "",
  tel: "",
  isDefault: false,
};

export default function AddressFormModal({ open, onOpenChange, onSubmit, editAddress, isLoading = false }: AddressFormModalProps) {
  const [formData, setFormData] = useState<AddressInput>(emptyFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        // 모달이 열릴 때 폼 데이터 초기화
        if (editAddress) {
          setFormData({
            addressName: editAddress.addressName,
            recipientName: editAddress.recipientName,
            zipCode: editAddress.zipCode,
            address: editAddress.address,
            addressDetail: editAddress.addressDetail || "",
            phone: editAddress.phone,
            tel: editAddress.tel || "",
            isDefault: editAddress.isDefault,
          });
        } else {
          setFormData(emptyFormData);
        }
        setErrors({});
      }
      onOpenChange(newOpen);
    },
    [editAddress, onOpenChange]
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.addressName.trim()) {
      newErrors.addressName = "배송지명을 입력해주세요";
    } else if (formData.addressName.length > 20) {
      newErrors.addressName = "배송지명은 20자 이내로 입력해주세요";
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "수령인을 입력해주세요";
    } else if (formData.recipientName.length > 50) {
      newErrors.recipientName = "수령인은 50자 이내로 입력해주세요";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "우편번호를 검색해주세요";
    }

    if (!formData.address.trim()) {
      newErrors.address = "주소를 입력해주세요";
    }

    if (formData.addressDetail && formData.addressDetail.length > 100) {
      newErrors.addressDetail = "상세주소는 100자 이내로 입력해주세요";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "휴대전화를 입력해주세요";
    } else if (!/^[\d-]+$/.test(formData.phone)) {
      newErrors.phone = "휴대전화는 숫자와 하이픈만 입력 가능합니다";
    }

    if (formData.tel && !/^[\d-]*$/.test(formData.tel)) {
      newErrors.tel = "연락처는 숫자와 하이픈만 입력 가능합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const handlePostcodeComplete = (data: { zipCode: string; address: string; roadAddress: string; jibunAddress: string }) => {
    setFormData((prev) => ({
      ...prev,
      zipCode: data.zipCode,
      address: data.address,
    }));
    setErrors((prev) => ({ ...prev, zipCode: "", address: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{editAddress ? "배송지 수정" : "배송지 추가"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* 배송지명 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">
              배송지명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.addressName}
              onChange={(e) => setFormData((prev) => ({ ...prev, addressName: e.target.value }))}
              placeholder="예: 집, 회사"
              className="w-full px-5 py-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              maxLength={20}
            />
            {errors.addressName && <p className="text-red-500 text-lg mt-2">{errors.addressName}</p>}
          </div>

          {/* 수령인 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">
              수령인 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientName: e.target.value }))}
              placeholder="수령인 이름"
              className="w-full px-5 py-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              maxLength={50}
            />
            {errors.recipientName && <p className="text-red-500 text-lg mt-2">{errors.recipientName}</p>}
          </div>

          {/* 우편번호 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">
              우편번호 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <input type="text" value={formData.zipCode} readOnly placeholder="우편번호" className="flex-1 px-5 py-4 text-xl border border-gray-300 rounded-lg bg-gray-50" />
              <PostcodeSearch onComplete={handlePostcodeComplete} className="px-6 py-4 text-xl h-auto" />
            </div>
            {errors.zipCode && <p className="text-red-500 text-lg mt-2">{errors.zipCode}</p>}
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">
              주소 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.address} readOnly placeholder="주소" className="w-full px-5 py-4 text-xl border border-gray-300 rounded-lg bg-gray-50" />
            {errors.address && <p className="text-red-500 text-lg mt-2">{errors.address}</p>}
          </div>

          {/* 상세주소 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">상세주소</label>
            <input
              type="text"
              value={formData.addressDetail}
              onChange={(e) => setFormData((prev) => ({ ...prev, addressDetail: e.target.value }))}
              placeholder="상세주소 (동/호수 등)"
              className="w-full px-5 py-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              maxLength={100}
            />
            {errors.addressDetail && <p className="text-red-500 text-lg mt-2">{errors.addressDetail}</p>}
          </div>

          {/* 휴대전화 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">
              휴대전화 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="010-0000-0000"
              className="w-full px-5 py-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            {errors.phone && <p className="text-red-500 text-lg mt-2">{errors.phone}</p>}
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">연락처 (선택)</label>
            <input
              type="tel"
              value={formData.tel}
              onChange={(e) => setFormData((prev) => ({ ...prev, tel: e.target.value }))}
              placeholder="02-0000-0000"
              className="w-full px-5 py-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            {errors.tel && <p className="text-red-500 text-lg mt-2">{errors.tel}</p>}
          </div>

          {/* 기본 배송지 설정 */}
          <div className="flex items-center gap-4 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
              className="w-6 h-6 text-pink-500 rounded focus:ring-pink-500"
            />
            <label htmlFor="isDefault" className="text-xl text-gray-700">
              기본 배송지로 설정
            </label>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="px-8 py-4 text-xl h-auto">
              취소
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-pink-500 hover:bg-pink-600 px-8 py-4 text-xl h-auto">
              {isLoading ? "저장 중..." : editAddress ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
