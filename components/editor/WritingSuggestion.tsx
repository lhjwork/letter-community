"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Editor } from "@tiptap/react";
import { fetchWritingSuggestion } from "@/lib/ai/writing-assist";

interface WritingSuggestionProps {
  editor: Editor | null;
}

export function WritingSuggestion({ editor }: WritingSuggestionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    setSuggestion(null);
    setVisible(false);
    clearTimers();
  }, [clearTimers]);

  const acceptSuggestion = useCallback(() => {
    if (!editor || !suggestion) return;

    editor.commands.insertContent(suggestion);
    dismiss();
  }, [editor, suggestion, dismiss]);

  // Keyboard handler: Tab to accept, ESC to dismiss
  useEffect(() => {
    if (!suggestion || !visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && suggestion) {
        e.preventDefault();
        acceptSuggestion();
      } else if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      } else {
        // Any other key dismisses the suggestion
        dismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [suggestion, visible, acceptSuggestion, dismiss]);

  // Monitor editor changes and trigger suggestion after 3s inactivity
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Dismiss current suggestion on any edit
      dismiss();

      // Cancel in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      // Set new 3-second debounce timer
      clearTimers();
      timerRef.current = setTimeout(async () => {
        const content = editor.getText();

        // Minimum content check
        if (content.trim().length < 10) return;

        setIsLoading(true);
        abortRef.current = new AbortController();

        try {
          const result = await fetchWritingSuggestion(editor.getHTML());

          if (result.suggestion) {
            setSuggestion(result.suggestion);
            setVisible(true);

            // Auto fade-out after 5 seconds
            fadeTimerRef.current = setTimeout(() => {
              dismiss();
            }, 5000);
          }
        } catch {
          // Silently fail
        } finally {
          setIsLoading(false);
        }
      }, 3000);
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      clearTimers();
    };
  }, [editor, clearTimers, dismiss]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [clearTimers]);

  if (!visible || !suggestion) {
    if (isLoading) {
      return (
        <div className="mt-2 text-sm text-gray-300 italic animate-pulse">
          ✎ ...
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className="mt-2 transition-opacity duration-500 ease-in-out cursor-pointer"
      style={{ opacity: visible ? 0.6 : 0 }}
      onClick={acceptSuggestion}
      title="Tab으로 삽입, ESC로 닫기"
    >
      <span className="text-gray-400 italic text-base">
        ✎ {suggestion}
      </span>
      <span className="ml-2 text-xs text-gray-300">
        Tab ↹
      </span>
    </div>
  );
}
