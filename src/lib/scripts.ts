// 索引データの正本＝ content/scripts/ のファイル群そのもの（296本のfree/*.mdとscript.md）。
// ここで手作業の一覧をハードコードしない。ビルド時にファイルシステムをスキャンして
// 業(theme) × 住人(character) の索引を組み立てる（Issue #20指示: 296本を手で列挙しない）。
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { RESIDENTS } from "../data/residents";

const SCRIPTS_DIR = path.join(process.cwd(), "content", "scripts");
const FREE_DIR = path.join(SCRIPTS_DIR, "free");
const MAIN_DIR = path.join(SCRIPTS_DIR, "main");
const HUB_FILE = path.join(SCRIPTS_DIR, "script.md");
// 業を象徴する生成絵の正本置き場（Issue #73）。sync-assets.mjs が public/images/ に複製する。
const THEME_SYMBOLS_DIR = path.join(process.cwd(), "assets", "images", "theme-symbols");

export interface Episode {
  /** ファイル名から拡張子を除いたもの＝サイトのURLスラッグ (`ai__aristo`)。 */
  slug: string;
  /** 業(テーマ)スラッグ (`ai`)。 */
  theme: string;
  /** 住人スラッグ (`aristo`)。 */
  character: string;
  /** 業の日本語名。free/*.md の frontmatter title（`好きで苦しい` 等）を正本にする。 */
  themeTitle: string;
  /** name-name の sceneId（`?scene=` に渡す）。`## {character}-{theme}:` 見出しから取る。 */
  sceneId: string;
  /** そのシーンで最初に指定される背景（`shadow-library/xxx.webp`）。読むページの額縁背景に使う。 */
  background: string | null;
}

export function parseFrontmatterTitle(raw: string): string {
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return "";
  const titleLine = fm[1]?.match(/^title:\s*"([^"]*)"\s*$/m);
  return titleLine?.[1] ?? "";
}

export function parseSceneId(raw: string): string {
  const heading = raw.match(/^## ([a-z0-9-]+):/m);
  return heading?.[1] ?? "";
}

export function parseFirstBackground(raw: string): string | null {
  const bg = raw.match(/^\[背景:\s*([^\]]+)\]/m);
  return bg?.[1]?.trim() ?? null;
}

let cachedEpisodes: Episode[] | null = null;

/** free/*.md 全件をスキャンして Episode[] を組み立てる（ビルド時1回・以後キャッシュ）。 */
export function loadEpisodes(): Episode[] {
  if (cachedEpisodes) return cachedEpisodes;

  const files = readdirSync(FREE_DIR).filter((f) => f.endsWith(".md"));
  const episodes = files.map((file): Episode => {
    const slug = file.replace(/\.md$/, "");
    // "__" 区切りはちょうど2セグメント（業__住人）。3セグメント（a__b__c）を黙って
    // 先頭2つに丸めず、ここで規約違反として明示的に弾く。
    const parts = slug.split("__");
    const [theme, character] = parts;
    if (parts.length !== 2 || !theme || !character) {
      throw new Error(`free/${file} はファイル名規約 "業__住人.md"（"__" 区切りちょうど2セグメント）に反している`);
    }
    const raw = readFileSync(path.join(FREE_DIR, file), "utf-8");
    const sceneId = parseSceneId(raw) || `${character}-${theme}`;
    return {
      slug,
      theme,
      character,
      themeTitle: parseFrontmatterTitle(raw),
      sceneId,
      background: parseFirstBackground(raw),
    };
  });

  episodes.sort((a, b) => a.slug.localeCompare(b.slug));
  cachedEpisodes = episodes;
  return episodes;
}

export interface ThemeSummary {
  slug: string;
  title: string;
  /** そのお題に答える住人スラッグ一覧（存在する組み合わせのみ）。 */
  characters: string[];
}

export interface ThemeCategoryDefinition {
  slug: string;
  label: string;
  description: string;
  themeSlugs: readonly string[];
}

export interface ThemeCategorySummary {
  category: ThemeCategoryDefinition;
  themes: ThemeSummary[];
}

export interface CharacterSummary {
  slug: string;
  /** その住人が答えているお題スラッグ一覧。 */
  themes: string[];
}

/** 業(テーマ)ごとにグルーピングした索引。存在する組み合わせだけが載る＝そのままカバレッジ地図。 */
export function loadThemes(): ThemeSummary[] {
  const episodes = loadEpisodes();
  const byTheme = new Map<string, ThemeSummary>();
  for (const ep of episodes) {
    let entry = byTheme.get(ep.theme);
    if (!entry) {
      entry = { slug: ep.theme, title: ep.themeTitle, characters: [] };
      byTheme.set(ep.theme, entry);
    }
    entry.characters.push(ep.character);
  }
  return sortByHubOrder([...byTheme.values()]);
}

