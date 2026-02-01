import { useSession } from "next-auth/react";

interface Letter {
  senderId?: string;
  authorId?: string;
  senderUserId?: string;
}

export function useIsAuthor(letter: Letter) {
  const { data: session } = useSession();

  // 백엔드에서 사용하는 다양한 필드명들을 확인
  const letterAuthorId =
    letter.senderId || letter.authorId || letter.senderUserId;
  const currentUserId = session?.user?.id;

  const isAuthor = currentUserId === letterAuthorId;

  // 디버깅용 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    console.log("useIsAuthor - Current user ID:", currentUserId);
    console.log("useIsAuthor - Letter author ID:", letterAuthorId);
    console.log("useIsAuthor - Is author:", isAuthor);
  }

  return {
    isAuthor,
    currentUserId,
    letterAuthorId,
  };
}
