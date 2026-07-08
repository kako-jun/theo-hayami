import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Issue #43 / #46: せお登場を「背景 → 待機 → 登場せお → 待機 → 話者」の順に立てる間合いを構造として固定する安全網。
// content/scripts/**/*.md を実ファイルとして走査し、`[登場: せお ...]` で始まる行について
//   - 直前の行が待機ディレクティブ `[待機: N]`（背景フェード待ち・#46）
//   - 直後の行が待機ディレクティブ `[待機: N]`（せお登場フェード待ち・#43）
//   - 直前の直前（2行上）が `[背景:` で始まる（背景→待機→登場せお の並び・#46）
// であることを検証する（N はいずれも正の整数ミリ秒）。
// 狙いは「背景（フェードイン）→ せお（フェードイン）→ 最初の話者（ヴィンチア）」の間合いが、
// 将来スクリプトを再生成・編集した時に消える回帰を検出すること。
//
// なぜ直前にも待機が要るか（#46）:
// - name-name は非同期が既定＝連続ディレクティブは並行フェードで「同時」に見える。
//   逐次（背景を先に立ててからせお）にするため `[待機:]` を挟む。
// - `[待機:]` は実時間待ちであり「フェード完了待ち」ではない。待機値は背景・立ち絵のフェード時間に合わせる。
//
// 設計判断:
// - 待機のミリ秒値（現状 700）はハードコードしない。背景フェードの可変化（既定 700ms）や
//   `character_fade_ms` の変更に追随して値が変わり得るため、ここでは「正の整数の待機ディレクティブが
//   前後に在る」という構造だけを検証し、具体値には依存しない。`[待機: 0]` のような非正（N<=0）は不合格。
// - `[登場: せお` 行を持たないファイル（せお開幕セル等）は自然に検査対象外になる＝意図どおり。

const SCRIPTS_DIR = fileURLToPath(new URL("../../content/scripts/", import.meta.url));

// 待機ディレクティブ: 行頭アンカー・正の整数のミリ秒（具体値には依存しない）。
// name-name のディレクティブは行頭で認識される（scripts.ts の `^\[背景:...\]` 等と同流儀）。
const WAIT_DIRECTIVE = /^\[待機:\s*(\d+)\]\s*$/;
const BACKGROUND_PREFIX = "[背景:";
const SEO_ENTRANCE_PREFIX = "[登場: せお";

interface SeoEntrance {
  file: string; // content/scripts/ からの相対パス（失敗メッセージ用）
  line: number; // 1-indexed の `[登場: せお ...]` 行番号
  prev2: string | undefined; // 2行上の行（`[背景:` を期待。無ければ undefined）
  prev: string | undefined; // 直前の行（`[待機: N]` を期待。無ければ undefined）
  next: string | undefined; // 直後の行（`[待機: N]` を期待。末尾なら undefined）
}

function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function toRelative(full: string): string {
  const marker = "content/scripts/";
  const idx = full.indexOf(marker);
  return idx >= 0 ? full.slice(idx) : full;
}

const MD_FILES = walkMarkdown(SCRIPTS_DIR);

// せお登場行を全ファイルから収集する（1ファイルに複数あれば各々を独立して拾う）。
const SEO_ENTRANCES: SeoEntrance[] = MD_FILES.flatMap((full) => {
  const lines = readFileSync(full, "utf-8").split("\n");
  const hits: SeoEntrance[] = [];
  lines.forEach((ln, i) => {
    if (ln.startsWith(SEO_ENTRANCE_PREFIX)) {
      hits.push({
        file: toRelative(full),
        line: i + 1,
        prev2: i - 2 >= 0 ? lines[i - 2] : undefined,
        prev: i - 1 >= 0 ? lines[i - 1] : undefined,
        next: lines[i + 1],
      });
    }
  });
  return hits;
});

// 待機ディレクティブ（正の整数）かを判定し、違反理由（あれば）を返すヘルパ。
function waitViolation(
  entrance: SeoEntrance,
  target: string | undefined,
  where: "直前" | "直後",
): string | undefined {
  if (target === undefined) {
    return `${entrance.file}:${entrance.line} 「せお登場」の${where}に待機ディレクティブが無い（境界超え/末尾）`;
  }
  const m = target.match(WAIT_DIRECTIVE);
  if (!m) {
    return `${entrance.file}:${entrance.line} の${where}は [待機: N] であるべきだが "${target}" だった`;
  }
  const ms = Number(m[1]);
  if (!(ms > 0)) {
    return `${entrance.file}:${entrance.line} の${where}の待機ミリ秒は正の整数であるべきだが ${ms} だった`;
  }
  return undefined;
}

describe("Issue #43/#46: せお登場の前後の待機ディレクティブ（背景→待機→登場→待機の間合い）", () => {
  it("走査対象の *.md が存在する（glob/パス破損で空集合になる偽陰性のガード）", () => {
    expect(MD_FILES.length).toBeGreaterThan(0);
  });

  it("せお登場行が1件以上見つかる（検査対象が空で全部pass する偽陰性のガード）", () => {
    // ここが 0 だと以降の不変条件テストは vacuously true になり回帰を見逃す。
    expect(SEO_ENTRANCES.length).toBeGreaterThan(0);
  });

  it("`[登場: せお` で始まる各行の直後が待機ディレクティブ `[待機: N]`（N は正の整数）である（#43 せお登場フェード待ち）", () => {
    // 1ファイルに複数のせお登場があっても、収集時に各出現を独立して拾っているため
    // 各々の直後で成立することをここで一括検証する（将来登場が増えても守られる）。
    const violations = SEO_ENTRANCES.flatMap((e) => {
      const v = waitViolation(e, e.next, "直後");
      return v ? [v] : [];
    });
    // 空配列を期待。違反があれば「どのファイルの何行目が違反か」が全件表示される。
    expect(violations).toEqual([]);
  });

  it("`[登場: せお` で始まる各行の直前も待機ディレクティブ `[待機: N]`（N は正の整数）である（#46 背景フェード待ち）", () => {
    const violations = SEO_ENTRANCES.flatMap((e) => {
      const v = waitViolation(e, e.prev, "直前");
      return v ? [v] : [];
    });
    expect(violations).toEqual([]);
  });

  it("`[登場: せお` の2行上が `[背景:` で始まる（背景 → 待機 → 登場せお の並び・#46）", () => {
    const violations = SEO_ENTRANCES.flatMap((e) => {
      if (e.prev2 === undefined) {
        return [`${e.file}:${e.line} 「せお登場」の2行上が無い（境界超え）`];
      }
      if (!e.prev2.startsWith(BACKGROUND_PREFIX)) {
        return [`${e.file}:${e.line} の2行上は [背景: であるべきだが "${e.prev2}" だった`];
      }
      return [];
    });
    expect(violations).toEqual([]);
  });
});
