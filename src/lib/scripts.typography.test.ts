import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// 組版ルール（docs/09_production/script_format.md が正本）を機械照合する安全網。
// content/scripts/**/*.md を実ファイルとして走査し、本文行のみを対象に、
// 将来スクリプトを再生成・編集した時の組版回帰（半角記号の混入・誤った横棒族の混入・
// ？！後の半角スペース欠落）を検出する。各違反は「file:line 内容」で全件列挙して落とす。
//
// 本文行の定義（seo-wait と同流儀で除外する）:
//   - 行頭が `[`（ディレクティブ）・`#`（見出し）・`**`（話者行）・`>`（地の文）・`- `（選択肢/箇条）
//   - `→` を含む行（選択肢ジャンプ）
//   - 空行
//   - frontmatter（先頭 `---` 〜 次の `---` の間）
// これらは name-name 構文・メタ情報であり全角化ルールの対象外（script_format.md #13/#20）。

const SCRIPTS_DIR = fileURLToPath(new URL("../../content/scripts/", import.meta.url));

function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    // README.md は脚本でなく規約ドキュメント（name-name 構文 `?scene=` 等を含む散文）＝組版対象外。
    else if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md")
      out.push(full);
  }
  return out;
}

function toRelative(full: string): string {
  const marker = "content/scripts/";
  const idx = full.indexOf(marker);
  return idx >= 0 ? full.slice(idx) : full;
}

interface BodyLine {
  file: string; // content/scripts/ からの相対パス
  line: number; // 1-indexed 行番号
  text: string; // 行の内容
}

// 本文行か判定する（除外条件は上記コメント参照）。frontmatter はファイル単位で別途スキップ。
function isBodyLine(raw: string): boolean {
  const t = raw.trimEnd();
  if (t.trim() === "") return false;
  if (t.includes("→")) return false;
  // 行頭（先頭空白は許容しない＝原稿は行頭直付け）で判定する。
  if (t.startsWith("[")) return false;
  if (t.startsWith("#")) return false;
  if (t.startsWith("**")) return false;
  if (t.startsWith(">")) return false;
  if (t.startsWith("- ")) return false;
  return true;
}

// 全ファイルから本文行を収集する（frontmatter はスキップ）。
const MD_FILES = walkMarkdown(SCRIPTS_DIR);

const BODY_LINES: BodyLine[] = MD_FILES.flatMap((full) => {
  const lines = readFileSync(full, "utf-8").split("\n");
  const hits: BodyLine[] = [];
  let inFrontmatter = false;
  let frontmatterDone = false;
  lines.forEach((ln, i) => {
    // frontmatter: 先頭行が `---` で開き、次の `---` で閉じる（1ファイル1回だけ）。
    if (!frontmatterDone) {
      if (i === 0 && ln.trim() === "---") {
        inFrontmatter = true;
        return;
      }
      if (inFrontmatter) {
        if (ln.trim() === "---") {
          inFrontmatter = false;
          frontmatterDone = true;
        }
        return;
      }
      // 先頭が `---` でなければ frontmatter 無し
      frontmatterDone = true;
    }
    if (isBodyLine(ln)) {
      hits.push({ file: toRelative(full), line: i + 1, text: ln });
    }
  });
  return hits;
});

// ルール2: 本文に使わない横棒族。
// em dash U+2014 / horizontal bar U+2015 / en dash U+2013 / box-drawing U+2500 / midline horizontal ellipsis U+22EF。
const FORBIDDEN_DASHES: { char: string; code: string }[] = [
  { char: "—", code: "U+2014 em dash" },
  { char: "―", code: "U+2015 horizontal bar" },
  { char: "–", code: "U+2013 en dash" },
  { char: "─", code: "U+2500 box-drawing horizontal" },
  { char: "⋯", code: "U+22EF midline horizontal ellipsis" },
];

// ルール3: ？！の直後に半角スペースが要る。ただし直後が行末・以下の文字なら許容。
// 閉じ括弧（全角二重・角・丸・波・亀甲・墨付き・山）・句読点・連続マーク・三点リーダーは間不要。
const ALLOWED_AFTER_MARK = new Set([
  "」", "』", "）", "｝", "〕", "】", "》", "〉", "、", "。", "？", "！", "”", "’", "…", ")",
]);

describe("組版ルール（script_format.md）を本文行で機械照合する安全網", () => {
  it("走査対象の *.md が存在する（glob/パス破損で空集合になる偽陰性のガード）", () => {
    expect(MD_FILES.length).toBeGreaterThan(0);
  });

  it("本文行が1件以上見つかる（検査対象が空で全部pass する偽陰性のガード）", () => {
    expect(BODY_LINES.length).toBeGreaterThan(0);
  });

  it("ルール1: 本文に半角 `?` `!` を含まない（全角 `？！` にすべき・#13）", () => {
    const violations = BODY_LINES.flatMap((b) => {
      if (b.text.includes("?") || b.text.includes("!")) {
        return [`${b.file}:${b.line} 半角 ?/! を含む: ${b.text.trim()}`];
      }
      return [];
    });
    expect(violations).toEqual([]);
  });

  it("ルール2: 本文に禁止横棒族（em/horizontal bar/en dash/U+2500/U+22EF）を含まない（#19/#20）", () => {
    const violations = BODY_LINES.flatMap((b) => {
      const found = FORBIDDEN_DASHES.filter((d) => b.text.includes(d.char));
      if (found.length > 0) {
        const names = found.map((d) => d.code).join(", ");
        return [`${b.file}:${b.line} 禁止文字[${names}]を含む: ${b.text.trim()}`];
      }
      return [];
    });
    expect(violations).toEqual([]);
  });

  it("ルール3: 本文中の `？`/`！` の直後は半角スペース（行末・閉じ括弧・句読点・連続？！は許容・#13）", () => {
    const violations: string[] = [];
    for (const b of BODY_LINES) {
      const chars = [...b.text];
      for (let k = 0; k < chars.length; k++) {
        if (chars[k] === "？" || chars[k] === "！") {
          const nxt = chars[k + 1];
          if (nxt === undefined) continue; // 行末
          if (nxt === " ") continue; // 半角スペース（正しい間）
          if (ALLOWED_AFTER_MARK.has(nxt)) continue; // 閉じ括弧・句読点・連続マーク等
          violations.push(
            `${b.file}:${b.line} 「${chars[k]}」直後に半角スペースが無い（"${nxt}"が続く）: ${b.text.trim()}`,
          );
          break; // 1行1件で十分
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
