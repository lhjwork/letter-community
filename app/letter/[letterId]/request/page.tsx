import { redirect } from "next/navigation";

/** 실물 편지 신청 폼은 편지 상세 안(#request)으로 옮겼다. 예전 링크 보호 */
export default async function Page({ params }: { params: Promise<{ letterId: string }> }) {
  const { letterId } = await params;
  redirect(`/letter/${letterId}#request`);
}
