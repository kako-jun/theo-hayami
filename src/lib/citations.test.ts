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
  deriveDisplaySection,
  extractLeadingWork,
  japaneseIdFromHeading,
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
  display_section: string;
  also: string[];
  reading: string;
  link?: string;
  raw: string;
}

interface CitationPlacement {
  block: number;
  id: string;
}

const ROOT = process.cwd();
const PHILOSOPHY_DIR = path.join(ROOT, "docs", "05_philosophy");
const THINKERS_DIR = path.join(PHILOSOPHY_DIR, "thinkers");
const SCRIPTS_CONTENT_DIR = path.join(ROOT, "content", "scripts");

const citations = JSON.parse(readFileSync(path.join(PHILOSOPHY_DIR, "citations.json"), "utf-8")) as Citation[];
const readings = JSON.parse(readFileSync(path.join(PHILOSOPHY_DIR, "work_readings.json"), "utf-8")) as {
  works: Record<string, { reading: string; link?: string; aliases?: string[] }>;
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
    const kategoriai = citations.find((c) => c.id === "aristo-カテゴリー");
    expect(kategoriai?.work).toBe("カテゴリー論");
    expect(kategoriai?.section).toBe("");
    expect(kategoriai?.also).toEqual(["形而上学Δ"]);

    const ousia = citations.find((c) => c.id === "aristo-実体");
    expect(ousia?.work).toBe("形而上学");
    expect(ousia?.section).toBe("Ζ・Η");
    expect(ousia?.also).toEqual(["カテゴリー論"]);

    const eudaimonia = citations.find((c) => c.id === "aristo-エウダイモニア");
    expect(eudaimonia?.work).toBe("ニコマコス倫理学");
    expect(eudaimonia?.section).toBe("I・X");
    expect(eudaimonia?.also).toEqual(["エウデモス倫理学"]);
  });

  it("／の右側が登録済み著作名でない断片は別著作にせず section の続きとして残す（レビュー指摘S5）", () => {
    // 人間知性研究 第四節／第十二節: 「第十二節」は著作名でなく章節の続き。以前は also に漏れていた（旧表記 4／12）。
    const humesFork = citations.find((c) => c.id === "hue-ヒュームのフォーク");
    expect(humesFork?.work).toBe("人間知性研究");
    expect(humesFork?.section).toBe("第四節／第十二節");
    expect(humesFork?.also).toEqual([]);

    // 人間本性論II.i.11／III: 「III」も章番号の続き。以前は also=["III"] に漏れていた。
    const sympathy = citations.find((c) => c.id === "hue-共感");
    expect(sympathy?.work).toBe("人間本性論");
    expect(sympathy?.section).toBe("II.i.11／III");
    expect(sympathy?.also).toEqual([]);

    // 省察 第六／エリザベト宛書簡（1643）: 書簡は著作でないため未登録のまま
    // （work_readings.json に登録しない）→ also に書簡名が漏れない。
    const mindBody = citations.find((c) => c.id === "dekaris-心身合一");
    expect(mindBody?.work).toBe("省察");
    expect(mindBody?.also).toEqual([]);
  });

  it("also（2つ目以降の著作）も全件 work_readings.json に登録済み（レビュー指摘S4・章節だけの断片が無い）", () => {
    const bad: string[] = [];
    for (const c of citations) {
      for (const alsoFragment of c.also) {
        const alsoWork = extractLeadingWork(alsoFragment).work;
        if (!alsoWork || !registeredNames.has(alsoWork)) {
          bad.push(`${c.id}: also="${alsoFragment}"`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

// 栞リストの著作記事リンク（Issue #178）。work_readings.json の link が
// citations.json へ正しく伝播しているか（work_readings.json 側の中身は
// work-readings.quality.test.ts が別途検証する）。
describe("citations.json の link（Issue #178・work_readings.json からの伝播）", () => {
  it("citation.link は readings.works[citation.work].link と完全一致する（canonical 経由のみ・値のズレが無い）", () => {
    const bad: string[] = [];
    for (const c of citations) {
      const expectedLink = readings.works[c.work]?.link;
      if (c.link !== expectedLink) {
        bad.push(`${c.id}: work="${c.work}" citation.link=${JSON.stringify(c.link)} expected=${JSON.stringify(expectedLink)}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("link を持たない著作の citation には link キー自体が無い（JSON.stringify が undefined を省略）", () => {
    const raw = readFileSync(path.join(PHILOSOPHY_DIR, "citations.json"), "utf-8");
    const rawEntries = JSON.parse(raw) as Record<string, unknown>[];
    const bad: string[] = [];
    for (const entry of rawEntries) {
      const hasLinkKey = Object.prototype.hasOwnProperty.call(entry, "link");
      const work = entry.work as string;
      const shouldHaveLink = readings.works[work]?.link !== undefined;
      if (hasLinkKey !== shouldHaveLink) {
        bad.push(`${entry.id}: hasLinkKey=${hasLinkKey} shouldHaveLink=${shouldHaveLink}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("実データに link 有り・無しの両方が存在する（回帰防止）", () => {
    const withLink = citations.filter((c) => c.link !== undefined);
    const withoutLink = citations.filter((c) => c.link === undefined);
    expect(withLink.length).toBeGreaterThan(0);
    expect(withoutLink.length).toBeGreaterThan(0);
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

  it("全 block が対象ファイルの実在する話者ブロック数の範囲内", () => {
    for (const [file, placements] of Object.entries(citationMap)) {
      const text = readFileSync(path.join(SCRIPTS_CONTENT_DIR, file), "utf-8");
      const blockCount = countSpeakerBlocks(text);
      for (const p of placements) {
        expect(p.block, `${file}: block`).toBeGreaterThanOrEqual(1);
        expect(p.block, `${file}: block`).toBeLessThanOrEqual(blockCount);
      }
    }
  });

  it("1本あたりの上限: ティータイムは3箇所（住人1人につき1箇所・#183）、自由行動・本編は2箇所", () => {
    for (const [file, placements] of Object.entries(citationMap)) {
      const isTeaTime = file.startsWith("current/") || file.startsWith("current-drafts/");
      expect(placements.length, file).toBeLessThanOrEqual(isTeaTime ? 3 : 2);
    }
  });

  it("ティータイムでは同じ住人に2箇所配置しない（1人1箇所）", () => {
    const residentOf = new Map(citations.map((c) => [c.id, c.resident]));
    for (const [file, placements] of Object.entries(citationMap)) {
      if (!(file.startsWith("current/") || file.startsWith("current-drafts/"))) continue;
      const residents = placements.map((p) => residentOf.get(p.id));
      expect(new Set(residents).size, file).toBe(residents.length);
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

describe("splitWorkSection / japaneseIdFromHeading（build-citations.mjs のパース単体）", () => {
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

  it("／区切りも、右側が登録済みの著作名のときだけ著作の境界とみなす（レビュー指摘S5・読点と同じ規則）", () => {
    // 「人間知性研究4／12」: ／の右「12」は登録済み著作名ではない（同じ著作の章節の続き）
    // → 境界にしない・section は割らずに「4／12」のまま残す（also に「12」を入れない）。
    expect(splitWorkSection("人間知性研究4／12", registeredNames)).toEqual({
      work: "人間知性研究",
      section: "4／12",
      also: [],
    });
    // 「人間本性論II.i.11／III」: ／の右「III」も著作名ではない（章番号の続き）。
    expect(splitWorkSection("人間本性論II.i.11／III", registeredNames)).toEqual({
      work: "人間本性論",
      section: "II.i.11／III",
      also: [],
    });
    // 「省察 第六／エリザベト宛書簡（1643）」: 書簡は著作ではないため work_readings.json に
    // 未登録のまま（意図的）→ 境界にしない・also に書簡名を入れない（raw にだけ残る）。
    expect(splitWorkSection("省察 第六／エリザベト宛書簡（1643）", registeredNames)).toEqual({
      work: "省察",
      section: "第六／エリザベト宛書簡（1643）",
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

  it("splitIntoWorkFragments は／と著作境界の読点で断片に割る（どちらも右側が登録済み著作名の時だけ）", () => {
    expect(splitIntoWorkFragments("形而上学Ζ・Η／カテゴリー論", registeredNames)).toEqual([
      "形而上学Ζ・Η",
      "カテゴリー論",
    ]);
    expect(splitIntoWorkFragments("エチカ IV 序文、I p15・I p29", registeredNames)).toEqual([
      "エチカ IV 序文、I p15・I p29",
    ]);
    // レビュー指摘S5: ／の右側が登録済み著作名でなければ割らない。
    expect(splitIntoWorkFragments("人間知性研究4／12", registeredNames)).toEqual(["人間知性研究4／12"]);
    expect(splitIntoWorkFragments("人間本性論II.i.11／III", registeredNames)).toEqual(["人間本性論II.i.11／III"]);
  });

  it("japaneseIdFromHeading: 見出しの（or／の手前までの日本語語句を、空白・中黒・かぎ括弧・全角イコールを除いて取り出す", () => {
    // レビュー指摘（#173）: id は英字スラッグ（旧 conceptSlug）ではなく見出しの日本語語句そのもの由来にする
    // （ラテン文字の原語併記が無い見出しで連番にフォールバックし、md 編集のたびに id がずれる事故を防ぐ）。
    expect(japaneseIdFromHeading("現象（Erscheinung）")).toBe("現象");
    expect(japaneseIdFromHeading("アンチノミー（Antinomie）")).toBe("アンチノミー");
    expect(japaneseIdFromHeading("カテゴリー（κατηγορίαι / katēgoriai）")).toBe("カテゴリー");
    // ／が（より先に出る見出しは／の手前まで（2つ目の対語は捨てる。id の安定性・簡潔さ優先）。
    expect(japaneseIdFromHeading("自発的／非自発的（ἑκούσιον / hekousion・ἀκούσιον）")).toBe("自発的");
    // 空白・中黒・かぎ括弧・全角イコールを除去する。読点（、）も除去する。
    expect(japaneseIdFromHeading("知は行の始め、行は知の成（ちはこうのはじめ）")).toBe("知は行の始め行は知の成");
    expect(japaneseIdFromHeading("感情の定義 全48（エチカ第3部末尾「感情の定義」）")).toBe("感情の定義全48");
    expect(japaneseIdFromHeading("身体＝機械（人間機械論の生理学）")).toBe("身体機械");
    // 括弧も／も無い見出しは全体を使う。
    expect(japaneseIdFromHeading("見出しに括弧が無い")).toBe("見出しに括弧が無い");
  });
});

describe("deriveDisplaySection（build-citations.mjs・栞テロップの短縮表示。Issue #173 Phase B）", () => {
  it("出典行の引用文（最初の 。 以降）を捨てる", () => {
    // ou-知行合一 の section 実データ: 引用文まで残ると長すぎるテロップになっていた不具合の再現。
    expect(deriveDisplaySection("（徐愛との最初期の主題）。「未だ知りて行わざる者あらず。知りて行わざるは、ただ未だ知らざるなり」")).toBe(
      "",
    );
  });

  it("説明括弧（（…）は捨てる。ただし section が丸ごと1個の部位指定括弧なら残す", () => {
    // spino-思想言論の自由 の section 実データ: 引用を包む説明括弧ごと除去。
    expect(deriveDisplaySection("第20章（「各人に思考の自由・思うことを語る自由を認めうる」）")).toBe("第20章");
    // hegru-止揚 の section 実データ: 『大論理学』（有論）のような部位指定は例外的に残す。
    expect(deriveDisplaySection("（有論）")).toBe("（有論）");
  });

  it("読点区切りの複数ロケータは先頭だけ残す", () => {
    // spino-必然性決定論 の section 実データ。
    expect(deriveDisplaySection("I p29・I p33、I app（目的論の否定）、II p48（意志の自由の否定）")).toBe("I p29");
  });

  it("数字を伴わない章の並記（中黒区切り）はそのまま残す（一体の指定か列挙か判別できないため）", () => {
    // aristo-エウダイモニア「I・X」・aristo-実体「Ζ・Η」の section 実データ。
    expect(deriveDisplaySection("I・X")).toBe("I・X");
    expect(deriveDisplaySection("Ζ・Η")).toBe("Ζ・Η");
  });

  it("空文字は空文字のまま", () => {
    expect(deriveDisplaySection("")).toBe("");
  });
});

describe("栞テロップ本文の長さの安全網（Issue #173 Phase B）", () => {
  it("citation_map.json に実際に配置されている全テロップ本文が56字以内（折り返しは name-name #679）", () => {
    const byId = new Map(citations.map((c) => [c.id, c]));
    const overLong: string[] = [];
    for (const [file, placements] of Object.entries(citationMap)) {
      for (const p of placements) {
        const citation = byId.get(p.id);
        if (!citation) continue;
        const body = formatCitation(citation);
        if (body.length > 56) overLong.push(`${file}#${p.id}: "${body}"（${body.length}字）`);
      }
    }
    expect(overLong).toEqual([]);
  });
});

describe("citations.json の id（レビュー指摘・#173: 連番フォールバック禁止）", () => {
  it("id に連番形式（末尾 -数字）が無い", () => {
    const numericSuffix = citations.filter((c) => /-\d+$/.test(c.id));
    expect(numericSuffix.map((c) => c.id)).toEqual([]);
  });

  it("全 id が `{residentSlug}-{見出し由来の日本語id}` として機械的に導出できる（安定 id）", () => {
    // RESIDENT_NAMES（カタカナ表示名）→ ファイル名スラッグの逆引き。
    const residentSlugByName: Record<string, string> = {
      アリスト: "aristo",
      デカリス: "dekaris",
      ヘグル: "hegru",
      ヒュー: "hue",
      カンティア: "kantia",
      マキヤ: "makiya",
      オウ: "ou",
      スピノ: "spino",
    };
    const bad: string[] = [];
    for (const c of citations) {
      const residentSlug = residentSlugByName[c.resident];
      const expectedId = `${residentSlug}-${japaneseIdFromHeading(c.concept)}`;
      if (c.id !== expectedId) bad.push(`${c.id} (concept=${c.concept} から期待される id は ${expectedId})`);
    }
    expect(bad).toEqual([]);
  });
});

describe("getCitationsForSlug / fileKeyToReaderSlug（src/lib/citations.ts）", () => {
  it("current/temperature.md の栞は tea-temperature の読むページに灯る", () => {
    // Phase B seed で block:3 に hue-習慣慣れ が2件目として追加された（citation_map.json）。
    const result = getCitationsForSlug("tea-temperature");
    expect(result.map((c) => c.id)).toEqual(["kantia-アンチノミー", "hue-習慣慣れ"]);
    expect(formatCitation(result[0]!)).toBe("『純粋理性批判（じゅんすいりせいひはん）』");
  });

  it("main/ohako-kantia.md の栞は ohako-kantia の読むページに灯る", () => {
    // Phase B seed で block:9 に kantia-物自体 が2件目として追加された（citation_map.json）。
    const result = getCitationsForSlug("ohako-kantia");
    expect(result.map((c) => c.id)).toEqual(["kantia-現象", "kantia-物自体"]);
    expect(formatCitation(result[0]!)).toBe("『純粋理性批判（じゅんすいりせいひはん）』");
  });

  it("配置の無い slug は空配列（何も灯さない）", () => {
    expect(getCitationsForSlug("nonexistent__nobody")).toEqual([]);
    expect(getCitationsForSlug("act9-99")).toEqual([]);
  });

  it("fileKeyToReaderSlug の対応表（current→tea- prefix・free/main→そのまま）", () => {
    expect(fileKeyToReaderSlug("current/temperature.md")).toBe("tea-temperature");
    expect(fileKeyToReaderSlug("free/ai__aristo.md")).toBe("ai__aristo");
    expect(fileKeyToReaderSlug("main/act1-01.md")).toBe("act1-01");
    expect(fileKeyToReaderSlug("main/ohako-kantia.md")).toBe("ohako-kantia");
    expect(fileKeyToReaderSlug("current-drafts/x.md")).toBe(null);
  });

  it("current/x.md はファイル名でなく公開 slug 基準で ReaderFrame の slug と一致する（#173 M2）", () => {
    // content/scripts/current/wc-luck.md は publishedTeaTimeQuestions 上で
    // slug: "world-cup" / sceneId: "tea-wc-luck"（sceneId の tea- 以降がファイル名と一致）。
    // ReaderFrame に渡る実際の slug は `tea-${question.slug}` = "tea-world-cup" であり、
    // ファイル名からナイーブに組んだ "tea-wc-luck" とは異なる。
    expect(fileKeyToReaderSlug("current/wc-luck.md")).toBe("tea-world-cup");
    expect(fileKeyToReaderSlug("current/wc-luck.md")).not.toBe("tea-wc-luck");
  });
});
