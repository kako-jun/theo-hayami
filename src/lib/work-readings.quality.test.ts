// docs/05_philosophy/work_readings.json（読み仮名の正本）のデータ品質の安全網（Issue #173）。
//
// 既存の src/lib/citations.test.ts は「citations.json の work が work_readings.json の
// canonical キーと一致する」ことしか見ておらず、work_readings.json 自体の値の形（読みが
// 平仮名か、aliases が重複していないか）は検証していない。
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const READINGS_PATH = path.join(process.cwd(), "docs", "05_philosophy", "work_readings.json");
const readings = JSON.parse(readFileSync(READINGS_PATH, "utf-8")) as {
  works: Record<string, { reading: string; link?: string; aliases?: string[] }>;
};

// 平仮名（U+3041-U+309F）＋長音記号ー（U+30FC）＋中黒・（U+30FB）のみ許可。
const HIRAGANA_ONLY_RE = /^[ぁ-ゟ・ー]+$/;

describe("work_readings.json: 読みの表記", () => {
  it("全 reading が平仮名（＋長音・中黒）のみで構成されている", () => {
    const bad = Object.entries(readings.works)
      .filter(([, entry]) => !HIRAGANA_ONLY_RE.test(entry.reading))
      .map(([canonical, entry]) => `${canonical}: "${entry.reading}"`);
    expect(bad).toEqual([]);
  });
});

describe("work_readings.json: aliases の一意性", () => {
  it("aliases の値が全著作を通して重複しない", () => {
    const seen = new Map<string, string>(); // alias -> 最初に見つかった canonical
    const duplicates: string[] = [];
    for (const [canonical, entry] of Object.entries(readings.works)) {
      for (const alias of entry.aliases ?? []) {
        const owner = seen.get(alias);
        if (owner) {
          duplicates.push(`"${alias}"（${owner} と ${canonical} の両方に登録）`);
        } else {
          seen.set(alias, canonical);
        }
      }
    }
    expect(duplicates).toEqual([]);
  });

  it("alias が他の著作の canonical キーと衝突しない", () => {
    const canonicalKeys = new Set(Object.keys(readings.works));
    const collisions: string[] = [];
    for (const [canonical, entry] of Object.entries(readings.works)) {
      for (const alias of entry.aliases ?? []) {
        if (alias !== canonical && canonicalKeys.has(alias)) {
          collisions.push(`"${alias}"（${canonical} の alias が別著作の canonical キーと同名）`);
        }
      }
    }
    expect(collisions).toEqual([]);
  });
});

// 栞リストの著作記事リンク（Issue #178）。日本語版 Wikipedia の記事に実在確認済みのものだけを
// 持たせる（記事が無い・別項目にしか無い著作は link を持たせずリンク無し表示）。
describe("work_readings.json: link（Issue #178・日本語版 Wikipedia の著作記事）", () => {
  const WIKIPEDIA_JA_PREFIX = "https://ja.wikipedia.org/wiki/";

  it("全 link が https://ja.wikipedia.org/wiki/ 始まり", () => {
    const bad = Object.entries(readings.works)
      .filter(([, entry]) => entry.link !== undefined && !entry.link.startsWith(WIKIPEDIA_JA_PREFIX))
      .map(([canonical, entry]) => `${canonical}: "${entry.link}"`);
    expect(bad).toEqual([]);
  });

  it("link を持つ著作が1件以上ある（Issue #178 実装の存在確認）", () => {
    const withLink = Object.entries(readings.works).filter(([, entry]) => entry.link !== undefined);
    expect(withLink.length).toBeGreaterThan(0);
  });

  it("aliases はただの文字列配列であり、alias 自身が独立した link を持つことはできない（canonical 経由のみ）", () => {
    // work_readings.json の構造上、aliases は string[] であって { reading, link } のような
    // オブジェクトではない。canonical キーの entry.link だけが唯一の正本であることを、
    // 構造そのもの（各 entry.aliases が文字列だけの配列である）で確認する。
    const bad: string[] = [];
    for (const [canonical, entry] of Object.entries(readings.works)) {
      for (const alias of entry.aliases ?? []) {
        if (typeof alias !== "string") bad.push(`${canonical}: alias が文字列でない (${JSON.stringify(alias)})`);
      }
    }
    expect(bad).toEqual([]);
  });
});
