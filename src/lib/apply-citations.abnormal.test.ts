// apply-citations.mjs（applyCitationsToText）の異常系・冪等の安全網（Issue #173, #176）。
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

describe("applyCitationsToText: block の範囲外", () => {
  it("block=0（下限未満）と maxBlock+1（上限超え）はどちらも throw する", () => {
    expect(() => applyCitationsToText(THREE_BLOCKS, [{ block: 0, id: "work-a" }], CITATIONS_BY_ID)).toThrow(
      /範囲外/,
    );
    // THREE_BLOCKS の話者ブロック数は3 → 4は上限超え。
    expect(() => applyCitationsToText(THREE_BLOCKS, [{ block: 4, id: "work-a" }], CITATIONS_BY_ID)).toThrow(
      /範囲外/,
    );
  });
});

describe("applyCitationsToText: 配置の異常", () => {
  it("同一ファイルで同じ block が2件あると重複 throw する", () => {
    const placements = [
      { block: 1, id: "work-a" },
      { block: 1, id: "work-b" },
    ];
    expect(() => applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID)).toThrow(/重複/);
  });

  it("配置 id が citationsById に無いと throw する", () => {
    const placements = [{ block: 1, id: "no-such-id" }];
    expect(() => applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID)).toThrow(
      /citations\.json に id が見つかりません/,
    );
  });

  it("話者ブロックが0のテキスト（frontmatterのみ）への配置は throw する", () => {
    const frontmatterOnly = `---
title: "空の脚本"
---
`;
    const placements = [{ block: 1, id: "work-a" }];
    expect(() => applyCitationsToText(frontmatterOnly, placements, CITATIONS_BY_ID)).toThrow(/範囲外/);
  });
});

describe("applyCitationsToText: 手編集で崩れた しおり 行の正規化（冪等）", () => {
  it("重複・別位置にある崩れた しおり 行が1回の適用で正規化される", () => {
    // ブロックB(2番目)の後ろに正しくない位置の しおり 行が2つ紛れ込んでいる想定
    // （手編集や過去の生成物の残骸）。台帳どおり block1（**A**）の話者行の直前にだけ再挿入されるべき。
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
    const placements = [{ block: 1, id: "work-a" }];
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
    const placements = [{ block: 2, id: "work-b" }];
    const applied = applyCitationsToText(withOtherArgs, placements, CITATIONS_BY_ID);
    const shioriLines = applied.split("\n").filter((l) => /種別\s*=\s*しおり/.test(l));
    expect(shioriLines).toEqual(["[テロップ: 『著作B（ちょさくびー）』, 種別=しおり]"]);
  });
});

describe("applyCitationsToText: 1ファイル2箇所配置", () => {
  it("出力順は placements（block 昇順）の順になる", () => {
    const placements = [
      { block: 1, id: "work-a" },
      { block: 3, id: "work-b" },
    ];
    const applied = applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID);
    const idxA = applied.indexOf("著作A");
    const idxB = applied.indexOf("著作B");
    expect(idxA).toBeGreaterThan(-1);
    expect(idxB).toBeGreaterThan(-1);
    expect(idxA).toBeLessThan(idxB);
  });
});

describe("applyCitationsToText: 本文行0行の話者ブロック（レビュー指摘N7・Issue #176で仕様変更）", () => {
  it("話者行の直後が[で始まる（本文行0行）場合でも、しおりは常に話者行の直前に挿入される（本文行数に関係ない）", () => {
    // Bブロックは本文行を持たず、話者行の直後がいきなり[選択]ディレクティブ。
    // Issue #176: 挿入位置は「話者ブロックの語り始め＝話者行の直前」に一本化されたため、
    // 本文行が0行かどうかによる場合分けが不要になった（旧仕様は本文行0行のときだけ
    // 話者行の直後に挿していたが、新仕様では常に話者行の直前）。
    const noBody = `---
title: "テスト"
---

**A** (a/normal, 右):
台詞A

**B** (b/normal, 左):
[選択]
- 選択肢1 → x
- 選択肢2 → y

**C** (c/normal, 右):
台詞C
`;
    const placements = [{ block: 2, id: "work-b" }];
    const applied = applyCitationsToText(noBody, placements, CITATIONS_BY_ID);
    const lines = applied.split("\n");
    const speakerBIndex = lines.findIndex((l) => l.startsWith("**B**"));
    // しおりは話者行の直前（-1行目）に来る。
    expect(lines[speakerBIndex - 1]).toBe("[テロップ: 『著作B（ちょさくびー）』, 種別=しおり]");
    // 本文行が無い元の構造（話者行の直後がいきなり [選択]）はそのまま保たれる。
    expect(lines[speakerBIndex + 1]).toBe("[選択]");
  });
});

describe("applyCitationsToText: --check 相当（差分の有無で適用可否を判定する仕組み）", () => {
  it("適用済みテキストへ同じ台帳を再適用しても差分が出ない（--check が『一致』と判定するケース）", () => {
    const placements = [{ block: 2, id: "work-a" }];
    const applied = applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID);
    const reapplied = applyCitationsToText(applied, placements, CITATIONS_BY_ID);
    expect(reapplied).toBe(applied);
  });

  it("未適用のテキストに台帳を適用すると差分が出る（--check が『不一致』と判定するケース）", () => {
    const placements = [{ block: 2, id: "work-a" }];
    const applied = applyCitationsToText(THREE_BLOCKS, placements, CITATIONS_BY_ID);
    expect(applied).not.toBe(THREE_BLOCKS);
  });
});
