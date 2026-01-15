"use client";

import Image from "next/image";

export default function FeatureSection() {
  return (
    <section className="w-full relative overflow-hidden">
      <div className="relative w-full aspect-[1440/480]">
        <Image
          src="/images/sections/main/main-feature-section-img.svg"
          alt="레터를 통해 진심을 공유해보세요"
          fill
          className="object-cover"
          priority={false}
        />
      </div>
    </section>
  );
}
