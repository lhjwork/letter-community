"use client";

import { Address } from "@/types/address";
import { Button } from "@/components/ui/button";
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

export default function AddressCard({ address, onEdit, onDelete, onSetDefault, onSelect, showActions = true, selectable = false }: AddressCardProps) {
  const fullAddress = address.addressDetail ? `(${address.zipCode}) ${address.address} ${address.addressDetail}` : `(${address.zipCode}) ${address.address}`;

  return (
    <div
      className={`border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow ${selectable ? "cursor-pointer hover:border-pink-300" : ""}`}
      onClick={() => selectable && onSelect?.(address)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {address.isDefault && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
            <span className="font-semibold text-gray-800">{address.addressName}</span>
            {address.isDefault && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">기본 배송지</span>}
          </div>
          <p className="text-gray-700 mb-1">
            {address.recipientName} | {address.phone}
          </p>
          <p className="text-gray-600 text-sm">{fullAddress}</p>
          {address.tel && <p className="text-gray-500 text-sm mt-1">연락처: {address.tel}</p>}
        </div>

        {showActions && (
          <div className="flex flex-col gap-2 shrink-0">
            {!address.isDefault && onSetDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault(address._id);
                }}
              >
                기본 설정
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
              >
                수정
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(address._id);
                }}
              >
                삭제
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
