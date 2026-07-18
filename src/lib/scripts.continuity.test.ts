import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MAIN_DIR = path.join(process.cwd(), "content", "scripts", "main");

function mainScript(file: string): string {
  return readFileSync(path.join(MAIN_DIR, file), "utf-8");
}

describe("main story continuity", () => {
  it("act2-01 does not misattribute the hologram explanation to セオ", () => {
    const act1 = mainScript("act1-01.md");
    const act2 = mainScript("act2-01.md");

    expect(act1).toContain("**ヴィンチア** (vincia/explain, 右):\nホログラム、と言えばいいかな。");
    expect(act2).not.toContain("きみは、前にも言っていたね。ホログラムだったんだ、って。");
    expect(act2).toContain("前に、僕は言ったね。きみのいた現実は、ホログラムのような投影だった、って。");
  });

  it("keeps unshown past references from becoming direct quotes or repeated visits", () => {
    expect(mainScript("act2-02.md")).not.toMatch(/いつも、スピノが座ってた|いつも座ってた|いつも、ここへ来る/u);

    const act2_03 = mainScript("act2-03.md");
    expect(act2_03).not.toContain("戻らんぞ");
    expect(act2_03).not.toContain("「さあ、どうだろうね」って");
    expect(act2_03).toContain("初めて会ったときみたいな軽さがなくて");

    expect(mainScript("act3-01.md")).not.toContain("きのう聞いた言葉");
    expect(mainScript("act2-01.md")).not.toMatch(/昨日と同じ|昨日と、同じ/u);
    expect(mainScript("act3-01.md")).not.toContain("昨日と違う");
    expect(mainScript("act2-01.md")).toContain("前に見たときと同じ数");
    expect(mainScript("act3-01.md")).toContain("前に見たときと違う");
  });

  it("keeps Vincia's identity reveal in act3-04 instead of act3-03", () => {
    const act3_03 = mainScript("act3-03.md");
    const act3_04 = mainScript("act3-04.md");

    expect(act3_03).not.toContain("僕は黒幕ではない");
    expect(act3_03).not.toContain("好奇心、と呼んでもいい");
    expect(act3_03).toContain("次は、真相を聞く番だ");

    expect(act3_04).toContain("僕は黒幕ではない");
    expect(act3_04).toContain("好奇心、と呼んでもいい");
  });

  it("keeps Dekaris's doubt as Seo's own reasoning in act3-02", () => {
    const act3_02 = mainScript("act3-02.md");
    expect(act3_02).toContain("デカリスに会ってから、わかったんだ");
    expect(act3_02).toContain("自分の安心も、きみの優しさも疑う");
    expect(act3_02).not.toContain("デカリスなら、そう言うだろう");
  });

  it("keeps ending anchors and character voice constraints", () => {
    expect(mainScript("act4-03.md")).toContain("見えているはずなのに、端が欠けてる");
    expect(mainScript("act4-04.md")).toContain("この物語で語られたことを、まず疑え");
    expect(mainScript("ohako-makiya.md")).not.toContain("わし");
    expect(mainScript("ohako-hue.md")).not.toContain("ぼくの言うこと");
    expect(mainScript("ohako-hegru.md")).not.toContain("覚えておおき");
  });

  it("keeps late-story afterimages from reading as physical resident returns", () => {
    const act2_02 = mainScript("act2-02.md");
    const act3_04 = mainScript("act3-04.md");
    const act4_01 = mainScript("act4-01.md");
    const act4_04 = mainScript("act4-04.md");

    expect(act2_02).toContain("「いなくなる、ってどういうことなんだろう」");
    expect(act2_02).not.toContain("「消えるって、どういうことなんだろう」");
    expect(act3_04).toContain("残った声を追う → act4-01");
    expect(act3_04).not.toContain("最後の住人に会う → act4-01");
    expect(act4_01).not.toMatch(/\[登場: (ヒュー|オウ)/u);
    expect(act4_01).toContain("言葉になりきる前で止まる");
    expect(act4_04).toContain("ヒューの余韻");
    expect(act4_04).not.toContain("ヒューの沈黙");
  });
});