/**
 * 業の象徴画像（Issue #73）の配信パスを返す。assets/images/theme-symbols/{slug}.webp が
 * 実在する業だけ `/images/theme-symbols/{slug}.webp` を返し、無ければ null。
 * ハードコードの許可リストにしない＝画像を追加するたびにコード側を触らずに済む
 * （loadThemes() 同様、ファイルシステムの実在を正本にする）。
 * fs.existsSync を呼ぶビルド時I/O関数であり、readRatioPercent() のような
 * 副作用なしの純粋関数ではない（同じ引数でも配置ファイルの有無で戻り値が変わる）。
 */
export function themeSymbolImage(slug: string): string | null {
  const filePath = path.join(THEME_SYMBOLS_DIR, `${slug}.webp`);
  return existsSync(filePath) ? `/images/theme-symbols/${slug}.webp` : null;
}

// 業カテゴリの正本。初出は docs/09_production/combination_grid_drafts.md の
// 「全テーマの口語タイトル」だが、サイト表示ではビルド時に安定して使える
// 型付きデータとしてここに置く。業そのものの順序は loadThemes() のハブ順を保つ。
export const THEME_CATEGORIES = [
  {
    slug: "desire",
    label: "欲・むさぼり",
    description: "ほしい、手放せない、よく見られたい。自分の内側から伸びる力。",
    themeSlugs: ["moke", "netami", "gouman", "shihai", "shuuchaku", "izon", "namake", "mie"],
  },
  {
    slug: "relations",
    label: "対人",
    description: "勝ちたい、信じたい、許せない。人とのあいだで生まれる揺れ。",
    themeSlugs: ["ronpa", "uso", "kodoku", "ai", "fushin", "yurushi", "douchou", "kitai", "fukushuu"],
  },
  {
    slug: "emotion",
    label: "感情",
    description: "怒り、不安、後悔。気持ちに振り回されるときの問い。",
    themeSlugs: ["ikari", "fuan", "koukai", "taikutsu", "soushitsu", "zaiakukan", "aseri"],
  },
  {
    slug: "existence",
    label: "生きること",
    description: "死、老い、意味、時間。生きることそのものに触れる問い。",
    themeSlugs: ["shi", "oi", "imi", "jiyuu", "koufuku", "jikan", "henka"],
  },
  {
    slug: "knowledge",
    label: "認識・知",
    description: "わかる、わからない、決められない。ものの見方を問う領域。",
    themeSlugs: ["mujun", "wakattete", "gensou", "tadashisa", "mayoi", "atarimae", "wakeru"],
  },
] as const satisfies readonly ThemeCategoryDefinition[];

const UNCATEGORIZED_THEME_CATEGORY = {
  slug: "uncategorized",
  label: "未分類",
  description: "新しく追加され、まだカテゴリを決めていない業。",
  themeSlugs: [],
} as const satisfies ThemeCategoryDefinition;

export function loadThemeCategories(): ThemeCategorySummary[] {
  return groupThemesByCategory(loadThemes());
}

export function groupThemesByCategory(themes: ThemeSummary[]): ThemeCategorySummary[] {
  const bySlug = new Map(themes.map((theme) => [theme.slug, theme]));
  const used = new Set<string>();

  const groups: ThemeCategorySummary[] = THEME_CATEGORIES.map((category) => {
    const grouped = themes.filter((theme) => {
      const belongs = (category.themeSlugs as readonly string[]).includes(theme.slug);
      if (belongs) used.add(theme.slug);
      return belongs;
    });
    return { category, themes: grouped };
  }).filter((group) => group.themes.length > 0);

  const uncategorized = themes.filter((theme) => bySlug.has(theme.slug) && !used.has(theme.slug));
  if (uncategorized.length > 0) {
    groups.push({ category: UNCATEGORIZED_THEME_CATEGORY, themes: uncategorized });
  }

  return groups;
}

/** 住人ごとにグルーピングした索引。 */
export function loadCharacterThemes(): CharacterSummary[] {
  const episodes = loadEpisodes();
  const byChar = new Map<string, CharacterSummary>();
  for (const ep of episodes) {
    let entry = byChar.get(ep.character);
    if (!entry) {
      entry = { slug: ep.character, themes: [] };
      byChar.set(ep.character, entry);
    }
    entry.themes.push(ep.theme);
  }
  return [...byChar.values()];
}

