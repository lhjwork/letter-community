// 로컬 백업 유틸리티 (네트워크 오류 시 사용)

interface LocalBackupData {
  title: string;
  content: string;
  type: "friend" | "story";
  category: string;
  timestamp: number;
}

const BACKUP_KEY = "letter_draft_backup";

// 로컬 백업 저장
export function saveLocalBackup(data: Omit<LocalBackupData, "timestamp">) {
  try {
    const backupData: LocalBackupData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
  } catch (error) {
    console.warn("로컬 백업 저장 실패:", error);
  }
}

// 로컬 백업 불러오기
export function loadLocalBackup(): LocalBackupData | null {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (backup) {
      return JSON.parse(backup);
    }
  } catch (error) {
    console.warn("로컬 백업 불러오기 실패:", error);
  }
  return null;
}

// 로컬 백업 삭제
export function clearLocalBackup() {
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch (error) {
    console.warn("로컬 백업 삭제 실패:", error);
  }
}

// 백업이 있는지 확인
export function hasLocalBackup(): boolean {
  try {
    return localStorage.getItem(BACKUP_KEY) !== null;
  } catch (error) {
    return false;
  }
}

// 백업 시간 확인 (분 단위)
export function getBackupAge(): number | null {
  const backup = loadLocalBackup();
  if (backup) {
    return Math.floor((Date.now() - backup.timestamp) / (1000 * 60));
  }
  return null;
}
