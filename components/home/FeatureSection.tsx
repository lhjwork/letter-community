import Image from "next/image";

export default function FeatureSection() {
  return (
    <section className="w-full relative overflow-hidden">
      {/* 모바일: 이미지에 구워진 텍스트가 너무 작아지므로 HTML 텍스트로 대체 */}
      <div className="sm:hidden px-4 pt-10 pb-6 text-center">
        <h2 className="text-2xl leading-tight text-[#424242] font-['NanumJangMiCe'] mb-3">
          레터를 통해 진심을 공유해보세요
        </h2>
        <p className="text-base text-[#757575]">
          형식에 얽매이지 않고 자유롭게 소통하며,
          <br />
          서로의 마음을 나눠요
        </p>
      </div>

      {/* 모바일은 일러스트(우측)만 보이도록 크롭, sm 이상은 원본 비율 */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[1200/395]">
        <Image
          src="/images/sections/main/main-feature-section-img.png"
          alt="레터를 통해 진심을 공유해보세요"
          fill
          className="object-cover object-right sm:object-center"
          sizes="100vw"
        />
      </div>

      {/* Floating decorative envelopes - CSS only */}
      <span
        className="hidden sm:block absolute top-8 left-[10%] text-5xl pointer-events-none select-none opacity-30 animate-float-emoji-1"
        aria-hidden="true"
      >
        💌
      </span>
      <span
        className="hidden sm:block absolute bottom-8 right-[15%] text-4xl pointer-events-none select-none opacity-20 animate-float-emoji-2"
        aria-hidden="true"
      >
        ✉️
      </span>
    </section>
  );
}
