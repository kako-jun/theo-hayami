// 出典（栞）まわりの安全網（Issue #173 Phase A）。
//
// 対象は3つの生成物・設定物と、それらを読む src/lib/citations.ts:
// - docs/05_philosophy/citations.json（scripts/build-citations.mjs の生成物・thinkers md が正本）
// - docs/05_philosophy/citation_map.json（配置台帳・手編集）
// - docs/05_philosophy/work_readings.json（読み仮名の正本）
//
// scripts/*.mjs 自体（build-citations.mjs / apply-citations.mjs）は vitest 環境から
// そのまま import して純関数をテストする（scriptsDir 配下の他の *.mjs と違い、
// パース/変換ロジックを export しているため：他の check-sitemap.mjs 等はCLI専用で export を持たない）。
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyCitationsToText } from "../../scripts/apply-citations.mjs";
import {
  conceptSlug,
  extractLeadingWork,
  parseThinkerFile,
  splitIntoWorkFragments,
  splitWorkSection,
} from "../../scripts/build-citations.mjs";
import { fileKeyToReaderSlug, formatCitation, getCitationsForSlug } from "./citations";

interface Citation {
  id: string;
  resident: string;
  concept: string;
  work: string;
  section: string;
  also: string[];
  reading: string;
  raw: string;
}

interface CitationPlacement {
  after_block: number;
  id: string;
}

const ROOT = process.cwd();
const PHILOSOPHY_DIR = path.join(ROOT, "docs", "05_philosophy");
const THINKERS_DIR = path.join(PHILOSOPHY_DIR, "thinkers");
const SCRIPTS_CONTENT_DIR = path.join(ROOT, "content", "scripts");

const citations = JSON.parse(readFileSync(path.join(PHILOSOPHY_DIR, "citations.json"), "utf-8")) as Citation[];
const readings = JSON.parse(readFileSync(path.join(PHILOSOPHY_DIR, "work_readings.json"), "utf-8")) as {
  works: Record<string, { reading: string; aliases?: string[] }>;
};
const citationMapRaw = JSON.parse(readFileSync(path.join(PHILOSOPHY_DIR, "citation_map.json"), "utf-8")) as Record<
  string,
  unknown
>;
const citationMap = Object.fromEntries(
  Object.entries(citationMapRaw).filter(([key]) => !key.startsWith("_")),
) as Record<string, CitationPlacement[]>;

// splitWorkSection / splitIntoWorkFragments が「読点の右側が著作名か」を判定するのに使う
// 登録済み著作名集合（正本 + alias）。build-citations.mjs の main() と同じ組み方。
const registeredNames = new Set<string>();
for (const [canonical, entry] of Object.entries(readings.works)) {
  registeredNames.add(canonical);
  for (const alias of entry.aliases ?? []) registeredNames.add(alias);
}

// 話者ブロック開始行。apply-citations.mjs の SPEAKER_LINE_RE と同じ判定
// （`**話者**:` または `**話者** (表情, 位置):`）。
const SPEAKER_LINE_RE = /^\*\*[^*]+\*\*/;
function countSpeakerBlocks(text: string): number {
  return text.split("\n").filter((line) => SPEAKER_LINE_RE.test(line)).length;
}

