"use client";

import { Address } from "@/types/address";
import { Star } from "lucide-react";

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onSelect?: (address: Address) => void;
  showActions?: boolean;
  selectable?: boolean;
}

const btn = "h-9 px-3 text-sm rounded-lg border border-[#C4C4C4] text-[#424242] bg-white hover:bg-[#F5F5F5] transition-colors";

export default function AddressCard({ address, onEdit, onDelete, onSetDefault, onSelect, showActions = true, selectable = false }: AddressCardProps) {
  const fullAddress = address.addressDetail ? `(${address.zipCode}) ${address.address} ${address.addressDetail}` : `(${address.zipCode}) ${address.address}`;

  return (
    <div
      className={`border rounded-xl p-4 sm:p-5 bg-[#FEFEFE] transition-all ${address.isDefault ? "border-[#FF9883]" : "border-[#C4C4C4]"} ${selectable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#FF9883]" : ""}`}
      onClick={() => selectable && onSelect?.(address)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {address.isDefault && <Star className="w-4 h-4 text-[#FF9883] fill-[#FF9883]" />}
            <span className="font-semibold text-[#424242] text-lg">{address.addressName}</span>
            {address.isDefault && <span className="text-xs bg-[#FFF7F5] text-[#FF7F65] border border-[#FF9883] px-2 py-0.5 rounded-full">기본 배송지</span>}
          </div>
          <p className="text-[#424242] mb-1">
            {address.recipientName} | {address.phone}
          </p>
          <p className="text-[#757575] text-sm">{fullAddress}</p>
          {address.tel && <p className="text-[#757575] text-sm mt-1">연락처: {address.tel}</p>}
        </div>

        {showActions && (
          <div className="flex flex-col gap-2 shrink-0">
            {!address.isDefault && onSetDefault && (
              <button
                type="button"
                className={btn}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault(address._id);
                }}
              >
                기본 설정
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                className={btn}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
              >
                수정
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className={`${btn} text-[#FF7F65] border-[#FF9883] hover:bg-[#FFF7F5]`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(address._id);
                }}
              >
                삭제
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
