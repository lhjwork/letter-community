"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLike } from "@/hooks/useLike";
import LoginDialog from "@/components/shareds/LoginDialog";

interface LikeButtonProps {
  letterId: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  color: string;
}

const PARTICLE_COLORS = ["#FF6B6B", "#FF8E8E", "#FFB4B4", "#FF4757", "#FF6348"];

export default function LikeButton({ letterId, initialLikeCount = 0, initialIsLiked = false, size = "md", showCount = true }: LikeButtonProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [justLiked, setJustLiked] = useState(false);
  const { isLiked, likeCount, isToggling, toggleLike, isLoggedIn } = useLike({
    letterId,
    initialLikeCount,
    initialIsLiked,
  });

  const spawnParticles = useCallback(() => {
    const newParticles: Particle[] = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: 0,
      y: 0,
      angle: (i * 60) + (Math.random() * 30 - 15),
      distance: 20 + Math.random() * 15,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 700);
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setIsLoginDialogOpen(true);
      return;
    }

    if (!isLiked) {
      spawnParticles();
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 400);
    }

    await toggleLike();
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        disabled={isToggling}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        className={`
          relative flex items-center gap-1 transition-colors duration-200
          ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}
          ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${sizeClasses[size]}
        `}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        {/* Heart particles */}
        <AnimatePresence>
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <motion.span
                key={p.id}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0.5],
                  x: Math.cos(rad) * p.distance,
                  y: Math.sin(rad) * p.distance,
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute pointer-events-none text-xs"
                style={{ color: p.color }}
              >
                &#9829;
              </motion.span>
            );
          })}
        </AnimatePresence>

        <motion.svg
          className={`${iconSizes[size]}`}
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={justLiked ? { scale: [1, 1.3, 0.9, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </motion.svg>
        {showCount && (
          <motion.span
            key={likeCount}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {likeCount}
          </motion.span>
        )}
      </motion.button>

      <LoginDialog isOpen={isLoginDialogOpen} onClose={() => setIsLoginDialogOpen(false)} />
    </>
  );
}
