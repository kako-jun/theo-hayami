import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RESIDENTS } from "../data/residents.ts";
import type { ThemeSummary } from "./scripts.ts";
import {
  findEpisode,
  findOhako,
  groupStoryButtonsByAct,
  groupThemesByCategory,
  loadCharacterThemes,
  loadEpisodes,
  loadHubOrder,
  loadOhako,
  loadStoryButtons,
  loadThemeCategories,
  loadThemes,
  mainStoryActLabel,
  THEME_CATEGORIES,
  sortByHubOrder,
  themeSymbolImage,
} from "./scripts.ts";

// 実 content/scripts/free/*.md を loadEpisodes() で実際に読み、名前ドリフト・見出し崩れ・
// カバレッジ地図の破綻を将来検出する安全網。数値は「今後増えうる」ものは下限（>=）で押さえ、
// 「意味的に固定」なもの（住人8人）だけ厳密に固定する。

const FREE_DIR = fileURLToPath(new URL("../../content/scripts/free/", import.meta.url));
const DISK_FILES = readdirSync(FREE_DIR).filter((f) => f.endsWith(".md"));
const KNOWN_CHARACTERS = new Set(RESIDENTS.map((r) => r.slug));

const episodes = loadEpisodes();

describe("loadEpisodes: 実データの取り込み", () => {
  it("free/*.md を1本も落とさずに Episode 化する（ディスク実数と一致）", () => {
    expect(episodes.length).toBe(DISK_FILES.length);
  });

  it("エピソードは現行296本以上ある（コンテンツが縮んでいない）", () => {
    expect(episodes.length).toBeGreaterThanOrEqual(296);
  });

  it("全エピソードが索引契約を満たす（slug/theme/character/sceneId/themeTitle が非空）", () => {
    const bad = episodes.filter(
      (e) => !e.slug || !e.theme || !e.character || !e.sceneId || !e.themeTitle.trim(),
    );
    expect(bad.map((e) => e.slug)).toEqual([]);
  });

  it("slug は theme__character に正確に分解・復元できる", () => {
    const bad = episodes.filter((e) => e.slug !== `${e.theme}__${e.character}`);
    expect(bad.map((e) => e.slug)).toEqual([]);
  });

  it("sceneId は `${character}-${theme}` 規約に従う（name-name のメニュー/ディープリンクが依存）", () => {
    // 見出し `## {character}-{theme}:` から取った実際の sceneId が規約通りかを全件検証する。
    // フォールバック値との一致確認ではなく、実ファイルの見出しがリネームで規約を破って
    // いないかの回帰ネット。ここが緑のまま別名にされると dead embed が出荷される。
    const bad = episodes.filter((e) => e.sceneId !== `${e.character}-${e.theme}`);
    expect(bad.map((e) => `${e.slug}:${e.sceneId}`)).toEqual([]);
  });

  it("theme / character は小文字英数字（スラッグ規約）", () => {
    const bad = episodes.filter((e) => !/^[a-z0-9]+$/.test(e.theme) || !/^[a-z0-9]+$/.test(e.character));
    expect(bad.map((e) => e.slug)).toEqual([]);
  });

  it("エピソードは slug 昇順にソートされている", () => {
    const slugs = episodes.map((e) => e.slug);
    expect(slugs).toEqual([...slugs].sort((a, b) => a.localeCompare(b)));
  });
});

describe("loadEpisodes: 住人（character）の同一性", () => {
  it("登場する住人はちょうど8人（residents.ts と一致）", () => {
    const chars = new Set(episodes.map((e) => e.character));
    expect(chars.size).toBe(8);
    expect([...chars].sort()).toEqual([...KNOWN_CHARACTERS].sort());
  });

  it("未知の住人スラッグ（名前ドリフト）が混入していない", () => {
    const unknown = episodes.filter((e) => !KNOWN_CHARACTERS.has(e.character));
    expect(unknown.map((e) => e.slug)).toEqual([]);
  });
});

