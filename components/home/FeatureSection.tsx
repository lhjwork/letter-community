import Image from "next/image";

export default function FeatureSection() {
  return (
    <section className="w-full relative overflow-hidden">
      <div className="relative w-full aspect-[3/2] sm:aspect-[1440/480]">
        <Image
          src="/images/sections/main/main-feature-section-img.svg"
          alt="레터를 통해 진심을 공유해보세요"
          fill
          className="object-cover"
          priority={false}
        />
      </div>

      {/* Floating decorative envelopes - CSS only */}
      <span
        className="absolute top-8 left-[10%] text-3xl sm:text-5xl pointer-events-none select-none opacity-30 animate-float-emoji-1"
        aria-hidden="true"
      >
        💌
      </span>
      <span
        className="absolute bottom-8 right-[15%] text-2xl sm:text-4xl pointer-events-none select-none opacity-20 animate-float-emoji-2"
        aria-hidden="true"
      >
        ✉️
      </span>
    </section>
  );
}
