"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Address, AddressInput } from "@/types/address";
import { getAddresses, createAddress, updateAddress, deleteAddress as deleteAddressApi, setDefaultAddress } from "@/lib/address-api";
import { Button } from "@/components/ui/button";
import AddressCard from "@/components/address/AddressCard";
import AddressFormModal from "@/components/address/AddressFormModal";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.backendToken) {
      fetchAddresses();
    }
  }, [status, session, router]);

  const fetchAddresses = async () => {
    if (!session?.backendToken) return;

    try {
      setIsLoading(true);
      const response = await getAddresses(session.backendToken);
      setAddresses(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "배송지를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowFormModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowFormModal(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!session?.backendToken) return;
    if (!confirm("정말 이 배송지를 삭제하시겠습니까?")) return;

    try {
      await deleteAddressApi(session.backendToken, id);
      setAddresses(addresses.filter((addr) => addr._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!session?.backendToken) return;

    try {
      await setDefaultAddress(session.backendToken, id);
      fetchAddresses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "기본 배송지 설정에 실패했습니다.");
    }
  };

  const handleSubmit = async (data: AddressInput) => {
    if (!session?.backendToken) return;

    setIsSubmitting(true);
    try {
      if (editingAddress) {
        await updateAddress(session.backendToken, editingAddress._id, data);
      } else {
        await createAddress(session.backendToken, data);
      }
      setShowFormModal(false);
      fetchAddresses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/my-page" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            마이페이지로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "NanumJangMiCe, cursive" }}>
              배송지 관리
            </h1>
            <Button onClick={handleAddAddress} className="bg-pink-500 hover:bg-pink-600">
              <Plus className="w-4 h-4 mr-1" />
              배송지 추가
            </Button>
          </div>
        </div>

        {/* 배송지 목록 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">저장된 배송지가 없습니다.</p>
              <Button onClick={handleAddAddress} className="bg-pink-500 hover:bg-pink-600">
                첫 번째 배송지 추가하기
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <AddressCard key={address._id} address={address} onEdit={handleEditAddress} onDelete={handleDeleteAddress} onSetDefault={handleSetDefault} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 배송지 추가/수정 모달 */}
      <AddressFormModal open={showFormModal} onOpenChange={setShowFormModal} onSubmit={handleSubmit} editAddress={editingAddress} isLoading={isSubmitting} />
    </div>
  );
}
