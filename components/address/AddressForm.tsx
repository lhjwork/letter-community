"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Address } from "@/types/address";
import { getAddresses } from "@/lib/address-api";
import { Button } from "@/components/ui/button";
import PostcodeSearch from "./PostcodeSearch";
import AddressSelectModal from "./AddressSelectModal";

export interface ShippingFormData {
  recipientName: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  phone: string;
  tel: string;
  saveAsDefault: boolean;
  saveToBook: boolean;
}

interface AddressFormProps {
  value: ShippingFormData;
  onChange: (data: ShippingFormData) => void;
  errors?: Record<string, string>;
}

export default function AddressForm({ value, onChange, errors = {} }: AddressFormProps) {
  const { data: session } = useSession();
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [useDefaultAddress, setUseDefaultAddress] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (!session?.backendToken) return;

      try {
        const res = await getAddresses(session.backendToken);
        const defaultAddr = res.data?.find((addr) => addr.isDefault);
        setDefaultAddress(defaultAddr || null);
      } catch {
        // 에러 무시
      }
    };

    fetchDefaultAddress();
  }, [session?.backendToken]);

  const handleUseDefaultChange = (checked: boolean) => {
    setUseDefaultAddress(checked);
    if (checked && defaultAddress) {
      onChange({
        ...value,
        recipientName: defaultAddress.recipientName,
        zipCode: defaultAddress.zipCode,
        address: defaultAddress.address,
        addressDetail: defaultAddress.addressDetail || "",
        phone: defaultAddress.phone,
        tel: defaultAddress.tel || "",
      });
    }
  };

  const handleAddressSelect = (address: Address) => {
    onChange({
      ...value,
      recipientName: address.recipientName,
      zipCode: address.zipCode,
      address: address.address,
      addressDetail: address.addressDetail || "",
      phone: address.phone,
      tel: address.tel || "",
    });
  };

  const handlePostcodeComplete = (data: { zipCode: string; address: string; roadAddress: string; jibunAddress: string }) => {
    onChange({
      ...value,
      zipCode: data.zipCode,
      address: data.address,
    });
  };

  const updateField = (field: keyof ShippingFormData, fieldValue: string | boolean) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-4">
      {/* 기본 배송지 체크박스 */}
      {defaultAddress && (
        <div className="flex items-center gap-2">
          <input type="checkbox" id="useDefault" checked={useDefaultAddress} onChange={(e) => handleUseDefaultChange(e.target.checked)} className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500" />
          <label htmlFor="useDefault" className="text-sm text-gray-700">
            기본 배송지 ({defaultAddress.addressName})
          </label>
        </div>
      )}

      {/* 우편번호 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 우편번호
        </label>
        <div className="flex gap-2 flex-wrap">
          <input type="text" value={value.zipCode} readOnly placeholder="우편번호" className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
          <PostcodeSearch onComplete={handlePostcodeComplete} />
          <Button type="button" variant="outline" onClick={() => setShowSelectModal(true)}>
            배송지 선택
          </Button>
        </div>
        {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}

        {/* 저장 옵션 */}
        <div className="flex flex-wrap gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={value.saveAsDefault} onChange={(e) => updateField("saveAsDefault", e.target.checked)} className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500" />
            <span className="text-sm text-gray-600">기본 배송지로 등록</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={value.saveToBook} onChange={(e) => updateField("saveToBook", e.target.checked)} className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500" />
            <span className="text-sm text-gray-600">주소록에 저장</span>
          </label>
        </div>
      </div>

      {/* 배송지 주소 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 배송지 주소
        </label>
        <input type="text" value={value.address} readOnly placeholder="주소" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 mb-2" />
        <input
          type="text"
          value={value.addressDetail}
          onChange={(e) => updateField("addressDetail", e.target.value)}
          placeholder="상세주소 (동/호수 등)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      {/* 수취인 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 수취인 이름
        </label>
        <input
          type="text"
          value={value.recipientName}
          onChange={(e) => updateField("recipientName", e.target.value)}
          placeholder="수취인 이름"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>}
      </div>

      {/* 수취인 휴대전화 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="text-red-500">*</span> 수취인 휴대전화
        </label>
        <input
          type="tel"
          value={value.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="010-0000-0000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* 수취인 연락처 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">수취인 연락처 (선택)</label>
        <input
          type="tel"
          value={value.tel}
          onChange={(e) => updateField("tel", e.target.value)}
          placeholder="02-0000-0000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* 배송지 선택 모달 */}
      <AddressSelectModal open={showSelectModal} onOpenChange={setShowSelectModal} onSelect={handleAddressSelect} />
    </div>
  );
}