describe("loadThemes: 業ごとのグルーピング＝カバレッジ地図", () => {
  it("業は38種以上（お題が縮んでいない・今後増えうるので下限）", () => {
    expect(loadThemes().length).toBeGreaterThanOrEqual(38);
  });

  it("各業は非空タイトルと1人以上の住人を持つ", () => {
    const bad = loadThemes().filter((t) => !t.title.trim() || t.characters.length === 0);
    expect(bad.map((t) => t.slug)).toEqual([]);
  });

  it("業ごとの住人に重複が無く、全て既知の住人", () => {
    const bad = loadThemes().filter(
      (t) =>
        new Set(t.characters).size !== t.characters.length ||
        t.characters.some((c) => !KNOWN_CHARACTERS.has(c)),
    );
    expect(bad.map((t) => t.slug)).toEqual([]);
  });

  it("同じ業に複数住人が正しく集まる（ai のディスク実態と一致）", () => {
    const aiTheme = loadThemes().find((t) => t.slug === "ai");
    const expected = DISK_FILES.filter((f) => f.startsWith("ai__"))
      .map((f) => f.replace(/^ai__/, "").replace(/\.md$/, ""))
      .sort();
    expect(aiTheme).toBeDefined();
    expect([...(aiTheme?.characters ?? [])].sort()).toEqual(expected);
  });

  it("業の総組み合わせ数はエピソード総数と一致（グルーピングで欠落・重複が起きない）", () => {
    const total = loadThemes().reduce((n, t) => n + t.characters.length, 0);
    expect(total).toBe(episodes.length);
  });
});

describe("loadThemeCategories: 業カテゴリ", () => {
  it("現行の全ての業が公開カテゴリへ分類される", () => {
    const categorized = new Set<string>(
      THEME_CATEGORIES.flatMap((category) => [...category.themeSlugs]),
    );
    const missing = loadThemes()
      .map((theme) => theme.slug)
      .filter((slug) => !categorized.has(slug));
    expect(missing).toEqual([]);
  });

  it("カテゴリ内の業順はハブ順序を保つ", () => {
    const hub = loadThemes().map((theme) => theme.slug);
    for (const group of loadThemeCategories()) {
      const indices = group.themes.map((theme) => hub.indexOf(theme.slug));
      expect(indices).toEqual([...indices].sort((a, b) => a - b));
    }
  });

  it("公開カテゴリ名は読者向けに難語を避ける", () => {
    const labels = loadThemeCategories().map((group) => group.category.label);
    expect(labels).toEqual(["欲・むさぼり", "対人", "感情", "生きること", "認識・知"]);
  });

  it("住人別の部分集合もカテゴリ順とハブ順を保って分類できる", () => {
    const aristoThemeSlugs = new Set(loadCharacterThemes().find((c) => c.slug === "aristo")?.themes ?? []);
    const aristoThemes = loadThemes().filter((theme) => aristoThemeSlugs.has(theme.slug));
    const hub = loadThemes().map((theme) => theme.slug);
    const groups = groupThemesByCategory(aristoThemes);
    expect(groups.map((group) => group.category.label)).toEqual([
      "欲・むさぼり",
      "対人",
      "感情",
      "生きること",
      "認識・知",
    ]);
    expect(new Set(groups.flatMap((group) => group.themes.map((theme) => theme.slug)))).toEqual(
      new Set(aristoThemes.map((theme) => theme.slug)),
    );
    for (const group of groups) {
      const indices = group.themes.map((theme) => hub.indexOf(theme.slug));
      expect(indices).toEqual([...indices].sort((a, b) => a - b));
    }
  });
});

describe("loadCharacterThemes: 住人ごとのグルーピング", () => {
  it("住人はちょうど8人ぶん載る", () => {
    expect(loadCharacterThemes().length).toBe(8);
  });

  it("住人の総お題数はエピソード総数と一致（グルーピングで欠落・重複が起きない）", () => {
    const total = loadCharacterThemes().reduce((n, c) => n + c.themes.length, 0);
    expect(total).toBe(episodes.length);
  });
});

describe("findEpisode", () => {
  it("既知スラッグで該当エピソードを返す", () => {
    expect(findEpisode("ai__aristo")?.slug).toBe("ai__aristo");
  });

  it("存在しないスラッグは undefined", () => {
    expect(findEpisode("nonexistent__slug")).toBeUndefined();
  });
});

