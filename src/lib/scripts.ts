// 索引データの正本＝ content/scripts/ のファイル群そのもの（296本のfree/*.mdとscript.md）。
// ここで手作業の一覧をハードコードしない。ビルド時にファイルシステムをスキャンして
// 業(theme) × 住人(character) の索引を組み立てる（Issue #20指示: 296本を手で列挙しない）。
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS_DIR = fileURLToPath(new URL("../../content/scripts/", import.meta.url));
const FREE_DIR = path.join(SCRIPTS_DIR, "free");
const HUB_FILE = path.join(SCRIPTS_DIR, "script.md");

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

function parseFrontmatterTitle(raw: string): string {
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return "";
  const titleLine = fm[1]?.match(/^title:\s*"([^"]*)"\s*$/m);
  return titleLine?.[1] ?? "";
}

function parseSceneId(raw: string): string {
  const heading = raw.match(/^## ([a-z0-9-]+):/m);
  return heading?.[1] ?? "";
}

function parseFirstBackground(raw: string): string | null {
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
    const [theme, character] = slug.split("__");
    if (!theme || !character) {
      throw new Error(`free/${file} はファイル名規約 "業__住人.md" に反している`);
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

function loadHubOrder(): HubEntry[] {
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

function sortByHubOrder(themes: ThemeSummary[]): ThemeSummary[] {
  const order = loadHubOrder();
  const indexOf = new Map(order.map((e, i) => [e.themeSlug, i]));
  return [...themes].sort((a, b) => {
    const ai = indexOf.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
    const bi = indexOf.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return a.slug.localeCompare(b.slug);
  });
}
