import { describe, expect, it } from "vitest";
import { parseFirstBackground, parseFrontmatterTitle, parseSceneId } from "./scripts.ts";

// これらは fs に触れず生文字列を受ける純パーサ。索引の3本柱（業名・sceneId・背景）を
// free/*.md のどの行から取るかの正規表現を、正常系・欠損時のフォールバック・境界の罠で守る。

describe("parseFrontmatterTitle", () => {
  it("frontmatter の title を業の日本語名として取り出す", () => {
    const raw = `---
engine: name-name
title: "好きで苦しい"
protagonist: "せお"
---

本文`;
    expect(parseFrontmatterTitle(raw)).toBe("好きで苦しい");
  });

  it("title 値に空白を含んでもクオート内を丸ごと取る", () => {
    const raw = `---
title: "あの とき こう していれば"
---`;
    expect(parseFrontmatterTitle(raw)).toBe("あの とき こう していれば");
  });

  it("frontmatter が無ければ空文字（見出し等に誤爆しない）", () => {
    const raw = `## aristo-ai: 愛
title: "これは本文中のtitle"`;
    expect(parseFrontmatterTitle(raw)).toBe("");
  });

  it("frontmatter はあるが title 行が無ければ空文字", () => {
    const raw = `---
engine: name-name
protagonist: "せお"
---`;
    expect(parseFrontmatterTitle(raw)).toBe("");
  });

  it("title がダブルクオートで囲まれていなければ取らない（クオート必須の契約）", () => {
    const raw = `---
title: 好きで苦しい
---`;
    expect(parseFrontmatterTitle(raw)).toBe("");
  });
});

describe("parseSceneId", () => {
  it("実データ形式の見出しから sceneId だけを取る（コロン・以降の説明を含めない）", () => {
    const raw = "## aristo-ai: 愛 / 住人: アリスト（能力:観察）";
    // `[a-z0-9-]+` はスペースの手前で止まるので後続の日本語や2つ目のコロンは拾わない。
    expect(parseSceneId(raw)).toBe("aristo-ai");
  });

  it("見出しが複数あっても最初の ## 見出しを sceneId にする", () => {
    const raw = `## first-scene: 一番目
本文
## second-scene: 二番目`;
    expect(parseSceneId(raw)).toBe("first-scene");
  });

  it("見出しが無ければ空文字（loadEpisodes 側のフォールバックに委ねる）", () => {
    const raw = `---
title: "愛"
---

見出しの無い本文`;
    expect(parseSceneId(raw)).toBe("");
  });

  it("大文字を含む見出しはマッチしない（slug は小文字英数字ハイフンのみ）", () => {
    const raw = "## Aristo-AI: 愛";
    expect(parseSceneId(raw)).toBe("");
  });

  it("行頭の ## のみ拾う（本文中の ## 断片には反応しない）", () => {
    const raw = "本文の途中に ## fake-scene: が現れても";
    expect(parseSceneId(raw)).toBe("");
  });
});

describe("parseFirstBackground", () => {
  it("実データ形式の背景行からパスを取り出す", () => {
    const raw = "[背景: shadow-library/dream-corridor-v.webp]";
    expect(parseFirstBackground(raw)).toBe("shadow-library/dream-corridor-v.webp");
  });

  it("背景パス前後の空白は trim する", () => {
    const raw = "[背景:   shadow-library/x.webp   ]";
    expect(parseFirstBackground(raw)).toBe("shadow-library/x.webp");
  });

  it("複数の背景指定があっても最初の1つ（額縁背景）を返す", () => {
    const raw = `[背景: shadow-library/first.webp]
本文
[背景: shadow-library/second.webp]`;
    expect(parseFirstBackground(raw)).toBe("shadow-library/first.webp");
  });

  it("背景行が無ければ null（背景無しを表す）", () => {
    const raw = `---
title: "愛"
---

背景の無い本文`;
    expect(parseFirstBackground(raw)).toBeNull();
  });
});
