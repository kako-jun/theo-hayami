// apply-citations.mjs（applyCitationsToText）の異常系・冪等の安全網（Issue #173）。
//
// 既存の src/lib/citations.test.ts は「現在のリポの実データ」を対象にした健全性・冪等性
// テストのみを持つ（境界値・重複・欠損 id・空ブロック等の異常系は無い）。本ファイルは
// フィクスチャの文字列リテラルだけで完結させ、実ファイルには一切触れない。
import { describe, expect, it } from "vitest";
import { applyCitationsToText } from "../../scripts/apply-citations.mjs";

interface Citation {
  id: string;
  work: string;
  section: string;
  reading: string;
  also: string[];
}

function citation(id: string, work: string, reading: string, section = ""): Citation {
  return { id, work, section, reading, also: [] };
}

// 話者3ブロックの最小フィクスチャ（apply-citations.mjs の SPEAKER_LINE_RE `^\*\*[^*]+\*\*` に合わせる）。
const THREE_BLOCKS = `---
title: "テスト"
---

**A** (a/normal, 右):
台詞A

**B** (b/normal, 左):
台詞B

**C** (c/normal, 右):
台詞C
`;

const CITATIONS_BY_ID = new Map<string, Citation>([
  ["work-a", citation("work-a", "著作A", "ちょさくえー")],
  ["work-b", citation("work-b", "著作B", "ちょさくびー")],
]);

describe("applyCitationsToText: after_block の範囲外", () => {
  it("after_block=0（下限未満）と maxBlock+1（上限超え）はどちらも throw する", () => {
    expect(() => applyCitationsToText(THREE_BLOCKS, [{ after_block: 0, id: "work-a" }], CITATIONS_BY_ID)).toThrow(
      /範囲外/,
    );
    // THREE_BLOCKS の話者ブロック数は3 → 4は上限超え。
    expect(() => applyCitationsToText(THREE_BLOCKS, [{ after_block: 4, id: "work-a" }], CITATIONS_BY_ID)).toThrow(
      /範囲外/,
    );
  });
});

describe("applyCitationsToText: 配置の異常", () => {
  it("同一ファイルで同じ after_block が2件あると重複 throw する", () => {
    const placements = [
      { after_block: 1, id: "work-a" },
      { after_block: 1, id: "work-b" },
    ];
    expect(() => applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID)).toThrow(/重複/);
  });

  it("配置 id が citationsById に無いと throw する", () => {
    const placements = [{ after_block: 1, id: "no-such-id" }];
    expect(() => applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID)).toThrow(
      /citations\.json に id が見つかりません/,
    );
  });

  it("話者ブロックが0のテキスト（frontmatterのみ）への配置は throw する", () => {
    const frontmatterOnly = `---
title: "空の脚本"
---
`;
    const placements = [{ after_block: 1, id: "work-a" }];
    expect(() => applyCitationsToText(frontmatterOnly, placements, CITATIONS_BY_ID)).toThrow(/範囲外/);
  });
});

describe("applyCitationsToText: 手編集で崩れた しおり 行の正規化（冪等）", () => {
  it("重複・別位置にある崩れた しおり 行が1回の適用で正規化される", () => {
    // ブロックB(2番目)の後ろに正しくない位置の しおり 行が2つ紛れ込んでいる想定
    // （手編集や過去の生成物の残骸）。台帳どおり block1 の直後にだけ再挿入されるべき。
    const messy = `---
title: "テスト"
---

**A** (a/normal, 右):
台詞A
[テロップ: 『迷子の出典（まいごのしゅってん）』, 種別=しおり]

**B** (b/normal, 左):
台詞B
[テロップ: 『別の迷子（べつのまいご）』, 種別=しおり]

**C** (c/normal, 右):
台詞C
`;
    const placements = [{ after_block: 1, id: "work-a" }];
    const once = applyCitationsToText(messy, placements, CITATIONS_BY_ID);
    const twice = applyCitationsToText(once, placements, CITATIONS_BY_ID);
    expect(twice).toBe(once); // 冪等
    const shioriLines = once.split("\n").filter((l) => /種別\s*=\s*しおり/.test(l));
    expect(shioriLines).toEqual(["[テロップ: 『著作A（ちょさくえー）』, 種別=しおり]"]);
  });

  it("他引数付き・空白ゆれの しおり 行も同一視して除去する（正規表現の同値分割）", () => {
    const withOtherArgs = `---
title: "テスト"
---

**A** (a/normal, 右):
台詞A
[テロップ: 何か, 位置=右上, 秒=6, 種別=しおり]

**B** (b/normal, 左):
台詞B
[テロップ:  ゆれた表記  ,  種別 = しおり ]

**C** (c/normal, 右):
台詞C
`;
    const placements = [{ after_block: 2, id: "work-b" }];
    const applied = applyCitationsToText(withOtherArgs, placements, CITATIONS_BY_ID);
    const shioriLines = applied.split("\n").filter((l) => /種別\s*=\s*しおり/.test(l));
    expect(shioriLines).toEqual(["[テロップ: 『著作B（ちょさくびー）』, 種別=しおり]"]);
  });
});

describe("applyCitationsToText: 1ファイル2箇所配置", () => {
  it("出力順は placements（after_block 昇順）の順になる", () => {
    const placements = [
      { after_block: 1, id: "work-a" },
      { after_block: 3, id: "work-b" },
    ];
    const applied = applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID);
    const idxA = applied.indexOf("著作A");
    const idxB = applied.indexOf("著作B");
    expect(idxA).toBeGreaterThan(-1);
    expect(idxB).toBeGreaterThan(-1);
    expect(idxA).toBeLessThan(idxB);
  });
});

describe("applyCitationsToText: --check 相当（差分の有無で適用可否を判定する仕組み）", () => {
  it("適用済みテキストへ同じ台帳を再適用しても差分が出ない（--check が『一致』と判定するケース）", () => {
    const placements = [{ after_block: 2, id: "work-a" }];
    const applied = applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID);
    const reapplied = applyCitationsToText(applied, placements, CITATIONS_BY_ID);
    expect(reapplied).toBe(applied);
  });

  it("未適用のテキストに台帳を適用すると差分が出る（--check が『不一致』と判定するケース）", () => {
    const placements = [{ after_block: 2, id: "work-a" }];
    const applied = applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID);
    expect(applied).not.toBe(THREE_BLOCKS);
  });
});
