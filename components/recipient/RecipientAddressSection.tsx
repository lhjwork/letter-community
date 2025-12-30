"use client";

import { useState } from "react";
import { RecipientAddressInput } from "@/types/recipient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RecipientAddressForm from "./RecipientAddressForm";

interface RecipientAddressSectionProps {
  addresses: RecipientAddressInput[];
  onChange: (addresses: RecipientAddressInput[]) => void;
  disabled?: boolean;
}

const emptyFormData: RecipientAddressInput = {
  name: "",
  phone: "",
  zipCode: "",
  address1: "",
  address2: "",
  memo: "",
};

export default function RecipientAddressSection({ addresses, onChange, disabled = false }: RecipientAddressSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<RecipientAddressInput>(emptyFormData);

  const handleAddClick = () => {
    setFormData(emptyFormData);
    setEditingIndex(null);
    setShowAddForm(true);
  };

  const handleEditClick = (index: number) => {
    setFormData(addresses[index]);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingIndex(null);
    setFormData(emptyFormData);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      // 수정
      const newAddresses = [...addresses];
      newAddresses[editingIndex] = formData;
      onChange(newAddresses);
    } else {
      // 추가
      onChange([...addresses, formData]);
    }
    handleCancel();
  };

  const handleDelete = (index: number) => {
    if (!confirm("이 수신자 주소를 삭제하시겠습니까?")) return;

    const newAddresses = addresses.filter((_, i) => i !== index);
    onChange(newAddresses);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">📮 수신자 주소 관리</h3>
          <p className="text-sm text-gray-600">편지를 받을 수신자들의 주소를 추가하세요</p>
        </div>
        {!disabled && (
          <Button onClick={handleAddClick} disabled={showAddForm} variant="outline">
            + 수신자 추가
          </Button>
        )}
      </div>

      {/* 추가/수정 폼 */}
      {showAddForm && <RecipientAddressForm value={formData} onChange={setFormData} onCancel={handleCancel} onSave={handleSave} />}

      {/* 수신자 목록 */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-gray-400 mb-2">📭</div>
            <p className="text-gray-500">등록된 수신자 주소가 없습니다</p>
            {!disabled && <p className="text-sm text-gray-400 mt-1">위의 "수신자 추가" 버튼을 눌러 주소를 추가해보세요</p>}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">수신자 목록 ({addresses.length}명)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {addresses.map((address, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span>
                        ({address.zipCode}) {address.address1}
                        {address.address2 && ` ${address.address2}`}
                      </span>
                    </div>
                  </div>
                </div>

                {!disabled && (
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(index)} disabled={showAddForm} className="text-blue-600 hover:text-blue-700">
                      수정
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(index)} disabled={showAddForm} className="text-red-600 hover:text-red-700">
                      삭제
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
