"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { RecipientAddress, LetterPhysicalStatus } from "@/types/recipient";
import { getRecipientAddresses, getLetterPhysicalStatus } from "@/lib/recipient-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecipientSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letterId: string;
  onSelect?: (recipient: RecipientAddress) => void; // 선택사항으로 변경
  onManualInput: () => void;
}

export default function RecipientSelectModal({ open, onOpenChange, letterId, onSelect, onManualInput }: RecipientSelectModalProps) {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [addresses, setAddresses] = useState<RecipientAddress[]>([]);
  const [physicalStatus, setPhysicalStatus] = useState<LetterPhysicalStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchPhysicalStatus = useCallback(async () => {
    if (!token || !letterId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getLetterPhysicalStatus(token, letterId);
      if (response.success) {
        setPhysicalStatus(response.data);
        setShowStatus(true);
      }
    } catch (error: any) {
      console.error("실물 편지 상태 조회 실패:", error);
      if (error.message?.includes("403") || error.message?.includes("NO_PHYSICAL_REQUESTS")) {
        setError("이 편지에 대한 실물 편지 신청 내역이 없습니다.");
      } else if (error.message?.includes("401")) {
        setError("로그인이 필요합니다.");
      } else {
        setError("상태 조회에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, letterId]);

  useEffect(() => {
    if (open) {
      fetchAddresses();
      setShowStatus(false);
      setPhysicalStatus(null);
      setError(null);
    }
  }, [open, fetchAddresses]);

  const handleSelect = (address: RecipientAddress) => {
    // 기존 주소 선택 시 발송 상태 확인 (주소 정보는 상태 확인용으로만 사용)
    console.log("선택된 주소:", address.name);
    fetchPhysicalStatus();
  };

  const handleManualInput = () => {
    onManualInput();
    onOpenChange(false);
  };

  const handleBackToSelection = () => {
    setShowStatus(false);
    setPhysicalStatus(null);
    setError(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { label: "신청됨", variant: "secondary" as const, color: "text-yellow-600" },
      approved: { label: "승인됨", variant: "default" as const, color: "text-green-600" },
      writing: { label: "작성 중", variant: "outline" as const, color: "text-blue-600" },
      sent: { label: "발송됨", variant: "default" as const, color: "text-purple-600" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const, color: "text-gray-600" };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusMessage = (status: string, sentDate?: string) => {
    switch (status) {
      case "requested":
        return "편지 작성자의 승인을 기다리고 있습니다.";
      case "approved":
        return "승인되었습니다. 편지 작성을 준비 중입니다.";
      case "writing":
        return "편지를 손으로 작성하고 있습니다.";
      case "sent":
        return sentDate ? `편지가 ${new Date(sentDate).toLocaleDateString("ko-KR")}에 발송되었습니다.` : "편지가 발송되었습니다.";
      default:
        return "상태를 확인할 수 없습니다.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{showStatus ? "실물 편지 발송 상태" : "수신자 선택"}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {showStatus ? (
            // 발송 상태 표시 화면
            <div className="space-y-6">
              {error ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-red-600 mb-4">❌</div>
                    <h3 className="font-medium text-red-800 mb-2">상태 조회 실패</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </CardContent>
                </Card>
              ) : physicalStatus ? (
                <>
                  {/* 편지 정보 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📮 {physicalStatus.letterTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">총 신청 수: {physicalStatus.totalUserRequests}개</p>
                        </div>
                        {getStatusBadge(physicalStatus.deliveryStatus.status)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 현재 상태 */}
                  <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        📋 현재 상태
                        {getStatusBadge(physicalStatus.deliveryStatus.status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{getStatusMessage(physicalStatus.deliveryStatus.status, physicalStatus.deliveryStatus.sentDate)}</p>

                      {physicalStatus.deliveryStatus.trackingNumber && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">📦 운송장 번호: {physicalStatus.deliveryStatus.trackingNumber}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 신청 내역 */}
                  {physicalStatus.userRequests.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">📋 신청 내역</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {physicalStatus.userRequests.map((request, index) => (
                            <div key={request.requestId} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">신청 #{index + 1}</span>
                                {getStatusBadge(request.status)}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>📅 신청일: {new Date(request.requestedAt).toLocaleDateString("ko-KR")}</div>
                                {request.approvedAt && <div>✅ 승인일: {new Date(request.approvedAt).toLocaleDateString("ko-KR")}</div>}
                                {request.writingStartedAt && <div>✍️ 작성 시작: {new Date(request.writingStartedAt).toLocaleDateString("ko-KR")}</div>}
                                {request.sentDate && <div>📮 발송일: {new Date(request.sentDate).toLocaleDateString("ko-KR")}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">상태를 조회하고 있습니다...</p>
                </div>
              ) : null}

              {/* 뒤로가기 버튼 */}
              <div className="flex justify-center">
                <Button onClick={handleBackToSelection} variant="outline">
                  ← 수신자 선택으로 돌아가기
                </Button>
              </div>
            </div>
          ) : (
            // 기존 수신자 선택 화면
            <>
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
