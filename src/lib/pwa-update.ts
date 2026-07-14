// PWA 更新検知の cooldown 判定（Issue #59）。
//
// registerSW の onNeedRefresh は稀に短時間で連続発火しうる（例: skipWaiting 後の再登録で
// もう一度 onNeedRefresh が呼ばれる等）。reload → onNeedRefresh → reload … のループを防ぐため、
// 「直近の更新から一定時間内なら今回はスキップする」という cooldown を設ける（mypace と同じ方式）。
//
// cooldown の判定そのもの（shouldSkipUpdate）は Date.now() / sessionStorage I/O を含まない
// 純粋関数にして、vitest（environment: "node"）から直接テストできるようにする
// （dev-doctrine: 索引・判定ロジックは純粋関数に切り出す）。sessionStorage の読み書きは
// 別関数に分離し、LibraryLayout.astro の <script> 側から呼び出す。

/** reload loop 防止の cooldown 窓（ミリ秒）。mypace と同じ 10 秒。 */
export const PWA_UPDATE_COOLDOWN_MS = 10_000;

const STORAGE_KEY = "theo-hayami:pwa-update-at";

/**
 * 直近の更新記録時刻（lastUpdateAt）から見て、今回（now）の onNeedRefresh を
 * スキップすべきかどうかを判定する純粋関数。
 *
 * - lastUpdateAt が null（未記録＝初回）なら false（スキップしない＝必ず反映する）。
 * - now - lastUpdateAt が cooldownMs 未満なら true（直近に更新済みなので今回は無視）。
 */
export function shouldSkipUpdate(lastUpdateAt: number | null, now: number, cooldownMs: number): boolean {
  if (lastUpdateAt === null) return false;
  return now - lastUpdateAt < cooldownMs;
}

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== "undefined";
}

/** 直近の更新記録時刻を sessionStorage から読む。未記録・破損・非対応環境は null。 */
export function getLastUpdateAt(): number | null {
  if (!hasSessionStorage()) return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/** 更新記録時刻を sessionStorage に書く。quota超過等の失敗は握りつぶす（cooldownが効かないだけで壊れない）。 */
export function recordUpdateAt(now: number): void {
  if (!hasSessionStorage()) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, String(now));
  } catch {
    // 握りつぶす。
  }
}
