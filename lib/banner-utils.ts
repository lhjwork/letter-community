import fs from "fs";
import path from "path";

interface BannerSlide {
  id: number;
  image: string;
  alt: string;
}

export function getBannerSlides(): BannerSlide[] {
  const bannerDir = path.join(process.cwd(), "public/images/mainbanner");

  try {
    // mainbanner 폴더가 없으면 빈 배열 반환
    if (!fs.existsSync(bannerDir)) {
      return [];
    }

    // 폴더 내의 모든 파일 읽기
    const files = fs.readdirSync(bannerDir);

    // 이미지 파일만 필터링 (png, jpg, jpeg, gif, webp)
    const imageFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext);
      })
      .sort(); // 파일명 순으로 정렬

    // BannerSlide 배열로 변환
    return imageFiles.map((file, index) => ({
      id: index + 1,
      image: `/images/mainbanner/${file}`,
      alt: `배너 ${index + 1}`,
    }));
  } catch (error) {
    console.error("배너 이미지 로드 실패:", error);
    return [];
  }
}
