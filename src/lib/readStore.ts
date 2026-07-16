// 完読（読み終わった）読むページの記録ストア（クライアント専用・Issue #30）。
//
// name-name の既読 localStorage は name-name オリジンにあり、theo-hayami（別オリジン）の
// 索引からは読めない。そこで theo-hayami が自前で「完読した slug」を貯める。
// 「開いた＝既読」ではなく「終劇（"to be continued"）まで読み終えた＝既読」（kako-jun 確定）。
//
// slug は `業__住人`（例 `ai__aristo`）＝読むページ（free/[slug]）の URL スラッグ。
// 索引側（各ページの ReadMarks 経由）もこの同じ形式で読むため、appStorage.ts を唯一の保存境界にする。
//
// SSR は無い（output: "static"）が、Astro のビルド時評価や vitest(node 環境)で
// localStorage が存在しない文脈で import されうるため、必ずガードする。

import { getAppStorage, updateAppStorage } from "./appStorage";

/** 既読 slug の集合を返す。localStorage 無し・JSON 破損・非配列は空集合にフォールバック。 */
export function getReadSet(): Set<string> {
  const completedSlugs = getAppStorage().read?.completedSlugs;
  if (!Array.isArray(completedSlugs)) return new Set();
  return new Set(completedSlugs.filter((s): s is string => typeof s === "string"));
}

/** slug が完読済みか。 */
export function isRead(slug: string): boolean {
  return getReadSet().has(slug);
}

/**
 * 完読数と母数から達成率（0〜100の整数%）を返す（Issue #73・既読ゲージの幅計算）。
 * 母数0はゼロ除算を避けて0を返す。副作用なしの純粋関数（ReadMarks.astro から呼ぶ）。
 */
export function readRatioPercent(readCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((readCount / total) * 100);
}

/** slug を完読として記録する（冪等・追加のみ）。localStorage 無し・空 slug は何もしない。 */
export function markRead(slug: string): void {
  if (!slug) return;
  const set = getReadSet();
  if (set.has(slug)) return; // 冪等（既にあれば書き込みも起こさない）
  set.add(slug);
  updateAppStorage((current) => ({
    ...current,
    read: {
      ...current.read,
      completedSlugs: [...set],
    },
  }));
}
