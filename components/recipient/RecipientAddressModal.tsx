"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { RecipientAddress, RecipientAddressInput, RecipientRequest } from "@/types/recipient";
import { getLetterRecipients, getRecipientAddresses, createRecipientAddress, updateRecipientAddress, deleteRecipientAddress } from "@/lib/recipient-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecipientAddressList from "./RecipientAddressList";

interface RecipientAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letterId: string;
  canEdit?: boolean;
  isAuthor?: boolean;
}

export default function RecipientAddressModal({ open, onOpenChange, letterId, canEdit = true, isAuthor = false }: RecipientAddressModalProps) {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [addresses, setAddresses] = useState<RecipientAddress[]>([]);
  const [recipientRequests, setRecipientRequests] = useState<RecipientRequest[]>([]);
  const [letterInfo, setLetterInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"addresses" | "requests">("addresses");

  const fetchData = useCallback(async () => {
    if (!token || !letterId) return;

    try {
      setIsLoading(true);
      setError(null);

      if (isAuthor) {
        // 편지 작성자인 경우 실물 편지 신청자 목록 조회
        try {
          const recipientResponse = await getLetterRecipients(token, letterId);
          if (recipientResponse.success) {
            setRecipientRequests(recipientResponse.data.recipients);
            setLetterInfo({
              title: recipientResponse.data.letterTitle,
              authorName: recipientResponse.data.authorName,
              totalRequests: recipientResponse.data.totalRequests,
            });
            setStats(recipientResponse.data.stats);
            setActiveTab("requests");
          }
        } catch (err: any) {
          if (err.message?.includes("403")) {
            setError("편지 작성자만 수신자 목록을 조회할 수 있습니다.");
          } else if (err.message?.includes("401")) {
            setError("로그인이 필요합니다.");
          } else {
            console.error("수신자 목록 조회 실패:", err);
            // 실물 편지 신청자 목록 조회 실패 시 주소 목록으로 폴백
          }
        }
      }

      // 수신자 주소 목록 조회 (편집 가능한 주소들)
      try {
        const addressResponse = await getRecipientAddresses(token, letterId);
        if (addressResponse.success) {
          setAddresses(addressResponse.data);
        }
      } catch (err) {
        console.error("수신자 주소 목록 조회 실패:", err);
      }
    } catch (error) {
      console.error("데이터 조회 실패:", error);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [token, letterId, isAuthor]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: "신청됨", variant: "secondary" as const },
      approved: { label: "승인됨", variant: "default" as const },
      rejected: { label: "거절됨", variant: "destructive" as const },
      writing: { label: "작성 중", variant: "outline" as const },
      sent: { label: "발송됨", variant: "default" as const },
      delivered: { label: "배송완료", variant: "default" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAuthor ? "수신자 관리" : "수신자 주소 관리"}
            {letterInfo && (
              <div className="text-sm font-normal text-gray-600 mt-1">
                {letterInfo.title} - {letterInfo.authorName}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        {isAuthor && (
          <div className="flex gap-2 border-b">
            <Button variant={activeTab === "requests" ? "default" : "ghost"} onClick={() => setActiveTab("requests")} className="rounded-b-none">
              실물 편지 신청자 ({recipientRequests.length})
            </Button>
            <Button variant={activeTab === "addresses" ? "default" : "ghost"} onClick={() => setActiveTab("addresses")} className="rounded-b-none">
              수신자 주소 관리 ({addresses.length})
            </Button>
          </div>
        )}

        <div className="py-4">
          {isAuthor && activeTab === "requests" && (
            <div className="space-y-6">
              {/* 통계 카드 */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">총 신청</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">대기 중</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">승인됨</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">거절됨</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">완료됨</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* 실물 편지 신청자 목록 */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">로딩 중...</p>
                </div>
              ) : recipientRequests.length > 0 ? (
                <div className="space-y-4">
                  {recipientRequests.map((request) => (
                    <Card key={request.requestId}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{request.name}</h3>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>📞 {request.phone}</div>
                              <div>📍 {request.fullAddress}</div>
                              {request.memo && <div>💬 {request.memo}</div>}
                              <div>📅 신청일: {new Date(request.requestedAt).toLocaleDateString("ko-KR")}</div>
                              <div className="text-xs text-gray-400">세션: {request.sessionId}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">아직 실물 편지 신청이 없습니다.</div>
              )}
            </div>
          )}

          {(!isAuthor || activeTab === "addresses") && (
            <RecipientAddressList addresses={addresses} onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} isLoading={isLoading} canEdit={canEdit} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
