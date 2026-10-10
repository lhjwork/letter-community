import { redirect } from "next/navigation";

/** 예전 사연 쓰기 링크. /write 로 통합됐으므로 쿼리만 옮겨 보낸다 */
export default async function StoryUpdateRedirect({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  redirect(id ? `/write?kind=story&id=${encodeURIComponent(id)}` : "/write?kind=story");
}
