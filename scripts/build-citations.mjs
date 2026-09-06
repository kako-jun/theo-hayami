#!/usr/bin/env node
// docs/05_philosophy/thinkers/*.md の各概念見出し（### / ####）直下にある
// `出典:` / `- 出典:` / `出典：` 行から docs/05_philosophy/citations.json を生成する（Issue #173 Phase A）。
//
// 正本は thinkers md（各住人の概念インベントリ）。citations.json は本スクリプトの生成物で、
// コミットはするが手編集はしない（thinkers md を直して再生成する）。
// 読み仮名は docs/05_philosophy/work_readings.json が正本。ここに無い著作名が出典行に
// 出てきたら、曲解防止のため生成を失敗させる（未登録を一括で洗い出してから exit 1 する）。

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const THINKERS_DIR = path.join(ROOT, "docs", "05_philosophy", "thinkers");
const READINGS_PATH = path.join(ROOT, "docs", "05_philosophy", "work_readings.json");
const OUTPUT_PATH = path.join(ROOT, "docs", "05_philosophy", "citations.json");

// ファイル名（住人slug）→ 表示名（カタカナ）。docs/05_philosophy/mapping.md の対応表と同じ。
export const RESIDENT_NAMES = {
  aristo: "アリスト",
  dekaris: "デカリス",
  hegru: "ヘグル",
  hue: "ヒュー",
  kantia: "カンティア",
  makiya: "マキヤ",
  ou: "オウ",
  spino: "スピノ",
};

