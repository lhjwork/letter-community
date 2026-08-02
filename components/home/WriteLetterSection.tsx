"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/lib/animations/hooks";
import { fadeInUp, staggerContainer, buttonPop } from "@/lib/animations/config";

export default function WriteLetterSection() {
  const { ref, controls } = useScrollReveal();

  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4 sm:px-8 lg:px-20">
        {/* Title - scroll reveal */}
        <motion.div
          ref={ref}
          className="text-center mb-8 sm:mb-16"
          variants={fadeInUp}
          initial="hidden"
          animate={controls}
        >
          <h2 className="text-2xl sm:text-4xl lg:text-[52px] leading-tight sm:leading-[60px] text-[#424242] font-['NanumJangMiCe'] mb-2 sm:mb-4">전하고 싶은 말을 편지에 담아보세요</h2>
          <p className="text-base sm:text-xl lg:text-2xl text-[#757575]">특별한 순간의 하루를 기록하는 편지</p>
        </motion.div>

        {/* Letter preview card - with hover tilt */}
        <motion.div
          className="relative max-w-[920px] mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          {/* Highlight box */}
          <motion.div
            className="absolute -top-5 sm:-top-7 left-1/2 -translate-x-1/2 w-[160px] sm:w-[240px] h-10 sm:h-14 bg-[#FF7F65] opacity-60 rounded"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          />

          {/* Main card */}
          <motion.div
            className="relative bg-[#FEFEFE] border border-[#C4C4C4] rounded-xl p-6 sm:p-12 shadow-[12px_12px_40px_rgba(0,0,0,0.12)] overflow-hidden min-h-[280px] sm:min-h-0"
            whileHover={{
              scale: 1.01,
              rotateY: 1,
              boxShadow: "16px 16px 50px rgba(0,0,0,0.16)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Holes - hidden on mobile */}
            <div className="hidden sm:flex absolute left-[18px] top-[50px] flex-col gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-[#FEFEFE] border border-[#75757533] shadow-inner" />
              ))}
            </div>

            {/* Vertical line - hidden on mobile */}
            <div className="hidden sm:block absolute left-[30px] top-[38px] bottom-[38px] w-px bg-[#FF9F99]" />

            {/* Horizontal lines */}
            <div className="space-y-8 sm:space-y-12">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-px bg-[#EDEDED]"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.05, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              ))}
            </div>

            {/* To. label */}
            <motion.div
              className="absolute top-[40px] sm:top-[64px] left-[24px] sm:left-[72px]"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="relative inline-block">
                <div className="absolute -left-2 -top-1 w-[42px] sm:w-[52px] h-7 sm:h-8 bg-[#FF7F65] border-[10px] sm:border-[12px] border-[#FF7F65]" />
                <span className="relative text-lg sm:text-2xl font-semibold text-[#FEFEFE]">To.</span>
              </div>
            </motion.div>

            {/* Recipient */}
            <motion.div
              className="absolute top-[40px] sm:top-[64px] left-[80px] sm:left-[138px]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <span className="text-base sm:text-2xl font-semibold text-[#424242]">보내고 싶은 누군가</span>
            </motion.div>

            {/* Date */}
            <motion.div
              className="absolute top-[44px] sm:top-[68px] right-6 sm:right-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <span className="text-sm sm:text-lg text-[#424242]">20xx.xx.xx</span>
            </motion.div>

            {/* Content */}
            <motion.div
              className="absolute top-[100px] sm:top-[160px] left-[24px] sm:left-[72px]"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <div className="relative">
                <div className="absolute -left-3 -top-1 w-2 h-8 sm:h-10 bg-[#424242]" />
                <span className="text-base sm:text-2xl font-semibold text-[#424242]">오늘 정말 기분 좋은일이</span>
              </div>
            </motion.div>

            {/* Signature */}
            <motion.div
              className="absolute bottom-[40px] sm:bottom-[68px] right-6 sm:right-12 flex items-center gap-2 sm:gap-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <div className="w-5 h-4 sm:w-7 sm:h-6">
                <svg viewBox="0 0 28 24" fill="none">
                  <path d="M2 0H26C27.1 0 28 0.9 28 2V22C28 23.1 27.1 24 26 24H2C0.9 24 0 23.1 0 22V2C0 0.9 0.9 0 2 0Z" fill="#FF7F65" />
                  <path d="M2 2L14 13L26 2" stroke="black" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <span className="text-base sm:text-xl font-medium text-[#424242]">레터 이용자</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Buttons - stagger entrance */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-8 sm:mt-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div variants={buttonPop}>
            <Link href="/write?type=story" className="block px-6 py-3 sm:py-4 bg-[#FF7F65] text-[#F9F9F9] text-lg sm:text-2xl font-semibold rounded hover:bg-[#FF6B50] transition-colors text-center">
              사연 신청하기
            </Link>
          </motion.div>
          <motion.div variants={buttonPop}>
            <Link href="/stories" className="block px-6 py-3 sm:py-4 border-2 border-[#FF7F65] text-[#FF7F65] text-lg sm:text-2xl font-semibold rounded hover:bg-[#FFF5F3] transition-colors text-center">
              사연 보러가기
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
