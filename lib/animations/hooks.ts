"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, useAnimation } from "framer-motion";

type AnimationControlsType = ReturnType<typeof useAnimation>;

/**
 * Triggers animation when element scrolls into view
 */
export function useScrollReveal(options?: {
  threshold?: number;
  once?: boolean;
}): { ref: React.RefObject<HTMLDivElement | null>; controls: AnimationControlsType; inView: boolean } {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    amount: options?.threshold ?? 0.2,
    once: options?.once ?? true,
  });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  return { ref, controls, inView };
}

/**
 * Stagger children animation on scroll
 */
export function useStaggerChildren(options?: {
  threshold?: number;
  once?: boolean;
}): { ref: React.RefObject<HTMLDivElement | null>; controls: AnimationControlsType; inView: boolean } {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    amount: options?.threshold ?? 0.1,
    once: options?.once ?? true,
  });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  return { ref, controls, inView };
}

/**
 * Typewriter effect - reveals text character by character
 */
export function useTypewriter(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayedText("");
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isComplete };
}

/**
 * Prefers reduced motion check
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
