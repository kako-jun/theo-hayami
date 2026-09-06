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

/** 出典行の本文（ラベル除去済み）を { work, section } に分ける。 */
export function splitWorkSection(raw) {
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

function isRomanizable(seg) {
  if (!/[A-Za-z]/.test(seg)) return false;
  if (/[぀-ヿ一-鿿Ͱ-Ͽ]/.test(seg)) return false;
  return true;
}

function slugify(seg) {
  const norm = seg.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  return norm
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 見出しの `（... / ...）` からラテン文字のセグメントを拾って kebab-case にする。無ければ null。 */
export function conceptSlug(heading) {
  const m = heading.match(/[（(]([^（）()]*)[）)]/);
  if (!m) return null;
  const segments = m[1]
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const seg of segments) {
    if (!isRomanizable(seg)) continue;
    const slug = slugify(seg);
    if (slug.length >= 2) return slug;
  }
  return null;
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
export function parseThinkerFile(text, residentSlug) {
  const lines = text.split("\n");
  const residentName = RESIDENT_NAMES[residentSlug];
  const citations = [];
  const usedIds = new Set();
  let heading = null;
  let body = [];
  let seq = 0;

  const flush = () => {
    if (heading === null) return;
    for (const line of body) {
      const m = line.match(CITATION_LINE_RE);
      if (!m) continue;
      seq += 1;
      const raw = m[1].trim();
      const { work, section } = splitWorkSection(raw);
      const slug = conceptSlug(heading);
      let id = slug ? `${residentSlug}-${slug}` : null;
      if (!id || usedIds.has(id)) id = `${residentSlug}-${seq}`;
      usedIds.add(id);
      citations.push({ id, resident: residentName, concept: heading, work, section, raw });
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
  const files = readdirSync(THINKERS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const all = [];
  const missing = new Set();

  for (const file of files) {
    const residentSlug = path.basename(file, ".md");
    const text = readFileSync(path.join(THINKERS_DIR, file), "utf-8");
    const entries = parseThinkerFile(text, residentSlug);
    for (const entry of entries) {
      const hit = readings.get(entry.work);
      if (!hit) {
        missing.add(entry.work);
        continue;
      }
      all.push({
        id: entry.id,
        resident: entry.resident,
        concept: entry.concept,
        work: hit.canonical,
        section: entry.section,
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

  writeFileSync(OUTPUT_PATH, JSON.stringify(all, null, 2) + "\n", "utf-8");
  console.log(`[build-citations] ${all.length} 件を書き出しました → ${path.relative(ROOT, OUTPUT_PATH)}`);
  const byResident = new Map();
  for (const entry of all) byResident.set(entry.resident, (byResident.get(entry.resident) ?? 0) + 1);
  for (const [resident, count] of byResident) console.log(`  ${resident}: ${count}`);
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) main();
