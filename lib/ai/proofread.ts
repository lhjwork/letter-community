import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { Correction } from "./proofread-types";
import { htmlToText, filterCorrections } from "./proofread-utils";

export type { Correction };
export { applyCorrections } from "./proofread-utils";

const PROMPT = `아래 글의 한국어 맞춤법·띄어쓰기·오타를 점검해주세요.

규칙:
1. 맞춤법, 띄어쓰기, 오타, 깨진 한글 조합("습ㄴ디ㅏ" → "습니다")만 고칩니다.
2. 말투, 문체, 어휘 선택, 내용은 절대 바꾸지 않습니다. 반말/존댓말도 유지합니다.
3. original은 원문에 토씨 하나 안 틀리고 그대로 들어 있는 짧은 구절(한 문장 이내)이어야 합니다.
4. 같은 오류가 여러 번 나오면 각각 따로 적습니다.
5. reason은 10자 안팎으로 짧게 씁니다. 예: "맞춤법", "띄어쓰기", "조합 깨짐"
6. 고칠 곳이 없으면 corrections를 빈 배열로 돌려줍니다.

원문:
{text}
`;

const Schema = z.object({
  corrections: z.array(
    z.object({
      original: z.string().describe("원문에 그대로 존재하는 잘못된 구절"),
      corrected: z.string().describe("고친 구절"),
      reason: z.string().describe("짧은 이유"),
    }),
  ),
});

export async function proofreadHtml(html: string): Promise<Correction[]> {
  const text = htmlToText(html);
  if (text.length < 5) return [];
  const { object } = await generateObject({
    model: google(process.env.PROOFREAD_MODEL || "gemini-3.8-flash"),
    prompt: PROMPT.replace("{text}", text),
    schema: Schema,
  });
  return filterCorrections(html, object.corrections);
}
