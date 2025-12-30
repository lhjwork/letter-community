"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { RecipientAddress, RecipientAddressInput } from "@/types/recipient";
import { getRecipientAddresses, createRecipientAddress, updateRecipientAddress, deleteRecipientAddress } from "@/lib/recipient-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RecipientAddressList from "./RecipientAddressList";

interface RecipientAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letterId: string;
  canEdit?: boolean;
}

export default function RecipientAddressModal({ open, onOpenChange, letterId, canEdit = true }: RecipientAddressModalProps) {
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

  const handleAdd = useCallback(
    async (data: RecipientAddressInput) => {
      if (!token) throw new Error("로그인이 필요합니다");

      const response = await createRecipientAddress(token, letterId, data);
      if (response.success) {
        setAddresses((prev) => [...prev, response.data]);
      }
    },
    [token, letterId]
  );

  const handleUpdate = useCallback(
    async (addressId: string, data: RecipientAddressInput) => {
      if (!token) throw new Error("로그인이 필요합니다");

      const response = await updateRecipientAddress(token, letterId, addressId, data);
      if (response.success) {
        setAddresses((prev) => prev.map((addr) => (addr._id === addressId ? response.data : addr)));
      }
    },
    [token, letterId]
  );

  const handleDelete = useCallback(
    async (addressId: string) => {
      if (!token) throw new Error("로그인이 필요합니다");

      const response = await deleteRecipientAddress(token, letterId, addressId);
      if (response.success) {
        setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
      }
    },
    [token, letterId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>수신자 주소 관리</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <RecipientAddressList addresses={addresses} onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} isLoading={isLoading} canEdit={canEdit} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
