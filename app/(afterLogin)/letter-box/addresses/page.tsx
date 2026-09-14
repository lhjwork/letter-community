"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Address, AddressInput } from "@/types/address";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress as deleteAddressApi,
  setDefaultAddress,
} from "@/lib/address-api";
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
      setError(
        err instanceof Error
          ? err.message
          : "배송지를 불러오는데 실패했습니다.",
      );
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
      alert(
        err instanceof Error ? err.message : "기본 배송지 설정에 실패했습니다.",
      );
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
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFE]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFD9D0] border-t-[#FF9883] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#757575]">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      <div className="container mx-auto px-4 sm:px-8 lg:px-20 py-8 sm:py-12 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/letter-box"
            className="inline-flex items-center gap-2 text-[#757575] hover:text-[#424242] mb-6 text-base sm:text-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            우편함으로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <h1
              className="text-3xl sm:text-4xl lg:text-[48px] text-[#757575]"
              style={{ fontFamily: "NanumJangMiCe, cursive" }}
            >
              배송지 관리
            </h1>
            <button
              onClick={handleAddAddress}
              className="inline-flex items-center gap-1 h-[48px] sm:h-[56px] px-5 sm:px-6 bg-[#FF7F65] text-white text-base sm:text-xl font-semibold rounded-lg hover:bg-[#ff6b50] transition-colors"
            >
              <Plus className="w-5 h-5" />
              배송지 추가
            </button>
          </div>
        </div>

        {/* 배송지 목록 */}
        <div>
          {error && (
            <div className="bg-[#FFF7F5] border border-[#FF9883] text-[#FF7F65] px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {addresses.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#C4C4C4] rounded-xl">
              <p
                className="text-[#C4C4C4] text-2xl sm:text-3xl mb-6"
                style={{ fontFamily: "NanumJangMiCe, cursive" }}
              >
                저장된 배송지가 없습니다
              </p>
              <button
                onClick={handleAddAddress}
                className="inline-block px-6 py-3 bg-[#FF7F65] text-white text-lg font-semibold rounded-lg hover:bg-[#ff6b50] transition-colors"
              >
                첫 배송지 추가하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 배송지 추가/수정 모달 */}
      <AddressFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        onSubmit={handleSubmit}
        editAddress={editingAddress}
        isLoading={isSubmitting}
      />
    </div>
  );
}
