"use client";

import { motion } from "framer-motion";
import { useScrollReveal } from "@/lib/animations/hooks";
import { fadeInUp, scaleUp } from "@/lib/animations/config";

export default function ContactSection() {
  const { ref, controls } = useScrollReveal();

  return (
    <section className="w-full py-12 sm:py-24 border-t border-[#C4C4C4]">
      <div className="container mx-auto px-4 sm:px-8 lg:px-20">
        <motion.div
          ref={ref}
          className="text-center"
          variants={fadeInUp}
          initial="hidden"
          animate={controls}
        >
          <h2 className="text-2xl sm:text-4xl lg:text-[52px] leading-tight sm:leading-[60px] text-[#424242] font-['NanumJangMiCe'] mb-6 sm:mb-12">
            도움이 필요하다면 언제든 연락주세요
          </h2>
          <motion.button
            className="px-6 py-3 sm:py-4 bg-[#FF7F65] text-[#F9F9F9] text-lg sm:text-2xl font-semibold rounded hover:bg-[#FF6B50] transition-colors"
            variants={scaleUp}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(255, 127, 101, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            서비스 문의하기
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
