// src/lib/citations.ts の追加観点（Issue #173）。
//
// 既存の src/lib/citations.test.ts は実データ（docs/05_philosophy/*.json）だけを対象にしており、
// 実データでは「1slugに配置2件」「section 空の栞」のケースが無い（citation_map.json は
// 現状どちらのファイルも配置1件のみ）。この2点はフィクスチャに差し替えないと検証できないため、
// scripts.fallback.test.ts と同じ流儀で node:fs をモックし、citations.ts をフレッシュに読み直す。
import { afterEach, describe, expect, it, vi } from "vitest";

const fsMock = vi.hoisted(() => ({
  citations: [] as unknown[],
  citationMap: {} as Record<string, unknown>,
}));

vi.mock("node:fs", () => ({
  readFileSync: (p: string) => {
    const s = String(p);
    if (s.endsWith("citation_map.json")) return JSON.stringify(fsMock.citationMap);
    if (s.endsWith("citations.json")) return JSON.stringify(fsMock.citations);
    throw new Error(`unexpected readFileSync path in test: ${s}`);
  },
}));

afterEach(() => {
  fsMock.citations = [];
  fsMock.citationMap = {};
  vi.resetModules();
});

async function freshCitations() {
  vi.resetModules();
  return import("./citations.ts");
}

describe("getCitationsForSlug: 1ファイル2配置", () => {
  it("配置順（citation_map.json の並び順）どおりの配列を返す", async () => {
    fsMock.citations = [
      { id: "id-1", resident: "R", concept: "c1", work: "著作1", section: "", also: [], reading: "いち", raw: "" },
      { id: "id-2", resident: "R", concept: "c2", work: "著作2", section: "", also: [], reading: "に", raw: "" },
    ];
    fsMock.citationMap = {
      "main/two-shiori.md": [
        { after_block: 1, id: "id-1" },
        { after_block: 5, id: "id-2" },
      ],
    };
    const { getCitationsForSlug } = await freshCitations();
    const result = getCitationsForSlug("two-shiori");
    expect(result.map((c) => c.id)).toEqual(["id-1", "id-2"]);
  });
});

describe("formatCitation: section の有無による形式", () => {
  it("非空 section は `『work（reading）』section` になり末尾に空白が付かない", async () => {
    fsMock.citations = [
      {
        id: "id-1",
        resident: "R",
        concept: "c",
        work: "純粋理性批判",
        section: "Ζ・Η",
        also: [],
        reading: "じゅんすいりせいひはん",
        raw: "",
      },
    ];
    fsMock.citationMap = { "main/x.md": [{ after_block: 1, id: "id-1" }] };
    const { getCitationsForSlug, formatCitation } = await freshCitations();
    const [c] = getCitationsForSlug("x");
    expect(formatCitation(c!)).toBe("『純粋理性批判（じゅんすいりせいひはん）』Ζ・Η");
    expect(formatCitation(c!).endsWith(" ")).toBe(false);
  });

  it("空 section は `『work（reading）』` だけになる", async () => {
    fsMock.citations = [
      {
        id: "id-1",
        resident: "R",
        concept: "c",
        work: "エチカ",
        section: "",
        also: [],
        reading: "えちか",
        raw: "",
      },
    ];
    fsMock.citationMap = { "main/x.md": [{ after_block: 1, id: "id-1" }] };
    const { getCitationsForSlug, formatCitation } = await freshCitations();
    const [c] = getCitationsForSlug("x");
    expect(formatCitation(c!)).toBe("『エチカ（えちか）』");
  });
});

describe("fileKeyToReaderSlug: 不正キー", () => {
  it("未知の1階層目（未知ディレクトリ）は null", async () => {
    const { fileKeyToReaderSlug } = await freshCitations();
    expect(fileKeyToReaderSlug("archive/old.md")).toBe(null);
  });

  it("スラッシュを含まないキー（拡張子どころかディレクトリ区切りも無い）は null", async () => {
    const { fileKeyToReaderSlug } = await freshCitations();
    expect(fileKeyToReaderSlug("temperature.md")).toBe(null);
  });

  // fix: fileKeyToReaderSlug を不正キーで null にする厳密化 (#173)。
  // 受理形を `^(current|current-drafts|free|main)\/([A-Za-z0-9_-]+)\.md$` に厳密化した後は、
  // 既知ディレクトリ名で始まっていても拡張子なし・二重スラッシュ・許可外文字は null になる。
  it("拡張子なしキー（例: `main/foo`）は null", async () => {
    const { fileKeyToReaderSlug } = await freshCitations();
    expect(fileKeyToReaderSlug("main/foo")).toBe(null);
  });

  it("二重スラッシュキー（例: `main//foo.md`）は null", async () => {
    const { fileKeyToReaderSlug } = await freshCitations();
    expect(fileKeyToReaderSlug("main//foo.md")).toBe(null);
  });

  it("ファイル名に許可文字（英数字・`_`・`-`）以外を含むキーは null", async () => {
    const { fileKeyToReaderSlug } = await freshCitations();
    expect(fileKeyToReaderSlug("main/温度.md")).toBe(null);
    expect(fileKeyToReaderSlug("main/foo bar.md")).toBe(null);
  });
});
