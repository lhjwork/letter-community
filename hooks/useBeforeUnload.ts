import { useEffect, useRef } from "react";

interface UseBeforeUnloadProps {
  when: boolean;
  message?: string;
}

export function useBeforeUnload({ when, message = "작성 중인 내용이 있습니다. 정말 나가시겠습니까?" }: UseBeforeUnloadProps) {
  const messageRef = useRef(message);
  const whenRef = useRef(when);

  useEffect(() => {
    messageRef.current = message;
    whenRef.current = when;
  }, [message, when]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (whenRef.current) {
        // 최신 브라우저에서는 사용자 정의 메시지가 무시되고 기본 메시지가 표시됩니다
        event.preventDefault();
        event.returnValue = ""; // 빈 문자열로 설정
        return "";
      }
    };

    // 이벤트 리스너를 조건부로 추가/제거
    if (when) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when]); // when이 변경될 때마다 이벤트 리스너를 다시 설정
}
