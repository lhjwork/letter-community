import { adService } from "@/lib/services/adService";
import { AdPlacement } from "@/types/ad";

export const adDebugger = {
  // 특정 광고 상태 확인
  async checkAdStatus(adSlug: string) {
    console.log(`🔍 광고 상태 확인: ${adSlug}`);

    try {
      const debugInfo = await adService.getAdDebugInfo(adSlug);

      if (debugInfo) {
        console.log("광고 기본 정보:", debugInfo.ad);
        console.log(
          "노출 가능 여부:",
          debugInfo.displayStatus.isDisplayable ? "✅" : "❌"
        );

        debugInfo.displayStatus.reasons.forEach((reason) => {
          const status = reason.passed ? "✅" : "❌";
          console.log(`${status} ${reason.check}:`, reason.value);
        });
      } else {
        console.log("❌ 광고를 찾을 수 없습니다");
      }
    } catch (error) {
      console.error("❌ 디버깅 중 에러:", error);
    }
  },

  // 노출 가능한 광고 목록 확인
  async checkDisplayableAds(placement?: string) {
    console.log(
      `🔍 노출 가능한 광고 확인${placement ? ` (${placement})` : ""}`
    );

    try {
      const debugInfo = await adService.getDisplayableAdsDebug(
        placement as AdPlacement
      );

      if (debugInfo) {
        console.log(`전체 광고: ${debugInfo.totalAdsInDB}개`);
        console.log(`활성 광고: ${debugInfo.activeAds}개`);
        console.log(`노출 설정된 광고: ${debugInfo.visibleAds}개`);
        console.log(`노출 가능한 광고: ${debugInfo.displayableAdsCount}개`);

        if (debugInfo.displayableAds.length > 0) {
          console.log("✅ 노출 가능한 광고:");
          debugInfo.displayableAds.forEach((ad) => {
            console.log(
              `  - ${ad.name} (우선순위: ${ad.displayControl.priority})`
            );
          });
        }

        if (debugInfo.filteredOutAds.length > 0) {
          console.log("❌ 필터링된 광고:");
          debugInfo.filteredOutAds.forEach((ad) => {
            console.log(`  - ${ad.name}: ${ad.reason}`);
          });
        }
      }
    } catch (error) {
      console.error("❌ 디버깅 중 에러:", error);
    }
  },
};

// 전역에서 사용 가능하도록 설정 (개발 환경)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as any).adDebugger = adDebugger;
}
