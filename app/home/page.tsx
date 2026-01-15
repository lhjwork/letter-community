import HeroBanner from "@/components/home/HeroBanner";
import WriteLetterSection from "@/components/home/WriteLetterSection";
import StoryListSection from "@/components/home/StoryListSection";
import FeatureSection from "@/components/home/FeatureSection";
import ContactSection from "@/components/home/ContactSection";
import { getBannerSlides } from "@/lib/banner-utils";
import { getFeaturedStories, type Story } from "@/lib/api";

export default async function HomePage() {
  const bannerSlides = getBannerSlides();

  // Featured Stories 가져오기
  let featuredStories: Story[] = [];
  try {
    const response = await getFeaturedStories();
    console.log("Featured Stories API Response:", response);
    featuredStories = response.data || [];
  } catch (error) {
    console.error("Featured stories 로드 실패:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    // 에러가 발생해도 빈 배열로 계속 진행
    featuredStories = [];
  }

  return (
    <main className="min-h-screen bg-[#FEFEFE]">
      {/* Hero Banner */}
      {bannerSlides.length > 0 && (
        <div className="container mx-auto px-20 py-12">
          <HeroBanner bannerSlides={bannerSlides} />
        </div>
      )}

      {/* Write Letter Section */}
      <WriteLetterSection />

      {/* Story List Section */}
      <StoryListSection stories={featuredStories} />

      {/* Feature Section */}
      <FeatureSection />

      {/* Contact Section */}
      <ContactSection />
    </main>
  );
}
