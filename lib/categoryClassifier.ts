import type { Category } from "./categoryTheme";

/**
 * 키워드 기반 카테고리 분류기
 * AI API 호출 없이 프론트엔드에서 직접 카테고리를 분류합니다.
 */

// 카테고리별 키워드 정의
const categoryKeywords: Record<Category, { primary: string[]; secondary: string[] }> = {
  가족: {
    primary: ["가족", "부모", "엄마", "아빠", "어머니", "아버지", "형제", "자매", "동생", "언니", "오빠", "누나", "할머니", "할아버지", "조부모"],
    secondary: ["집", "가정", "식구", "친척", "고향", "가문", "자식", "아들", "딸", "손주"],
  },
  사랑: {
    primary: ["사랑", "연애", "애인", "남자친구", "여자친구", "남친", "여친", "짝사랑", "이별", "헤어", "고백", "데이트", "연인", "커플"],
    secondary: ["좋아", "설레", "그리워", "보고싶", "만나", "키스", "포옹", "결혼", "약혼", "프러포즈"],
  },
  우정: {
    primary: ["친구", "우정", "베프", "절친", "동료", "동창", "선후배", "학교친구", "직장동료"],
    secondary: ["같이", "함께", "놀", "학교", "동아리", "팀", "모임", "회사", "사이"],
  },
  성장: {
    primary: ["성장", "도전", "극복", "성취", "목표", "꿈", "발전", "노력", "성공", "변화", "개발", "자기계발"],
    secondary: ["이겨", "해냈", "할 수 있", "배웠", "깨달", "시작", "첫", "도전", "시도", "노력"],
  },
  위로: {
    primary: ["위로", "힘들", "아픈", "슬픈", "괴로", "고통", "힐링", "위안", "공감", "응원", "힘내"],
    secondary: ["힘", "걱정", "불안", "우울", "외로", "쓸쓸", "아파", "괜찮", "울", "눈물"],
  },
  추억: {
    primary: ["추억", "그리움", "옛날", "과거", "그때", "회상", "기억", "그립", "생각나", "그시절"],
    secondary: ["예전", "어렸을", "어릴", "학창시절", "젊었을", "지난", "옛", "추억", "회상"],
  },
  감사: {
    primary: ["감사", "고마", "고맙", "감사드", "감사합", "고마워", "고맙습", "사랑합", "존경", "축복"],
    secondary: ["덕분", "은혜", "도움", "배려", "친절", "좋은", "소중", "감사", "행복"],
  },
  기타: {
    primary: [],
    secondary: [],
  },
};

interface ClassificationResult {
  category: Category;
  confidence: number;
  reason: string;
  tags: string[];
}

/**
 * 제목과 내용을 분석하여 카테고리를 분류합니다.
 */
export function classifyCategory(title: string, content: string): ClassificationResult {
  const text = `${title} ${content}`.toLowerCase();

  // 너무 짧은 경우 기본 처리
  if (content.length < 20) {
    return {
      category: "기타",
      confidence: 0.5,
      reason: "내용이 너무 짧아 자동 분류가 어렵습니다",
      tags: [],
    };
  }

  const scores: Record<Category, number> = {
    가족: 0,
    사랑: 0,
    우정: 0,
    성장: 0,
    위로: 0,
    추억: 0,
    감사: 0,
    기타: 0,
  };

  // 각 카테고리별 점수 계산
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    // Primary 키워드 (가중치 3)
    keywords.primary.forEach((keyword) => {
      const regex = new RegExp(keyword, "gi");
      const matches = text.match(regex);
      if (matches) {
        scores[category as Category] += matches.length * 3;
      }
    });

    // Secondary 키워드 (가중치 1)
    keywords.secondary.forEach((keyword) => {
      const regex = new RegExp(keyword, "gi");
      const matches = text.match(regex);
      if (matches) {
        scores[category as Category] += matches.length * 1;
      }
    });
  });

  // 최고 점수 카테고리 찾기
  let maxScore = 0;
  let selectedCategory: Category = "기타";

  Object.entries(scores).forEach(([category, score]) => {
    if (score > maxScore) {
      maxScore = score;
      selectedCategory = category as Category;
    }
  });

  // 신뢰도 계산 (0.3 ~ 0.9 사이)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  let confidence = 0.5;

  if (totalScore > 0) {
    const scoreRatio = maxScore / totalScore;
    confidence = Math.min(0.9, Math.max(0.3, scoreRatio * 0.8 + 0.2));
  }

  // 매칭된 키워드 추출 (태그)
  const tags: string[] = [];
  const categoryKws = categoryKeywords[selectedCategory];

  [...categoryKws.primary, ...categoryKws.secondary].forEach((keyword) => {
    if (text.includes(keyword) && tags.length < 5) {
      tags.push(keyword);
    }
  });

  // 분류 이유 생성
  const reason = generateReason(selectedCategory, confidence, tags);

  return {
    category: selectedCategory,
    confidence: Math.round(confidence * 100) / 100,
    reason,
    tags,
  };
}

/**
 * 카테고리별 분류 이유 생성
 */
function generateReason(category: Category, confidence: number, tags: string[]): string {
  const reasonMap: Record<Category, string> = {
    가족: "가족 관계와 관련된 내용이 감지되었습니다",
    사랑: "연애와 사랑에 관한 내용이 포함되어 있습니다",
    우정: "친구 또는 동료와의 관계에 대한 이야기입니다",
    성장: "성장과 도전에 관한 내용이 주를 이룹니다",
    위로: "위로와 공감이 필요한 내용입니다",
    추억: "과거의 추억과 회상에 관한 이야기입니다",
    감사: "감사와 고마움의 표현이 담겨 있습니다",
    기타: "특정 카테고리로 분류하기 어려운 내용입니다",
  };

  let reason = reasonMap[category];

  if (confidence < 0.5) {
    reason = `${reason} (신뢰도 낮음)`;
  }

  return reason;
}
