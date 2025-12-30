"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { RecipientAddress } from "@/types/recipient";
import { getRecipientAddresses } from "@/lib/recipient-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecipientSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letterId: string;
  onSelect: (recipient: RecipientAddress) => void;
  onManualInput: () => void;
}

export default function RecipientSelectModal({ open, onOpenChange, letterId, onSelect, onManualInput }: RecipientSelectModalProps) {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [addresses, setAddresses] = useState<RecipientAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!token || !letterId) return;

    try {
      setIsLoading(true);
      const response = await getRecipientAddresses(token, letterId);
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error("수신자 주소 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, letterId]);

  useEffect(() => {
    if (open) {
      fetchAddresses();
    }
  }, [open, fetchAddresses]);

  const handleSelect = (address: RecipientAddress) => {
    onSelect(address);
    onOpenChange(false);
  };

  const handleManualInput = () => {
    onManualInput();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>수신자 선택</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* 직접 입력 옵션 */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-pink-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">✏️ 새 주소 직접 입력</h3>
                  <p className="text-sm text-gray-600">새로운 수신자 주소를 직접 입력합니다</p>
                </div>
                <Button onClick={handleManualInput} variant="outline">
                  직접 입력
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 등록된 수신자 목록 */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">수신자 목록을 불러오는 중...</div>
            </div>
          ) : addresses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-gray-400 mb-2">📭</div>
                <p className="text-gray-500">등록된 수신자 주소가 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">{'위의 "직접 입력" 버튼을 눌러 주소를 입력해주세요'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">등록된 수신자 목록</h3>
              {addresses.map((address) => (
                <Card key={address._id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>
                              ({address.zipCode}) {address.address1}
                              {address.address2 && ` ${address.address2}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button onClick={() => handleSelect(address)} size="sm" className="ml-4">
                        선택
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
