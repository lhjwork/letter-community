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
          <DialogTitle className="text-3xl text-[#424242] font-normal" style={{ fontFamily: "NanumJangMiCe, cursive" }}>{editAddress ? "배송지 수정" : "배송지 추가"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* 배송지명 */}
          <div>
            <label className="block text-lg font-medium text-[#424242] mb-2">
              배송지명 <span className="text-[#FF7F65]">*</span>
            </label>
            <input
              type="text"
              value={formData.addressName}
              onChange={(e) => setFormData((prev) => ({ ...prev, addressName: e.target.value }))}
              placeholder="예: 집, 회사"
              className="w-full px-4 py-3 text-lg border-2 border-[#C4C4C4] rounded-lg text-[#424242] focus:outline-none focus:border-[#FF7F65]"
              maxLength={20}
            />
            {errors.addressName && <p className="text-[#FF7F65] text-sm mt-1">{errors.addressName}</p>}
          </div>

          {/* 수령인 */}
          <div>
            <label className="block text-lg font-medium text-[#424242] mb-2">
              수령인 <span className="text-[#FF7F65]">*</span>
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientName: e.target.value }))}
              placeholder="수령인 이름"
              className="w-full px-4 py-3 text-lg border-2 border-[#C4C4C4] rounded-lg text-[#424242] focus:outline-none focus:border-[#FF7F65]"
              maxLength={50}
            />
            {errors.recipientName && <p className="text-[#FF7F65] text-sm mt-1">{errors.recipientName}</p>}
          </div>

          {/* 우편번호 */}
          <div>
            <label className="block text-lg font-medium text-[#424242] mb-2">
              우편번호 <span className="text-[#FF7F65]">*</span>
            </label>
            <div className="flex gap-3">
              <input type="text" value={formData.zipCode} readOnly placeholder="우편번호" className="flex-1 px-4 py-3 text-lg border-2 border-[#C4C4C4] rounded-lg bg-[#F5F5F5] text-[#424242]" />
              <PostcodeSearch onComplete={handlePostcodeComplete} className="px-5 py-3 text-lg h-auto border-2 border-[#FF9883] text-[#FF9883] hover:bg-orange-50 hover:text-[#FF9883]" />
            </div>
            {errors.zipCode && <p className="text-[#FF7F65] text-sm mt-1">{errors.zipCode}</p>}
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-lg font-medium text-[#424242] mb-2">
              주소 <span className="text-[#FF7F65]">*</span>
            </label>
            <input type="text" value={formData.address} readOnly placeholder="주소" className="w-full px-4 py-3 text-lg border-2 border-[#C4C4C4] rounded-lg bg-[#F5F5F5] text-[#424242]" />
            {errors.address && <p className="text-[#FF7F65] text-sm mt-1">{errors.address}</p>}
          </div>

          {/* 상세주소 */}
          <div>
            <label className="block text-lg font-medium text-[#424242] mb-2">상세주소</label>
            <input
              type="text"
              value={formData.addressDetail}
              onChange={(e) => setFormData((prev) => ({ ...prev, addressDetail: e.target.value }))}
              placeholder="상세주소 (동/호수 등)"
              className="w-full px-4 py-3 text-lg border-2 border-[#C4C4C4] rounded-lg text-[#424242] focus:outline-none focus:border-[#FF7F65]"
              maxLength={100}
            />
            {errors.addressDetail && <p className="text-[#FF7F65] text-sm mt-1">{errors.addressDetail}</p>}
          </div>

          {/* 휴대전화 */}
          <div>
            <label className="block text-lg font-medium text-[#424242] mb-2">
              휴대전화 <span className="text-[#FF7F65]">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 text-lg border-2 border-[#C4C4C4] rounded-lg text-[#424242] focus:outline-none focus:border-[#FF7F65]"
            />
            {errors.phone && <p className="text-[#FF7F65] text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-lg font-medium text-[#424242] mb-2">연락처 (선택)</label>
            <input
              type="tel"
              value={formData.tel}
              onChange={(e) => setFormData((prev) => ({ ...prev, tel: e.target.value }))}
              placeholder="02-0000-0000"
              className="w-full px-4 py-3 text-lg border-2 border-[#C4C4C4] rounded-lg text-[#424242] focus:outline-none focus:border-[#FF7F65]"
            />
            {errors.tel && <p className="text-[#FF7F65] text-sm mt-1">{errors.tel}</p>}
          </div>

          {/* 기본 배송지 설정 */}
          <div className="flex items-center gap-4 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
              className="w-5 h-5 accent-[#FF9883] rounded"
            />
            <label htmlFor="isDefault" className="text-lg text-[#424242]">
              기본 배송지로 설정
            </label>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="px-8 py-3 text-lg h-auto border-2 border-[#C4C4C4] text-[#757575] hover:bg-[#F5F5F5]">
              취소
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#FF7F65] hover:bg-[#ff6b50] text-white px-8 py-3 text-lg h-auto">
              {isLoading ? "저장 중..." : editAddress ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