describe("loadOhako: おはこ（住人の初登場8本・main/ohako-*.md）の取り込み", () => {
  const MAIN_DIR = fileURLToPath(new URL("../../content/scripts/main/", import.meta.url));
  const MAIN_ENTRIES = readdirSync(MAIN_DIR);
  const ohako = loadOhako();

  it("おはこはちょうど8本（住人8人ぶん・.gitkeep 等の非 md を拾わない）", () => {
    expect(ohako.length).toBe(8);
    // main/ には .gitkeep も置かれている。ローダがそれを Entry 化していない証拠。
    expect(MAIN_ENTRIES).toContain(".gitkeep");
    expect(ohako.map((e) => e.slug)).not.toContain(".gitkeep");
  });

  it("住人スラッグは RESIDENTS の8人とちょうど一致（名前ドリフト検出）", () => {
    const chars = new Set(ohako.map((e) => e.character));
    expect(chars.size).toBe(8);
    expect([...chars].sort()).toEqual([...KNOWN_CHARACTERS].sort());
  });

  it("全件 slug === `ohako-${character}` に正確に分解・復元できる", () => {
    const bad = ohako.filter((e) => e.slug !== `ohako-${e.character}`);
    expect(bad.map((e) => e.slug)).toEqual([]);
  });

  it("全件 sceneId === slug（`## ohako-<住人>:` 見出しが規約通り・ディープリンクが依存）", () => {
    const bad = ohako.filter((e) => e.sceneId !== e.slug);
    expect(bad.map((e) => `${e.slug}:${e.sceneId}`)).toEqual([]);
  });

  it("全件 title / background が非空（額縁の表題・背景が欠けていない）", () => {
    const bad = ohako.filter((e) => !e.title.trim() || !e.background?.trim());
    expect(bad.map((e) => e.slug)).toEqual([]);
  });

  it("おはこは slug 昇順にソートされている", () => {
    const slugs = ohako.map((e) => e.slug);
    expect(slugs).toEqual([...slugs].sort((a, b) => a.localeCompare(b)));
  });
});

describe("findOhako", () => {
  it("既知住人でその住人のおはこを引ける", () => {
    const entry = findOhako("kantia");
    expect(entry?.character).toBe("kantia");
    expect(entry?.slug).toBe("ohako-kantia");
  });

  it("全既知住人が findOhako で引ける（導線が全住人ぶん張れる）", () => {
    const missing = [...KNOWN_CHARACTERS].filter((slug) => !findOhako(slug));
    expect(missing).toEqual([]);
  });

  it("未知の住人スラッグは undefined", () => {
    expect(findOhako("nonexistent")).toBeUndefined();
  });

  it("おはこの slug（`ohako-kantia`）を住人スラッグと取り違えても引かない", () => {
    // findOhako は character（`kantia`）で引く。slug をそのまま渡しても一致しない契約。
    expect(findOhako("ohako-kantia")).toBeUndefined();
  });
});

describe("loadStoryButtons: 第一幕+第二幕シーケンスの順序ゲート", () => {
  const buttons = loadStoryButtons();

  it("[act1-01, act1-02, おはこ×RESIDENTS順, act1-03, act1-04, act2-01..04] の通し16件を並べる", () => {
    const expected = [
      "act1-01",
      "act1-02",
      ...RESIDENTS.map((r) => `ohako-${r.slug}`),
      "act1-03",
      "act1-04",
      "act2-01",
      "act2-02",
      "act2-03",
      "act2-04",
    ];
    expect(buttons.length).toBe(16);
    expect(buttons.map((entry) => entry.slug)).toEqual(expected);
  });

  it("幕内の表示順は幕ごとに1始まりへリセットする通し番号（第一幕1..12、第二幕1..4）", () => {
    expect(buttons.slice(0, 12).map((entry) => entry.orderInAct)).toEqual(
      Array.from({ length: 12 }, (_, i) => i + 1),
    );
    expect(buttons.slice(12).map((entry) => entry.orderInAct)).toEqual([1, 2, 3, 4]);
  });

  it("本筋md（act1-*/act2-*）は character を持たず、おはこは住人slugを持つ", () => {
    const withoutChar = buttons.filter((entry) => entry.character === undefined).map((e) => e.slug);
    expect(withoutChar).toEqual(["act1-01", "act1-02", "act1-03", "act1-04", "act2-01", "act2-02", "act2-03", "act2-04"]);
    const ohakoButtons = buttons.filter((entry) => entry.character !== undefined);
    expect(ohakoButtons.map((e) => e.character)).toEqual(RESIDENTS.map((r) => r.slug));
    expect(ohakoButtons.every((e) => e.slug === `ohako-${e.character}`)).toBe(true);
  });

  it("全ボタンが title / sceneId / background を持つ（額縁・埋め込みが欠けない）", () => {
    const bad = buttons.filter((e) => !e.title.trim() || !e.sceneId.trim() || !e.background?.trim());
    expect(bad.map((e) => e.slug)).toEqual([]);
  });
});

