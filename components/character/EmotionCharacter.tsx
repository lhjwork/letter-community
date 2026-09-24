"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Editor } from "@tiptap/react";
import { detectEmotion, type Emotion } from "@/lib/emotion/lexicon";

/**
 * 글을 쓰는 동안 옆에서 감정에 반응하는 캐릭터.
 *
 * 캐릭터 = public/characters/<id>/<emotion>.webp (애니메이션 WebP, 카카오 이모티콘과 같은 방식)
 * 감정 파일이 없으면 idle.webp, 그것도 없으면 이모지로 fallback.
 * 작가 에셋 추가 = 폴더 하나 + scripts/frames-to-webp.sh. 코드 수정 없음.
 */

const DEBOUNCE_MS = 400;
const REACTION_MS = 2600; // 반응 후 idle 복귀

const LINE: Record<Emotion, string> = {
  joy: "좋은 일이 있었구나!",
  sad: "…옆에 있어줄게.",
  love: "마음이 전해져.",
  angry: "많이 속상했겠다.",
  surprise: "어머, 정말?",
  neutral: "",
};

const EMOJI: Record<Emotion, string> = {
  joy: "😄", sad: "😢", love: "🥰", angry: "😤", surprise: "😮", neutral: "🙂",
};

interface Props {
  editor: Editor | null;
  /** public/characters/<characterId>/ */
  characterId?: string;
}

export function EmotionCharacter({ editor, characterId = "toto" }: Props) {
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  // 없는 감정 파일은 기억해두고 idle로 대체 (매번 404 안 나게)
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!editor) return;

    const onUpdate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const { emotion: next } = detectEmotion(editor.getText());
        if (next === "neutral") return; // 확신 없으면 현재 상태 유지

        setEmotion(next);
        if (resetRef.current) clearTimeout(resetRef.current);
        resetRef.current = setTimeout(() => setEmotion("neutral"), REACTION_MS);
      }, DEBOUNCE_MS);
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (resetRef.current) clearTimeout(resetRef.current);
    };
  }, [editor]);

  const file = emotion === "neutral" ? "idle" : emotion;
  const src = `/characters/${characterId}/${missing.has(file) ? "idle" : file}.webp`;
  const useEmoji = missing.has("idle") && missing.has(file);

  return (
    <div
      className="pointer-events-none absolute right-2 bottom-2 z-20 flex flex-col items-center gap-1"
      aria-hidden
    >
      <AnimatePresence>
        {LINE[emotion] && (
          <motion.div
            key={emotion}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="whitespace-nowrap rounded-2xl bg-white/90 px-3 py-1.5 text-xs text-gray-700 shadow-md backdrop-blur"
          >
            {LINE[emotion]}
          </motion.div>
        )}
      </AnimatePresence>

      {useEmoji ? (
        <span className="select-none text-4xl">{EMOJI[emotion]}</span>
      ) : (
        // key로 감정 바뀔 때 img를 새로 만들어 애니메이션이 첫 프레임부터 재생되게 함
        // eslint-disable-next-line @next/next/no-img-element -- 애니메이션 WebP는 next/image 최적화가 프레임을 날림
        <img
          key={src}
          src={src}
          alt=""
          width={96}
          height={96}
          className="select-none"
          onError={() => setMissing((m) => new Set(m).add(file))}
        />
      )}
    </div>
  );
}
