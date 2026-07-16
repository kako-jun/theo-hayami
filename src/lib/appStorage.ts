// theo-hayami の永続クライアント状態をまとめる単一 localStorage 境界。
//
// localStorage のトップキーを増やすと、完読・本編進捗・PWA表示制御の責務が
// ブラウザ保存領域上で散らばる。後方互換は持たない方針なので、正本はこの
// `theo-hayami` 1キーだけにする。

export const APP_STORAGE_KEY = "theo-hayami";

export interface AppStorageState {
  read?: {
    completedSlugs?: string[];
  };
  storyProgress?: unknown;
  pwa?: {
    installDismissed?: boolean;
  };
}

function hasStorage(): boolean {
  return typeof localStorage !== "undefined";
}

export function getAppStorage(): AppStorageState {
  if (!hasStorage()) return {};
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as AppStorageState) : {};
  } catch {
    return {};
  }
}

export function setAppStorage(state: AppStorageState): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota 超過等は握りつぶす。保存が今回効かないだけで読む体験は壊さない。
  }
}

export function updateAppStorage(updater: (current: AppStorageState) => AppStorageState): void {
  setAppStorage(updater(getAppStorage()));
}
