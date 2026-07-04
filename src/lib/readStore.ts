// 完読（読み終わった）読むページの記録ストア（クライアント専用・Issue #30）。
//
// name-name の既読 localStorage は name-name オリジンにあり、theo-hayami（別オリジン）の
// 索引からは読めない。そこで theo-hayami が自前で「完読した slug」を貯める。
// 「開いた＝既読」ではなく「終劇（"to be continued"）まで読み終えた＝既読」（kako-jun 確定）。
//
// slug は `業__住人`（例 `ai__aristo`）＝読むページ（free/[slug]）の URL スラッグ。
// 索引側（各ページの ReadMarks 経由）もこの同じキー・同じ形式で読むため、ここを唯一の正本にする。
//
// SSR は無い（output: "static"）が、Astro のビルド時評価や vitest(node 環境)で
// localStorage が存在しない文脈で import されうるため、必ずガードする。

const STORAGE_KEY = "theo-hayami:read";

function hasStorage(): boolean {
  return typeof localStorage !== "undefined";
}

/** 既読 slug の集合を返す。localStorage 無し・JSON 破損・非配列は空集合にフォールバック。 */
export function getReadSet(): Set<string> {
  if (!hasStorage()) return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((s): s is string => typeof s === "string"));
  } catch {
    // 破損（手で書き換えられた・別バージョンの形式等）は空集合として扱い、書き込みで自己修復させる。
    return new Set();
  }
}

/** slug が完読済みか。 */
export function isRead(slug: string): boolean {
  return getReadSet().has(slug);
}

/** slug を完読として記録する（冪等・追加のみ）。localStorage 無し・空 slug は何もしない。 */
export function markRead(slug: string): void {
  if (!hasStorage() || !slug) return;
  const set = getReadSet();
  if (set.has(slug)) return; // 冪等（既にあれば書き込みも起こさない）
  set.add(slug);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // quota 超過等の保存失敗は握りつぶす（既読表示が今回反映されないだけで壊れはしない）。
  }
}
