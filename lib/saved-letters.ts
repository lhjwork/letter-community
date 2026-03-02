/**
 * 편지 보관하기 유틸리티
 * 다른 사람의 편지를 보관함에 저장하는 기능 (localStorage 기반)
 */

const SAVED_LETTERS_KEY = "saved_letters";

export interface SavedLetter {
  letterId: string;
  title: string;
  contentPreview: string;
  savedAt: string;
}

/**
 * 편지를 보관함에 저장
 */
export function saveLetter(letter: Omit<SavedLetter, "savedAt">): void {
  try {
    const saved = getSavedLetters();

    // 이미 보관된 편지인지 확인
    if (saved.some((s) => s.letterId === letter.letterId)) {
      return;
    }

    const newEntry: SavedLetter = {
      ...letter,
      savedAt: new Date().toISOString(),
    };

    saved.unshift(newEntry);
    localStorage.setItem(SAVED_LETTERS_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error("편지 보관 실패:", error);
  }
}

/**
 * 보관된 편지 목록 조회
 */
export function getSavedLetters(): SavedLetter[] {
  try {
    const data = localStorage.getItem(SAVED_LETTERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("보관 편지 목록 조회 실패:", error);
  }
  return [];
}

/**
 * 특정 편지가 보관되어 있는지 확인
 */
export function isLetterSaved(letterId: string): boolean {
  try {
    const saved = getSavedLetters();
    return saved.some((s) => s.letterId === letterId);
  } catch (error) {
    console.error("보관 여부 확인 실패:", error);
    return false;
  }
}

/**
 * 보관된 편지 삭제
 */
export function removeSavedLetter(letterId: string): void {
  try {
    const saved = getSavedLetters();
    const filtered = saved.filter((s) => s.letterId !== letterId);
    localStorage.setItem(SAVED_LETTERS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("보관 편지 삭제 실패:", error);
  }
}

/**
 * 보관 토글 (저장/삭제)
 */
export function toggleSaveLetter(
  letter: Omit<SavedLetter, "savedAt">,
): boolean {
  if (isLetterSaved(letter.letterId)) {
    removeSavedLetter(letter.letterId);
    return false; // 보관 해제됨
  } else {
    saveLetter(letter);
    return true; // 보관됨
  }
}