describe("citations.json（台帳・生成物）", () => {
  it("全 id が一意", () => {
    const ids = citations.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("全 work が work_readings.json の正本著作名（canonical キー）と一致する", () => {
    const canonicalWorks = new Set(Object.keys(readings.works));
    const bad = citations.filter((c) => !canonicalWorks.has(c.work));
    expect(bad).toEqual([]);
  });

  it("thinkers md を再走査しても同じ件数・未登録の著作名0件になる（mdが正本・生成物と同期している）", () => {
    const files = readdirSync(THINKERS_DIR).filter((f) => f.endsWith(".md"));

    let total = 0;
    const missing = new Set<string>();
    for (const file of files) {
      const residentSlug = path.basename(file, ".md");
      const text = readFileSync(path.join(THINKERS_DIR, file), "utf-8");
      const entries = parseThinkerFile(text, residentSlug, registeredNames);
      total += entries.length;
      for (const entry of entries) {
        if (!registeredNames.has(entry.work)) missing.add(entry.work);
      }
    }

    expect([...missing].sort()).toEqual([]);
    expect(total).toBe(citations.length);
  });

  it("section の先頭に別の著作名が混入していない（複数著作の出典行の分割漏れガード）", () => {
    // レビュー指摘（#173）: `カテゴリー論／形而上学Δ` のような複数著作の出典行で、
    // 2つ目以降の著作名が section に紛れ込んでいないか。section の先頭を
    // extractLeadingWork で覗き見て、それが登録済みの著作名（正本 or alias）と
    // 一致するものが無いことを確認する（build-citations.mjs の自己検査と同じ判定）。
    const leaks = citations
      .filter((c) => c.section)
      .map((c) => ({ id: c.id, section: c.section, leadingWork: extractLeadingWork(c.section).work }))
      .filter((c) => registeredNames.has(c.leadingWork));
    expect(leaks).toEqual([]);
  });

  it("複数著作の出典行は最初の著作だけが work/section になり、残りは also に入る", () => {
    const kategoriai = citations.find((c) => c.id === "aristo-kategoriai");
    expect(kategoriai?.work).toBe("カテゴリー論");
    expect(kategoriai?.section).toBe("");
    expect(kategoriai?.also).toEqual(["形而上学Δ"]);

    const ousia = citations.find((c) => c.id === "aristo-ousia");
    expect(ousia?.work).toBe("形而上学");
    expect(ousia?.section).toBe("Ζ・Η");
    expect(ousia?.also).toEqual(["カテゴリー論"]);

    const eudaimonia = citations.find((c) => c.id === "aristo-eudaimonia");
    expect(eudaimonia?.work).toBe("ニコマコス倫理学");
    expect(eudaimonia?.section).toBe("I・X");
    expect(eudaimonia?.also).toEqual(["エウデモス倫理学"]);
  });
});

describe("citation_map.json（配置台帳）", () => {
  const citationIds = new Set(citations.map((c) => c.id));

  it("全 id が citations.json に存在する", () => {
    const bad: string[] = [];
    for (const [file, placements] of Object.entries(citationMap)) {
      for (const p of placements) {
        if (!citationIds.has(p.id)) bad.push(`${file}: ${p.id}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("全 after_block が対象ファイルの実在する話者ブロック数の範囲内", () => {
    for (const [file, placements] of Object.entries(citationMap)) {
      const text = readFileSync(path.join(SCRIPTS_CONTENT_DIR, file), "utf-8");
      const blockCount = countSpeakerBlocks(text);
      for (const p of placements) {
        expect(p.after_block, `${file}: after_block`).toBeGreaterThanOrEqual(1);
        expect(p.after_block, `${file}: after_block`).toBeLessThanOrEqual(blockCount);
      }
    }
  });

  it("1本あたり最大2箇所（レビューで担保するガードレール）", () => {
    for (const [file, placements] of Object.entries(citationMap)) {
      expect(placements.length, file).toBeLessThanOrEqual(2);
    }
  });
});

describe("apply-citations の冪等性", () => {
  it("現在のリポの脚本MD（適用済み）へ再適用しても差分が出ない", () => {
    const citationsById = new Map(citations.map((c) => [c.id, c]));
    for (const [file, placements] of Object.entries(citationMap)) {
      const before = readFileSync(path.join(SCRIPTS_CONTENT_DIR, file), "utf-8");
      const once = applyCitationsToText(before, placements, citationsById);
      const twice = applyCitationsToText(once, placements, citationsById);
      expect(twice).toBe(once);
      // リポの脚本MDは既に台帳を適用済みという前提（コミット済みの生成結果）。
      expect(once).toBe(before);
    }
  });
});

describe("splitWorkSection / conceptSlug（build-citations.mjs のパース単体）", () => {
  it("区切り文字（空白・ローマ数字・数字・括弧）の手前までを work にする（単一著作）", () => {
    expect(splitWorkSection("純粋理性批判", registeredNames)).toEqual({
      work: "純粋理性批判",
      section: "",
      also: [],
    });
    expect(splitWorkSection("分析論後書 II.19", registeredNames)).toEqual({
      work: "分析論後書",
      section: "II.19",
      also: [],
    });
    expect(splitWorkSection("形而上学Γ（IV）", registeredNames)).toEqual({
      work: "形而上学",
      section: "Γ（IV）",
      also: [],
    });
  });

  it("／区切りの複数著作は最初の断片だけが work/section になり、以降は also に入る（section に別著作名を混ぜない）", () => {
    expect(splitWorkSection("カテゴリー論／形而上学Δ", registeredNames)).toEqual({
      work: "カテゴリー論",
      section: "",
      also: ["形而上学Δ"],
    });
    expect(splitWorkSection("形而上学Ζ・Η／カテゴリー論", registeredNames)).toEqual({
      work: "形而上学",
      section: "Ζ・Η",
      also: ["カテゴリー論"],
    });
  });

  it("読点区切りでも、右側が登録済みの著作名のときだけ著作の境界とみなす", () => {
    // 「君主論25章、ディスコルシ」: 読点の右「ディスコルシ」が登録済み著作名 → 境界。
    expect(splitWorkSection("君主論25章、ディスコルシ", registeredNames)).toEqual({
      work: "君主論",
      section: "25章",
      also: ["ディスコルシ"],
    });
    // 「エチカ IV 序文、I p15・I p29」: 読点の右「I p15・I p29」は著作名ではない
    // （同じ著作内のロケータ列挙）→ 境界にしない・section は割らずに残す。
    expect(splitWorkSection("エチカ IV 序文、I p15・I p29", registeredNames)).toEqual({
      work: "エチカ",
      section: "IV 序文、I p15・I p29",
      also: [],
    });
  });

  it("行頭の引用（「」／『』）は閉じ括弧までを work にする", () => {
    expect(splitWorkSection("「原始契約について」／人間本性論III.ii.7–10", registeredNames)).toEqual({
      work: "原始契約について",
      section: "",
      also: ["人間本性論III.ii.7–10"],
    });
    expect(splitWorkSection("『大学』八条目を陽明流に貫いた大学問の一節", registeredNames)).toEqual({
      work: "大学",
      section: "八条目を陽明流に貫いた大学問の一節",
      also: [],
    });
  });

  it("splitIntoWorkFragments は／と著作境界の読点で断片に割る", () => {
    expect(splitIntoWorkFragments("形而上学Ζ・Η／カテゴリー論", registeredNames)).toEqual([
      "形而上学Ζ・Η",
      "カテゴリー論",
    ]);
    expect(splitIntoWorkFragments("エチカ IV 序文、I p15・I p29", registeredNames)).toEqual([
      "エチカ IV 序文、I p15・I p29",
    ]);
  });

  it("見出しの（... / ...）からラテン文字のセグメントを kebab-case で取り出す", () => {
    expect(conceptSlug("現象（Erscheinung）")).toBe("erscheinung");
    expect(conceptSlug("美と崇高（das Schöne / das Erhabene）")).toBe("das-schone");
    expect(conceptSlug("カテゴリー（κατηγορίαι / katēgoriai）")).toBe("kategoriai");
    expect(conceptSlug("A. 論理・認識（オルガノン）")).toBe(null);
    expect(conceptSlug("見出しに括弧が無い")).toBe(null);
  });
});

describe("getCitationsForSlug / fileKeyToReaderSlug（src/lib/citations.ts）", () => {
  it("current/temperature.md の栞は tea-temperature の読むページに灯る", () => {
    const result = getCitationsForSlug("tea-temperature");
    expect(result.map((c) => c.id)).toEqual(["kantia-antinomie"]);
    expect(formatCitation(result[0]!)).toBe("『純粋理性批判（じゅんすいりせいひはん）』");
  });

  it("main/ohako-kantia.md の栞は ohako-kantia の読むページに灯る", () => {
    const result = getCitationsForSlug("ohako-kantia");
    expect(result.map((c) => c.id)).toEqual(["kantia-erscheinung"]);
    expect(formatCitation(result[0]!)).toBe("『純粋理性批判（じゅんすいりせいひはん）』");
  });

  it("配置の無い slug は空配列（何も灯さない）", () => {
    expect(getCitationsForSlug("ai__aristo")).toEqual([]);
    expect(getCitationsForSlug("act1-01")).toEqual([]);
  });

  it("fileKeyToReaderSlug の対応表（current→tea- prefix・free/main→そのまま）", () => {
    expect(fileKeyToReaderSlug("current/temperature.md")).toBe("tea-temperature");
    expect(fileKeyToReaderSlug("free/ai__aristo.md")).toBe("ai__aristo");
    expect(fileKeyToReaderSlug("main/act1-01.md")).toBe("act1-01");
    expect(fileKeyToReaderSlug("main/ohako-kantia.md")).toBe("ohako-kantia");
    expect(fileKeyToReaderSlug("current-drafts/x.md")).toBe(null);
  });
});
