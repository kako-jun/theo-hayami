#!/usr/bin/env node
// docs/05_philosophy/citation_map.json の配置台帳に従って、対象の脚本MDへ
// `[テロップ: 『著作名（よみがな）』章節, 種別=しおり]` を挿入する（Issue #173 Phase A、
// Issue #176 で発火位置を「ブロックの終わり」から「ブロックの語り始め」に変更）。
//
// 冪等: 実行のたびに既存の `種別=しおり` テロップ行を全て取り除いてから、台帳どおりに
// 再挿入する。だから2回連続で流しても差分は出ない（citation_map.json / citations.json /
// thinkers md が変わらない限り）。
//
// --check を付けると、書き込みは行わず「今のファイルが台帳と一致しているか」だけを見る
// （CI 用）。一致しなければ差分ファイル名を報告して exit 1。

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCRIPTS_DIR = path.join(ROOT, "content", "scripts");
const MAP_PATH = path.join(ROOT, "docs", "05_philosophy", "citation_map.json");
const CITATIONS_PATH = path.join(ROOT, "docs", "05_philosophy", "citations.json");

// 話者ブロックの開始行: `**話者**:` または `**話者** (表情, 位置):`。
const SPEAKER_LINE_RE = /^\*\*[^*]+\*\*/;
// 既存の しおり テロップ行（再挿入前にまず全て取り除く＝冪等の要）。
const SHIORI_TELOP_RE = /^\[テロップ:.*種別\s*=\s*しおり.*\]\s*$/;

function loadCitationsById() {
  const list = JSON.parse(readFileSync(CITATIONS_PATH, "utf-8"));
  return new Map(list.map((c) => [c.id, c]));
}

function loadMap() {
  const json = JSON.parse(readFileSync(MAP_PATH, "utf-8"));
  const entries = {};
  for (const [file, list] of Object.entries(json)) {
    if (file.startsWith("_")) continue; // _comment 等のメタキーは対象外
    entries[file] = list;
  }
  return entries;
}

/** citation 1件を `[テロップ: 『著作名（よみがな）』章節, 種別=しおり]` の1行にする。
 * 章節は display_section（短縮済み表示用。build-citations.mjs の deriveDisplaySection 参照）を使う。
 * section（完全形・参照用）はここでは使わない。 */
export function buildTelopLine(citation) {
  let body = `『${citation.work}（${citation.reading}）』${citation.display_section ?? ""}`;
  // 本文に `,` を含める場合は全角にする（name-name #674 仕様。章節に半角カンマが
  // 紛れ込んでもディレクティブの引数区切りと衝突しないための安全策）。
  body = body.replace(/,/g, "，");
  return `[テロップ: ${body}, 種別=しおり]`;
}

/** 脚本MDのテキストに、指定された配置一覧（[{block, id}]）を適用したテキストを返す。
 * 挿入位置は「ブロック N の `**話者**` 行の直前」（住人が理論を語り始めた瞬間に栞を出す・
 * Issue #176）。ブロック1の場合も同じ規則が自然に働く: 冒頭演出ブロック（`[待機: 表示完了]` 等）の
 * 後にある空行の後、最初の話者行の直前に挿さる。テロップ行と話者行の間に空行は入れない
 * （話者行の直前に直接テロップ行を差し込むだけなので、本文行数には依存しない）。 */
export function applyCitationsToText(text, placements, citationsById) {
  const byBlock = new Map();
  for (const p of placements) {
    if (byBlock.has(p.block)) {
      throw new Error(`citation_map.json: block が重複しています: ${p.block}`);
    }
    byBlock.set(p.block, p);
  }

  // まず既存の しおり テロップ行を全て除去する（冪等の要。これをしないと2回目の実行で
  // 前回挿入した行がそのまま話者ブロックの本文として数えられてしまう）。
  const lines = text.split("\n").filter((line) => !SHIORI_TELOP_RE.test(line));

  const out = [];
  let blockIndex = 0;
  for (const line of lines) {
    if (SPEAKER_LINE_RE.test(line)) {
      blockIndex += 1;
      const placement = byBlock.get(blockIndex);
      if (placement) {
        const citation = citationsById.get(placement.id);
        if (!citation) {
          throw new Error(`citations.json に id が見つかりません: ${placement.id}`);
        }
        out.push(buildTelopLine(citation));
      }
    }
    out.push(line);
  }

  const maxBlock = blockIndex;
  for (const p of placements) {
    if (p.block < 1 || p.block > maxBlock) {
      throw new Error(`citation_map.json: block=${p.block} は話者ブロック数(${maxBlock})の範囲外です`);
    }
  }

  return out.join("\n");
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const citationsById = loadCitationsById();
  const map = loadMap();

  let mismatched = 0;
  let changed = 0;
  for (const [relPath, placements] of Object.entries(map)) {
    const filePath = path.join(SCRIPTS_DIR, relPath);
    const before = readFileSync(filePath, "utf-8");
    const after = applyCitationsToText(before, placements, citationsById);
    if (before === after) {
      console.log(`[apply-citations] ${relPath}: 変更なし（既に適用済み）`);
      continue;
    }
    if (checkOnly) {
      console.error(`[apply-citations] ${relPath}: 台帳と一致しません（npm run citations:apply を実行してください）`);
      mismatched += 1;
      continue;
    }
    writeFileSync(filePath, after, "utf-8");
    console.log(`[apply-citations] ${relPath}: 栞を適用しました`);
    changed += 1;
  }

  if (checkOnly) {
    if (mismatched > 0) {
      process.exitCode = 1;
      return;
    }
    console.log("[apply-citations] --check: 全て台帳と一致しています");
    return;
  }

  console.log(`[apply-citations] 完了（${changed}ファイル更新）`);
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) main();
