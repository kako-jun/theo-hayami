// 栞（種別=しおり）が他の安全網テストの不変条件と衝突しないことの機械照合（Issue #173）。
//
// 観点:
// - scripts.typography.test.ts の本文行判定（行頭 `[` は除外）に しおり テロップ行が
//   引っかからないことを固定する。
// - scripts.seo-wait.test.ts が守る「セオ登場」直前・直後・2行上の待機/背景ディレクティブの
//   並びに、citation_map.json の配置（実際に適用済みの脚本MD）が割り込んでいないことを確認する。
//
// citations.json の id 形式（連番フォールバック禁止・`{resident}-{見出し}` 形式）は
// 既に src/lib/citations.test.ts の describe("citations.json の id（レビュー指摘・#173...")
// が全く同じ2観点をカバーしているため、ここでは重複させない。
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyCitationsToText } from "../../scripts/apply-citations.mjs";

const PHILOSOPHY_DIR = path.join(process.cwd(), "docs", "05_philosophy");
const SCRIPTS_CONTENT_DIR = path.join(process.cwd(), "content", "scripts");

const citationMapRaw = JSON.parse(readFileSync(path.join(PHILOSOPHY_DIR, "citation_map.json"), "utf-8")) as Record<
  string,
  unknown
>;
const citationMap = Object.fromEntries(
  Object.entries(citationMapRaw).filter(([key]) => !key.startsWith("_")),
) as Record<string, { block: number; id: string }[]>;

// apply-citations.mjs の SHIORI_TELOP_RE と同一の判定。
const SHIORI_TELOP_RE = /^\[テロップ:.*種別\s*=\s*しおり.*\]\s*$/;
// scripts.seo-wait.test.ts の SEO_ENTRANCE_PREFIX と同一の判定。
const SEO_ENTRANCE_PREFIX = "[登場: セオ";

describe("しおりテロップ行 と scripts.typography.test.ts の本文行判定", () => {
  it("citation_map.json の配置先ファイルに実在する しおり 行は、本文行判定（行頭 `[` 除外）から漏れなく除外される", () => {
    const files = Object.keys(citationMap);
    expect(files.length).toBeGreaterThan(0); // 偽陰性ガード（配置が0件だと以下は無検証で通ってしまう）

    let shioriLineCount = 0;
    for (const file of files) {
      const text = readFileSync(path.join(SCRIPTS_CONTENT_DIR, file), "utf-8");
      for (const line of text.split("\n")) {
        if (!SHIORI_TELOP_RE.test(line)) continue;
        shioriLineCount += 1;
        // scripts.typography.test.ts の isBodyLine は「行頭が `[`」の行を本文行から除外する。
        // しおり行が本文行判定に混入していないことを、その判定条件そのもので固定する。
        expect(line.startsWith("[")).toBe(true);
      }
    }
    expect(shioriLineCount).toBeGreaterThan(0); // 偽陰性ガード（0件だと上のループが無検証で終わる）
  });
});

describe("しおりテロップ行 と scripts.seo-wait.test.ts のセオ登場間合い", () => {
  it("citation_map.json の全配置は、対象ファイルの `[登場: セオ` 行の直前・直後・2行上に挿入されない", () => {
    const files = Object.keys(citationMap);
    expect(files.length).toBeGreaterThan(0); // 偽陰性ガード

    let seoEntranceCount = 0;
    for (const file of files) {
      const lines = readFileSync(path.join(SCRIPTS_CONTENT_DIR, file), "utf-8").split("\n");
      lines.forEach((line, i) => {
        if (!line.startsWith(SEO_ENTRANCE_PREFIX)) return;
        seoEntranceCount += 1;
        const prev2 = i - 2 >= 0 ? lines[i - 2] : undefined;
        const prev = i - 1 >= 0 ? lines[i - 1] : undefined;
        const next = lines[i + 1];
        expect(prev2 !== undefined && SHIORI_TELOP_RE.test(prev2), `${file}:${i + 1} の2行上`).toBe(false);
        expect(prev !== undefined && SHIORI_TELOP_RE.test(prev), `${file}:${i + 1} の直前`).toBe(false);
        expect(next !== undefined && SHIORI_TELOP_RE.test(next), `${file}:${i + 1} の直後`).toBe(false);
      });
    }
    // このリポの対象ファイルに「セオ登場」自体が1件も無ければ上のチェックは vacuously true になる
    // だけなので、それでよい（citation_map.json の対象ファイルがセオ登場を含まない構成もあり得る）。
    // ただし今回の2ファイル（temperature.md / ohako-kantia.md）はどちらもセオ登場を持つため、
    // ここが0件のままテストが緑になることが無いよう明示的に確認しておく。
    expect(seoEntranceCount).toBeGreaterThan(0);
  });
});

describe("しおりテロップ行 と『セオ開幕』脚本のブロック1配置（Issue #176: 語り始め＝話者行の直前）", () => {
  it("block:1 の配置は content/scripts/current-drafts/adhd.md（セオ開幕の実脚本）でも [登場: セオ の直前・直後・2行上に来ない", () => {
    // adhd.md はブロック1が **セオ** で、その手前に冒頭演出
    // （[背景:]→[待機: 表示完了]→[登場: セオ]→[待機: 表示完了]→空行）が続く実際の脚本。
    // block:1 の栞は「冒頭演出ブロックの後（空行の後・話者行の直前）」に挿さる仕様
    // （scripts/apply-citations.mjs）なので、[登場: セオ の直後行にはならないはず
    // （直後は既存の [待機: 表示完了] のまま）ということをここで実データに対して固定する。
    const before = readFileSync(
      path.join(SCRIPTS_CONTENT_DIR, "current-drafts", "adhd.md"),
      "utf-8",
    );
    const citationsById = new Map([
      [
        "fixture-seo-open",
        { id: "fixture-seo-open", work: "テスト著作", section: "", reading: "てすとちょさく", also: [] },
      ],
    ]);
    const applied = applyCitationsToText(before, [{ block: 1, id: "fixture-seo-open" }], citationsById);
    const lines = applied.split("\n");
    lines.forEach((line, i) => {
      if (!line.startsWith(SEO_ENTRANCE_PREFIX)) return;
      const prev2 = i - 2 >= 0 ? lines[i - 2] : undefined;
      const prev = i - 1 >= 0 ? lines[i - 1] : undefined;
      const next = lines[i + 1];
      expect(prev2 !== undefined && SHIORI_TELOP_RE.test(prev2), "2行上").toBe(false);
      expect(prev !== undefined && SHIORI_TELOP_RE.test(prev), "直前").toBe(false);
      expect(next !== undefined && SHIORI_TELOP_RE.test(next), "直後").toBe(false);
    });
    // しおりが実際に挿入されたことも確認する（挿入されず偽陽性で通る事故のガード）。
    expect(lines.some((l) => SHIORI_TELOP_RE.test(l))).toBe(true);
  });
});