export function findEpisode(slug: string): Episode | undefined {
  return loadEpisodes().find((e) => e.slug === slug);
}

// --- おはこ（住人の初登場8本・main/ohako-*.md） ---
//
// free/*.md（業__住人・自由問答）とは別系統。main/ にある本編素材のうち、住人ごとの
// 「初めての問答」1本ずつ（ohako-<住人>.md）を、住人ページ／story ページから到達可能に
// するための索引。loadEpisodes() の "__"2分割規約は ohako には適用されない（ファイル名は
// ohako-<住人> の1系統）ため、混ぜずに独立ローダにする。パーサ（title/sceneId/背景）は
// free と同じものを流用する。

export interface OhakoEntry {
  /** 読むページの URL スラッグ (`ohako-aristo`)。ファイル名から拡張子を除いたもの。 */
  slug: string;
  /** 住人スラッグ (`aristo`)。slug から `ohako-` 接頭辞を落としたもの。 */
  character: string;
  /** 表題。frontmatter title（`分類 〜アリストの問い〜` 等）を正本にする。 */
  title: string;
  /** name-name の sceneId（`?scene=` に渡す）。`## ohako-<住人>:` 見出しから取る（= slug）。 */
  sceneId: string;
  /** 冒頭で指定される背景（`shadow-library/xxx.webp`）。読むページの額縁背景に使う。 */
  background: string | null;
}

// --- 本筋（act1-*.md・第一幕の地の物語。住人はいない） ---
//
// おはこ（住人の初対面8本）とは別系統。main/act1-01.md〜act1-04.md のような
// 「到着・入口・違和感・一幕締め」の地の物語。住人に紐づかないため character を持たない。
// ファイル名規約 `act<幕>-<通し>.md`（`/^act\d+-\d+\.md$/`）でスキャンし、ohako ローダとは
// 混ぜない。title/sceneId/背景のパーサは free/ohako と同じものを流用する。

export interface MainStoryEntry {
  /** 読むページの URL スラッグ (`act1-01`)。ファイル名から拡張子を除いたもの。 */
  slug: string;
  /** 表題。frontmatter title（`到着 〜影の図書館へ〜` 等）を正本にする。 */
  title: string;
  /** name-name の sceneId（`?scene=` に渡す）。`## act1-01:` 見出しから取る（= slug）。 */
  sceneId: string;
  /** 冒頭で指定される背景（`shadow-library/xxx.webp`）。読むページの額縁背景に使う。 */
  background: string | null;
}

/**
 * `/story` に並べる本編ボタン1件。おはこ（住人あり）と本筋（住人なし）を同じ順序ゲートに
 * 並べるため character は optional。本筋 md では undefined になる。
 */
export interface StoryButtonEntry {
  slug: string;
  /** 住人スラッグ。おはこは住人slug・本筋mdでは undefined。 */
  character?: string;
  title: string;
  sceneId: string;
  background: string | null;
  /** 幕内の表示順。1始まりの通し番号（第一幕は 1..12）。 */
  orderInAct: number;
}

let cachedOhako: OhakoEntry[] | null = null;
let cachedMainStories: MainStoryEntry[] | null = null;
let cachedStoryButtons: StoryButtonEntry[] | null = null;

/** main/ohako-*.md 全件をスキャンして OhakoEntry[] を組み立てる（ビルド時1回・以後キャッシュ）。 */
export function loadOhako(): OhakoEntry[] {
  if (cachedOhako) return cachedOhako;

  const files = readdirSync(MAIN_DIR).filter((f) => /^ohako-.+\.md$/.test(f));
  const entries = files.map((file): OhakoEntry => {
    const slug = file.replace(/\.md$/, "");
    const character = slug.replace(/^ohako-/, "");
    const raw = readFileSync(path.join(MAIN_DIR, file), "utf-8");
    const sceneId = parseSceneId(raw) || slug;
    return {
      slug,
      character,
      title: parseFrontmatterTitle(raw),
      sceneId,
      background: parseFirstBackground(raw),
    };
  });

  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  cachedOhako = entries;
  return entries;
}

/** 住人スラッグからその住人の「初めての問答」を引く（無ければ undefined）。 */
export function findOhako(character: string): OhakoEntry | undefined {
  return loadOhako().find((e) => e.character === character);
}

