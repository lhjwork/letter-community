"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Address } from "@/types/address";
import { getAddresses, getRecentAddresses, saveRecentToBook } from "@/lib/address-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";

interface AddressSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (address: Address) => void;
}

type TabType = "book" | "recent";

export default function AddressSelectModal({ open, onOpenChange, onSelect }: AddressSelectModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("book");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [recentAddresses, setRecentAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && session?.backendToken) {
      fetchAddresses();
    }
  }, [open, session?.backendToken]);

  const fetchAddresses = async () => {
    if (!session?.backendToken) return;

    setIsLoading(true);
    setError("");

    try {
      const [bookRes, recentRes] = await Promise.all([getAddresses(session.backendToken), getRecentAddresses(session.backendToken, 20)]);
      setAddresses(bookRes.data || []);
      setRecentAddresses(recentRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "배송지를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToBook = async (address: Address) => {
    if (!session?.backendToken) return;

    const addressName = prompt("주소록에 저장할 배송지명을 입력하세요", address.addressName || "");
    if (addressName === null) return;

    try {
      await saveRecentToBook(session.backendToken, address._id, addressName || undefined);
      alert("주소록에 저장되었습니다.");
      fetchAddresses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  };

  const handleSelect = (address: Address) => {
    onSelect(address);
    onOpenChange(false);
  };

  const currentAddresses = activeTab === "book" ? addresses : recentAddresses;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>배송지 선택</DialogTitle>
        </DialogHeader>

        {/* 탭 */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "book" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("book")}
          >
            배송주소록
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "recent" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("recent")}
          >
            최근배송지
          </button>
        </div>

        {/* 안내 문구 */}
        <p className="text-sm text-gray-500">
          {activeTab === "book" ? "* 배송 주소록은 마이페이지 > 배송주소록 관리에서 수정할 수 있습니다." : "* 최근 사용한 배송지 목록입니다. 주소록에 저장하여 관리할 수 있습니다."}
        </p>

        {/* 주소 목록 */}
        <div className="overflow-y-auto max-h-[400px] space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : currentAddresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{activeTab === "book" ? "저장된 배송지가 없습니다." : "최근 배송지가 없습니다."}</div>
          ) : (
            currentAddresses.map((address) => (
              <div key={address._id} className="border border-gray-200 rounded-lg p-3 hover:border-pink-300 hover:bg-pink-50 cursor-pointer transition-colors" onClick={() => handleSelect(address)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{address.addressName || "배송지"}</span>
                      {address.isDefault && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">기본</span>}
                    </div>
                    <p className="text-sm text-gray-700">
                      {address.recipientName} | {address.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      ({address.zipCode}) {address.address}
                      {address.addressDetail && ` ${address.addressDetail}`}
                    </p>
                  </div>

                  {activeTab === "recent" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveToBook(address);
                      }}
                      title="주소록에 저장"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
