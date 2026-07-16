// PWA インストール促しバナーの判定・記憶ロジック（Issue #67）。
//
// mypace（repos/2025/mypace/apps/web/src/hooks/ui/usePWAInstall.ts）と同じ流れ:
// `beforeinstallprompt` を preventDefault() で捕まえて独自バナーを出し、却下（明示の
// 閉じるボタン、または `prompt()` 後の userChoice が "dismissed"）は記憶して再表示しない。
// mypace は7日で却下記憶が失効するが、本Issueの完了条件は「却下後は再表示されない」＝
// 失効させない恒久記憶なので、期限は持たせない（読み書きは appStorage.ts に集約）。
//
// 判定（shouldShowInstallPrompt）は DOM/ブラウザAPIに依存しない純粋関数にして、
// vitest（environment: "node"）から直接テストできるようにする（dev-doctrine: 索引・判定
// ロジックは純粋関数に切り出す・pwa-update.ts と同じ方針）。localStorage の読み書きは
// 別関数に分離し、PwaInstallBanner.astro の <script> 側から呼び出す。

import { getAppStorage, updateAppStorage } from "./appStorage";

/** バナーを却下済みか。localStorage 無し・未記録は false（＝却下していない扱い）。 */
export function getInstallDismissed(): boolean {
  return getAppStorage().pwa?.installDismissed === true;
}

/** 却下を恒久的に記憶する。localStorage 無し・quota超過等の失敗は握りつぶす。 */
export function setInstallDismissed(): void {
  updateAppStorage((current) => ({
    ...current,
    pwa: {
      ...current.pwa,
      installDismissed: true,
    },
  }));
}

/**
 * インストール促しバナーを表示すべきかどうかを判定する純粋関数。
 *
 * - canInstall: `beforeinstallprompt` を捕まえ、まだ消費（prompt済み/appinstalled）していないか
 * - isStandalone: 既にインストール済み（`display-mode: standalone` またはiOSの`navigator.standalone`）か
 * - isDismissed: 過去に却下済みか（getInstallDismissed の結果）
 */
export function shouldShowInstallPrompt(canInstall: boolean, isStandalone: boolean, isDismissed: boolean): boolean {
  return canInstall && !isStandalone && !isDismissed;
}
