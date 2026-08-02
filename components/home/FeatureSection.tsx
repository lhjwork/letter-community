"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function FeatureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);

  return (
    <section ref={ref} className="w-full relative overflow-hidden">
      <motion.div
        className="relative w-full aspect-[3/2] sm:aspect-[1440/480]"
        style={{ y, scale, opacity }}
      >
        <Image
          src="/images/sections/main/main-feature-section-img.svg"
          alt="레터를 통해 진심을 공유해보세요"
          fill
          className="object-cover"
          priority={false}
        />
      </motion.div>

      {/* Floating decorative envelopes */}
      <motion.div
        className="absolute top-8 left-[10%] text-3xl sm:text-5xl pointer-events-none select-none opacity-30"
        animate={{
          y: [0, -15, -8, -20, 0],
          rotate: [-5, 3, -2, 4, -5],
        }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      >
        💌
      </motion.div>
      <motion.div
        className="absolute bottom-8 right-[15%] text-2xl sm:text-4xl pointer-events-none select-none opacity-20"
        animate={{
          y: [0, -12, -5, -18, 0],
          rotate: [3, -4, 2, -3, 3],
        }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity, delay: 1 }}
      >
        ✉️
      </motion.div>
    </section>
  );
}
