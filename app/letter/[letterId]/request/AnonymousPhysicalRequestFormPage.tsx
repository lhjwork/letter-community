"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnonymousPhysicalRequestForm from "@/components/letter/AnonymousPhysicalRequestForm";
import { Card, CardContent } from "@/components/ui/card";

interface AnonymousPhysicalRequestFormPageProps {
  letterId: string;
}

export default function AnonymousPhysicalRequestFormPage({ letterId }: AnonymousPhysicalRequestFormPageProps) {
  const router = useRouter();
  const [letterTitle, setLetterTitle] = useState<string>("편지");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 편지 정보 조회 (선택사항 - 제목 표시용)
    const fetchLetterInfo = async () => {
      try {
        const response = await fetch(`/api/letters/${letterId}`);
        if (response.ok) {
          const data = await response.json();
          setLetterTitle(data.data?.title || "편지");
        }
      } catch (error) {
        console.error("편지 정보 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLetterInfo();
  }, [letterId]);

  const handleSuccess = (requestId: string) => {
    // 신청 완료 후 상태 조회 페이지로 이동
    router.push(`/letter/${letterId}/request/${requestId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <span className="ml-3 text-gray-600">로딩 중...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AnonymousPhysicalRequestForm letterId={letterId} letterTitle={letterTitle} onSuccess={handleSuccess} onCancel={handleCancel} />;
}
