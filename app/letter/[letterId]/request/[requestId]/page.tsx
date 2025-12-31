import { Metadata } from "next";
import AnonymousPhysicalStatusTrackerPage from "./AnonymousPhysicalStatusTrackerPage";

export const metadata: Metadata = {
  title: "신청 상태 조회",
  description: "실물 편지 신청 상태를 조회하세요",
};

interface PageProps {
  params: Promise<{
    letterId: string;
    requestId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { letterId, requestId } = await params;

  return <AnonymousPhysicalStatusTrackerPage letterId={letterId} requestId={requestId} />;
}
