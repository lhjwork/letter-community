import { Metadata } from "next";
import AnonymousPhysicalRequestFormPage from "./AnonymousPhysicalRequestFormPage";

export const metadata: Metadata = {
  title: "실물 편지 신청",
  description: "실물 편지를 신청하세요",
};

interface PageProps {
  params: Promise<{
    letterId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { letterId } = await params;

  return <AnonymousPhysicalRequestFormPage letterId={letterId} />;
}
