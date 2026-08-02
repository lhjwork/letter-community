"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/animations/config";

interface EnvelopeAnimationProps {
  children: ReactNode;
  onOpen?: () => void;
}

export default function EnvelopeAnimation({
  children,
  onOpen,
}: EnvelopeAnimationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen?.();
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            className="relative cursor-pointer mx-auto"
            style={{ perspective: 800, maxWidth: 420 }}
            onClick={handleOpen}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
          >
            {/* Envelope body */}
            <div
              className="relative rounded-xl overflow-hidden shadow-lg"
              style={{
                background: "linear-gradient(135deg, #FFF5F3 0%, #FFE8E3 100%)",
                border: "2px solid #FFD4CC",
                minHeight: 240,
              }}
            >
              {/* Envelope flap (top triangle) */}
              <motion.div
                className="absolute top-0 left-0 right-0 z-10"
                style={{
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                }}
                initial={{ rotateX: 0 }}
                whileHover={{ rotateX: -15 }}
                transition={springs.gentle}
              >
                <svg
                  viewBox="0 0 420 120"
                  className="w-full"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="0,0 420,0 210,120"
                    fill="#FFEAE5"
                    stroke="#FFD4CC"
                    strokeWidth="2"
                  />
                </svg>
              </motion.div>

              {/* Envelope content area */}
              <div className="pt-20 pb-8 px-8 flex flex-col items-center justify-center min-h-[240px]">
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  💌
                </motion.div>
                <p
                  className="text-[#FF9883] text-lg font-medium"
                  style={{ fontFamily: "'Nanum JangMiCe', cursive" }}
                >
                  편지를 열어보세요
                </p>
                <p className="text-[#C4A69A] text-sm mt-1">탭하여 열기</p>
              </div>

              {/* Decorative wax seal */}
              <motion.div
                className="absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                style={{
                  background: "radial-gradient(circle, #FF9883 0%, #FF7F65 100%)",
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-white text-lg">L</span>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="letter-content"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              ...springs.gentle,
              delay: 0.1,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
