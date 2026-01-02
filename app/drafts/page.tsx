"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DraftsPage() {
  const router = useRouter();

  useEffect(() => {
    // /drafts 페이지는 이제 /write 페이지에 통합되었으므로 리다이렉트
    router.replace("/write");
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>편지 작성 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