describe("groupStoryButtonsByAct: /story の幕見出し分割", () => {
  it("16件フラット配列を第一幕12件・第二幕4件の2グループへ分ける（おはこは直前の act に属す）", () => {
    const sections = groupStoryButtonsByAct(loadStoryButtons());
    expect(sections.map((s) => s.act)).toEqual([1, 2]);
    expect(sections[0]?.buttons.length).toBe(12);
    expect(sections[1]?.buttons.map((e) => e.slug)).toEqual(["act2-01", "act2-02", "act2-03", "act2-04"]);
  });
});

describe("mainStoryActLabel: /main/[slug].astro の幕見出しラベル", () => {
  it("act1-*/act2-* のslugから「第一幕」「第二幕」を返す", () => {
    expect(mainStoryActLabel("act1-01")).toBe("第一幕");
    expect(mainStoryActLabel("act2-03")).toBe("第二幕");
  });

  it("act prefix を持たないslug（おはこ等）は undefined", () => {
    expect(mainStoryActLabel("ohako-spino")).toBeUndefined();
  });
});

describe("ハブ順序（script.md の [選択] 正本）", () => {
  it("全ての業がハブ（[選択]）に配線されている（メニューから到達不能な業が無い）", () => {
    const hubThemes = new Set(loadHubOrder().map((e) => e.themeSlug));
    const unwired = loadThemes()
      .map((t) => t.slug)
      .filter((slug) => !hubThemes.has(slug));
    expect(unwired).toEqual([]);
  });

  it("loadThemes はハブの選択肢順に並ぶ", () => {
    const existing = new Set(loadThemes().map((t) => t.slug));
    const expected = loadHubOrder()
      .map((e) => e.themeSlug)
      .filter((slug) => existing.has(slug));
    expect(loadThemes().map((t) => t.slug)).toEqual(expected);
  });

  it("sortByHubOrder はハブの順序で並べ替える", () => {
    const hub = loadHubOrder().map((e) => e.themeSlug);
    expect(hub.length).toBeGreaterThanOrEqual(3);
    const at = (i: number): string => {
      const v = hub[i];
      if (v === undefined) throw new Error("ハブが短すぎる");
      return v;
    };
    const a = at(0);
    const b = at(Math.floor(hub.length / 2));
    const c = at(hub.length - 1);
    const scrambled: ThemeSummary[] = [c, a, b].map((slug) => ({ slug, title: "", characters: [] }));
    expect(sortByHubOrder(scrambled).map((t) => t.slug)).toEqual([a, b, c]);
  });

  it("ハブに無い業は末尾に、その中では slug 昇順で並ぶ", () => {
    const input: ThemeSummary[] = [
      { slug: "zzz-not-in-hub", title: "", characters: [] },
      { slug: "aaa-not-in-hub", title: "", characters: [] },
    ];
    expect(sortByHubOrder(input).map((t) => t.slug)).toEqual(["aaa-not-in-hub", "zzz-not-in-hub"]);
  });

  it("ハブにある業はハブに無い業より前に並ぶ", () => {
    const hub = loadHubOrder().map((e) => e.themeSlug);
    const real = hub[0];
    if (real === undefined) throw new Error("ハブが空");
    const input: ThemeSummary[] = [
      { slug: "zzz-not-in-hub", title: "", characters: [] },
      { slug: real, title: "", characters: [] },
    ];
    expect(sortByHubOrder(input).map((t) => t.slug)).toEqual([real, "zzz-not-in-hub"]);
  });
});

describe("themeSymbolImage: 実データの安全網（Issue #73）", () => {
  it("netami の象徴画像は実在する（誤って削除・リネームされたら検出する回帰ネット）", () => {
    expect(themeSymbolImage("netami")).toBe("/images/theme-symbols/netami.webp");
  });

  it("存在しない業スラッグは実データに対しても null", () => {
    expect(themeSymbolImage("nonexistent-theme-slug-zzz")).toBeNull();
  });
});
