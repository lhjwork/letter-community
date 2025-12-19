import { useEffect, useRef, useState, useCallback } from "react";

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  onIntersect?: () => void;
}

export const useIntersectionObserver = ({ threshold = 0.1, rootMargin = "100px", onIntersect }: UseIntersectionObserverProps = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const handleIntersect = useCallback(() => {
    if (onIntersect) {
      onIntersect();
    }
  }, [onIntersect]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          handleIntersect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, handleIntersect]);

  return { ref, isIntersecting };
};