/** main/act1-*.md 全件をスキャンして MainStoryEntry[] を組み立てる（ビルド時1回・以後キャッシュ）。 */
export function loadMainStories(): MainStoryEntry[] {
  if (cachedMainStories) return cachedMainStories;

  const files = readdirSync(MAIN_DIR).filter((f) => /^act\d+-\d+\.md$/.test(f));
  const entries = files.map((file): MainStoryEntry => {
    const slug = file.replace(/\.md$/, "");
    const raw = readFileSync(path.join(MAIN_DIR, file), "utf-8");
    const sceneId = parseSceneId(raw) || slug;
    return {
      slug,
      title: parseFrontmatterTitle(raw),
      sceneId,
      background: parseFirstBackground(raw),
    };
  });

  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  cachedMainStories = entries;
  return entries;
}

/** 本筋スラッグから MainStoryEntry を引く（無ければ undefined）。 */
export function findMainStory(slug: string): MainStoryEntry | undefined {
  return loadMainStories().find((e) => e.slug === slug);
}

/**
 * `/story` に並べる第一幕の本編ボタン。順序ゲートの厳密な並びは
 * [act1-01, act1-02, おはこ×RESIDENTS順, act1-03, act1-04] の通し12件。
 * 到着→入口で文脈を与えてから、住人8人との初対面（おはこ）、そして違和感→一幕締めで閉じる。
 * `orderInAct` は 1 始まりの通し番号（1..12）。本筋mdには住人がいないので character は付かない。
 */
export function loadStoryButtons(): StoryButtonEntry[] {
  if (cachedStoryButtons) return cachedStoryButtons;

  const mainBySlug = new Map(loadMainStories().map((entry) => [entry.slug, entry]));
  const requireMain = (slug: string): MainStoryEntry => {
    const entry = mainBySlug.get(slug);
    if (!entry) {
      throw new Error(`第一幕シーケンスに対応する本筋mdが見つからない: ${slug}`);
    }
    return entry;
  };
  const asButton = (entry: MainStoryEntry): Omit<StoryButtonEntry, "orderInAct"> => ({
    slug: entry.slug,
    title: entry.title,
    sceneId: entry.sceneId,
    background: entry.background,
  });

  const ohakoByCharacter = new Map(loadOhako().map((entry) => [entry.character, entry]));

  // 順序ゲートの厳密な並び（住人分はハードコードせず RESIDENTS 配列順で差し込む）。
  const sequence: Omit<StoryButtonEntry, "orderInAct">[] = [
    asButton(requireMain("act1-01")),
    asButton(requireMain("act1-02")),
    ...RESIDENTS.map((resident) => {
      const entry = ohakoByCharacter.get(resident.slug);
      if (!entry) {
        throw new Error(`本編ボタンに対応するおはこが見つからない: ${resident.slug}`);
      }
      return {
        slug: entry.slug,
        character: entry.character,
        title: entry.title,
        sceneId: entry.sceneId,
        background: entry.background,
      };
    }),
    asButton(requireMain("act1-03")),
    asButton(requireMain("act1-04")),
  ];

  cachedStoryButtons = sequence.map((entry, index) => ({ ...entry, orderInAct: index + 1 }));
  return cachedStoryButtons;
}

export function findStoryButton(slug: string): StoryButtonEntry | undefined {
  return loadStoryButtons().find((entry) => entry.slug === slug);
}

// --- ハブ（script.md）の選択肢順序 ---
//
// 業の並び順・日本語ラベルは script.md の `## hub:` シーンの [選択] ブロック
// (`- お題名 → xxx-menu`) を正本にする（Issue #20指示）。ここをパースして
// 「読者が最初に選ぶ順番」を各種indexページの並び順として再利用する。

interface HubEntry {
  label: string;
  themeSlug: string;
}

let cachedHubOrder: HubEntry[] | null = null;

export function loadHubOrder(): HubEntry[] {
  if (cachedHubOrder) return cachedHubOrder;

  const raw = readFileSync(HUB_FILE, "utf-8");
  const hubSection = raw.match(/## hub:[\s\S]*?\[選択\]([\s\S]*?)\[\/選択\]/);
  const entries: HubEntry[] = [];
  if (hubSection?.[1]) {
    const lineRe = /^-\s*(.+?)\s*→\s*([a-z0-9-]+)-menu\s*$/gm;
    for (const m of hubSection[1].matchAll(lineRe)) {
      const label = m[1];
      const themeSlug = m[2];
      if (label && themeSlug) entries.push({ label, themeSlug });
    }
  }
  cachedHubOrder = entries;
  return entries;
}

export function sortByHubOrder(themes: ThemeSummary[]): ThemeSummary[] {
  const order = loadHubOrder();
  const indexOf = new Map(order.map((e, i) => [e.themeSlug, i]));
  return [...themes].sort((a, b) => {
    const ai = indexOf.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
    const bi = indexOf.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return a.slug.localeCompare(b.slug);
  });
}
