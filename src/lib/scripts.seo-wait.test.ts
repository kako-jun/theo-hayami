import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Issue #43: せお登場直後の間合いを構造として固定する安全網。
// content/scripts/**/*.md を実ファイルとして走査し、`[登場: せお ...]` で始まる行の
// 直後の行が待機ディレクティブ `[待機: N]`（N は正の整数ミリ秒）であることを検証する。
// 狙いは「せお表示 → 少しの間 → 最初の話者（ヴィンチア）登場」の間合いが、将来スクリプトを
// 再生成・編集した時に消える回帰を検出すること。
//
// 設計判断:
// - 待機のミリ秒値（現状 500）はハードコードしない。Issue は「N は本番実機で見て詰める」と
//   しており 500→400 等に変わり得る。ここでは「正の整数の待機ディレクティブが直後に在る」という
//   構造だけを検証し、具体値には依存しない。`[待機: 0]` のような非正（N<=0）は不合格。
// - `[登場: せお` 行を持たないファイル（せお開幕セル等）は自然に検査対象外になる＝意図どおり。

const SCRIPTS_DIR = fileURLToPath(new URL("../../content/scripts/", import.meta.url));

// 待機ディレクティブ: 行頭アンカー・正の整数のミリ秒（具体値には依存しない）。
// name-name のディレクティブは行頭で認識される（scripts.ts の `^\[背景:...\]` 等と同流儀）。
const WAIT_DIRECTIVE = /^\[待機:\s*(\d+)\]\s*$/;
const SEO_ENTRANCE_PREFIX = "[登場: せお";

interface SeoEntrance {
  file: string; // content/scripts/ からの相対パス（失敗メッセージ用）
  line: number; // 1-indexed の `[登場: せお ...]` 行番号
  next: string | undefined; // 直後の行（末尾なら undefined）
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
      hits.push({ file: toRelative(full), line: i + 1, next: lines[i + 1] });
    }
  });
  return hits;
});

describe("Issue #43: せお登場直後の待機ディレクティブ（間合い）", () => {
  it("走査対象の *.md が存在する（glob/パス破損で空集合になる偽陰性のガード）", () => {
    expect(MD_FILES.length).toBeGreaterThan(0);
  });

  it("せお登場行が1件以上見つかる（検査対象が空で全部pass する偽陰性のガード）", () => {
    // ここが 0 だと以降の不変条件テストは vacuously true になり回帰を見逃す。
    expect(SEO_ENTRANCES.length).toBeGreaterThan(0);
  });

  it("`[登場: せお` で始まる各行の直後が待機ディレクティブ `[待機: N]`（N は正の整数）である", () => {
    // 1ファイルに複数のせお登場があっても、収集時に各出現を独立して拾っているため
    // 各々の直後で成立することをここで一括検証する（将来登場が増えても守られる）。
    const violations = SEO_ENTRANCES.flatMap((e) => {
      const next = e.next;
      if (next === undefined) {
        return [`${e.file}:${e.line} 「せお登場」が末尾行で、直後の待機ディレクティブが無い`];
      }
      const m = next.match(WAIT_DIRECTIVE);
      if (!m) {
        return [`${e.file}:${e.line} の直後は [待機: N] であるべきだが "${next}" だった`];
      }
      const ms = Number(m[1]);
      if (!(ms > 0)) {
        return [`${e.file}:${e.line} の直後の待機ミリ秒は正の整数であるべきだが ${ms} だった`];
      }
      return [];
    });
    // 空配列を期待。違反があれば「どのファイルの何行目が違反か」が全件表示される。
    expect(violations).toEqual([]);
  });
});
