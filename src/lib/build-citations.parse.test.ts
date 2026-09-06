// build-citations.mjs（parseThinkerFile）のパース観点の安全網（Issue #173）。
//
// 既存の src/lib/citations.test.ts は splitWorkSection/extractLeadingWork を直接呼ぶ単体テスト
// と、実データ（thinkers md 全体）の健全性テストしか持たない。本ファイルは
// parseThinkerFile（見出し走査 → 出典行抽出 → id 生成の一連）を、文字列リテラルの
// フィクスチャで検証する。実 thinkers md には一切触れない。
//
// registeredNames は実 work_readings.json の正本著作名+alias（splitWorkSection の
// 読点境界判定に必要な実データ）をそのまま使う。フィクスチャの見出し・出典本文は
// citations.test.ts の既存フィクスチャと異なる組み合わせを選び、内容の重複を避ける。
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractLeadingWork, parseThinkerFile } from "../../scripts/build-citations.mjs";

const READINGS_PATH = path.join(process.cwd(), "docs", "05_philosophy", "work_readings.json");
const readings = JSON.parse(readFileSync(READINGS_PATH, "utf-8")) as {
  works: Record<string, { reading: string; aliases?: string[] }>;
};
const registeredNames = new Set<string>();
for (const [canonical, entry] of Object.entries(readings.works)) {
  registeredNames.add(canonical);
  for (const alias of entry.aliases ?? []) registeredNames.add(alias);
}

describe("parseThinkerFile: 出典行の3表記", () => {
  it("`出典:`／`- 出典:`／`出典：` の3表記は同じ raw を返す", () => {
    const text = `### 見出しコロン
出典: 純粋理性批判

### 見出しハイフン
- 出典: 純粋理性批判

### 見出し全角コロン
出典：純粋理性批判
`;
    const entries = parseThinkerFile(text, "test", registeredNames);
    expect(entries.map((e) => e.raw)).toEqual(["純粋理性批判", "純粋理性批判", "純粋理性批判"]);
  });
});

describe("parseThinkerFile: 1見出しに出典行が2つ", () => {
  it("先頭の出典行だけが採用される（2つ目は無視）", () => {
    const text = `### 二重出典の見出し
出典: 純粋理性批判
出典: エチカ
`;
    const entries = parseThinkerFile(text, "test", registeredNames);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.raw).toBe("純粋理性批判");
  });
});

describe("parseThinkerFile: 見出しレベルの判定（### / #### のみ）", () => {
  it("`##`（2つ）や `#####`（5つ）の見出し直下の出典行は拾わない", () => {
    const text = `## レベル2の見出し
出典: 純粋理性批判

##### レベル5の見出し
出典: エチカ
`;
    const entries = parseThinkerFile(text, "test", registeredNames);
    expect(entries).toEqual([]);
  });
});

describe("parseThinkerFile: 複数著作の出典行", () => {
  it("／区切りは最初の著作だけが work/section になり、残りは also に入る", () => {
    const text = `### 断片A
出典: 分析論前書／分析論後書
`;
    const entries = parseThinkerFile(text, "test", registeredNames);
    expect(entries[0]).toMatchObject({ work: "分析論前書", section: "", also: ["分析論後書"] });
  });

  it("読点区切りは、右側が登録済み著作名のときだけ著作境界とみなす", () => {
    const splitCase = `### 断片B
出典: 戦術論、フィレンツェ史
`;
    const notSplitCase = `### 断片C
出典: 小論理学 §5、§6
`;
    const splitEntries = parseThinkerFile(splitCase, "test", registeredNames);
    const notSplitEntries = parseThinkerFile(notSplitCase, "test", registeredNames);
    expect(splitEntries[0]).toMatchObject({ work: "戦術論", section: "", also: ["フィレンツェ史"] });
    expect(notSplitEntries[0]).toMatchObject({ work: "小論理学", section: "§5、§6", also: [] });
  });
});

describe("parseThinkerFile: id 衝突", () => {
  it("同じ日本語見出しが2つあると生成が失敗する（連番フォールバックしない）", () => {
    const text = `### 同じ見出し
出典: 純粋理性批判

### 同じ見出し
出典: エチカ
`;
    expect(() => parseThinkerFile(text, "test", registeredNames)).toThrow(/衝突/);
  });
});

describe("build-citations.mjs main() の missing 集計相当（readings 未登録の著作が複数）", () => {
  it("未登録の著作名を全件まとめて収集する（1件目で打ち切らない）", () => {
    const text = `### 架空見出しイ
出典: 架空著作イロハ

### 架空見出しニ
出典: 架空著作ニホヘト
`;
    const entries = parseThinkerFile(text, "test", registeredNames);
    // main() の missing 収集ロジック（未登録なら Set へ加える）を同じ形でなぞる。
    const missing = new Set<string>();
    for (const entry of entries) {
      if (!registeredNames.has(entry.work)) missing.add(entry.work);
    }
    expect([...missing].sort()).toEqual(["架空著作イロハ", "架空著作ニホヘト"]);
  });
});

describe("build-citations.mjs main() の自己検査相当（section 先頭の著作名混入）", () => {
  it("section の先頭が登録済み著作名と一致すると自己検査に引っかかる", () => {
    // 「大学 大学問」は space 区切りのため work="大学"（work_readings.json の登録名）で
    // 切られ、section="大学問"（これも登録名）が残る。これは main() の自己検査
    // （section の先頭語が登録著作名なら section 混入とみなす）が検出すべきケース。
    const text = `### 自己検査フィクスチャ
出典: 大学 大学問
`;
    const entries = parseThinkerFile(text, "test", registeredNames);
    expect(entries[0]?.section).toBe("大学問");
    const leadingWork = extractLeadingWork(entries[0]!.section).work;
    expect(registeredNames.has(leadingWork)).toBe(true);
  });
});
