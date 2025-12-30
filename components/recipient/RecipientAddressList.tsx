"use client";

import { useState } from "react";
import { RecipientAddress, RecipientAddressInput } from "@/types/recipient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RecipientAddressForm from "./RecipientAddressForm";

interface RecipientAddressListProps {
  addresses: RecipientAddress[];
  onAdd: (data: RecipientAddressInput) => Promise<void>;
  onUpdate: (addressId: string, data: RecipientAddressInput) => Promise<void>;
  onDelete: (addressId: string) => Promise<void>;
  isLoading?: boolean;
  canEdit?: boolean;
}

const emptyFormData: RecipientAddressInput = {
  name: "",
  phone: "",
  zipCode: "",
  address1: "",
  address2: "",
  memo: "",
};

export default function RecipientAddressList({ addresses, onAdd, onUpdate, onDelete, isLoading = false, canEdit = true }: RecipientAddressListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RecipientAddressInput>(emptyFormData);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAddClick = () => {
    setFormData(emptyFormData);
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleEditClick = (address: RecipientAddress) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      zipCode: address.zipCode,
      address1: address.address1,
      address2: address.address2 || "",
      memo: address.memo || "",
    });
    setEditingId(address._id);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData(emptyFormData);
  };

  const handleSave = async () => {
    try {
      setActionLoading(editingId || "add");

      if (editingId) {
        await onUpdate(editingId, formData);
      } else {
        await onAdd(formData);
      }

      handleCancel();
    } catch (error) {
      console.error("수신자 주소 저장 실패:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("이 수신자 주소를 삭제하시겠습니까?")) return;

    try {
      setActionLoading(addressId);
      await onDelete(addressId);
    } catch (error) {
      console.error("수신자 주소 삭제 실패:", error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">📮 수신자 주소 관리</h3>
          <p className="text-sm text-gray-600">편지를 받을 수신자들의 주소를 관리하세요</p>
        </div>
        {canEdit && (
          <Button onClick={handleAddClick} disabled={isLoading || showAddForm}>
            + 수신자 추가
          </Button>
        )}
      </div>

      {/* 추가/수정 폼 */}
      {showAddForm && <RecipientAddressForm value={formData} onChange={setFormData} onCancel={handleCancel} onSave={handleSave} isLoading={actionLoading === (editingId || "add")} />}

      {/* 수신자 목록 */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-gray-400 mb-2">📭</div>
            <p className="text-gray-500">등록된 수신자 주소가 없습니다</p>
            {canEdit && <p className="text-sm text-gray-400 mt-1">위의 "수신자 추가" 버튼을 눌러 주소를 추가해보세요</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card key={address._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">👤 {address.name}</span>
                      <span className="text-gray-600">({address.phone})</span>
                      {address.memo && (
                        <Badge variant="secondary" className="text-xs">
                          {address.memo}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        <span>📍</span>
                        <span>
                          ({address.zipCode}) {address.address1}
                          {address.address2 && ` ${address.address2}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">등록일: {new Date(address.createdAt).toLocaleDateString("ko-KR")}</div>
                  </div>

                  {canEdit && (
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(address)} disabled={isLoading || showAddForm || actionLoading === address._id}>
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address._id)}
                        disabled={isLoading || showAddForm || actionLoading === address._id}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        {actionLoading === address._id ? "삭제 중..." : "삭제"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
