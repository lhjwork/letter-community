import { z } from "zod";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { proofreadHtml } from "@/lib/ai/proofread";

const RequestSchema = z.object({ content: z.string().max(20000) });

process.env.VERCEL_AI_TELEMETRY_OPT_OUT = "1";

/**
 * 등록 직전 맞춤법 점검. 실패하면 빈 배열을 돌려 등록을 막지 않는다.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "로그인이 필요합니다.", corrections: [] }, { status: 401 });
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ corrections: [], skipped: "no-key" });
  }
  const rateLimit = checkRateLimit(session.user.id);
  if (!rateLimit.allowed) {
    return Response.json({ corrections: [], skipped: "rate-limit" });
  }

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "내용이 올바르지 않습니다.", corrections: [] }, { status: 400 });
  }

  try {
    const corrections = await proofreadHtml(parsed.data.content);
    return Response.json({ corrections });
  } catch (error) {
    console.error("맞춤법 점검 실패:", error);
    return Response.json({ corrections: [], skipped: "error" });
  }
}
