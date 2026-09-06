// 出典（栞）の読み出し（Issue #173 Phase A）。
//
// 正本は docs/05_philosophy/thinkers/*.md（住人ごとの概念インベントリ）。
// docs/05_philosophy/citations.json（台帳・生成物）と docs/05_philosophy/citation_map.json
// （配置・手編集）はどちらも scripts/build-citations.mjs 側の関心事で、ここは読むだけ。
// content/scripts/*.md を fs でスキャンする src/lib/scripts.ts と同じ流儀
// （process.cwd() 起点の相対パス・モジュールキャッシュ）に揃える。
import { readFileSync } from "node:fs";
import path from "node:path";
import { publishedTeaTimeQuestions } from "../data/teaTime";

const PHILOSOPHY_DIR = path.join(process.cwd(), "docs", "05_philosophy");
const CITATIONS_PATH = path.join(PHILOSOPHY_DIR, "citations.json");
const CITATION_MAP_PATH = path.join(PHILOSOPHY_DIR, "citation_map.json");

export interface Citation {
  id: string;
  resident: string;
  concept: string;
  work: string;
  section: string;
  /** 出典行に複数著作が並んでいた場合の2つ目以降（例: `カテゴリー論／形而上学Δ` の `形而上学Δ`）。
   *  raw の補助情報として持つだけで、栞のテロップ/リスト表示には使わない（work/section のみ表示）。 */
  also: string[];
  reading: string;
  raw: string;
}

export interface CitationPlacement {
  after_block: number;
  id: string;
}

let cachedCitations: Citation[] | null = null;
let cachedMap: Record<string, CitationPlacement[]> | null = null;

function loadCitations(): Citation[] {
  if (!cachedCitations) {
    cachedCitations = JSON.parse(readFileSync(CITATIONS_PATH, "utf-8")) as Citation[];
  }
  return cachedCitations;
}

function loadCitationMap(): Record<string, CitationPlacement[]> {
  if (!cachedMap) {
    const raw = JSON.parse(readFileSync(CITATION_MAP_PATH, "utf-8")) as Record<string, unknown>;
    const entries: Record<string, CitationPlacement[]> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (key.startsWith("_")) continue; // _comment 等のメタキーは対象外
      entries[key] = value as CitationPlacement[];
    }
    cachedMap = entries;
  }
  return cachedMap;
}

/**
 * citation_map.json のファイルキー（`content/scripts/` からの相対パス。例 `current/wc-luck.md`）を、
 * 読むページの slug（ReaderFrame の `slug` prop・readStore の既読判定キーと同じ値）に変換する。
 * - `current/x.md`（けふのティータイム）→ ReaderFrame の slug は `tea-${question.slug}`
 *   （src/data/teaTime.ts の公開 slug 基準。tea-time/[slug].astro が
 *   `slug={`tea-${question.slug}`}` で渡す）。ファイル名 `x` と公開 slug は一致しないことがある
 *   （例: `current/wc-luck.md` は公開 slug `world-cup`。sceneId `tea-wc-luck` の方がファイル名と
 *   揃っている）。そのため `publishedTeaTimeQuestions` を引き、sceneId の `tea-` 以降がファイル名と
 *   一致する、または slug 自体がファイル名と一致するエントリを探して、その `slug` から
 *   `tea-${slug}` を組み直す。該当エントリが無ければ null（未公開・栞の対象外）。
 * - `free/a__b.md` → `a__b`（そのまま。free/[slug].astro の episode.slug と一致）。
 * - `main/x.md`（本筋・おはこ）→ `x`（そのまま。main/[slug].astro の slug と一致）。
 * 未知の1階層目（`current-drafts/` 等）は null（栞の対象外）。
 *
 * 受理する形は `^(current|current-drafts|free|main)\/([A-Za-z0-9_-]+)\.md$` のみに厳密化する
 * （レビュー指摘・#173テスト設計）。拡張子なし・二重スラッシュ・ファイル名に許可文字以外を
 * 含むキーは、既知ディレクトリ名で始まっていても null にする。実際の content/scripts/ 配下の
 * ファイル名は英数字・`_`・`-` のみ（本関数のテストで固定済み）なので実データには影響しない。
 */
const VALID_FILE_KEY_RE = /^(current|current-drafts|free|main)\/([A-Za-z0-9_-]+)\.md$/;

/** `current/{base}.md` のファイル名 base を、公開 slug 基準の ReaderFrame slug に解決する（レビュー指摘M2）。 */
function currentFileBaseToReaderSlug(base: string): string | null {
  const question = publishedTeaTimeQuestions.find((q) => {
    const sceneSuffix = q.sceneId?.startsWith("tea-") ? q.sceneId.slice("tea-".length) : undefined;
    return sceneSuffix === base || q.slug === base;
  });
  return question ? `tea-${question.slug}` : null;
}

export function fileKeyToReaderSlug(fileKey: string): string | null {
  const m = fileKey.match(VALID_FILE_KEY_RE);
  if (!m) return null;
  // noUncheckedIndexedAccess: RegExpMatchArray の要素分割代入は string | undefined になる
  // （正規表現の構造上、m[1]/m[2] は必ずキャプチャされるが型上は保証されない・レビュー指摘M1）。
  const dir = m[1];
  const base = m[2];
  if (dir === undefined || base === undefined) return null;
  if (dir === "current") return currentFileBaseToReaderSlug(base);
  if (dir === "free" || dir === "main") return base;
  return null; // current-drafts: 形式は正当だが栞の対象外
}

/** 読むページの slug から、その扉に灯す栞（出典）の一覧を返す（配置順）。無ければ空配列。 */
export function getCitationsForSlug(slug: string): Citation[] {
  const map = loadCitationMap();
  const citations = loadCitations();
  const byId = new Map(citations.map((c) => [c.id, c]));

  const results: Citation[] = [];
  for (const [fileKey, placements] of Object.entries(map)) {
    if (fileKeyToReaderSlug(fileKey) !== slug) continue;
    for (const placement of placements) {
      const citation = byId.get(placement.id);
      if (citation) results.push(citation);
    }
  }
  return results;
}

/** 栞1件の表示文言（『著作名（よみがな）』章節）。apply-citations.mjs の telop 本文と同じ組み方。 */
export function formatCitation(citation: Citation): string {
  return `『${citation.work}（${citation.reading}）』${citation.section ?? ""}`;
}