const CITATION_LINE_RE = /^-?\s*出典[:：]\s*(.*)$/;
const HEADING_RE = /^(#{3,4})\s+(.*?)\s*$/;

// work 抽出の区切り文字（1文字ずつのクラス判定）。
// 、／(全角/半角スラッシュ)（(全角/半角開き括弧)「『(引用開き)。(句点)空白／数字／
// ローマ数字に使う羅語アルファベット／ギリシャ文字。
// 先頭1文字だけは区切り判定から除外する（「第四反論と答弁」「省察への第二答弁」等、
// 作品名自体の頭が「第」だったり、区切り文字を含まない例外を壊さないため）。
const DELIM_RE = /[、／/（(「『。\s0-9Ͱ-ϿIVXLCDM]/;

// 行頭が引用括弧で始まる出典行（例: `「原始契約について」／人間本性論...`、
// `『大学』八条目を陽明流に貫いた大学問の一節。`）は、閉じ括弧までを work として取り出す。
const QUOTE_PAIRS = [
  ["「", "」"],
  ["『", "』"],
];

function stripTrailing(s) {
  return s.replace(/[。、\s]+$/u, "").trim();
}

/**
 * 断片（既に「1著作ぶん」に割られたテキスト）から { work, section } を取り出す。
 * 複数著作の分割（splitIntoWorkFragments）を経由した最初の断片にだけ適用する内部ヘルパー。
 */
export function extractLeadingWork(raw) {
  const body = raw.trim();
  for (const [open, close] of QUOTE_PAIRS) {
    if (!body.startsWith(open)) continue;
    const closeIdx = body.indexOf(close);
    if (closeIdx === -1) continue;
    const work = stripTrailing(body.slice(open.length, closeIdx));
    const rest = body.slice(closeIdx + close.length).replace(/^[、／/\s]+/u, "");
    return { work, section: stripTrailing(rest) };
  }
  if (body.length <= 1) return { work: stripTrailing(body), section: "" };
  const tail = body.slice(1);
  const m = tail.search(DELIM_RE);
  if (m === -1) return { work: stripTrailing(body), section: "" };
  const idx = m + 1;
  const work = stripTrailing(body.slice(0, idx));
  const section = stripTrailing(body.slice(idx).replace(/^[、／/\s]+/u, ""));
  return { work, section };
}

// 区切り文字（、 または ／／/）が「著作の区切り」か「同じ著作内のロケータ区切り／
// ふつうの日本語の読点／別著作を指さない残骸」かを判定する材料。区切りの直後
// （次の区切り文字まで）を extractLeadingWork で覗き見て、その結果が
// work_readings.json に登録済みの著作名（正本 or alias）と完全一致するときだけ
// 著作の区切りとみなす。
// - 読点の例:「エチカ IV 序文、I p15・I p29」のような同一著作内のロケータ列挙を
//   割ってしまわないため。
// - ／の例（レビュー指摘S5）:「人間知性研究4／12」の `12`、「人間本性論II.i.11／III」の
//   `III` はどちらも登録著作名ではない（章節の続き）ので、／があっても分割しない
//   → section にそのまま `4／12`・`II.i.11／III` として残る。「省察 第六／エリザベト宛
//   書簡（1643）」の書簡名も work_readings.json に未登録なので同様に分割せず、
//   also に書簡名が漏れ出ることもない（書簡は著作でないため意図的に未登録のまま）。
function splitOnWorkBoundary(text, delimiterRe, registeredNames) {
  const boundaries = [];
  let searchFrom = 0;
  for (;;) {
    const rest = text.slice(searchFrom);
    const m = rest.match(delimiterRe);
    if (!m) break;
    const idx = searchFrom + m.index;
    const delimLen = m[0].length;
    const after = text.slice(idx + delimLen);
    const candidate = extractLeadingWork(after).work;
    if (candidate && registeredNames.has(candidate)) boundaries.push({ idx, delimLen });
    searchFrom = idx + delimLen;
  }
  if (boundaries.length === 0) return [text];
  const out = [];
  let start = 0;
  for (const b of boundaries) {
    out.push(text.slice(start, b.idx));
    start = b.idx + b.delimLen;
  }
  out.push(text.slice(start));
  return out;
}

const SLASH_DELIM_RE = /[／/]/;
const TOUTEN_DELIM_RE = /、/;

/**
 * 出典行の本文を「著作ごとの断片」に分割する（例: `形而上学Ζ・Η／カテゴリー論` →
 * `["形而上学Ζ・Η", "カテゴリー論"]`）。／（全角/半角）・読点のどちらも、区切りの右側が
 * 登録済みの著作名（正本 or alias）で始まるときだけ著作境界として割る（レビュー指摘S5・
 * 読点の既存規則に揃えた）。それ以外（ロケータの続き・未登録の書簡名など）は割らずに
 * section の一部として残す。
 */
export function splitIntoWorkFragments(raw, registeredNames) {
  const slashParts = splitOnWorkBoundary(raw.trim(), SLASH_DELIM_RE, registeredNames);
  const fragments = [];
  for (const part of slashParts) {
    fragments.push(...splitOnWorkBoundary(part, TOUTEN_DELIM_RE, registeredNames));
  }
  return fragments.map((f) => stripTrailing(f)).filter(Boolean);
}

/**
 * 出典行の本文（ラベル除去済み）を { work, section, also } に分ける。
 * 複数著作が並ぶ出典行（`カテゴリー論／形而上学Δ` 等）は、**最初の断片だけ**から
 * work/section を取る。2つ目以降の断片は also に入れるだけで section には混ぜない
 * （section に別の著作名が紛れ込むレビュー指摘・#173 の修正）。
 */
export function splitWorkSection(raw, registeredNames) {
  const fragments = splitIntoWorkFragments(raw, registeredNames);
  const [first, ...restFragments] = fragments;
  const { work, section } = extractLeadingWork(first ?? "");
  return { work, section, also: restFragments };
}

/**
 * 見出しから安定した id 用の日本語語句を取り出す（レビュー指摘・#173）。
 * 英字スラッグ（旧 conceptSlug）は使わない: 見出しにラテン文字の原語併記が無い概念
 * （356件中75件）が連番 `{residentSlug}-{n}` にフォールバックしており、thinkers md に
 * 見出しを1つ挿すだけで以降の連番が全部ずれ、citation_map.json が別概念を指す事故に
 * なるため。見出しの最初の `（`/`(`/`／`/`/` の手前まで（無ければ見出し全体）を使い、
 * 空白・中黒・かぎ括弧・全角イコールを取り除く。
 * 例: `現象（Erscheinung）` → `現象`、`アンチノミー（Antinomie）` → `アンチノミー`、
 * `知は行の始め、行は知の成（ちはこうのはじめ）` → `知は行の始め行は知の成`。
 */
export function japaneseIdFromHeading(heading) {
  const cutIdx = heading.search(/[（(／/]/);
  const base = cutIdx === -1 ? heading : heading.slice(0, cutIdx);
  return base.replace(/[\s、・「」＝]/gu, "");
}

function loadReadings() {
  const json = JSON.parse(readFileSync(READINGS_PATH, "utf-8"));
  const lookup = new Map(); // 著作名（正本 or alias）→ { canonical, reading }
  for (const [canonical, entry] of Object.entries(json.works ?? {})) {
    lookup.set(canonical, { canonical, reading: entry.reading });
    for (const alias of entry.aliases ?? []) {
      lookup.set(alias, { canonical, reading: entry.reading });
    }
  }
  return lookup;
}

/** 1住人ぶんの thinkers md を走査して、出典を持つ概念見出しの一覧を返す。 */
export function parseThinkerFile(text, residentSlug, registeredNames) {
  const lines = text.split("\n");
  const residentName = RESIDENT_NAMES[residentSlug];
  const citations = [];
  const usedIds = new Set();
  let heading = null;
  let body = [];

  const flush = () => {
    if (heading === null) return;
    for (const line of body) {
      const m = line.match(CITATION_LINE_RE);
      if (!m) continue;
      const raw = m[1].trim();
      const { work, section, also } = splitWorkSection(raw, registeredNames);
      const idBase = japaneseIdFromHeading(heading);
      if (!idBase) {
        throw new Error(`見出しから id を作れません（${residentSlug}）: ${JSON.stringify(heading)}`);
      }
      const id = `${residentSlug}-${idBase}`;
      if (usedIds.has(id)) {
        // 連番へのフォールバックはしない（thinkers md に見出しを1つ挿すだけで既存 id が
        // ずれる事故を防ぐため・レビュー指摘#173）。衝突したら見出し側を直してもらう。
        throw new Error(`id が衝突しています（${residentSlug}）: ${id}（見出し: ${JSON.stringify(heading)}）`);
      }
      usedIds.add(id);
      citations.push({ id, resident: residentName, concept: heading, work, section, also, raw });
      break; // 1概念1出典行（既存データで確認済み・複数出典行を持つ概念は無い）
    }
    heading = null;
    body = [];
  };

  for (const line of lines) {
    const hm = line.match(HEADING_RE);
    if (hm) {
      flush();
      heading = hm[2];
      body = [];
      continue;
    }
    if (heading !== null) body.push(line);
  }
  flush();

  return citations;
}

function main() {
  const readings = loadReadings();
  const registeredNames = new Set(readings.keys());
  const files = readdirSync(THINKERS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const all = [];
  const missing = new Set();

  for (const file of files) {
    const residentSlug = path.basename(file, ".md");
    const text = readFileSync(path.join(THINKERS_DIR, file), "utf-8");
    const entries = parseThinkerFile(text, residentSlug, registeredNames);
    for (const entry of entries) {
      const hit = readings.get(entry.work);
      if (!hit) {
        missing.add(entry.work);
        continue;
      }
      // also（2つ目以降の著作）も同じ読み仮名台帳の登録チェック対象にする（レビュー指摘・#173 S4）。
      // splitIntoWorkFragments の分割自体が registeredNames 済みの名前でしかしないため
      // （S5）、通常はここで missing になることは無いはずだが、二重の安全網として
      // also の各断片の先頭著作名（extractLeadingWork）も同様に検査し、未登録なら
      // 一括で洗い出す（1件ずつ直して再実行、を繰り返さないため missing 側に集約する）。
      for (const alsoFragment of entry.also) {
        const alsoWork = extractLeadingWork(alsoFragment).work;
        if (!alsoWork || !readings.has(alsoWork)) missing.add(alsoWork || alsoFragment);
      }
      all.push({
        id: entry.id,
        resident: entry.resident,
        concept: entry.concept,
        work: hit.canonical,
        section: entry.section,
        also: entry.also,
        reading: hit.reading,
        raw: entry.raw,
      });
    }
  }

  if (missing.size > 0) {
    console.error(
      `[build-citations] work_readings.json に未登録の著作名が ${missing.size} 件あります:`,
    );
    for (const w of [...missing].sort()) console.error(`  - ${w}`);
    process.exitCode = 1;
    return;
  }

  const ids = new Set();
  for (const entry of all) {
    if (ids.has(entry.id)) {
      throw new Error(`id が重複しています: ${entry.id}`);
    }
    ids.add(entry.id);
  }

  // 自己検査: section の先頭が登録済みの著作名（正本 or alias）と一致するもの＝
  // 複数著作の分割漏れで section に別著作が混入したケースを検出する（レビュー指摘・#173）。
  const sectionLeaks = [];
  for (const entry of all) {
    if (!entry.section) continue;
    const leadingWork = extractLeadingWork(entry.section).work;
    if (leadingWork && readings.has(leadingWork)) {
      sectionLeaks.push(`${entry.id}: section="${entry.section}"（先頭が著作名 "${leadingWork}"）`);
    }
  }
  if (sectionLeaks.length > 0) {
    console.error(`[build-citations] section に別の著作名が混入しています（自己検査）:`);
    for (const s of sectionLeaks) console.error(`  - ${s}`);
    process.exitCode = 1;
    return;
  }

  // 自己検査: also に「章節だけの断片」（ロケータの続きや未登録の書簡名など、著作名で
  // 始まらない断片）が混入していないか（レビュー指摘・#173 S5）。splitIntoWorkFragments の
  // 分割条件（登録済み著作名で始まる時だけ分割）が正しく効いていれば、also の各断片は
  // 必ず登録済み著作名で始まるはず。混入があれば分割ロジックの回帰とみなして失敗させる。
  const alsoSectionOnlyLeaks = [];
  for (const entry of all) {
    for (const alsoFragment of entry.also) {
      const alsoWork = extractLeadingWork(alsoFragment).work;
      if (!alsoWork || !readings.has(alsoWork)) {
        alsoSectionOnlyLeaks.push(`${entry.id}: also="${alsoFragment}"（先頭が登録済み著作名と一致しません）`);
      }
    }
  }
  if (alsoSectionOnlyLeaks.length > 0) {
    console.error(`[build-citations] also に章節だけの断片が混入しています（自己検査）:`);
    for (const s of alsoSectionOnlyLeaks) console.error(`  - ${s}`);
    process.exitCode = 1;
    return;
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(all, null, 2) + "\n", "utf-8");
  console.log(`[build-citations] ${all.length} 件を書き出しました → ${path.relative(ROOT, OUTPUT_PATH)}`);
  const byResident = new Map();
  for (const entry of all) byResident.set(entry.resident, (byResident.get(entry.resident) ?? 0) + 1);
  for (const [resident, count] of byResident) console.log(`  ${resident}: ${count}`);
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) main();
